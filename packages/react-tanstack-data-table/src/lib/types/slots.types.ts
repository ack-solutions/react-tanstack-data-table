/**
 * Slots and SlotProps Type System for DataTable
 *
 * This file defines all available slots and their corresponding prop types,
 * following the MUI DataGrid pattern for maximum flexibility and extensibility.
 */
import { TableProps, TableContainerProps, BoxProps } from '@mui/material';
import { Table, Row, Column } from '@tanstack/react-table';
import { ComponentType, ReactNode } from 'react';

import { DataTableColumn, TableFilters, ExportProgress, ExportResult, ExportError, ServerExportColumn } from './index';
import { DataTablePaginationProps } from '../components/pagination/data-table-pagination';
import { DataTableSize } from '../utils/table-helpers';


/**
 * Available slots for customization
 */
export interface DataTableSlots<T = any> {
    // Container and wrapper slots
    root?: ComponentType<DataTableSlotProps<T>['root']>;
    tableContainer?: ComponentType<DataTableSlotProps<T>['tableContainer']>;
    table?: ComponentType<DataTableSlotProps<T>['table']>;

    // Header slots
    toolbar?: ComponentType<DataTableSlotProps<T>['toolbar']>;
    header?: ComponentType<DataTableSlotProps<T>['header']>;
    headerRow?: ComponentType<DataTableSlotProps<T>['headerRow']>;
    headerCell?: ComponentType<DataTableSlotProps<T>['headerCell']>;
    sortIconAsc?: ComponentType<DataTableSlotProps<T>['sortIconAsc']>;
    sortIconDesc?: ComponentType<DataTableSlotProps<T>['sortIconDesc']>;

    // Body slots
    body?: ComponentType<DataTableSlotProps<T>['body']>;
    row?: ComponentType<DataTableSlotProps<T>['row']>;
    cell?: ComponentType<DataTableSlotProps<T>['cell']>;

    // Special row slots
    loadingRow?: ComponentType<DataTableSlotProps<T>['loadingRow']>;
    emptyRow?: ComponentType<DataTableSlotProps<T>['emptyRow']>;
    expandedRow?: ComponentType<DataTableSlotProps<T>['expandedRow']>;

    // Footer slots
    footer?: ComponentType<DataTableSlotProps<T>['footer']>;
    pagination?: ComponentType<DataTableSlotProps<T>['pagination']>;

    // Toolbar component slots
    searchInput?: ComponentType<DataTableSlotProps<T>['searchInput']>;
    columnVisibilityControl?: ComponentType<DataTableSlotProps<T>['columnVisibilityControl']>;
    columnCustomFilterControl?: ComponentType<DataTableSlotProps<T>['columnCustomFilterControl']>;
    columnPinningControl?: ComponentType<DataTableSlotProps<T>['columnPinningControl']>;
    exportButton?: ComponentType<DataTableSlotProps<T>['exportButton']>;
    resetButton?: ComponentType<DataTableSlotProps<T>['resetButton']>;
    tableSizeControl?: ComponentType<DataTableSlotProps<T>['tableSizeControl']>;

    // Bulk action slots
    bulkActionsToolbar?: ComponentType<DataTableSlotProps<T>['bulkActionsToolbar']>;

    // Icon slots
    searchIcon?: ComponentType<DataTableSlotProps<T>['searchIcon']>;
    clearIcon?: ComponentType<DataTableSlotProps<T>['clearIcon']>;
    exportIcon?: ComponentType<DataTableSlotProps<T>['exportIcon']>;
    columnIcon?: ComponentType<DataTableSlotProps<T>['columnIcon']>;
    resetIcon?: ComponentType<DataTableSlotProps<T>['resetIcon']>;
    moreIcon?: ComponentType<DataTableSlotProps<T>['moreIcon']>;
    filterIcon?: ComponentType<DataTableSlotProps<T>['filterIcon']>;
    pinIcon?: ComponentType<DataTableSlotProps<T>['pinIcon']>;
    unpinIcon?: ComponentType<DataTableSlotProps<T>['unpinIcon']>;
    leftIcon?: ComponentType<DataTableSlotProps<T>['leftIcon']>;
    rightIcon?: ComponentType<DataTableSlotProps<T>['rightIcon']>;
    csvIcon?: ComponentType<DataTableSlotProps<T>['csvIcon']>;
    excelIcon?: ComponentType<DataTableSlotProps<T>['excelIcon']>;
    selectAllIcon?: ComponentType<DataTableSlotProps<T>['selectAllIcon']>;
    deselectIcon?: ComponentType<DataTableSlotProps<T>['deselectIcon']>;
    tableSizeIcon?: ComponentType<DataTableSlotProps<T>['tableSizeIcon']>;
    tableSizeSmallIcon?: ComponentType<DataTableSlotProps<T>['tableSizeSmallIcon']>;
    tableSizeMediumIcon?: ComponentType<DataTableSlotProps<T>['tableSizeMediumIcon']>;


