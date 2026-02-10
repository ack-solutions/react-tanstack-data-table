/**
 * Enhanced Slots and SlotProps Type System for DataTable
 *
 * This file defines all available slots and their corresponding prop types,
 * following the MUI DataGrid pattern for maximum flexibility and extensibility.
 * 
 * Key improvements:
 * - Full component props inheritance without limitations
 * - Better type safety with generic support
 * - Flexible prop merging and overriding
 * - Support for custom styling and behavior
 */
import { TableProps, TableContainerProps, BoxProps, ToolbarProps, TableRowProps, TableCellProps, TableHeadProps, TableBodyProps } from '@mui/material';
import { Table, Row, Column } from '@tanstack/react-table';
import { ComponentType, ReactNode, HTMLAttributes, ComponentProps } from 'react';

import { DataTableColumn, TableFilters, ExportProgress, ExportResult, ExportError, ServerExportColumn, ExportStateChange } from './index';
import { DataTableSize } from '../utils/table-helpers';
import { DataTablePaginationProps } from "../components/pagination";
import { DataTableToolbarProps } from '../components/toolbar/data-table-toolbar';

/**
 * Enhanced slot component type that supports full component customization
 */
export type SlotComponent<TProps = any> = ComponentType<TProps>;

/**
 * Base slot props interface that includes common props for all slots
 */
export interface BaseSlotProps<T = any> {
    table: Table<T>;
}

/**
 * Enhanced slot props that merge base props with component-specific props
 */
export type EnhancedSlotProps<TBase, TComponent> = TBase & TComponent & {
    // Allow any additional props for maximum flexibility
    [key: string]: any;
};

/**
 * Available slots for customization with enhanced typing
 */
export interface DataTableSlots<T = any> {
    // Container and wrapper slots
    root?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, BoxProps & { children: ReactNode }>>;
    tableContainer?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, TableContainerProps & { 
        children: ReactNode;
        enableStickyHeader?: boolean;
        maxHeight?: string | number;
        enableVirtualization?: boolean;
    }>>;
    table?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, TableProps & { 
        children: ReactNode;
        tableSize?: DataTableSize;
        enableStickyHeader?: boolean;
        fitToScreen?: boolean;
        tableStyle?: React.CSSProperties;
    }>>;

    // Header slots
    toolbar?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, ToolbarProps & DataTableToolbarProps & {
        title?: string;
        subtitle?: string;
        enableGlobalFilter?: boolean;
        enableColumnVisibility?: boolean;
        enableColumnFilter?: boolean;
        enableExport?: boolean;
        enableReset?: boolean;
        enableTableSizeControl?: boolean;
        enableColumnPinning?: boolean;
        enableRefresh?: boolean;
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
        onExportStateChange?: (state: ExportStateChange) => void;
    }>>;

    header?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, TableHeadProps & {
        enableSorting?: boolean;
        draggable?: boolean;
        enableColumnResizing?: boolean;
        enableStickyHeader?: boolean;
        fitToScreen?: boolean;
        onColumnReorder?: (draggedColumnId: string, targetColumnId: string) => void;
    }>>;

    headerRow?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, TableRowProps & {
        headerGroups: any[];
    }>>;

    headerCell?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, TableCellProps & {
        header: any;
        column: Column<T>;
        enableSorting?: boolean;
        draggable?: boolean;
        enableColumnResizing?: boolean;
        onColumnReorder?: (draggedColumnId: string, targetColumnId: string) => void;
        isPinned?: boolean | 'left' | 'right';
        pinnedPosition?: number;
        pinnedRightPosition?: number;
    }>>;

    // Icon slots with full component props
    sortIconAsc?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    sortIconDesc?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;

    // Body slots
    body?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, TableBodyProps & {
        children: ReactNode;
        rows: Row<T>[];
        loading?: boolean;
        emptyMessage?: string;
        enableVirtualization?: boolean;
        enablePagination?: boolean;
    }>>;

    row?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, TableRowProps & {
        row: Row<T>;
        index: number;
        enableHover?: boolean;
        enableStripes?: boolean;
        isOdd?: boolean;
        renderSubComponent?: (row: Row<T>) => ReactNode;
        disableStickyHeader?: boolean;
    }>>;

    cell?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, TableCellProps & {
        row: Row<T>;
        cell: any;
        column: Column<T>;
        value: any;
        isPinned?: boolean | 'left' | 'right';
        pinnedPosition?: number;
        pinnedRightPosition?: number;
        alignment?: 'left' | 'center' | 'right';
    }>>;

    // Special row slots
    loadingRow?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, TableRowProps & {
        rowCount: number;
        colSpan: number;
    }>>;

    emptyRow?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, TableRowProps & {
        colSpan: number;
        message: string;
    }>>;

    expandedRow?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, TableRowProps & {
        row: Row<T>;
        colSpan: number;
        children: ReactNode;
    }>>;

