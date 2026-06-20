/**
 * Every user-facing string the grid renders, for localization via the `localeText`
 * prop. Pass a `Partial<DataTableLocaleText>` to override only what you need; the
 * rest falls back to {@link DEFAULT_LOCALE_TEXT} (English). Interpolated strings are
 * functions. Mirrors the flat shape of MUI X's `localeText`.
 */
export interface DataTableLocaleText {
    // Toolbar
    toolbarSearch: string;
    searchPlaceholder: string;
    clearSearch: string;
    toolbarColumns: string;
    toolbarDensity: string;
    toolbarExport: string;
    toolbarRefresh: string;
    toolbarReset: string;
    exportAs: string;
    exportCSV: string;
    exportExcel: string;
    densityCompact: string;
    densityStandard: string;
    densityComfortable: string;

    // Columns panel
    columnsManageTitle: string;
    columnsShowAll: string;
    columnsReset: string;
    columnsDone: string;
    showColumn: string;
    hideColumn: string;
    pinLeft: string;
    pinRight: string;
    unpin: string;

    // Column filter
    filterTitle: string;
    filterButton: string;
    filterLogic: string;
    filterLogicAnd: string;
    filterLogicOr: string;
    filterColumn: string;
    filterOperator: string;
    filterValue: string;
    filterValues: string;
    filterAddFilter: string;
    filterApply: string;
    filterClearAll: string;
    rangeFrom: string;
    rangeTo: string;
    booleanAny: string;
    booleanTrue: string;
    booleanFalse: string;
    /** Operator labels keyed by operator value (e.g. `contains` → "Contains"). */
    operators: Record<string, string>;

    // Selection / bulk
    selectedRows: (count: number) => string;
    clearSelection: string;

    // Overlays & rows
    noRows: string;
    expandRow: string;
    collapseRow: string;
    rowActions: string;
    autoFitColumn: string;

    // Pagination
    paginationRowsPerPage: string;
    paginationDisplayedRows: (params: { from: number; to: number; count: number }) => string;
}
