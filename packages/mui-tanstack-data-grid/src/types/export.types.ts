import type { SelectionState } from './selection.types';

export type ExportFormat = 'csv' | 'excel';

/**
 * Where the export work happens. Default is `'client'`.
 *
 * - `client`       — fetch + format + build the file in the browser (in-memory rows
 *                    for client data, or paged through `onFetchData` for server data).
 * - `server-data`  — the server STREAMS raw rows (`onExportStream`); the client formats
 *                    (visible columns + transforms) and stream-writes the file.
 * - `server-file`  — the server BUILDS the finished file (`onServerExport` → `{ blob }`
 *                    or `{ fileUrl }`); the client just downloads it.
 * - `server-async` — the server enqueues a job (`onServerExport` → `{ jobId }`); the
 *                    client polls (`onExportPoll`) until a `{ fileUrl }` is ready.
 */
export type ExportMode = 'client' | 'server-data' | 'server-file' | 'server-async';

/** Which rows to export. */
export type ExportScope = 'all' | 'filtered' | 'selected';

/** How the file is written on the client. `auto` picks the best supported sink. */
export type ExportSink = 'auto' | 'stream' | 'blob';

export type ExportConcurrencyMode = 'ignoreIfRunning' | 'cancelAndRestart' | 'queue';

export type ExportPhase =
    | 'starting'
    | 'fetching'
    | 'processing'
    | 'waiting' // async server job in progress
    | 'downloading'
    | 'completed'
    | 'cancelled'
    | 'error';

export type ExportValueFormat = 'string' | 'number' | 'boolean' | 'date' | 'json' | 'auto';

export interface ExportProgressPayload {
    processedRows?: number;
    totalRows?: number;
    percentage?: number;
}

export interface ExportStateChange {
    phase: ExportPhase;
    mode?: ExportMode | 'client' | 'server';
    format?: ExportFormat;
    filename?: string;
    processedRows?: number;
    totalRows?: number;
    percentage?: number;
    message?: string;
    code?: string;
    startedAt?: number;
    endedAt?: number;
}

/** A single column in an {@link ExportRequest} — id + the resolved export header. */
export interface ExportColumn {
    id: string;
    header: string;
    /** Optional hint so a server-side exporter can format the value the same way. */
    format?: ExportValueFormat;
}

/**
 * The serializable descriptor the client computes from grid state for EVERY export,
 * then hands to the active mode. This is the single source of truth for *which columns*,
 * *which rows*, *what order*, and *what filters/sort* an export covers — so visible /
 * selected columns and the current query are handled identically across all modes.
 */
export interface ExportRequest {
    format: ExportFormat;
    filename: string;
    /** Visible, non-`hideInExport` columns in display order, with resolved headers. */
    columns: ExportColumn[];
    /** `all` = every row, `filtered` = current filters, `selected` = the selection. */
    scope: ExportScope;
    /** Include/exclude selection state (relevant when `scope === 'selected'`). */
    selection?: SelectionState;
    /** Curated current filters (global + column), for `all` / `filtered`. */
    filters?: any;
    /** Current sort state. */
    sorting?: any;
    includeHeaders?: boolean;
    delimiter?: string;
    sanitizeCSV?: boolean;
}

/** Returned by a `server-async` export; identifies the in-flight job to poll. */
export interface ExportJobRef {
    jobId: string;
    statusUrl?: string;
}

/** One poll result for a `server-async` export job. */
export interface ExportJobStatus {
    status: 'pending' | 'processing' | 'ready' | 'error';
    fileUrl?: string;
    filename?: string;
    mimeType?: string;
    percentage?: number;
    processedRows?: number;
    totalRows?: number;
    message?: string;
}

/**
 * What a server export callback may return.
 * - `{ data, total }` — a page of rows (client builds the file).
 * - `{ blob }`        — a finished file in memory.
 * - `{ fileUrl }`     — a URL to a finished/streamed file.
 * - `{ jobId }`       — an async job to poll (server-async).
 */
export type ServerExportResult<T = any> =
    | { data: T[]; total?: number }
    | { blob: Blob; filename?: string; mimeType?: string; total?: number }
    | { fileUrl: string; filename?: string; mimeType?: string; total?: number }
    | { jobId: string; statusUrl?: string; total?: number };