    // Selection slots
    checkboxSelection?: ComponentType<DataTableSlotProps<T>['checkboxSelection']>;

    // Expansion slots
    expandIcon?: ComponentType<DataTableSlotProps<T>['expandIcon']>;
    collapseIcon?: ComponentType<DataTableSlotProps<T>['collapseIcon']>;

    // Loading and empty state slots
    loadingSkeleton?: ComponentType<DataTableSlotProps<T>['loadingSkeleton']>;
    noDataOverlay?: ComponentType<DataTableSlotProps<T>['noDataOverlay']>;

    // Progress and dialog slots
    exportProgressDialog?: ComponentType<DataTableSlotProps<T>['exportProgressDialog']>;
}

/**
 * Base slot props interface that includes common props for all slots
 */
export interface BaseSlotProps<T = any> {
    table: Table<T>;
    data: T[];
    columns: DataTableColumn<T>[];
}

/**
 * Props for each slot component
 */
export interface DataTableSlotProps<T = any> {
    // Container and wrapper slot props
    root: BaseSlotProps<T> & BoxProps & {
        children: ReactNode;
    };

    tableContainer: BaseSlotProps<T> & TableContainerProps & {
        children: ReactNode;
        enableStickyHeader?: boolean;
        maxHeight?: string | number;
        enableVirtualization?: boolean;
    };

    table: BaseSlotProps<T> & TableProps & {
        children: ReactNode;
        tableSize?: DataTableSize;
        enableStickyHeader?: boolean;
        fitToScreen?: boolean;
        tableStyle?: React.CSSProperties;
    };

    // Header slot props
    toolbar: BaseSlotProps<T> & {
        title?: string;
        subtitle?: string;
        enableGlobalFilter?: boolean;
        enableColumnVisibility?: boolean;
        enableColumnFilter?: boolean;
        enableExport?: boolean;
        enableReset?: boolean;
        enableTableSizeControl?: boolean;
        enableColumnPinning?: boolean;
        extraFilter?: ReactNode;
        serverExport?: {
            fetchData: (page: number, pageSize: number, filters: TableFilters) => Promise<{ data: T[]; total: number }>;
            columns: ServerExportColumn<T>[];
            pageSize?: number;
        };
        currentFilters?: TableFilters;
        onExportStart?: (format: 'csv' | 'excel', summary: { mode: 'client' | 'server'; totalRows: number; estimatedMemoryMB?: number }) => void;
        onExportProgress?: (progress: ExportProgress) => void;
        onExportComplete?: (result: ExportResult) => void;
        onExportError?: (error: ExportError) => void;
        onExportCancel?: () => void;
    };

    header: BaseSlotProps<T> & {
        enableSorting?: boolean;
        draggable?: boolean;
        enableColumnResizing?: boolean;
        enableStickyHeader?: boolean;
        fitToScreen?: boolean;
        onColumnReorder?: (draggedColumnId: string, targetColumnId: string) => void;
    };

    headerRow: BaseSlotProps<T> & {
        headerGroups: any[];
    };

    headerCell: BaseSlotProps<T> & {
        header: any;
        column: Column<T>;
        enableSorting?: boolean;
        draggable?: boolean;
        enableColumnResizing?: boolean;
        onColumnReorder?: (draggedColumnId: string, targetColumnId: string) => void;
        isPinned?: boolean | 'left' | 'right';
        pinnedPosition?: number;
        pinnedRightPosition?: number;
    };

    sortIconAsc: Record<string, any>;
    sortIconDesc: Record<string, any>;

    // Body slot props
    body: BaseSlotProps<T> & {
        children: ReactNode;
        rows: Row<T>[];
        loading?: boolean;
        emptyMessage?: string;
        enableVirtualization?: boolean;
        enablePagination?: boolean;
    };

    row: BaseSlotProps<T> & {
        row: Row<T>;
        index: number;
        enableHover?: boolean;
        enableStripes?: boolean;
        isOdd?: boolean;
        renderSubComponent?: (row: Row<T>) => ReactNode;
        disableStickyHeader?: boolean;
    };

    cell: BaseSlotProps<T> & {
        row: Row<T>;
        cell: any;
        column: Column<T>;
        value: any;
        isPinned?: boolean | 'left' | 'right';
        pinnedPosition?: number;
        pinnedRightPosition?: number;
        alignment?: 'left' | 'center' | 'right';
    };

