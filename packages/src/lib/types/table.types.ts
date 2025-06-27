import { SortingState, TableState as TanstackTableState } from '@tanstack/react-table';

import { ColumnFilterRule } from '../features';


/**
 * Table State and Configuration Types
 * Consolidated table-related interfaces from data-table.types.ts
 */

/**
 * Table filters configuration
 */

export type TableSize = 'small' | 'medium';

// declare module '@tanstack/react-table' {
//     interface TableState {
//         customColumnsFilter: CustomColumnFilterState;
//     }
// }

export interface TableState extends TanstackTableState {
    customColumnsFilter: CustomColumnFilterState;
}

export interface TableFilters {
    globalFilter: string;
    customColumnsFilter: CustomColumnFilterState;
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

export interface TableFiltersForFetch {
    search?: string;
    page?: number;
    pageSize?: number;
    sorting?: SortingState;
    customColumnsFilter?: CustomColumnFilterState;
}

export interface CustomColumnFilterState {
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
