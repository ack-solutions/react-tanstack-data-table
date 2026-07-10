import type { ReactNode, MouseEvent, RefObject, ComponentType } from 'react';
import type {
    Row,
    SortingState,
    ColumnResizeMode,
    ColumnPinningState,
    RowPinningState,
    PaginationState,
    ColumnDef,
} from '@tanstack/react-table';

import type { DataTableDensity } from '../theme/tokens';
import type { ColumnFilterState } from './filter.types';
import type { SelectionState, SelectMode } from './selection.types';
import type { DataTableLoggingOptions } from './logging.types';
import type { DataTableApi, ResetLayoutAction } from './api.types';
import type { SavedView } from './views.types';
import type { DataTableSlots, PartialSlotProps } from './slots.types';
import type { DataTableLocaleText } from './locale.types';
import type { PersistOptions } from '../utils/persistence';
import type {
    ExportConcurrencyMode,
    ExportProgressPayload,
    ExportStateChange,
    ExportMode,
    ExportSink,
    ExportRequest,
    ExportJobRef,
    ExportJobStatus,
    ServerExportResult,
} from './export.types';
import type {
    TableState,
    TableFilters,
    DataFetchMeta,
    DataRefreshContext,
} from './state.types';

/**
 * The built-in toolbar controls, as ready-to-render elements, handed to
 * `renderToolbar` so callers can arrange them in any order/position. A control
 * is `null` when its feature flag is off (e.g. `search` is null without
 * `enableGlobalFilter`). Each `columns`/`density`/`export` element already
 * includes its popover/menu, so it works wherever you place it.
 */
export interface DataTableToolbarControls {
    /** Collapsible global search. */
    search: ReactNode;
    /** Saved-views control (picker + save/update/delete). */
    views: ReactNode;
    /** Column-filter button + popover. */
    filter: ReactNode;
    /** Columns button + panel (show/hide, pin, reorder). */
    columns: ReactNode;
    /** Density selector button + menu. */
    density: ReactNode;
    /** Export button + menu (CSV/Excel). */
    export: ReactNode;
    /** Refresh button. */
    refresh: ReactNode;
    /** Reset button. */
    reset: ReactNode;
    /** Grid ⇄ list view toggle. */
    viewToggle: ReactNode;
    /** Your `extraFilter` node. */
    extraFilter: ReactNode;
}

/**
 * Props for the `<DataTable>` component.
 *
 * Naming conventions: `enableX` = feature toggle · `onXChange` = state callback ·
 * `xMode` = client/server · `renderX` = render function · plain adjectives
 * (`striped`, `hover`) = visual modifiers. v1 names are kept as `@deprecated`
 * aliases and removed in v3.
 */
/** A single per-row action shown in the auto-generated actions column. */
export interface DataTableRowAction<T = any> {
    /** Tooltip (icon mode) and menu-item text (menu mode). */
    label: string;
    /** Icon component (e.g. a per-path MUI icon or lucide icon). Required for icon mode. */
    icon?: ComponentType<any>;
    onClick: (row: Row<T>) => void;
    /** Render the action disabled for this row. */
    disabled?: boolean;
    /** Omit the action for this row entirely. */
    hidden?: boolean;
    /** MUI colour for the icon button / menu item. */
    color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

/** Params passed to `renderListItem` for each row in list view. */
export interface DataTableListItemParams<T> {
    /** The row's original data. */
    row: T;
    /** The underlying TanStack row node (for `getIsSelected`, `depth`, …). */
    rowNode: Row<T>;
    /** The imperative grid API (selection, editing, data CRUD, …). */
    api: DataTableApi<T>;
    /** The row's display index on the current page. */
    index: number;
    /** Whether the row is currently selected. */
    isSelected: boolean;
}

export interface DataTableProps<T> {
    // ── Data ──────────────────────────────────────────────────────────────
    /** Column definitions. */
    columns: ColumnDef<T, any>[];
    /** Row data (client mode). */
    data?: T[];
    /** Total row count for server mode. */
    rowCount?: number;
    /** Returns a stable id for a row. Defaults to `row[idKey]`. */
    getRowId?: (row: T, index: number) => string;
    /** Shorthand for `getRowId` when the id is a single field (default: `'id'`). */
    idKey?: keyof T;
    extraFilter?: ReactNode | null;
    footerFilter?: ReactNode | null;
    /** Show a sticky footer **summary row** with per-column `aggregation` totals (client mode). */
    enableAggregation?: boolean;
    /** Override built-in UI strings (operators, toolbar, pagination, …). Falls back to `enUS`. */
    localeText?: Partial<DataTableLocaleText>;
    /**
     * Rearrange / restyle the built-in toolbar. Receives the ready-made control
     * elements ({@link DataTableToolbarControls}) so you can place them in any
     * order or position (e.g. search on the right). Return your layout. For a
     * complete replacement, use `slots.toolbar` instead.
     */
    renderToolbar?: (controls: DataTableToolbarControls) => ReactNode;

