/**
 * General table utilities for DataTable components
 */

// Import types from centralized location
import type { TableMetrics } from '../types';


export type DataTableSize = 'small' | 'medium';

/**
 * Calculate skeleton rows count based on viewport and row height
 */
export function calculateSkeletonRows(
    containerHeight: number,
    rowHeight: number,
    maxRows = 10,
): number {
    const estimatedRows = Math.ceil(containerHeight / rowHeight);
    return Math.min(estimatedRows, maxRows);
}

/**
 * Generate unique row ID for virtualization
 */
export function generateRowId<T>(row: T, index: number, idKey?: keyof T): string {
    if (idKey && row[idKey]) {
        return String(row[idKey]);
    }
    return `row-${index}`;
}

/**
 * Calculate total width of pinned columns
 */
export function calculatePinnedColumnsWidth(
    columns: any[],
    side: 'left' | 'right',
): number {
    return columns
        .filter(col => col.getIsPinned() === side)
        .reduce((total, col) => total + (col.getSize() || 0), 0);
}

/**
 * Check if table should use fixed layout
 */
export function shouldUseFixedLayout(
    fitToScreen: boolean,
    enableColumnResizing: boolean,
    totalColumns: number,
): boolean {
    return fitToScreen || (enableColumnResizing && totalColumns > 5);
}

/**
 * Format cell value based on column type
 */
export function formatCellValue(value: any, type: string): string {
    if (value === null || value === undefined) {
        return '-';
    }

    switch (type) {
        case 'date':
            return value instanceof Date ? value.toLocaleDateString() : String(value);
        case 'number':
            return typeof value === 'number' ? value.toLocaleString() : String(value);
        case 'boolean':
            return value ? 'Yes' : 'No';
        default:
            return String(value);
    }
}

/**
 * Debounce function for search and filters
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Get table performance metrics
 */

export function calculateTableMetrics(
    totalRows: number,
    visibleRows: number,
    columns: any[],
    renderStartTime: number,
): TableMetrics {
    return {
        totalRows,
        visibleRows,
        pinnedColumns: columns.filter(col => col.getIsPinned()).length,
        renderTime: performance.now() - renderStartTime,
    };
}