    // Special row slot props
    loadingRow: BaseSlotProps<T> & {
        rowCount: number;
        colSpan: number;
    };

    emptyRow: BaseSlotProps<T> & {
        colSpan: number;
        message: string;
    };

    expandedRow: BaseSlotProps<T> & {
        row: Row<T>;
        colSpan: number;
        children: ReactNode;
    };

    // Footer slot props
    footer: BaseSlotProps<T> & {
        children: ReactNode;
        enableStickyFooter?: boolean;
    };

    pagination: BaseSlotProps<T> & DataTablePaginationProps;

    // Toolbar component slot props
    searchInput: BaseSlotProps<T> & {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
        autoFocus?: boolean;
    };

    columnsPanel: BaseSlotProps<T> & {
        getTogglableColumns: (columns: DataTableColumn<T>[]) => DataTableColumn<T>[];
        getPinnableColumns: (columns: DataTableColumn<T>[]) => DataTableColumn<T>[];
    }
    columnVisibilityControl: BaseSlotProps<T>;
    columnCustomFilterControl: BaseSlotProps<T>;
    columnPinningControl: BaseSlotProps<T>;
    resetButton: BaseSlotProps<T>;
    tableSizeControl: BaseSlotProps<T>;

    // Bulk action slot props
    bulkActionsToolbar: BaseSlotProps<T> & {
        selectionState: any;
        selectedRowCount: number;
        bulkActions?: (selectionState: any) => ReactNode;
        onBulkAction?: (action: string, selectionState: T[]) => void;
        enableSelectAll?: boolean;
        onSelectAll?: () => void;
        onDeselectAll?: () => void;
    };

    exportButton: BaseSlotProps<T> & {
        filename?: string;
        dataMode?: 'client' | 'server';
        serverExport?: {
            fetchData: (page: number, pageSize: number, filters: TableFilters) => Promise<{ data: T[]; total: number }>;
            columns: ServerExportColumn<T>[];
            pageSize?: number;
        };
        currentFilters?: TableFilters;
        onExportStart?: (format: 'csv' | 'excel', summary: { mode: 'client' | 'server'; totalRows: number; estimatedMemoryMB?: number }) => void;
        onExportProgress?: (progress: ExportProgress) => void;
        onExportComplete?: (result: ExportResult) => void;
        onExportError?: (error: ExportError) => void;
        onExportCancel?: () => void;
    };


    // Icon slot props - simple components that just need basic styling
    searchIcon: Record<string, any>;
    clearIcon: Record<string, any>;
    exportIcon: Record<string, any>;
    columnIcon: Record<string, any>;
    resetIcon: Record<string, any>;
    moreIcon: Record<string, any>;
    filterIcon: Record<string, any>;
    pinIcon: Record<string, any>;
    unpinIcon: Record<string, any>;
    leftIcon: Record<string, any>;
    rightIcon: Record<string, any>;
    expandIcon: Record<string, any>;
    collapseIcon: Record<string, any>;
    csvIcon: Record<string, any>;
    excelIcon: Record<string, any>;
    selectAllIcon: Record<string, any>;
    deselectIcon: Record<string, any>;
    tableSizeIcon: Record<string, any>;
    tableSizeSmallIcon: Record<string, any>;
    tableSizeMediumIcon: Record<string, any>;

    // Selection slot props
    checkboxSelection: BaseSlotProps<T> & {
        row?: Row<T>;
        checked: boolean;
        indeterminate?: boolean;
        onChange: (checked: boolean) => void;
        disabled?: boolean;
    };

    selectionColumn: DataTableColumn<T>;
    expandColumn: DataTableColumn<T>;

    // Loading and empty state slot props
    loadingSkeleton: BaseSlotProps<T> & {
        rows: number;
        columns: number;
    };

    noDataOverlay: BaseSlotProps<T> & {
        message: string;
    };

    // Progress and dialog slot props
    exportProgressDialog: BaseSlotProps<T> & {
        open: boolean;
        progress: ExportProgress;
        onCancel: () => void;
    };
}

/**
 * Default slot components - can be overridden by users
 */
export interface DefaultSlots<T = any> extends DataTableSlots<T> {
    // All slots should have default implementations
}

/**
 * Utility type to make all slot props optional for easier usage
 */
export type PartialSlotProps<T = any> = {
    [K in keyof DataTableSlotProps<T>]?: Partial<DataTableSlotProps<T>[K]>;
};

/**
 * Utility type for slot component props with proper generic support
 */
export type SlotComponentProps<
    TSlot extends keyof DataTableSlots<T>,
    T = any
> = DataTableSlotProps<T>[TSlot];