    /** @deprecated Renamed to `rowCount`. */
    totalRow?: number;

    // ── Data modes / fetching ─────────────────────────────────────────────
    dataMode?: 'client' | 'server';
    initialState?: Partial<TableState>;
    /**
     * Opt-in view-state persistence. Set a stable `stateKey` to remember the
     * grid's state — pagination, sort, search, filters, column order / width /
     * visibility / pinning, density — across reloads and remounts with no extra
     * wiring (read into `initialState` on mount, written on change). Selection
     * and row expansion are excluded by default. Tune via {@link persist}.
     */
    stateKey?: string;
    persist?: PersistOptions;

    // ── Saved / named views ───────────────────────────────────────────────
    /**
     * Show a toolbar **Views** control that captures the current layout (filters,
     * sort, column visibility/order/size, pinning, density, page size) as a named
     * preset the user can switch between, update, and delete. Uncontrolled views are
     * stored under `dt:<stateKey>:views` (needs a `stateKey`; in-memory otherwise).
     */
    enableSavedViews?: boolean;
    /** Controlled views list (presence switches the feature to controlled mode). */
    views?: SavedView[];
    onViewsChange?: (views: SavedView[]) => void;
    /** Controlled active view id (`null` = the synthetic Default view). */
    activeViewId?: string | null;
    onActiveViewChange?: (id: string | null) => void;
    initialLoadData?: boolean;
    onDataStateChange?: (state: Partial<TableState>) => void;
    onFetchData?: (filters: Partial<TableFilters>, meta?: DataFetchMeta) => Promise<{ data: T[]; total: number }>;
    onFetchStateChange?: (filters: Partial<TableState>, options?: DataFetchMeta) => void;
    onRefreshData?: (context: DataRefreshContext) => void | Promise<void>;

    // ── Export ────────────────────────────────────────────────────────────
    /** Where export work happens. Default `'client'`; switch per call via the API too. */
    exportMode?: ExportMode;
    exportFilename?: string;
    exportConcurrency?: ExportConcurrencyMode;
    /** Rows per page when paging server data for export (default 1000). */
    exportChunkSize?: number;
    exportStrictTotalCheck?: boolean;
    exportSanitizeCSV?: boolean;
    /** Client file sink: `'auto'` (stream where supported), `'stream'`, or `'blob'`. */
    exportSink?: ExportSink;
    /** Delay between paged fetches in ms. Default `0`. Raise for rate-limited APIs. */
    exportInterPageDelayMs?: number;
    /** Concurrent paged fetches when the total is known. Default `1` (sequential). */
    exportFetchConcurrency?: number;
    /** Max rows the client will build into a file before erroring (guard). */
    exportMaxClientRows?: number;
    /** Truncate XLSX at Excel's row cap instead of throwing. Default `false`. */
    exportTruncateXlsx?: boolean;
    /** Poll interval for `server-async` jobs in ms. Default `2000`. */
    exportPollIntervalMs?: number;
    /** Force a renamed download for `{ fileUrl }` (buffers — avoid for huge files). */
    exportRenameDownload?: boolean;
    /** Emit progress at most every N rows (kills the per-row render storm). Default `2000`. */
    exportProgressEvery?: number;
    onExportProgress?: (progress: ExportProgressPayload) => void;
    onExportComplete?: (result: { success: boolean; filename: string; totalRows: number }) => void;
    onExportError?: (error: { message: string; code: string }) => void;
    onExportStateChange?: (state: ExportStateChange) => void;
    /**
     * `server-file` / `server-async`: the server builds the finished file from the
     * {@link ExportRequest} and returns `{ blob }`, `{ fileUrl }`, or `{ jobId }`.
     */
    onServerExport?: (request: ExportRequest, signal?: AbortSignal) => Promise<ServerExportResult<T>>;
    /** `server-data`: stream raw rows from the server; the client formats + writes them. */
    onExportStream?: (request: ExportRequest, signal?: AbortSignal) => AsyncIterable<T[]> | Promise<AsyncIterable<T[]>>;
    /** `server-async`: poll an export job until it is ready (or errors). */
    onExportPoll?: (job: ExportJobRef, signal?: AbortSignal) => Promise<ExportJobStatus>;
    onExportCancel?: () => void;

