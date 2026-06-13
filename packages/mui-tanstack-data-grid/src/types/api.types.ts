import type {
    ColumnPinningState,
    SortingState,
    ColumnOrderState,
    Row,
    Table,
} from '@tanstack/react-table';

import type { ColumnFilterState } from './filter.types';
import type { SelectionState } from './selection.types';
import type { ServerExportResult, ExportMode, ExportScope } from './export.types';
import type { TableState, TableFilters, PaginationModel } from './state.types';

export interface DataRefreshApiOptions {
    resetPagination?: boolean;
    force?: boolean;
    reason?: string;
}

export type DataRefreshApiInput = boolean | DataRefreshApiOptions;

export interface DataTableExportApiOptions {
    filename?: string;
    /** Override the table's `exportMode` for this one export. */
    mode?: ExportMode;
    /** Force a scope; otherwise derived from selection + active filters. */
    scope?: ExportScope;
    /** Explicit column-id whitelist (in order); otherwise visible columns. */
    columns?: string[];
    onlyVisibleColumns?: boolean;
    onlySelectedRows?: boolean;
    includeHeaders?: boolean;
    delimiter?: string;
    chunkSize?: number;
    strictTotalCheck?: boolean;
    sanitizeCSV?: boolean;
}

/** Serializable layout snapshot returned by `api.layout.saveLayout()`. */
export interface SavedLayout {
    columnVisibility: Record<string, boolean>;
    columnOrder: string[];
    columnSizing: Record<string, number>;
    columnPinning: ColumnPinningState;
    pagination?: PaginationModel;
    globalFilter?: string;
    columnFilter?: ColumnFilterState;
}

/** Imperative handle exposed via `apiRef`. */
export interface DataTableApi<T = any> {
    table: {
        getTable: () => Table<T>;
    };

    columnVisibility: {
        showColumn: (columnId: string) => void;
        hideColumn: (columnId: string) => void;
        toggleColumn: (columnId: string) => void;
        showAllColumns: () => void;
        hideAllColumns: () => void;
        resetColumnVisibility: () => void;
    };

    columnOrdering: {
        setColumnOrder: (columnOrder: ColumnOrderState) => void;
        moveColumn: (columnId: string, toIndex: number) => void;
        resetColumnOrder: () => void;
    };

    columnPinning: {
        pinColumnLeft: (columnId: string) => void;
        pinColumnRight: (columnId: string) => void;
        unpinColumn: (columnId: string) => void;
        setPinning: (pinning: ColumnPinningState) => void;
        resetColumnPinning: () => void;
    };

    columnResizing: {
        resizeColumn: (columnId: string, width: number) => void;
        autoSizeColumn: (columnId: string) => void;
        autoSizeAllColumns: () => void;
        resetColumnSizing: () => void;
    };

    filtering: {
        setGlobalFilter: (filter: string) => void;
        clearGlobalFilter: () => void;
        setColumnFilters: (filters: ColumnFilterState, isApply?: boolean) => void;
        addColumnFilter: (columnId: string, operator: string, value: any) => void;
        removeColumnFilter: (filterId: string) => void;
        clearAllFilters: () => void;
        resetFilters: () => void;
    };

    sorting: {
        setSorting: (sorting: SortingState) => void;
        sortColumn: (columnId: string, direction: 'asc' | 'desc' | false) => void;
        clearSorting: () => void;
        resetSorting: () => void;
    };

    pagination: {
        goToPage: (pageIndex: number) => void;
        nextPage: () => void;
        previousPage: () => void;
        setPageSize: (pageSize: number) => void;
        goToFirstPage: () => void;
        goToLastPage: () => void;
        resetPagination?: () => void;
    };

    selection: {
        selectRow: (rowId: string) => void;
        deselectRow: (rowId: string) => void;
        toggleRowSelection: (rowId: string) => void;
        selectAll: () => void;
        deselectAll: () => void;
        toggleSelectAll: () => void;
        getSelectionState: () => SelectionState;
        getSelectedCount: () => number;
        getSelectedRows: () => Row<T>[];
        isRowSelected: (rowId: string) => boolean;
    };

    data: {
        refresh: (options?: DataRefreshApiInput) => void;
        reload: (options?: DataRefreshApiOptions) => void;
        resetAll: () => void;
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
        updateMultipleRows: (updates: Array<{ rowId: string; data: Partial<T> }>) => void;
        insertMultipleRows: (newRows: T[], startIndex?: number) => void;
        deleteMultipleRows: (rowIds: string[]) => void;
        updateField: (rowId: string, fieldName: keyof T, value: any) => void;
        updateFieldByIndex: (index: number, fieldName: keyof T, value: any) => void;
        findRows: (predicate: (row: T) => boolean) => T[];
        findRowIndex: (predicate: (row: T) => boolean) => number;
        getDataCount: () => number;
        getFilteredDataCount: () => number;
    };

    layout: {
        resetLayout: () => void;
        resetAll: () => void;
        saveLayout: () => SavedLayout;
        restoreLayout: (layout: Partial<SavedLayout>) => void;
    };

    state: {
        getTableState: () => Partial<TableState>;
        getCurrentFilters: () => ColumnFilterState;
        getCurrentSorting: () => SortingState;
        getCurrentPagination: () => PaginationModel;
        getCurrentSelection: () => SelectionState;
        getGlobalFilter: () => string;
    };

    export: {
        /** Export to CSV using the active (or per-call) export mode. */
        exportCSV: (options?: DataTableExportApiOptions) => Promise<void>;
        /** Export to XLSX (small/medium only — Excel caps at 1,048,576 rows). */
        exportExcel: (options?: DataTableExportApiOptions) => Promise<void>;
        isExporting: () => boolean;
        cancelExport: () => void;
    };
}
