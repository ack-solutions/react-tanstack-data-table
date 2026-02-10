/**
 * Export Configuration Types
 * Consolidated export-related interfaces from export-utils.ts
 */

import { TableState } from './table.types';


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

export type ExportValueFormat = 'auto' | 'string' | 'number' | 'boolean' | 'json' | 'date';

export interface ExportStateChange {
    phase: ExportPhase;
    mode: 'client' | 'server';
    format: ExportFormat;
    filename: string;
    processedRows?: number;
    totalRows?: number;
    percentage?: number;
    message?: string;
    code?: string;
    startedAt?: number;
    endedAt?: number;
    queueLength?: number;
}

export interface ExportProgressPayload {
    processedRows?: number;
    totalRows?: number;
    percentage?: number;
}

export interface ServerExportDataResult<T = any> {
    data: T[];
    total: number;
}

export interface ServerExportBlobResult {
    blob: Blob;
    filename?: string;
    mimeType?: string;
    total?: number;
}

export interface ServerExportFileUrlResult {
    fileUrl: string;
    filename?: string;
    mimeType?: string;
    total?: number;
}

export type ServerExportResult<T = any> =
    | ServerExportDataResult<T>
    | ServerExportBlobResult
    | ServerExportFileUrlResult;

/**
 * Server export column configuration
 */
export interface ServerExportColumn<T = any> {
    id: string;
    header: string;
    accessor: keyof T | string;
    formatter?: (value: any, row: T) => string;
}

/**
 * Export options configuration
 */
export interface ExportOptions {
    filename?: string;
    format: ExportFormat;
    includeHeaders?: boolean;
    onlyVisibleColumns?: boolean;
    onlyFilteredData?: boolean;
    // New options for large datasets
    chunkSize?: number;
    onProgress?: (progress: ExportProgress) => void;
    onComplete?: (result: ExportResult) => void;
    onError?: (error: ExportError) => void;
    signal?: AbortSignal; // For cancellation
}

/**
 * Export progress information
 */
export interface ExportProgress {
    processedRows?: number;
    totalRows?: number;
    percentage?: number;
    currentChunk?: number;
    totalChunks?: number;
    estimatedTimeRemaining?: number;
}

/**
 * Export result information
 */
export interface ExportResult {
    success: boolean;
    filename: string;
    totalRows: number;
    totalColumns: number;
    processingTime: number;
    fileSize?: number;
}

/**
 * Export error information
 */
export interface ExportError {
    message: string;
    code: 'CANCELLED' | 'MEMORY_ERROR' | 'PROCESSING_ERROR' | 'UNKNOWN' | 'EXPORT_IN_PROGRESS';
    details?: any;
}

/**
 * Export configuration for DataTable
 */
export interface ExportConfig {
    enabled: boolean;
    formats: ExportFormat[];
    filename?: string;
    includeHeaders?: boolean;
    onlyVisibleColumns?: boolean;
    onlyFilteredData?: boolean;
    // New configuration for large datasets
    chunkSize?: number;
    strictTotalCheck?: boolean;
    sanitizeCSV?: boolean;
    concurrency?: ExportConcurrencyMode;
    enableProgressTracking?: boolean;
    maxMemoryThreshold?: number; // MB
}

/**
 * Export state for tracking ongoing exports
 */
export interface ExportState {
    isExporting: boolean;
    progress?: ExportProgress;
    controller?: AbortController;
    startTime?: number;
}

/**
 * Chunked data processing configuration
 */
export interface ChunkProcessingConfig {
    chunkSize: number;
    delayBetweenChunks: number; // ms
    useWebWorker: boolean;
}

/**
 * Styling options for pinned columns (actual implementation)
 */
export interface PinnedColumnStyleOptions {
    width?: number | string;
    minWidth?: number;
    maxWidth?: number;
    isPinned?: 'left' | 'right' | false;
    pinnedPosition?: number;
    pinnedRightPosition?: number;
    zIndex?: number;
    disableStickyHeader?: boolean;
    isLastLeftPinnedColumn?: boolean;
    isFirstRightPinnedColumn?: boolean;
    wrapText?: boolean; // If true, text will wrap; if false, text will truncate with ellipsis (default: false)
}

/**
 * Simplified Export Types for DataTable
 */

export interface SimpleExportOptions {
    filename?: string;
    format: ExportFormat;
    includeHeaders?: boolean;
    onlyVisibleColumns?: boolean;
    onlySelectedRows?: boolean;
    chunkSize?: number;
    strictTotalCheck?: boolean;
    sanitizeCSV?: boolean;
}

/**
 * Selection data for server exports
 */
export interface SelectionExportData {
    selectAllMatching?: boolean;
    excludedIds?: string[];
    selectedIds?: string[];
    hasSelection?: boolean;
}

export interface ServerExportOptions extends SimpleExportOptions {
    fetchData: (
        filters?: Partial<TableState>,
        selection?: SelectionExportData,
        signal?: AbortSignal
    ) => Promise<ServerExportResult<any>>;
    currentFilters?: any; // Current table filters/state
    pageSize?: number;
    selection?: SelectionExportData;
}

export interface ExportCallbacks {
    onProgress?: (progress: ExportProgress) => void;
    onComplete?: (result: ExportResult) => void;
    onError?: (error: ExportError) => void;
    onStateChange?: (state: ExportStateChange) => void;
}
