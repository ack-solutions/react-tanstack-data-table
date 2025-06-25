/**
 * Export Configuration Types
 * Consolidated export-related interfaces from export-utils.ts
 */

import { TableState } from './table.types';


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
    format: 'csv' | 'excel';
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
    processedRows: number;
    totalRows: number;
    percentage: number;
    currentChunk: number;
    totalChunks: number;
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
    code: 'CANCELLED' | 'MEMORY_ERROR' | 'PROCESSING_ERROR' | 'UNKNOWN';
    details?: any;
}

/**
 * Export configuration for DataTable
 */
export interface ExportConfig {
    enabled: boolean;
    formats: ('csv' | 'excel')[];
    filename?: string;
    includeHeaders?: boolean;
    onlyVisibleColumns?: boolean;
    onlyFilteredData?: boolean;
    // New configuration for large datasets
    chunkSize?: number;
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
    isPinned?: 'left' | 'right' | false;
    pinnedPosition?: number;
    pinnedRightPosition?: number;
    zIndex?: number;
    disableStickyHeader?: boolean;
    isLastLeftPinnedColumn?: boolean;
    isFirstRightPinnedColumn?: boolean;
}

/**
 * Simplified Export Types for DataTable
 */

export interface SimpleExportOptions {
    filename?: string;
    format: 'csv' | 'excel';
    includeHeaders?: boolean;
    onlyVisibleColumns?: boolean;
    onlySelectedRows?: boolean;
}

export interface ServerExportOptions extends SimpleExportOptions {
    fetchData: (filters?: Partial<TableState>) => Promise<{ data: any[]; total: number }>;
    currentFilters?: any; // Current table filters/state
    pageSize?: number;
}

export interface ExportCallbacks {
    onProgress?: (progress: ExportProgress) => void;
    onComplete?: (result: ExportResult) => void;
    onError?: (error: ExportError) => void;
}
