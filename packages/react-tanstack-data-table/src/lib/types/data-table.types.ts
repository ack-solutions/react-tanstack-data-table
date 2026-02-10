/**
 * Type definitions for DataTable components
 */
import { Row, SortingState, ColumnResizeMode, ColumnPinningState, PaginationState, ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';

import type { ColumnFilterState, TableFilters, TableState } from './index';
import { DataTableSlots, PartialSlotProps } from './slots.types';
import { DataTableSize } from '../utils/table-helpers';
import { SelectionState, SelectMode } from '../features';
import { DataTableLoggingOptions } from '../utils/logger';

// Dynamic data management interfaces
// TableFilters now imported from types folder

export type DataRefreshReason = 'initial' | 'state-change' | 'refresh' | 'reload' | 'reset' | string;

export interface DataFetchMeta {
    reason?: DataRefreshReason;
    force?: boolean;
}

export interface DataRefreshOptions extends DataFetchMeta {
    resetPagination?: boolean;
}

export interface DataRefreshContext {
    filters: Partial<TableFilters>;
    state: Partial<TableState>;
    options: Required<Pick<DataRefreshOptions, 'resetPagination' | 'force'>> & {
        reason: string;
    };
}

export type DataMutationAction =
    | 'updateRow'
    | 'updateRowByIndex'
    | 'insertRow'
    | 'deleteRow'
    | 'deleteRowByIndex'
    | 'deleteSelectedRows'
    | 'replaceAllData'
    | 'updateMultipleRows'
    | 'insertMultipleRows'
    | 'deleteMultipleRows'
    | 'updateField'
    | 'updateFieldByIndex';

export interface DataMutationContext<T> {
    action: DataMutationAction;
    previousData: T[];
    nextData: T[];
    rowId?: string;
    index?: number;
    rowIds?: string[];
    totalRow?: number;
}

export interface DataTableProps<T> {
    // Core data props
    // columns: DataTableColumn<T>[] | AccessorKeyColumnDef <T, string>[];
    columns: ColumnDef<T, any>[];
    data?: T[];
    totalRow?: number;
    idKey?: keyof T;
    extraFilter?: ReactNode | null;
    footerFilter?: ReactNode | null;

    // Data management modes (MUI DataGrid style)
    dataMode?: 'client' | 'server'; // Data management mode (default: 'client')
    initialState?: Partial<TableState>;
    initialLoadData?: boolean; // Initial load data (default: true)
    onDataStateChange?: (filters: Partial<TableState>) => void; // Callback when any filter/state changes
    onFetchData?: (filters: Partial<TableFilters>, meta?: DataFetchMeta) => Promise<{ data: T[]; total: number }>;
    onRefreshData?: (context: DataRefreshContext) => void | Promise<void>;
    onDataChange?: (nextData: T[], context: DataMutationContext<T>) => void;

    // Simplified Export props
    exportFilename?: string;
    onExportProgress?: (progress: { processedRows?: number; totalRows?: number; percentage?: number }) => void;
    onExportComplete?: (result: { success: boolean; filename: string; totalRows: number }) => void;
    onExportError?: (error: { message: string; code: string }) => void;

    // Server export callback - receives current table state/filters and selection data
    onServerExport?: (filters?: Partial<TableState>, selection?: SelectionState) => Promise<{ data: any[]; total: number }>;

    // Export cancellation callback - called when export is cancelled
    onExportCancel?: () => void;

    // Selection props
    enableRowSelection?: boolean | ((row: Row<T>) => boolean);
    enableMultiRowSelection?: boolean;
    selectMode?: SelectMode; // 'page' | 'all' - defines selection scope
    
    // Row selection control (like MUI DataGrid)
    isRowSelectable?: (params: { row: T; id: string }) => boolean;
    
    onSelectionChange?: (selection: SelectionState) => void;

    // Row click props
    onRowClick?: (event: React.MouseEvent<HTMLTableRowElement>, row: Row<T>) => void;
    selectOnRowClick?: boolean; // If true, row click will toggle selection (default: false)

    // Bulk action props
    enableBulkActions?: boolean;
    bulkActions?: (selectionState: SelectionState) => ReactNode;

    // Column resizing props
    enableColumnResizing?: boolean;
    columnResizeMode?: ColumnResizeMode;
    onColumnSizingChange?: (sizing: Record<string, number>) => void;

    // Column ordering props
    enableColumnDragging?: boolean;
    onColumnDragEnd?: (columnOrder: string[]) => void;

    // Column pinning props
    enableColumnPinning?: boolean;
    onColumnPinningChange?: (pinning: ColumnPinningState) => void;

    // Column visibility props
    enableColumnVisibility?: boolean;
    onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;

    // Expandable rows props
    enableExpanding?: boolean;
    getRowCanExpand?: (row: Row<T>) => boolean;
    renderSubComponent?: (row: Row<T>) => ReactNode;

    // Pagination props
    enablePagination?: boolean;
    paginationMode?: 'client' | 'server'; // Pagination mode (default: 'client')

    // Filtering props
    enableGlobalFilter?: boolean;
    enableColumnFilter?: boolean;
    filterMode?: 'client' | 'server'; // Filtering mode (default: 'client')

    // Sorting props
    enableSorting?: boolean;
    sortingMode?: 'client' | 'server'; // Sorting mode (default: 'client')
    onSortingChange?: (sorting: SortingState) => void;

    // Styling props
    enableHover?: boolean;
    enableStripes?: boolean;
    tableContainerProps?: any;
    tableProps?: any;
    fitToScreen?: boolean;
    tableSize?: DataTableSize;

    // Sticky header/footer props
    enableStickyHeaderOrFooter?: boolean;
    maxHeight?: string | number;

    // Virtualization props
    enableVirtualization?: boolean;
    estimateRowHeight?: number;

    // Toolbar props
    enableTableSizeControl?: boolean;
    enableExport?: boolean;
    enableReset?: boolean;
    enableRefresh?: boolean;

    // Loading and empty states
    loading?: boolean;
    emptyMessage?: string | ReactNode;
    skeletonRows?: number;

    // Column filters props
    onColumnFiltersChange?: (filterState: ColumnFilterState) => void;
    onPaginationChange?: (pagination: PaginationState) => void;
    onGlobalFilterChange?: (globalFilter: string) => void;
    onColumnFilterChange?: (columnFilter: ColumnFilterState) => void;
    // Slots for component customization (similar to MUI DataGrid)
    slots?: Partial<DataTableSlots<T>>;
    slotProps?: PartialSlotProps<T>;

    // Logging configuration
    logging?: boolean | DataTableLoggingOptions;
}
