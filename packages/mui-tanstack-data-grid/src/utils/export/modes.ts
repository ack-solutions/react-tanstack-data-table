/**
 * The four export modes + the `runExport` orchestrator that dispatches by `exportMode`.
 *
 *   client       — client fetches/uses rows, formats, streams the file.
 *   server-data  — server streams raw rows; client formats + stream-writes.
 *   server-file  — server builds the file; client downloads `{ blob } | { fileUrl }`.
 *   server-async — server enqueues a job; client polls until a `{ fileUrl }` is ready.
 */
import type { Row, Table } from '@tanstack/react-table';

import type {
    ExportJobRef,
    ExportMode,
    ExportPhase,
    ExportRequest,
    ExportSink,
    ExportStateChange,
    ServerExportResult,
} from '../../types/export.types';
import { createCancelledExportError, isCancelledError, throwIfAborted, waitWithAbort } from './cancel';
import { downloadBlob, downloadFromUrl } from './download';
import { formatRowRecord, type ResolvedExportColumn } from './format';
import { iterateBatches, pageAllRows, type FetchPage } from './fetch';
import { buildExportRequest, type BuildExportRequestOptions } from './request';
import { createTextSink, type ExportSinkHandle } from './sink';
import { buildXlsxBlob, csvHeaderLine, csvRowLine, recordsToCSV, CSV_MIME, XLSX_MIME } from './serialize';

export interface RunExportCallbacks<T = any> {
    /** Page rows for `client`/`server-data` fallback (wraps the grid's data fetch). */
    fetchPage?: FetchPage;
    /** Streaming row source for `server-data`. */
    onExportStream?: (request: ExportRequest, signal?: AbortSignal) => AsyncIterable<T[]> | Promise<AsyncIterable<T[]>>;
    /** Server file/job builder for `server-file` / `server-async`. */
    onServerExport?: (request: ExportRequest, signal?: AbortSignal) => Promise<ServerExportResult<T>>;
    /** Poll an async export job to completion. */
    onExportPoll?: (job: ExportJobRef, signal?: AbortSignal) => Promise<import('../../types/export.types').ExportJobStatus>;
}

export interface RunExportOptions<T = any> extends RunExportCallbacks<T> {
    mode: ExportMode;
    request: BuildExportRequestOptions;
    /** Whether grid data lives on the client (`'client'`) or the server (`'server'`). */
    dataMode?: 'client' | 'server';
    sink?: ExportSink;
    chunkSize?: number;
    interPageDelayMs?: number;
    fetchConcurrency?: number;
    /** Guard for client-built files (CSV via blob sink, or any XLSX). */
    maxClientRows?: number;
    /** Truncate XLSX at the Excel row limit instead of throwing. */
    truncateXlsx?: boolean;
    pollIntervalMs?: number;
    /** Force a renamed download for `{ fileUrl }` (buffers — avoid for huge files). */
    renameDownload?: boolean;
    progressEvery?: number;
    signal: AbortSignal;
    onProgress?: (p: { processedRows?: number; totalRows?: number; percentage?: number }) => void;
    onStateChange?: (s: ExportStateChange) => void;
    onComplete?: (r: { success: boolean; filename: string; totalRows: number }) => void;
    onError?: (e: { message: string; code: string }) => void;
    /** Internal: the open sink (set by `runExport` so the save-picker stays in the gesture). */
    sinkHandle?: ExportSinkHandle;
}

const DEFAULT_MAX_CLIENT_ROWS = 1_000_000;
const DEFAULT_POLL_INTERVAL_MS = 2000;
const DEFAULT_PROGRESS_EVERY = 2000;

function resolvedFilename(base: string, format: ExportRequest['format']): string {
    return `${base}.${format === 'excel' ? 'xlsx' : 'csv'}`;
}