    // ── Selection ─────────────────────────────────────────────────────────
    enableRowSelection?: boolean | ((row: Row<T>) => boolean);
    enableMultiRowSelection?: boolean;
    selectMode?: SelectMode;
    isRowSelectable?: (params: { row: T; id: string }) => boolean;
    onSelectionChange?: (selection: SelectionState) => void;

    // ── Row interaction ───────────────────────────────────────────────────
    onRowClick?: (event: MouseEvent<HTMLDivElement>, row: Row<T>) => void;
    selectOnRowClick?: boolean;
    /**
     * Per-row actions (Edit / Delete / View…). Providing this adds an auto-generated
     * `_actions` column (right-pinned when `enableColumnPinning` is on); the per-row
     * return value controls which actions show for that row (return `[]` for none).
     * Few actions render as inline icon buttons; more (or any without an icon) collapse
     * into an overflow menu.
     */
    getRowActions?: (row: Row<T>) => DataTableRowAction<T>[];
    /** Force the row-actions presentation. `'auto'` (default) picks icons vs menu. */
    rowActionsDisplay?: 'icons' | 'menu' | 'auto';

    // ── Editing ───────────────────────────────────────────────────────────
    /**
     * Commit an inline cell edit (mark columns with `editable`). Receives the updated
     * row and the original; return the row to persist (optionally transformed), or throw
     * to reject. On success the grid applies the returned row to its data; on a throw the
     * edit reverts. Without it, edits update the grid's local data directly.
     */
    processRowUpdate?: (newRow: T, oldRow: T) => T | Promise<T>;
    /** Called when `processRowUpdate` throws/rejects (the edit is reverted). */
    onProcessRowUpdateError?: (error: unknown) => void;
    /**
     * `'cell'` (default) edits one cell at a time (commit on Enter/blur). `'row'` opens
     * all of a row's editable cells together with explicit **Save** / **Cancel** in the
     * actions column; `processRowUpdate` then fires **once** with the fully-updated row.
     */
    editMode?: 'cell' | 'row';
    /** Row entered edit mode (`editMode: 'row'`). */
    onRowEditStart?: (params: { row: Row<T> }) => void;
    /** Row left edit mode — `reason` is `'save'` or `'cancel'`. */
    onRowEditStop?: (params: { row: Row<T>; reason: 'save' | 'cancel' }) => void;

    // ── Bulk actions ──────────────────────────────────────────────────────
    enableBulkActions?: boolean;
    renderBulkActions?: (selectionState: SelectionState) => ReactNode;
    /** @deprecated Renamed to `renderBulkActions`. */
    bulkActions?: (selectionState: SelectionState) => ReactNode;

    // ── Column resizing ───────────────────────────────────────────────────
    enableColumnResizing?: boolean;
    columnResizeMode?: ColumnResizeMode;
    onColumnSizingChange?: (sizing: Record<string, number>) => void;

    // ── Column reordering ─────────────────────────────────────────────────
    enableColumnReordering?: boolean;
    onColumnOrderChange?: (columnOrder: string[]) => void;
    /** @deprecated Renamed to `enableColumnReordering`. */
    enableColumnDragging?: boolean;
    /** @deprecated Renamed to `onColumnOrderChange`. */
    onColumnDragEnd?: (columnOrder: string[]) => void;

    // ── Column pinning ────────────────────────────────────────────────────
    enableColumnPinning?: boolean;
    onColumnPinningChange?: (pinning: ColumnPinningState) => void;

