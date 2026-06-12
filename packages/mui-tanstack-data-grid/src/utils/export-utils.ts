/**
 * Export subsystem — CSV + Excel, client + server (chunked), with cancellation
 * and progress/state callbacks. Ported from v1; `xlsx` is now **lazy-loaded**
 * via dynamic `import()` inside the Excel branch, so it's not pulled into the
 * initial bundle and only loads when an Excel export actually runs.
 */
import type { Table } from '@tanstack/react-table';

import type { SelectionState } from '../types/selection.types';
import type { ExportPhase, ServerExportResult } from '../types/export.types';

export interface ExportOptions {
    format: 'csv' | 'excel';
    filename: string;
    onProgress?: (progress: { processedRows?: number; totalRows?: number; percentage?: number }) => void;
    onComplete?: (result: { success: boolean; filename: string; totalRows: number }) => void;
    onError?: (error: { message: string; code: string }) => void;
    onStateChange?: (state: {
        phase: ExportPhase;
        processedRows?: number;
        totalRows?: number;
        percentage?: number;
        message?: string;
        code?: string;
    }) => void;
    signal?: AbortSignal;
    sanitizeCSV?: boolean;
}

export interface ServerExportOptions extends ExportOptions {
    fetchData: (filters?: any, selection?: SelectionState, signal?: AbortSignal) => Promise<ServerExportResult<any>>;
    currentFilters?: any;
    selection?: SelectionState;
    chunkSize?: number;
    strictTotalCheck?: boolean;
}

const EXPORT_CANCELLED_CODE = 'CANCELLED';
const DEFAULT_CHUNK_SIZE = 1000;
const MAX_SERVER_EXPORT_PAGES = 10000;

function createCancelledExportError(): Error & { code: string } {
    const error = new Error('Export cancelled') as Error & { code: string };
    error.name = 'AbortError';
    error.code = EXPORT_CANCELLED_CODE;
    return error;
}

function isCancelledError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    return error.name === 'AbortError' || (error as any).code === EXPORT_CANCELLED_CODE;
}

function throwIfExportCancelled(signal?: AbortSignal): void {
    if (signal?.aborted) throw createCancelledExportError();
}

function waitWithAbort(ms: number, signal?: AbortSignal): Promise<void> {
    if (!signal) return new Promise((resolve) => setTimeout(resolve, ms));
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            signal.removeEventListener('abort', onAbort);
            resolve();
        }, ms);
        const onAbort = () => {
            clearTimeout(timer);
            signal.removeEventListener('abort', onAbort);
            reject(createCancelledExportError());
        };
        signal.addEventListener('abort', onAbort, { once: true });
    });
}

function notifyState(onStateChange: ExportOptions['onStateChange'], state: Parameters<NonNullable<ExportOptions['onStateChange']>>[0]): void {
    onStateChange?.(state);
}

function isServerExportDataResult(result: unknown): result is { data: any[]; total: number } {
    return !!result && typeof result === 'object' && 'data' in (result as any) && Array.isArray((result as any).data);
}

function isServerExportBlobResult(result: unknown): result is { blob: Blob; filename?: string; mimeType?: string; total?: number } {
    return !!result && typeof result === 'object' && 'blob' in (result as any) && (result as any).blob instanceof Blob;
}

function isServerExportFileUrlResult(result: unknown): result is { fileUrl: string; filename?: string; mimeType?: string; total?: number } {
    return !!result && typeof result === 'object' && typeof (result as any).fileUrl === 'string';
}

function resolveExportHeader(columnDef: any, columnId: string): string {
    const defaultHeader = typeof columnDef?.header === 'string' ? columnDef.header : columnId;
    if (columnDef?.exportHeader === undefined || columnDef?.exportHeader === null) return defaultHeader;
    if (typeof columnDef.exportHeader === 'function') {
        return String(columnDef.exportHeader({ columnId, defaultHeader, columnDef }) ?? defaultHeader);
    }
    return String(columnDef.exportHeader);
}

function applyExportValueTransform(columnDef: any, value: any, row: any, rowIndex: number, columnId: string) {
    if (typeof columnDef?.exportValue === 'function') {
        return columnDef.exportValue({ value, row, rowIndex, columnId, columnDef });
    }
    return value;
}

