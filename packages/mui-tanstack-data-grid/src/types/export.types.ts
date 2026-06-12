export type ExportFormat = 'csv' | 'excel';

export type ExportConcurrencyMode = 'ignoreIfRunning' | 'cancelAndRestart' | 'queue';

export type ExportPhase =
    | 'starting'
    | 'fetching'
    | 'processing'
    | 'downloading'
    | 'completed'
    | 'cancelled'
    | 'error';

export interface ExportProgressPayload {
    processedRows?: number;
    totalRows?: number;
    percentage?: number;
}

export interface ExportStateChange {
    phase: ExportPhase;
    mode?: 'client' | 'server';
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

export type ServerExportResult<T = any> =
    | { data: T[]; total?: number }
    | { blob: Blob; filename?: string }
    | { fileUrl: string; filename?: string };
