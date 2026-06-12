# v2 Feature Parity Checklist

Every capability, prop, API method, slot, column option, toolbar control, util, and custom feature in
v1. **No row ships removed without an explicit decision.** Tick each as it lands in v2.
Source: full inventory of `packages/react-tanstack-data-table/src`.

Legend: ☐ todo · ◐ in progress · ☑ done — `keep` = same name · `rename` = see [MIGRATION.md](MIGRATION.md) · `improve` = behaviour upgraded.

---

## A. Capabilities (33)

- ☐ Client mode / Server mode (`dataMode`) — keep
- ☐ Dynamic fetch (`onFetchData`) + debounced fetch — keep/improve
- ☐ Data state callbacks (`onDataStateChange`, `onFetchStateChange`, `onRefreshData`) — keep
- ☐ Row CRUD via apiRef — keep
- ☐ Single + multi-column sorting — keep
- ☐ Client/server sorting (`sortingMode`) — keep
- ☐ Global search — keep
- ☐ Advanced column filters (pending→apply, AND/OR) — keep
- ☐ Filter operators: text/number/date/boolean/select — keep (date → dayjs)
- ☐ Custom filter components per column — keep
- ☐ Client/server filtering (`filterMode`) — keep
- ☐ Offset pagination, client/server (`paginationMode`) — keep
- ☐ Page size + total count — keep (`totalRow`→`rowCount`)
- ☐ Single + multi row selection — keep
- ☐ Select mode page vs all (include/exclude) — keep
- ☐ `isRowSelectable` — keep
- ☐ Bulk select / deselect / toggle — keep
- ☐ Selection change callback — keep
- ☐ Column visibility — keep
- ☐ Column reorder (drag) — rename (`enableColumnReordering`)
- ☐ Column pinning L/R — keep
- ☐ Column resizing + mode — keep/improve (CSS-var, min/max reliable)
- ☐ Row expansion / detail panel — rename (`renderDetailPanel`)
- ☐ Row click + select-on-click — keep
- ☐ CSV + Excel export (client + server) — keep (Excel lazy)
- ☐ Export progress / cancel / concurrency / chunking / CSV-sanitize — keep
- ☐ Density (`tableSize`→`density`, 3 levels) — rename/improve
- ☐ Hover / stripes — rename (`hover`/`striped`)
- ☐ Fit-to-screen — keep/improve
- ☐ Sticky header/footer — rename (`stickyHeader`/`stickyFooter`)
- ☐ Row virtualization — keep/improve
- ☐ Debug logging — keep

---

## B. Props (by group — all 93)

**Data:** ☐ `columns` ☐ `data` ☐ `totalRow`→`rowCount` ☐ `idKey`(+`getRowId`) ☐ `extraFilter` ☐ `footerFilter`

**Modes/fetch:** ☐ `dataMode` ☐ `initialState` ☐ `initialLoadData` ☐ `onDataStateChange` ☐ `onFetchData` ☐ `onFetchStateChange` ☐ `onRefreshData`

**Export:** ☐ `exportFilename` ☐ `exportConcurrency` ☐ `exportChunkSize` ☐ `exportStrictTotalCheck` ☐ `exportSanitizeCSV` ☐ `onExportProgress` ☐ `onExportComplete` ☐ `onExportError` ☐ `onExportStateChange` ☐ `onServerExport` ☐ `onExportCancel`

**Selection:** ☐ `enableRowSelection` ☐ `enableMultiRowSelection` ☐ `selectMode` ☐ `isRowSelectable` ☐ `onSelectionChange`

**Row click:** ☐ `onRowClick` ☐ `selectOnRowClick`

**Bulk:** ☐ `enableBulkActions` ☐ `bulkActions`→`renderBulkActions`

**Resizing:** ☐ `enableColumnResizing` ☐ `columnResizeMode` ☐ `onColumnSizingChange`

**Reorder:** ☐ `enableColumnDragging`→`enableColumnReordering` ☐ `onColumnDragEnd`→`onColumnOrderChange`

**Pinning:** ☐ `enableColumnPinning` ☐ `onColumnPinningChange`

**Visibility:** ☐ `enableColumnVisibility` ☐ `onColumnVisibilityChange`