function applyExportFormatTransform(columnDef: any, value: any, row: any, rowIndex: number, columnId: string) {
    const format = columnDef?.exportFormat;
    if (!format || format === 'auto') return value;
    if (typeof format === 'function') return format({ value, row, rowIndex, columnId, columnDef });
    if (value === null || value === undefined) return '';
    switch (format) {
        case 'string': return String(value);
        case 'number': return Number(value);
        case 'boolean': return Boolean(value);
        case 'json': return JSON.stringify(value);
        case 'date': return value instanceof Date ? value.toISOString() : String(value);
        default: return value;
    }
}

function normalizeExportValue(value: any): any {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
}

/** Client export: selected rows if any, else filtered rows; visible non-hidden columns. */
export async function exportClientData<TData>(table: Table<TData>, options: ExportOptions): Promise<void> {
    const { format, filename, onProgress, onComplete, onError, onStateChange, signal, sanitizeCSV = true } = options;
    try {
        throwIfExportCancelled(signal);
        notifyState(onStateChange, { phase: 'starting' });

        const selectedRows = table.getSelectedRows ? table.getSelectedRows() : [];
        const rowsToExport = selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows;

        const exportData: Record<string, any>[] = [];
        const visibleColumns = table.getVisibleLeafColumns().filter((col) => col.columnDef.hideInExport !== true);

        for (let index = 0; index < rowsToExport.length; index++) {
            throwIfExportCancelled(signal);
            const row = rowsToExport[index];
            const percentage = Math.round(((index + 1) / rowsToExport.length) * 100);
            onProgress?.({ processedRows: index + 1, totalRows: rowsToExport.length, percentage });
            notifyState(onStateChange, { phase: 'processing', processedRows: index + 1, totalRows: rowsToExport.length, percentage });

            const rowData: Record<string, any> = {};
            for (const column of visibleColumns) {
                const columnDef = column.columnDef;
                const header = resolveExportHeader(columnDef, column.id);
                const cell = row.getVisibleCells().find((c) => c.column.id === column.id);
                const baseValue = cell ? cell.getValue() : (row as any)?.original?.[column.id];
                const transformedValue = applyExportFormatTransform(
                    columnDef,
                    applyExportValueTransform(columnDef, baseValue, row.original, index, column.id),
                    row.original,
                    index,
                    column.id,
                );
                rowData[header] = normalizeExportValue(transformedValue);
            }
            exportData.push(rowData);
        }

        notifyState(onStateChange, { phase: 'downloading', processedRows: exportData.length, totalRows: exportData.length, percentage: 100 });
        await exportToFile(exportData, format, filename, signal, sanitizeCSV);

        const resolvedName = `${filename}.${format === 'excel' ? 'xlsx' : 'csv'}`;
        onComplete?.({ success: true, filename: resolvedName, totalRows: exportData.length });
        notifyState(onStateChange, { phase: 'completed', processedRows: exportData.length, totalRows: exportData.length, percentage: 100 });
    } catch (error) {
        if (isCancelledError(error)) {
            notifyState(onStateChange, { phase: 'cancelled', code: EXPORT_CANCELLED_CODE });
            return;
        }
        // eslint-disable-next-line no-console
        console.error('Client export failed:', error);
        const message = error instanceof Error ? error.message : 'Export failed';
        notifyState(onStateChange, { phase: 'error', message, code: 'CLIENT_EXPORT_ERROR' });
        onError?.({ message, code: 'CLIENT_EXPORT_ERROR' });
    }
}

