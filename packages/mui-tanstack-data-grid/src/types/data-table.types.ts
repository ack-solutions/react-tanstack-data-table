import type { ReactNode, MouseEvent, RefObject } from 'react';
import type {
    Row,
    SortingState,
    ColumnResizeMode,
    ColumnPinningState,
    PaginationState,
    ColumnDef,
} from '@tanstack/react-table';

import type { DataTableDensity } from '../theme/tokens';
import type { ColumnFilterState } from './filter.types';
import type { SelectionState, SelectMode } from './selection.types';
import type { DataTableLoggingOptions } from './logging.types';
import type { DataTableApi } from './api.types';
import type { DataTableSlots, PartialSlotProps } from './slots.types';
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

    // ── Column visibility ─────────────────────────────────────────────────
    enableColumnVisibility?: boolean;
    onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;

    // ── Row expansion ─────────────────────────────────────────────────────
    enableRowExpansion?: boolean;
    getRowCanExpand?: (row: Row<T>) => boolean;
    renderDetailPanel?: (row: Row<T>) => ReactNode;
    /** @deprecated Renamed to `enableRowExpansion`. */
    enableExpanding?: boolean;
    /** @deprecated Renamed to `renderDetailPanel`. */
    renderSubComponent?: (row: Row<T>) => ReactNode;

    // ── Pagination ────────────────────────────────────────────────────────
    enablePagination?: boolean;
    paginationMode?: 'client' | 'server';
    onPaginationChange?: (pagination: PaginationState) => void;

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
    /** Row density. Maps v1 `small`→`compact`, `medium`→`standard`. */
    density?: DataTableDensity;
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

    // ── Sticky / scroll ───────────────────────────────────────────────────
    stickyHeader?: boolean;
    stickyFooter?: boolean;
    maxHeight?: string | number;
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
    enableReset?: boolean;
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