function getRawFromTableRow(col: ResolvedExportColumn, row: Row<any>): any {
    try {
        return row.getValue(col.id);
    } catch {
        return (row.original as any)?.[col.id];
    }
}

function getRawFromObject(col: ResolvedExportColumn, obj: any, index: number): any {
    const accessorFn = (col.column as any)?.accessorFn;
    if (typeof accessorFn === 'function') return accessorFn(obj, index);
    return obj?.[col.id];
}

/** A progress reporter that only emits every `every` rows (kills the per-row render storm). */
function makeProgress(opts: RunExportOptions, getTotal: () => number | undefined) {
    const every = opts.progressEvery ?? DEFAULT_PROGRESS_EVERY;
    let lastEmitted = -1;
    return (processed: number, phase: ExportPhase, force = false) => {
        if (!force && processed - lastEmitted < every) return;
        lastEmitted = processed;
        const total = getTotal();
        const percentage = total && total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : undefined;
        opts.onProgress?.({ processedRows: processed, totalRows: total, percentage });
        opts.onStateChange?.({ phase, processedRows: processed, totalRows: total, percentage });
    };
}

// ── client / server-data shared writer ──────────────────────────────────────

type BatchConsumer = (records: Record<string, any>[]) => Promise<void> | void;
type BatchProducer = (consume: BatchConsumer) => Promise<void>;

async function writeCsv(
    opts: RunExportOptions,
    columns: ResolvedExportColumn[],
    produce: BatchProducer,
    getTotal: () => number | undefined,
): Promise<number> {
    const sink = opts.sinkHandle;
    if (!sink) throw new Error('No export sink');
    const headers = columns.map((c) => c.header);
    const lineOpts = { delimiter: opts.request.delimiter, sanitizeCSV: opts.request.sanitizeCSV };
    const emit = makeProgress(opts, getTotal);

    let processed = 0;
    if (opts.request.includeHeaders !== false) await sink.writeText(csvHeaderLine(headers, lineOpts) + '\n');
    await produce(async (records) => {
        throwIfAborted(opts.signal);
        let chunk = '';
        for (const rec of records) chunk += csvRowLine(rec, headers, lineOpts) + '\n';
        await sink.writeText(chunk);
        processed += records.length;
        emit(processed, 'processing');
    });
    await sink.close();
    emit(processed, 'processing', true);
    return processed;
}

async function writeXlsx(opts: RunExportOptions, produce: BatchProducer, getTotal: () => number | undefined): Promise<number> {
    const max = opts.maxClientRows ?? DEFAULT_MAX_CLIENT_ROWS;
    const all: Record<string, any>[] = [];
    const emit = makeProgress(opts, getTotal);
    await produce(async (records) => {
        throwIfAborted(opts.signal);
        if (all.length + records.length > max) {
            throw new Error(`Export exceeds the client limit of ${max.toLocaleString()} rows. Use CSV or a server export mode.`);
        }
        for (const rec of records) all.push(rec);
        emit(all.length, 'processing');
    });
    emit(all.length, 'downloading', true);
    const { blob } = await buildXlsxBlob(all, { truncate: opts.truncateXlsx });
    downloadBlob(blob, resolvedFilename(opts.request.filename, 'excel'), XLSX_MIME);
    return all.length;
}

// ── modes ───────────────────────────────────────────────────────────────────

