import { SortingState } from '@tanstack/react-table';

import { ColumnFilterRule, SelectionState } from '../features';


/**
 * Table State and Configuration Types
 * Consolidated table-related interfaces from data-table.types.ts
 */

/**
 * Table filters configuration
 */

export type TableSize = 'small' | 'medium';

// Extended table state interface with custom column filter support

export interface TableState {
    columnFilter: ColumnFilterState;
    selectionState?: SelectionState; // Selection state for CustomSelectionFeature
    globalFilter?: string;
    sorting?: SortingState;
    pagination?: {
        pageIndex: number;
        pageSize: number;
    };
    columnOrder?: string[];
    columnPinning?: {
        left?: string[];
        right?: string[];
    };
    columnVisibility?: Record<string, boolean>;
    columnSizing?: Record<string, number>;
}

export interface TableFilters {
    globalFilter: string;
    columnFilter: ColumnFilterState;
    sorting: SortingState;
    pagination: {
        pageIndex: number;
        pageSize: number;
    };
    columnOrder: string[];
    columnPinning: {
        left?: string[];
        right?: string[];
    };
}

export interface TableFiltersForFetch extends Partial<TableFilters> {
    search?: string;
    page?: number;
    pageSize?: number;
}

export interface ColumnFilterState {
    filters: ColumnFilterRule[];
    logic: 'AND' | 'OR';
    // Add pending state for draft filters before applying
    pendingFilters: ColumnFilterRule[];
    pendingLogic: 'AND' | 'OR';
}

/**
 * Table performance metrics
 */
export interface TablePerformanceMetrics {
    renderTime: number;
    dataProcessingTime: number;
    totalRows: number;
    visibleRows: number;
    memoryUsage?: number;
}

/**
 * Table metrics for debugging and optimization
 */
export interface TableMetrics {
    totalRows: number;
    visibleRows: number;
    totalColumns?: number;
    visibleColumns?: number;
    pinnedColumns?: number;
    renderTime: number;
    lastUpdated?: Date;
}