**Expansion:** ☐ `enableExpanding`→`enableRowExpansion` ☐ `getRowCanExpand` ☐ `renderSubComponent`→`renderDetailPanel`

**Pagination:** ☐ `enablePagination` ☐ `paginationMode` ☐ `onPaginationChange`

**Filtering:** ☐ `enableGlobalFilter` ☐ `enableColumnFilter` ☐ `filterMode` ☐ `onColumnFiltersChange` ☐ `onGlobalFilterChange` ☐ `onColumnFilterChange` (3 filter callbacks → consolidate to 2)

**Sorting:** ☐ `enableSorting` ☐ `sortingMode` ☐ `onSortingChange`

**Styling:** ☐ `enableHover`→`hover` ☐ `enableStripes`→`striped` ☐ `tableContainerProps`→`slotProps.scroller` ☐ `tableProps`→`slotProps.grid` ☐ `fitToScreen` ☐ `tableSize`→`density`

**Sticky/scroll:** ☐ `enableStickyHeaderOrFooter`→`stickyHeader` ☐ `maxHeight`

**Virtualization:** ☐ `enableVirtualization` ☐ `estimateRowHeight`→`estimatedRowHeight`

**Toolbar:** ☐ `enableTableSizeControl`→`enableDensitySelector` ☐ `enableExport` ☐ `enableReset` ☐ `enableRefresh`

**Loading/empty:** ☐ `loading` ☐ `emptyMessage`→`noRowsMessage` ☐ `skeletonRows`

**Customization:** ☐ `slots` ☐ `slotProps` ☐ `logging`

---

## C. apiRef methods (87, by namespace)

- ☐ **table:** `getTable`
- ☐ **columnVisibility:** showColumn, hideColumn, toggleColumn, showAllColumns, hideAllColumns, resetColumnVisibility
- ☐ **columnOrdering:** setColumnOrder, moveColumn, resetColumnOrder
- ☐ **columnPinning:** pinColumnLeft, pinColumnRight, unpinColumn, setPinning, resetColumnPinning
- ☐ **columnResizing:** resizeColumn, autoSizeColumn, autoSizeAllColumns, resetColumnSizing  *(autoSize → implement properly via measurement in v2)*
- ☐ **filtering:** setGlobalFilter, clearGlobalFilter, setColumnFilters, addColumnFilter, removeColumnFilter, clearAllFilters, resetFilters
- ☐ **sorting:** setSorting, sortColumn, clearSorting, resetSorting
- ☐ **pagination:** goToPage, nextPage, previousPage, setPageSize, goToFirstPage, goToLastPage, resetPagination
- ☐ **selection:** selectRow, deselectRow, toggleRowSelection, selectAll, deselectAll, toggleSelectAll, getSelectionState, getSelectedCount, getSelectedRows, isRowSelected
- ☐ **data:** refresh, reload, resetAll, getAllData, getRowData, getRowByIndex, updateRow, updateRowByIndex, insertRow, deleteRow, deleteRowByIndex, deleteSelectedRows, replaceAllData, updateMultipleRows, insertMultipleRows, deleteMultipleRows, updateField, updateFieldByIndex, findRows, findRowIndex, getDataCount, getFilteredDataCount
- ☐ **layout:** resetLayout, resetAll, saveLayout, restoreLayout
- ☐ **state:** getTableState, getCurrentFilters, getCurrentSorting, getCurrentPagination, getCurrentSelection
- ☐ **export:** exportCSV, exportExcel, exportServerData, isExporting, cancelExport

> `saveLayout`/`restoreLayout`/`getTableState` typed `any` in v1 → give **real types** in v2.

---

## D. Slots (65+) — replace any part

