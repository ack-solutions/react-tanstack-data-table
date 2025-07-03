import { ColumnPinningState, SortingState, ColumnOrderState, TableState, Row } from '@tanstack/react-table';

import { CustomColumnFilterState } from './table.types';
import { SelectionState } from '../features/custom-selection.feature';

export interface DataTableApi<T = any> {
    // Column Management
    columnVisibility: {
        showColumn: (columnId: string) => void;
        hideColumn: (columnId: string) => void;
        toggleColumn: (columnId: string) => void;
        showAllColumns: () => void;
        hideAllColumns: () => void;
        resetColumnVisibility: () => void;
    };

    // Column Ordering
    columnOrdering: {
        setColumnOrder: (columnOrder: ColumnOrderState) => void;
        moveColumn: (columnId: string, toIndex: number) => void;
        resetColumnOrder: () => void;
    };

    // Column Pinning
    columnPinning: {
        pinColumnLeft: (columnId: string) => void;
        pinColumnRight: (columnId: string) => void;
        unpinColumn: (columnId: string) => void;
        setPinning: (pinning: ColumnPinningState) => void;
        resetColumnPinning: () => void;
    };

    // Column Resizing
    columnResizing: {
        resizeColumn: (columnId: string, width: number) => void;
        autoSizeColumn: (columnId: string) => void;
        autoSizeAllColumns: () => void;
        resetColumnSizing: () => void;
    };

    // Filtering
    filtering: {
        setGlobalFilter: (filter: string) => void;
        clearGlobalFilter: () => void;
        setCustomColumnFilters: (filters: CustomColumnFilterState) => void;
        addColumnFilter: (columnId: string, operator: string, value: any) => void;
        removeColumnFilter: (filterId: string) => void;
        clearAllFilters: () => void;
        resetFilters: () => void;
    };

    // Sorting
    sorting: {
        setSorting: (sorting: SortingState) => void;
        sortColumn: (columnId: string, direction: 'asc' | 'desc' | false) => void;
        clearSorting: () => void;
        resetSorting: () => void;
    };

    // Pagination
    pagination: {
        goToPage: (pageIndex: number) => void;
        nextPage: () => void;
        previousPage: () => void;
        setPageSize: (pageSize: number) => void;
        goToFirstPage: () => void;
        goToLastPage: () => void;
    };

    // Enhanced Row Selection with automatic mode detection
    selection: {
        // Basic selection (works with current selectMode)
        selectRow: (rowId: string) => void;
        deselectRow: (rowId: string) => void;
        toggleRowSelection: (rowId: string) => void;

        // Smart selection methods (automatically handle page vs all modes)
        selectAll: () => void; // Selects all based on current selectMode
        deselectAll: () => void; // Deselects all
        toggleSelectAll: () => void; // Toggles select all

        // Selection state getters
        getSelectionState: () => SelectionState; // Get selection state
        getSelectedCount: () => number; // Get total selected count
        getSelectedRows: () => Row<T>[]
        // Selection state checks
        isRowSelected: (rowId: string) => boolean;
    };

    // Data Management
    data: {
        refresh: () => void;
        reload: () => void;

        // Data CRUD operations
        getAllData: () => T[];
        getRowData: (rowId: string) => T | undefined;
        getRowByIndex: (index: number) => T | undefined;
        updateRow: (rowId: string, updates: Partial<T>) => void;
        updateRowByIndex: (index: number, updates: Partial<T>) => void;
        insertRow: (newRow: T, index?: number) => void;
        deleteRow: (rowId: string) => void;
        deleteRowByIndex: (index: number) => void;
        deleteSelectedRows: () => void;
        replaceAllData: (newData: T[]) => void;

        // Bulk operations
        updateMultipleRows: (updates: Array<{ rowId: string; data: Partial<T> }>) => void;
        insertMultipleRows: (newRows: T[], startIndex?: number) => void;
        deleteMultipleRows: (rowIds: string[]) => void;

        // Field-specific updates
        updateField: (rowId: string, fieldName: keyof T, value: any) => void;
        updateFieldByIndex: (index: number, fieldName: keyof T, value: any) => void;

        // Data queries
        findRows: (predicate: (row: T) => boolean) => T[];
        findRowIndex: (predicate: (row: T) => boolean) => number;
        getDataCount: () => number;
        getFilteredDataCount: () => number;
    };

    // Layout Management
    layout: {
        resetLayout: () => void;
        resetAll: () => void;
        saveLayout: () => any;
        restoreLayout: (layout: any) => void;
    };

    // Table State
    state: {
        getTableState: () => any;
        getCurrentFilters: () => CustomColumnFilterState;
        getCurrentSorting: () => SortingState;
        getCurrentPagination: () => { pageIndex: number; pageSize: number };
        getCurrentSelection: () => string[];
    };

    // Simplified Export
    export: {
        exportCSV: (options?: {
            filename?: string;
            onlyVisibleColumns?: boolean;
            onlySelectedRows?: boolean;
            includeHeaders?: boolean;
        }) => Promise<void>;
        exportExcel: (options?: {
            filename?: string;
            onlyVisibleColumns?: boolean;
            onlySelectedRows?: boolean;
            includeHeaders?: boolean;
        }) => Promise<void>;
        exportServerData: (options: {
            format: 'csv' | 'excel';
            filename?: string;
            fetchData: (filters?: Partial<TableState>) => Promise<{ data: T[]; total: number }>;
            pageSize?: number;
            includeHeaders?: boolean;
        }) => Promise<void>;
        isExporting: () => boolean;
        cancelExport: () => void;
    };
}