    // ── Row pinning ───────────────────────────────────────────────────────
    /**
     * Pin individual rows to the top and/or bottom so they stay visible while the
     * rest scroll — pinned rows survive sort, filter, and pagination. Pin via
     * `apiRef.current.rowPinning` or the exported `createRowPinAction` helper (spread
     * into `getRowActions`), and seed pins with `initialState.rowPinning`.
     * **Client data mode only** (like footer aggregation); ignored under server
     * pagination. Top-level rows only (not tree sub-rows).
     */
    enableRowPinning?: boolean;
    onRowPinningChange?: (pinning: RowPinningState) => void;

    // ── Column visibility ─────────────────────────────────────────────────
    enableColumnVisibility?: boolean;
    onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;

    // ── Column menu (header kebab) ─────────────────────────────────────────
    /**
     * Per-column header "⋮" menu with sort (asc/desc/clear), hide column, and
     * autosize — actions that reuse the existing engine APIs (so each item is
     * gated by `enableSorting`/`enableColumnVisibility`/`enableColumnResizing`).
     * Default `true`. Opt a single column out via `columnDef.disableColumnMenu`.
     */
    enableColumnMenu?: boolean;

    // ── Row expansion ─────────────────────────────────────────────────────
    enableRowExpansion?: boolean;
    getRowCanExpand?: (row: Row<T>) => boolean;
    renderDetailPanel?: (row: Row<T>) => ReactNode;
    /**
     * Tree data: return a row's child rows. Enables hierarchical rows with an
     * expander that appears only on rows that have children, and depth indentation.
     * Mutually exclusive with `renderDetailPanel` (use one or the other).
     */
    getSubRows?: (originalRow: T, index: number) => T[] | undefined;
    /** @deprecated Renamed to `enableRowExpansion`. */
    enableExpanding?: boolean;
    /** @deprecated Renamed to `renderDetailPanel`. */
    renderSubComponent?: (row: Row<T>) => ReactNode;

    // ── List view ─────────────────────────────────────────────────────────
    /**
     * Render each row as a single full-width **list item** instead of a columnar
     * row — great for narrow/mobile layouts. The engine is unchanged (sorting,
     * filtering, pagination, selection, virtualization all still apply); only the
     * row rendering switches. Requires {@link renderListItem}. Controlled: pair
     * with {@link onListViewChange}, or omit and use {@link enableListView} for an
     * uncontrolled toolbar toggle.
     */
    listView?: boolean;
    /** Called when the built-in toolbar toggle switches modes (for controlled `listView`). */
    onListViewChange?: (listView: boolean) => void;
    /** Show a grid ⇄ list toggle in the toolbar. */
    enableListView?: boolean;
    /** Renders a row's content in list view. Owns the whole row (avatar, text, actions, …). */
    renderListItem?: (params: DataTableListItemParams<T>) => ReactNode;
    /** Fixed row height in px (overrides the density row height). Handy for list items. */
    rowHeight?: number;

    // ── Pagination ────────────────────────────────────────────────────────
    enablePagination?: boolean;
    paginationMode?: 'client' | 'server';
    onPaginationChange?: (pagination: PaginationState) => void;
    /** Page-size choices in the footer (default `[5, 10, 25, 50, 100]`); `[]` hides the selector. */
    rowsPerPageOptions?: number[];

    // ── Clipboard ─────────────────────────────────────────────────────────
    /** Show a "Copy" action in the bulk-actions bar (also available via `apiRef.clipboard`). */
    enableClipboardCopy?: boolean;
    /** Called after a successful clipboard copy with the number of rows copied. */
    onClipboardCopy?: (rowCount: number) => void;

    // ── Filtering ─────────────────────────────────────────────────────────
    enableGlobalFilter?: boolean;
    enableColumnFilter?: boolean;
    filterMode?: 'client' | 'server';
    onColumnFilterChange?: (state: ColumnFilterState, isApplied?: boolean) => void;
    onGlobalFilterChange?: (globalFilter: string) => void;
    /** @deprecated Use `onColumnFilterChange` (its second arg is `isApplied`). */
    onColumnFiltersChange?: (filterState: ColumnFilterState, isApplied?: boolean) => void;

    // ── Sorting ───────────────────────────────────────────────────────────
    enableSorting?: boolean;
    sortingMode?: 'client' | 'server';
    onSortingChange?: (sorting: SortingState) => void;