async function runClientOrServerData<T>(table: Table<T>, opts: RunExportOptions<T>): Promise<void> {
    const { request, columns } = buildExportRequest(table, opts.request);
    if (columns.length === 0) throw new Error('No exportable columns');
    opts.onStateChange?.({ phase: 'fetching' });

    const isStream = opts.mode === 'server-data' && !!opts.onExportStream;
    const serverPaged = (opts.mode === 'server-data' || opts.dataMode === 'server') && !!opts.fetchPage;
    const totalRef: { value: number | undefined } = { value: undefined };
    const getTotal = () => totalRef.value;

    const produce: BatchProducer = async (consume) => {
        if (isStream) {
            const source = await opts.onExportStream!(request, opts.signal);
            await iterateBatches(source, {
                signal: opts.signal,
                onBatch: async (rows, info) => {
                    const start = info.fetched - rows.length;
                    await consume(rows.map((r, i) => formatRowRecord(r, start + i, columns, getRawFromObject)));
                },
            });
            return;
        }
        if (serverPaged) {
            const res = await pageAllRows(opts.fetchPage!, {
                chunkSize: opts.chunkSize,
                interPageDelayMs: opts.interPageDelayMs,
                concurrency: opts.fetchConcurrency,
                signal: opts.signal,
                onBatch: async (rows, info) => {
                    totalRef.value = info.total;
                    const start = info.fetched - rows.length;
                    await consume(rows.map((r, i) => formatRowRecord(r, start + i, columns, getRawFromObject)));
                },
            });
            totalRef.value = res.total ?? totalRef.value;
            return;
        }
        // client in-memory rows
        const rows: Row<T>[] =
            request.scope === 'selected' && (table as any).getSelectedRows
                ? (table as any).getSelectedRows()
                : table.getFilteredRowModel().rows;
        totalRef.value = rows.length;
        await consume(rows.map((row, i) => formatRowRecord(row, i, columns, getRawFromTableRow)));
    };

    const count = request.format === 'excel' ? await writeXlsx(opts, produce, getTotal) : await writeCsv(opts, columns, produce, getTotal);

    opts.onStateChange?.({ phase: 'completed', processedRows: count, totalRows: count, percentage: 100 });
    opts.onComplete?.({ success: true, filename: resolvedFilename(opts.request.filename, request.format), totalRows: count });
}

async function downloadServerResult(result: ServerExportResult, opts: RunExportOptions, fallbackName: string): Promise<number> {
    if ('blob' in result && result.blob instanceof Blob) {
        opts.onStateChange?.({ phase: 'downloading' });
        downloadBlob(result.blob, result.filename || fallbackName, result.mimeType || result.blob.type || 'application/octet-stream');
        return result.total ?? 0;
    }
    if ('fileUrl' in result && typeof result.fileUrl === 'string') {
        opts.onStateChange?.({ phase: 'downloading' });
        await downloadFromUrl(result.fileUrl, result.filename || fallbackName, {
            mimeType: result.mimeType,
            rename: opts.renameDownload,
            signal: opts.signal,
        });
        return result.total ?? 0;
    }
    throw new Error('Server export returned an unsupported result for this mode');
}

async function runServerFile<T>(table: Table<T>, opts: RunExportOptions<T>): Promise<void> {
    if (!opts.onServerExport) throw new Error("server-file export requires an 'onServerExport' handler");
    const { request } = buildExportRequest(table, opts.request);
    const fallbackName = resolvedFilename(opts.request.filename, request.format);
    opts.onStateChange?.({ phase: 'processing' });
    const result = await opts.onServerExport(request, opts.signal);
    throwIfAborted(opts.signal);

    if ('jobId' in result && (result as any).jobId) {
        await pollAndDownload(opts, { jobId: (result as any).jobId, statusUrl: (result as any).statusUrl }, fallbackName);
        return;
    }
    const total = await downloadServerResult(result, opts, fallbackName);
    opts.onStateChange?.({ phase: 'completed', totalRows: total, percentage: 100 });
    opts.onComplete?.({ success: true, filename: fallbackName, totalRows: total });
}