- ☐ Containers: `root`, `tableContainer`→`scroller`, `table`→`grid`, `footer`
- ☐ Header: `toolbar`, `header`, `headerRow`, `headerCell`
- ☐ Body: `body`, `row`, `cell`, `expandedRow`→`detailPanel`
- ☐ States: `loadingRow`→`loadingOverlay`, `emptyRow`→`noRowsOverlay`, `loadingSkeleton`, `noDataOverlay`
- ☐ Pagination: `pagination`
- ☐ Toolbar controls: `searchInput`, `columnVisibilityControl`, `columnCustomFilterControl`, `columnPinningControl`, `resetButton`, `tableSizeControl`→`densityControl`, `bulkActionsToolbar`, `exportButton`, `refreshButton`
- ☐ Selection: `checkboxSelection`, `selectionColumn`
- ☐ Special column: `expandColumn`
- ☐ Icons (24): `sortIconAsc`, `sortIconDesc`, `searchIcon`, `refreshIcon`, `clearIcon`, `exportIcon`, `columnIcon`, `resetIcon`, `moreIcon`, `filterIcon`, `pinIcon`, `unpinIcon`, `leftIcon`, `rightIcon`, `csvIcon`, `excelIcon`, `selectAllIcon`, `deselectIcon`, `tableSizeIcon`, `tableSizeSmallIcon`, `tableSizeMediumIcon`, `expandIcon`, `collapseIcon`
- ☐ `slotProps` for every slot above (typed, with `sx`)

---

## E. Column definition options (18)

- ☐ `align` ☐ `wrapText` ☐ `type` (boolean/number/date/select/text) ☐ `options` (select)
- ☐ `filterable` ☐ `filterComponent` ☐ `editComponent`
- ☐ `hideInExport` ☐ `exportHeader` ☐ `exportValue` ☐ `exportFormat`
- ☐ TanStack: `size` ☐ `minSize` ☐ `maxSize` ☐ `enableResizing` ☐ `enableSorting` ☐ `header` ☐ `cell`
- ☐ (new) `aggregationFn` / footer aggregates — *candidate addition, confirm*

---

## F. Toolbar controls (9)

- ☐ `DataTableToolbar` ☐ `TableSearchControl` ☐ `ColumnVisibilityControl` ☐ `ColumnFilterControl`
- ☐ `ColumnPinningControl` ☐ `ColumnResetControl` ☐ `TableExportControl` ☐ `TableRefreshControl`
- ☐ `TableSizeControl`→`DensityControl` ☐ `BulkActionsToolbar`

---

## G. Utilities / public exports

- ☐ Export: `exportClientData`, `exportServerData` (+ chunking, cancel, sanitize)
- ☐ `useDebouncedFetch`
- ☐ Special columns: `createSelectionColumn`, `createExpandingColumn`
- ☐ Table helpers: `DataTableSize`, `calculateSkeletonRows`, `generateRowId`, `calculatePinnedColumnsWidth`, `shouldUseFixedLayout`, `formatCellValue`, `debounce`, `calculateTableMetrics`
- ☐ Column helpers: `getColumnType`, `getCustomFilterComponent`, `getColumnOptions`, `withIdsDeep`, `isColumnFilterable`
- ☐ Styling helpers: `getPinnedColumnStyle`, `tableCellStyles`, `tableRowStyles`, `getColumnAlignment` — *reworked for div/CSS-var layout*
- ☐ Slot helpers: `getSlotComponent`, `mergeSlotProps`, `getSlotComponentWithProps`, `extractSlotProps`, etc.
- ☐ Logger: `createLogger`, `configureDataTableLogging`, `getDataTableLoggingConfig`

> Public surface stays mostly stable; helpers tied to MUI-table specifics (`getPinnedColumnStyle`,
> `shouldUseFixedLayout`) are reimplemented for the div layout — flagged in [MIGRATION.md](MIGRATION.md).

---

## H. Custom TanStack features (2)

- ☐ **SelectionFeature** — `SelectionState`, include/exclude, page vs all, all methods
  (selectRow…canSelectRow), `isRowSelectable` integration
- ☐ **ColumnFilterFeature** — `ColumnFilterRule`/`ColumnFilterState`, pending vs active filters,
  per-type operators, AND/OR, `getCombinedFilteredRowModel`, `matchesCustomColumnFilters`

---

## I. New in v2 (additive, not parity — confirm scope)

- ☐ Keyboard navigation (roving tabindex / arrow keys) ☐ Full ARIA grid roles
- ☐ 3-level density ☐ Reliable min/max widths + smooth CSS-var resize ☐ pinned pixel-accuracy
- ☐ MUI component theme registration (`MuiTanstackDataGrid`) + token system
- ☐ `useDataTable()` headless export ☐ lazy Excel ☐ typed `saveLayout`/`restoreLayout`
- ☐ *(maybe)* column footer/aggregation · row drag-reorder · cell editing built-in
