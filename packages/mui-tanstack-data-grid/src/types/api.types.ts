import type {
    ColumnPinningState,
    RowPinningState,
    SortingState,
    ColumnOrderState,
    Row,
    Table,
} from '@tanstack/react-table';

import type { ColumnFilterState } from './filter.types';
import type { SelectionState } from './selection.types';
import type { ServerExportResult, ExportMode, ExportScope } from './export.types';
import type { TableState, TableFilters, PaginationModel } from './state.types';
import type { DataTableDensity } from '../theme/tokens';
import type { SavedView } from './views.types';

export interface DataRefreshApiOptions {
    resetPagination?: boolean;
    force?: boolean;
    reason?: string;
}

export type DataRefreshApiInput = boolean | DataRefreshApiOptions;

/**
 * Which pieces `api.layout.reset()` (and the toolbar "Reset layout" button) restores
 * to their initial values. The default set is column-layout only —
 * `['columnOrder', 'columnPinning', 'columnSizing']` — so a reset never touches the
 * user's data, filters, sorting, or page. Opt into more by passing `resetActions`.
 */
export type ResetLayoutAction =
    | 'columnOrder'
    | 'columnPinning'
    | 'columnSizing'
    | 'columnVisibility'
    | 'rowPinning'
    | 'filters'
    | 'sorting'
    | 'pagination';

export const DEFAULT_RESET_ACTIONS: ResetLayoutAction[] = ['columnOrder', 'columnPinning', 'columnSizing'];

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
    rowPinning?: RowPinningState;
    pagination?: PaginationModel;
    globalFilter?: string;
    columnFilter?: ColumnFilterState;
    sorting?: SortingState;
    density?: DataTableDensity;
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
        /** Open the toolbar "Columns" management panel (registered by the toolbar; no-op if it isn't mounted). */
        openPanel: () => void;
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

    /** Whole-row edit mode (`editMode: 'row'`). */
    editing: {
        /** Open a row for editing (all its editable cells). */
        startRowEdit: (rowId: string) => void;
        /** Commit the row being edited — fires `processRowUpdate` once. */
        saveRowEdit: () => void;
        /** Discard the row being edited. */
        cancelRowEdit: () => void;
        getEditingRowId: () => string | null;
        isRowInEditMode: (rowId: string) => boolean;
    };

    rowPinning: {
        pinRowTop: (rowId: string) => void;
        pinRowBottom: (rowId: string) => void;
        unpinRow: (rowId: string) => void;
        setRowPinning: (pinning: RowPinningState) => void;
        resetRowPinning: () => void;
        getPinnedRowIds: () => RowPinningState;
    };

    columnResizing: {
        resizeColumn: (columnId: string, width: number) => void;
        autoSizeColumn: (columnId: string) => void;
        autoSizeAllColumns: () => void;
        resetColumnSizing: () => void;
    };

    aggregation: {
        /** Per-column footer totals over the filtered rows: `{ [columnId]: value }`. */
        getTotals: () => Record<string, any>;
    };

    clipboard: {
        /** Copy the selected rows (visible export columns) to the clipboard as delimited text; resolves the count copied. */
        copySelectedRows: (options?: { includeHeaders?: boolean; delimiter?: string }) => Promise<number>;
    };

    filtering: {
        setGlobalFilter: (filter: string) => void;
        clearGlobalFilter: () => void;
        setColumnFilters: (filters: ColumnFilterState, isApply?: boolean) => void;
        addColumnFilter: (columnId: string, operator: string, value: any) => void;
        removeColumnFilter: (filterId: string) => void;
        clearAllFilters: () => void;
        resetFilters: () => void;
        /** Open the toolbar column-filter panel with a rule pre-targeting `columnId` (registered by the filter control; no-op if it isn't mounted). */
        openColumnFilter: (columnId: string) => void;
        /** Remove all applied + pending filter rules for a single column (used by the column menu's "Clear filter"). */
        clearColumnFilter: (columnId: string) => void;
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
        /**
         * Reset a configurable subset of the layout to its initial values, without
         * touching data (no reload). Defaults to {@link DEFAULT_RESET_ACTIONS}
         * (`columnOrder` + `columnPinning` + `columnSizing`). This backs the toolbar
         * "Reset layout" button.
         */
        reset: (actions?: ResetLayoutAction[]) => void;
        /** Reset the ENTIRE view state (columns, filters, sorting, pagination, density). */
        resetLayout: () => void;
        /** `resetLayout()` + reload the data. */
        resetAll: () => void;
        saveLayout: () => SavedLayout;
        restoreLayout: (layout: Partial<SavedLayout>) => void;
    };

    /** Saved/named views — capture the current layout as a named preset and switch between them. */
    views: {
        listViews: () => SavedView[];
        getActiveViewId: () => string | null;
        getActiveView: () => SavedView | null;
        /** Capture the current layout as a new named view and make it active. */
        saveView: (name: string) => SavedView;
        /** Overwrite a view's captured layout with the current one. */
        updateView: (id: string) => void;
        /** Apply a saved view's layout and make it active. */
        applyView: (id: string) => void;
        renameView: (id: string, name: string) => void;
        deleteView: (id: string) => void;
        /** Clear the active view and reset the layout to its initial state. */
        resetView: () => void;
        /** True when the current layout diverges from the active view (or any layout when none is active). */
        isDirty: () => boolean;
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