async function runServerAsync<T>(table: Table<T>, opts: RunExportOptions<T>): Promise<void> {
    if (!opts.onServerExport) throw new Error("server-async export requires an 'onServerExport' handler");
    const { request } = buildExportRequest(table, opts.request);
    const fallbackName = resolvedFilename(opts.request.filename, request.format);
    opts.onStateChange?.({ phase: 'starting' });
    const result = await opts.onServerExport(request, opts.signal);
    throwIfAborted(opts.signal);

    if ('blob' in result || 'fileUrl' in result) {
        const total = await downloadServerResult(result as ServerExportResult, opts, fallbackName);
        opts.onStateChange?.({ phase: 'completed', totalRows: total, percentage: 100 });
        opts.onComplete?.({ success: true, filename: fallbackName, totalRows: total });
        return;
    }
    if (!('jobId' in result) || !(result as any).jobId) throw new Error("server-async export expected a '{ jobId }' result");
    await pollAndDownload(opts, { jobId: (result as any).jobId, statusUrl: (result as any).statusUrl }, fallbackName);
}

async function pollAndDownload(opts: RunExportOptions, job: ExportJobRef, fallbackName: string): Promise<void> {
    if (!opts.onExportPoll) throw new Error("Async export requires an 'onExportPoll' handler");
    const interval = opts.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        throwIfAborted(opts.signal);
        const status = await opts.onExportPoll(job, opts.signal);
        if (status.status === 'error') throw new Error(status.message || 'Server export job failed');
        opts.onStateChange?.({
            phase: status.status === 'ready' ? 'downloading' : 'waiting',
            processedRows: status.processedRows,
            totalRows: status.totalRows,
            percentage: status.percentage,
            message: status.message,
        });
        if (status.percentage !== undefined) {
            opts.onProgress?.({ percentage: status.percentage, processedRows: status.processedRows, totalRows: status.totalRows });
        }
        if (status.status === 'ready') {
            if (!status.fileUrl) throw new Error('Async export finished without a fileUrl');
            await downloadFromUrl(status.fileUrl, status.filename || fallbackName, {
                mimeType: status.mimeType,
                rename: opts.renameDownload,
                signal: opts.signal,
            });
            opts.onStateChange?.({ phase: 'completed', totalRows: status.totalRows, percentage: 100 });
            opts.onComplete?.({ success: true, filename: status.filename || fallbackName, totalRows: status.totalRows ?? 0 });
            return;
        }
        await waitWithAbort(interval, opts.signal);
    }
}

/** Single entry point — builds the request, opens the sink (gesture-safe), dispatches by mode. */
export async function runExport<T>(table: Table<T>, opts: RunExportOptions<T>): Promise<void> {
    try {
        throwIfAborted(opts.signal);
        opts.onStateChange?.({ phase: 'starting' });

        // For client/server-data CSV, open the sink up-front so the save-picker keeps the user gesture.
        const clientLike = opts.mode === 'client' || opts.mode === 'server-data';
        if (clientLike && opts.request.format !== 'excel') {
            const sink = await createTextSink(resolvedFilename(opts.request.filename, 'csv'), {
                prefer: opts.sink ?? 'auto',
                mimeType: CSV_MIME,
            });
            if (sink === null) throw createCancelledExportError(); // user dismissed the save dialog
            opts.sinkHandle = sink;
        }

        switch (opts.mode) {
            case 'client':
            case 'server-data':
                await runClientOrServerData(table, opts);
                break;
            case 'server-file':
                await runServerFile(table, opts);
                break;
            case 'server-async':
                await runServerAsync(table, opts);
                break;
            default:
                throw new Error(`Unknown export mode: ${opts.mode}`);
        }
    } catch (error) {
        if (opts.sinkHandle) await opts.sinkHandle.abort().catch(() => undefined);
        if (isCancelledError(error)) {
            opts.onStateChange?.({ phase: 'cancelled', code: 'CANCELLED' });
            return;
        }
        const message = error instanceof Error ? error.message : 'Export failed';
        opts.onStateChange?.({ phase: 'error', message, code: 'EXPORT_ERROR' });
        opts.onError?.({ message, code: 'EXPORT_ERROR' });
    }
}

// Re-exported for the in-memory fallback / tests.
export { recordsToCSV, CSV_MIME };
