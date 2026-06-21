import type { DataTableLocaleText } from '../types/locale.types';

/** Built-in English strings. Override per-key via the `localeText` prop. */
export const DEFAULT_LOCALE_TEXT: DataTableLocaleText = {
    // Toolbar
    toolbarSearch: 'Search',
    searchPlaceholder: 'Search…',
    clearSearch: 'Clear search',
    toolbarColumns: 'Columns',
    toolbarDensity: 'Density',
    toolbarExport: 'Export',
    toolbarRefresh: 'Refresh',
    toolbarReset: 'Reset',
    toolbarViews: 'Views',
    exportAs: 'Export as',
    exportCSV: 'CSV',
    exportExcel: 'Excel',
    densityCompact: 'Compact',
    densityStandard: 'Standard',
    densityComfortable: 'Comfortable',

    // Saved views
    viewsDefault: 'Default',
    viewsSaveAs: 'Save current as…',
    viewsUpdate: 'Update current view',
    viewsDelete: 'Delete',
    viewsResetToDefault: 'Reset to default',
    viewsNamePlaceholder: 'View name',
    viewsUnsaved: 'Unsaved changes',
    viewsSave: 'Save',
    viewsCancel: 'Cancel',

    // Columns panel
    columnsManageTitle: 'Columns',
    columnsShowAll: 'Show all',
    columnsReset: 'Reset',
    columnsDone: 'Done',
    showColumn: 'Show',
    hideColumn: 'Hide',
    pinLeft: 'Pin left',
    pinRight: 'Pin right',
    unpin: 'Unpin',

    // Column filter
    filterTitle: 'Column Filters',
    filterButton: 'Filters',
    filterLogic: 'Logic',
    filterLogicAnd: 'AND',
    filterLogicOr: 'OR',
    filterColumn: 'Column',
    filterOperator: 'Operator',
    filterValue: 'Value',
    filterValues: 'Values',
    filterAddFilter: 'Add filter',
    filterApply: 'Apply',
    filterClearAll: 'Clear all',
    rangeFrom: 'From',
    rangeTo: 'To',
    booleanAny: 'Any',
    booleanTrue: 'True',
    booleanFalse: 'False',
    operators: {
        contains: 'Contains',
        notContains: 'Not contains',
        startsWith: 'Starts with',
        endsWith: 'Ends with',
        equals: 'Equals',
        notEquals: 'Not equals',
        isEmpty: 'Is empty',
        isNotEmpty: 'Is not empty',
        is: 'Is',
        greaterThan: 'Greater than',
        lessThan: 'Less than',
        greaterThanOrEqual: 'Greater than or equal',
        lessThanOrEqual: 'Less than or equal',
        between: 'Between',
        after: 'After',
        before: 'Before',
        in: 'In',
        notIn: 'Not in',
    },

    // Selection / bulk
    selectedRows: (count) => `${count} selected`,
    clearSelection: 'Clear',
    copy: 'Copy',

    // Overlays & rows
    noRows: 'No rows',
    expandRow: 'Expand row',
    collapseRow: 'Collapse row',
    rowActions: 'Row actions',
    autoFitColumn: 'Double-click to fit',
    pinRowTop: 'Pin to top',
    pinRowBottom: 'Pin to bottom',
    unpinRow: 'Unpin row',
    editRow: 'Edit',
    editSave: 'Save',
    editCancel: 'Cancel',

    // Column menu (header kebab)
    columnMenuLabel: 'Column menu',
    columnMenuSortAsc: 'Sort ascending',
    columnMenuSortDesc: 'Sort descending',
    columnMenuClearSort: 'Clear sort',
    columnMenuHide: 'Hide column',
    columnMenuAutosize: 'Autosize this column',

    // Pagination
    paginationRowsPerPage: 'Rows per page:',
    paginationDisplayedRows: ({ from, to, count }) => `${from}–${to} of ${count}`,

    // Screen-reader announcements (aria-live)
    announceSort: (column, direction) => (direction === 'none' ? 'Sorting cleared' : `Sorted by ${column}, ${direction}`),
    announceFilteredRows: (count) => `${count} rows after filter`,
    announcePage: (page, pageCount) => `Page ${page} of ${pageCount}`,
};

/** English locale (independent copy of the defaults), for `localeText={enUS}`. */
export const enUS: DataTableLocaleText = { ...DEFAULT_LOCALE_TEXT, operators: { ...DEFAULT_LOCALE_TEXT.operators } };

/** Merge a partial override over the English defaults (deep for `operators`). */
export function resolveLocaleText(localeText?: Partial<DataTableLocaleText>): DataTableLocaleText {
    if (!localeText) return DEFAULT_LOCALE_TEXT;
    return {
        ...DEFAULT_LOCALE_TEXT,
        ...localeText,
        operators: { ...DEFAULT_LOCALE_TEXT.operators, ...localeText.operators },
    };
}
