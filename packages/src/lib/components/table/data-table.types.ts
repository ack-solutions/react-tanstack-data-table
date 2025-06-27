/**
 * Type definitions for DataTable components
 */
import { Row, SortingState, ColumnResizeMode, ColumnPinningState, RowData, TableState } from '@tanstack/react-table';
import { ReactNode } from 'react';

import type { CustomColumnFilterState } from '../../types';
import { DataTableColumn } from '../../types';
import { DataTableSlots, PartialSlotProps } from '../../types/slots.types';
import { DataTableSize } from '../../utils/table-helpers';


// Import consolidated types


declare module '@tanstack/table-core' {
    interface ColumnMeta<TData extends RowData, TValue> { // eslint-disable-line @typescript-eslint/no-unused-vars
    }
}

// Dynamic data management interfaces
// TableFilters now imported from types folder

export interface DataTableProps<T> {
    // Core data props
    columns: DataTableColumn<T>[];
    data?: T[];
    totalRow?: number;
    idKey?: keyof T;
    extraFilter?: ReactNode | null;
    footerFilter?: ReactNode | null;

    // Data management modes (MUI DataGrid style)
    dataMode?: 'client' | 'server'; // Data management mode (default: 'client')
    initialState?: Partial<TableState>;
    initilaLoadData?: boolean; // Initial load data (default: true)
    onDataStateChange?: (filters: Partial<TableState>) => void; // Callback when any filter/state changes
    onFetchData?: (filters: Partial<TableState>) => Promise<{ data: T[]; total: number }>;

    // Simplified Export props
    exportFilename?: string;
    onExportProgress?: (progress: { processedRows: number; totalRows: number; percentage: number }) => void;
    onExportComplete?: (result: { success: boolean; filename: string; totalRows: number }) => void;
    onExportError?: (error: { message: string; code: string }) => void;

    // Server export callback - receives current table state/filters
    onServerExport?: (filters?: Partial<TableState>) => Promise<{ data: any[]; total: number }>;

    // Export cancellation callback - called when export is cancelled
    onExportCancel?: () => void;

    // Selection props
    enableRowSelection?: boolean | ((row: Row<T>) => boolean);
    enableMultiRowSelection?: boolean;
    onRowSelectionChange?: (selectedRows: T[]) => void;

    // Bulk action props
    enableBulkActions?: boolean;
    bulkActions?: (selectedRows: T[]) => ReactNode;

    // Column resizing props
    enableColumnResizing?: boolean;
    columnResizeMode?: ColumnResizeMode;

    // Column ordering props
    draggable?: boolean;
    onColumnDragEnd?: (columnOrder: string[]) => void;

    // Column pinning props
    enableColumnPinning?: boolean;
    onColumnPinningChange?: (pinning: ColumnPinningState) => void;

    // Expandable rows props
    enableExpanding?: boolean;
    getRowCanExpand?: (row: Row<T>) => boolean;
    renderSubComponent?: (row: Row<T>) => ReactNode;

    // Pagination props
    enablePagination?: boolean;
    paginationMode?: 'client' | 'server'; // Pagination mode (default: 'client')

    // Filtering props
    enableGlobalFilter?: boolean;
    enableColumnFilters?: boolean;
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
    enableColumnVisibility?: boolean;
    enableTableSizeControl?: boolean;
    enableExport?: boolean;
    enableReset?: boolean;

    // Loading and empty states
    loading?: boolean;
    emptyMessage?: string;
    skeletonRows?: number;

    // Column filters props
    onColumnFiltersChange?: (filterState: CustomColumnFilterState) => void;

    // Custom column filters props
    enableCustomColumnsFilter?: boolean;

    // Data CRUD callbacks
    onDataChange?: (data: T[]) => void;

    // Simple special columns configuration
    selectionColumn?: {
        width?: number;
        pinLeft?: boolean;
        customColumn?: DataTableColumn<any>;
        id?: string; // Simple ID override
    };

    // Action column customization
    actionColumn?: {
        pinRight?: boolean;
        customColumn?: DataTableColumn<any>;
        id?: string; // Simple ID override
    };

    // Expanding column customization
    expandingColumn?: {
        width?: number;
        pinLeft?: boolean;
        customColumn?: DataTableColumn<any>;
        id?: string; // Simple ID override
    };

    // Slots for component customization (similar to MUI DataGrid)
    slots?: Partial<DataTableSlots<T>>;
    slotProps?: PartialSlotProps<T>;
}

// All interfaces moved to centralized types folder:
// - TableState
// - TablePerformanceMetrics
// - ColumnConfig<T>
// - ExportConfig