    // Footer slots
    footer?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, BoxProps & {
        children: ReactNode;
        enableStickyFooter?: boolean;
    }>>;

    pagination?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, DataTablePaginationProps>>;

    // Toolbar component slots with full component inheritance
    searchInput?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, ComponentProps<'input'> & {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
        autoFocus?: boolean;
    }>>;

    columnVisibilityControl?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, HTMLAttributes<HTMLDivElement>>>;
    columnCustomFilterControl?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, HTMLAttributes<HTMLDivElement>>>;
    columnPinningControl?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, HTMLAttributes<HTMLDivElement>>>;
    resetButton?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, ComponentProps<'button'>>>;
    tableSizeControl?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, HTMLAttributes<HTMLDivElement>>>;

    // Bulk action slots
    bulkActionsToolbar?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, ToolbarProps & {
        selectionState: any;
        selectedRowCount: number;
        bulkActions?: (selectionState: any) => ReactNode;
        onBulkAction?: (action: string, selectionState: T[]) => void;
        enableSelectAll?: boolean;
        onSelectAll?: () => void;
        onDeselectAll?: () => void;
    }>>;

    exportButton?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, ComponentProps<'button'> & {
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
        onExportStateChange?: (state: ExportStateChange) => void;
    }>>;

    refreshButton?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, ComponentProps<'button'> & {
        loading?: boolean;
        showSpinnerWhileLoading?: boolean;
        onRefresh?: () => void;
    }>>;

    // Icon slots with full SVG component props
    searchIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    refreshIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    clearIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    exportIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    columnIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    resetIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    moreIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    filterIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    pinIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    unpinIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    leftIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    rightIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    csvIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    excelIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    selectAllIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    deselectIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    tableSizeIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    tableSizeSmallIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    tableSizeMediumIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;

    // Selection slots
    checkboxSelection?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, ComponentProps<'input'> & {
        row?: Row<T>;
        checked: boolean;
        indeterminate?: boolean;
        onChange: (checked: boolean) => void;
        disabled?: boolean;
    }>>;

    // Expansion slots
    expandIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;
    collapseIcon?: SlotComponent<ComponentProps<'svg'> & { [key: string]: any }>;

    // Loading and empty state slots
    loadingSkeleton?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, HTMLAttributes<HTMLDivElement> & {
        rows: number;
        columns: number;
    }>>;

    noDataOverlay?: SlotComponent<EnhancedSlotProps<BaseSlotProps<T>, HTMLAttributes<HTMLDivElement> & {
        message: string;
    }>>;



    // Special column slots
    selectionColumn?: DataTableColumn<T>;
    expandColumn?: DataTableColumn<T>;
}

/**
 * Enhanced slot props type that allows full customization
 */
export type DataTableSlotProps<T = any> = {
    [K in keyof DataTableSlots<T>]?: Record<string, any>;
};

/**
 * Columns panel props for slot customization
 */
export interface ColumnsPanelSlotProps<T = any> {
    getTogglableColumns?: (columns: DataTableColumn<T>[]) => DataTableColumn<T>[];
    getPinnableColumns?: (columns: DataTableColumn<T>[]) => DataTableColumn<T>[];
}

/**
 * Utility type to make all slot props optional for easier usage
 */
export type PartialSlotProps<T = any> = {
    [K in keyof DataTableSlotProps<T>]?: Partial<DataTableSlotProps<T>[K]>;
} & {
    // Special props for columns panel
    columnsPanel?: ColumnsPanelSlotProps<T>;
};

/**
 * Utility type for slot component props with proper generic support
 */
export type SlotComponentProps<
    TSlot extends keyof DataTableSlots<T>,
    T = any
> = DataTableSlots<T>[TSlot] extends SlotComponent<infer TProps> ? TProps : never;

/**
 * Helper type to extract component props from a slot
 */
export type ExtractSlotProps<TSlot> = TSlot extends SlotComponent<infer TProps> ? TProps : never;

/**
 * Default slot components - can be overridden by users
 */
// export interface DefaultSlots<T = any> extends DataTableSlots<T> {
//     // All slots should have default implementations
// }

/**
 * Enhanced slot configuration with better prop merging
 */
export interface SlotConfiguration<T = any> {
    slots?: Partial<DataTableSlots<T>>;
    slotProps?: PartialSlotProps<T>;
}

/**
 * Slot override configuration for advanced customization
 */
export interface SlotOverrideConfig<T = any> {
    // Override specific slot behavior
    overrideSlot?: <K extends keyof DataTableSlots<T>>(
        slotName: K,
        component: DataTableSlots<T>[K],
        props?: Partial<SlotComponentProps<K, T>>
    ) => void;
    
    // Merge props with existing slot props
    mergeSlotProps?: <K extends keyof DataTableSlots<T>>(
        slotName: K,
        props: Partial<SlotComponentProps<K, T>>
    ) => Partial<SlotComponentProps<K, T>>;
}