/** Server export: chunked fetch (or direct blob/fileUrl), then build the file. */
export async function exportServerData<TData>(table: Table<TData>, options: ServerExportOptions): Promise<void> {
    const {
        format, filename, fetchData, currentFilters, selection,
        onProgress, onComplete, onError, onStateChange, signal,
        chunkSize = DEFAULT_CHUNK_SIZE, strictTotalCheck = false, sanitizeCSV = true,
    } = options;

    try {
        throwIfExportCancelled(signal);
        notifyState(onStateChange, { phase: 'starting' });
        onProgress?.({});
        notifyState(onStateChange, { phase: 'fetching' });

        const initialResponse = await fetchData({ ...currentFilters, pagination: { pageIndex: 0, pageSize: 1 } }, selection, signal);

        if (isServerExportBlobResult(initialResponse)) {
            throwIfExportCancelled(signal);
            const resolvedName = initialResponse.filename || `${filename}.${format === 'excel' ? 'xlsx' : 'csv'}`;
            notifyState(onStateChange, { phase: 'downloading' });
            downloadFile(initialResponse.blob, resolvedName, initialResponse.mimeType || initialResponse.blob.type || 'application/octet-stream');
            onComplete?.({ success: true, filename: resolvedName, totalRows: initialResponse.total ?? 0 });
            notifyState(onStateChange, { phase: 'completed' });
            return;
        }
        if (isServerExportFileUrlResult(initialResponse)) {
            throwIfExportCancelled(signal);
            const resolvedName = initialResponse.filename || `${filename}.${format === 'excel' ? 'xlsx' : 'csv'}`;
            notifyState(onStateChange, { phase: 'downloading' });
            await downloadFromUrl(initialResponse.fileUrl, resolvedName, initialResponse.mimeType || 'application/octet-stream', signal);
            onComplete?.({ success: true, filename: resolvedName, totalRows: initialResponse.total ?? 0 });
            notifyState(onStateChange, { phase: 'completed' });
            return;
        }
        if (!isServerExportDataResult(initialResponse)) throw new Error('Invalid data received from server');

        const totalRows = typeof initialResponse.total === 'number' ? initialResponse.total : initialResponse.data.length;
        const hasTotal = typeof totalRows === 'number' && totalRows >= 0;
        let allData: any[] = [];

        for (let page = 0; page < MAX_SERVER_EXPORT_PAGES; page++) {
            throwIfExportCancelled(signal);
            const chunkResponse = await fetchData({ ...currentFilters, pagination: { pageIndex: page, pageSize: chunkSize } }, selection, signal);

            if (isServerExportBlobResult(chunkResponse)) {
                throwIfExportCancelled(signal);
                const resolvedName = chunkResponse.filename || `${filename}.${format === 'excel' ? 'xlsx' : 'csv'}`;
                notifyState(onStateChange, { phase: 'downloading' });
                downloadFile(chunkResponse.blob, resolvedName, chunkResponse.mimeType || chunkResponse.blob.type || 'application/octet-stream');
                onComplete?.({ success: true, filename: resolvedName, totalRows: chunkResponse.total ?? allData.length });
                notifyState(onStateChange, { phase: 'completed' });
                return;
            }
            if (isServerExportFileUrlResult(chunkResponse)) {
                throwIfExportCancelled(signal);
                const resolvedName = chunkResponse.filename || `${filename}.${format === 'excel' ? 'xlsx' : 'csv'}`;
                notifyState(onStateChange, { phase: 'downloading' });
                await downloadFromUrl(chunkResponse.fileUrl, resolvedName, chunkResponse.mimeType || 'application/octet-stream', signal);
                onComplete?.({ success: true, filename: resolvedName, totalRows: chunkResponse.total ?? allData.length });
                notifyState(onStateChange, { phase: 'completed' });
                return;
            }
            if (!isServerExportDataResult(chunkResponse)) throw new Error(`Failed to fetch chunk ${page + 1}`);

            const chunkData = chunkResponse.data;
            if (chunkData.length === 0) break;
            allData.push(...chunkData);

            const percentage = hasTotal && totalRows > 0 ? Math.min(100, Math.round((allData.length / totalRows) * 100)) : undefined;
            onProgress?.({ processedRows: allData.length, totalRows: hasTotal ? totalRows : undefined, percentage });
            notifyState(onStateChange, { phase: 'fetching', processedRows: allData.length, totalRows: hasTotal ? totalRows : undefined, percentage });

            if (hasTotal) {
                if (allData.length >= totalRows) break;
            } else if (chunkData.length < chunkSize) {
                break;
            }
            await waitWithAbort(100, signal);
        }

        if (hasTotal && allData.length > totalRows) allData = allData.slice(0, totalRows);
        if (hasTotal && strictTotalCheck && allData.length < totalRows) {
            throw new Error(`Expected ${totalRows} rows for export but received ${allData.length}`);
        }
        throwIfExportCancelled(signal);

        const visibleColumns = table.getVisibleLeafColumns().filter((col) => col.getIsVisible() && col.columnDef.hideInExport !== true);
        const exportData: Record<string, any>[] = [];

        for (let index = 0; index < allData.length; index++) {
            throwIfExportCancelled(signal);
            const rowData = allData[index];
            const exportRow: Record<string, any> = {};
            visibleColumns.forEach((column) => {
                const columnDef = column.columnDef;
                const header = resolveExportHeader(columnDef, column.id);
                let value = rowData[column.id];
                if (typeof column.accessorFn === 'function') value = column.accessorFn(rowData, index);
                value = applyExportValueTransform(columnDef, value, rowData, index, column.id);
                value = applyExportFormatTransform(columnDef, value, rowData, index, column.id);
                exportRow[header] = normalizeExportValue(value);
            });
            exportData.push(exportRow);
            if (allData.length > 0) {
                notifyState(onStateChange, { phase: 'processing', processedRows: index + 1, totalRows: allData.length, percentage: Math.round(((index + 1) / allData.length) * 100) });
            }
        }

        notifyState(onStateChange, { phase: 'downloading' });
        await exportToFile(exportData, format, filename, signal, sanitizeCSV);

        const resolvedName = `${filename}.${format === 'excel' ? 'xlsx' : 'csv'}`;
        onComplete?.({ success: true, filename: resolvedName, totalRows: exportData.length });
        notifyState(onStateChange, { phase: 'completed', processedRows: exportData.length, totalRows: exportData.length, percentage: 100 });
    } catch (error) {
        if (isCancelledError(error)) {
            notifyState(onStateChange, { phase: 'cancelled', code: EXPORT_CANCELLED_CODE });
            return;
        }
        // eslint-disable-next-line no-console
        console.error('Server export failed:', error);
        const message = error instanceof Error ? error.message : 'Export failed';
        notifyState(onStateChange, { phase: 'error', message, code: 'SERVER_EXPORT_ERROR' });
        onError?.({ message, code: 'SERVER_EXPORT_ERROR' });
    }
}