    // ── Appearance ────────────────────────────────────────────────────────
    /**
     * **Controlled** row density. When set, it overrides the density selector
     * every render (the selector becomes a no-op). Maps v1 `small`→`compact`,
     * `medium`→`standard`. For a starting density that the user can still change,
     * use {@link defaultDensity} (or `initialState.density`) instead.
     */
    density?: DataTableDensity;
    /** **Uncontrolled** initial density; the density selector can still change it. */
    defaultDensity?: DataTableDensity;
    hover?: boolean;
    striped?: boolean;
    /** Columns stretch to fill the width (and still respect min/max). */
    fitToScreen?: boolean;
    /** @deprecated Renamed to `density` (`small`→`compact`, `medium`→`standard`). */
    tableSize?: 'small' | 'medium';
    /** @deprecated Renamed to `hover`. */
    enableHover?: boolean;
    /** @deprecated Renamed to `striped`. */
    enableStripes?: boolean;
    /** Conditional class for a row. */
    getRowClassName?: (params: { row: Row<T>; index: number }) => string;
    /** Conditional class for a cell. */
    getCellClassName?: (params: { row: Row<T>; columnId: string; value: any }) => string;

    // ── Sticky / scroll / height ──────────────────────────────────────────
    //
    // Three height modes (like MUI X / AG Grid):
    //   • Auto (default) — grid grows to content, no inner scroll.
    //   • Capped (`maxHeight`) — body scrolls past the cap.
    //   • Fixed/fill (`height`) — grid is exactly `height`; body flexes & scrolls.
    // In any bounded mode the header pins to the top and the footer to the bottom
    // while the body scrolls between them.

    /** Pin the header to the top; on its own it bounds the body at `maxHeight` (default `480`). */
    stickyHeader?: boolean;
    /** Pin the footer (pagination) to the bottom; like `stickyHeader`, it bounds the body. */
    stickyFooter?: boolean;
    /** Cap the scroll viewport; beyond it the body scrolls. Active on its own. */
    maxHeight?: string | number;
    /** Fixed grid height (use `'100%'` to fill a flex/positioned parent); body scrolls to fill. */
    height?: string | number;
    /** Optional floor so a near-empty grid doesn't collapse. */
    minHeight?: string | number;
    /** @deprecated Renamed to `stickyHeader`. */
    enableStickyHeaderOrFooter?: boolean;

    // ── Virtualization ────────────────────────────────────────────────────
    enableVirtualization?: boolean;
    estimatedRowHeight?: number;
    /** @deprecated Renamed to `estimatedRowHeight`. */
    estimateRowHeight?: number;

    // ── Toolbar ───────────────────────────────────────────────────────────
    enableDensitySelector?: boolean;
    enableExport?: boolean;
    /**
     * Show the toolbar "Reset layout" button. It restores the column layout to its
     * initial state **without touching data** (no reload) — see {@link resetActions}
     * to configure exactly what it resets.
     */
    enableReset?: boolean;
    /**
     * What the "Reset layout" button restores. Defaults to column layout only:
     * `['columnOrder', 'columnPinning', 'columnSizing']`. Add `'columnVisibility'`,
     * `'rowPinning'`, `'filters'`, `'sorting'`, and/or `'pagination'` to widen it.
     */
    resetActions?: ResetLayoutAction[];
    /** Show the toolbar "Refresh data" button — re-fetches the data (calls `onFetchData` in server mode). */
    enableRefresh?: boolean;
    /** @deprecated Renamed to `enableDensitySelector`. */
    enableTableSizeControl?: boolean;

    // ── Loading / empty ───────────────────────────────────────────────────
    loading?: boolean;
    noRowsMessage?: string | ReactNode;
    skeletonRows?: number;
    /** @deprecated Renamed to `noRowsMessage`. */
    emptyMessage?: string | ReactNode;

    // ── Customization ─────────────────────────────────────────────────────
    slots?: Partial<DataTableSlots>;
    slotProps?: PartialSlotProps;
    /** Imperative handle (data CRUD, selection, sorting, export, …). */
    apiRef?: RefObject<DataTableApi<T> | null>;
    /** Per-instance style overrides on the root. */
    sx?: Record<string, any>;
    className?: string;

    // ── Debug ─────────────────────────────────────────────────────────────
    logging?: boolean | DataTableLoggingOptions;
}