async function exportToFile(data: Record<string, any>[], format: 'csv' | 'excel', filename: string, signal?: AbortSignal, sanitizeCSV = true): Promise<void> {
    throwIfExportCancelled(signal);
    if (data.length === 0) throw new Error('No data to export');

    if (format === 'csv') {
        const csv = convertToCSV(data, sanitizeCSV);
        throwIfExportCancelled(signal);
        downloadFile(csv, `${filename}.csv`, 'text/csv');
    } else {
        // Lazy-load xlsx only when an Excel export actually runs.
        const XLSX = await import('xlsx');
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        throwIfExportCancelled(signal);
        downloadFile(blob, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
}

function convertToCSV(data: Record<string, any>[], sanitizeCSV: boolean): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
        const values = headers.map((header) => {
            const rawValue = row[header] ?? '';
            const normalizedValue = sanitizeCSV ? sanitizeCSVCellValue(rawValue) : rawValue;
            const value = normalizedValue === null || normalizedValue === undefined ? '' : String(normalizedValue);
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}

function sanitizeCSVCellValue(value: any): any {
    if (typeof value !== 'string' || value.length === 0) return value;
    const first = value[0];
    if (first === '=' || first === '+' || first === '-' || first === '@') return `'${value}`;
    return value;
}

async function downloadFromUrl(url: string, filename: string, mimeType: string, signal?: AbortSignal): Promise<void> {
    throwIfExportCancelled(signal);
    try {
        const response = await fetch(url, { signal });
        if (!response.ok) throw new Error(`Failed to download export file from URL (${response.status})`);
        const blob = await response.blob();
        throwIfExportCancelled(signal);
        downloadFile(blob, filename, mimeType || blob.type || 'application/octet-stream');
    } catch (error) {
        if (isCancelledError(error)) throw error;
        // Fallback for URLs that block fetch (CORS) — let the browser handle it.
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
