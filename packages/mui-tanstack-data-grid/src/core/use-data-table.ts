/**
 * useDataTable — the headless engine.
 *
 * Owns all table logic (data, sorting, filtering, pagination, selection, column
 * state, server fetch, export, the imperative API). No DOM — the render layer
 * consumes the result. Ported from v1 `use-data-table-engine.ts` with:
 *  - deprecated prop aliases resolved (enableColumnDragging→enableColumnReordering, …)
 *  - `console.log` debug noise replaced by the gated logger
 *  - real `getRowId` support (stable row identity across pages)
 *  - the obsolete MUI-`<table>` layout math removed (the div/grid layer sizes columns)
 */
import {
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnOrderState,
    type ColumnPinningState,
    type PaginationState,
    type SortingState,
    type Updater,
    type Row,
    type Table,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTheme } from '@mui/material/styles';
import { useMemo, useReducer, useState, useRef, useCallback, useEffect, type RefObject } from 'react';

import type { DataTableProps } from '../types/data-table.types';
import type { DataTableApi, DataRefreshApiInput, DataRefreshApiOptions, DataTableExportApiOptions } from '../types/api.types';
import type { TableState, TableFilters, DataFetchMeta, DataRefreshOptions } from '../types/state.types';
import type { ColumnFilterState } from '../types/filter.types';
import type { SelectionState } from '../types/selection.types';
import type { DataTableDensity } from '../theme/tokens';
import type { ExportPhase, ExportProgressPayload, ExportStateChange } from '../types/export.types';

import { ColumnFilterFeature, getCombinedFilteredRowModel, SelectionFeature } from '../features';
import {
    createExpandingColumn,
    createSelectionColumn,
    generateRowId,
    withIdsDeep,
    useDebouncedFetch,
    runExport,
    createLogger,
} from '../utils';

const DEFAULT_INITIAL_STATE = {
    sorting: [] as SortingState,
    pagination: { pageIndex: 0, pageSize: 10 },
    selectionState: { ids: [], type: 'include' } as SelectionState,
    globalFilter: '',
    expanded: {} as Record<string, boolean>,
    columnOrder: [] as ColumnOrderState,
    columnPinning: { left: [], right: [] } as ColumnPinningState,
    columnVisibility: {} as Record<string, boolean>,
    columnSizing: {} as Record<string, number>,
    columnFilter: {
        filters: [],
        logic: 'AND',
        pendingFilters: [],
        pendingLogic: 'AND',
    } as ColumnFilterState,
};

interface EngineUIState {
    sorting: SortingState;
    pagination: { pageIndex: number; pageSize: number };
    globalFilter: string;
    selectionState: SelectionState;
    columnFilter: ColumnFilterState;
    expanded: Record<string, boolean>;
    density: DataTableDensity;
    columnOrder: ColumnOrderState;
    columnPinning: ColumnPinningState;
    columnVisibility: Record<string, boolean>;
    columnSizing: Record<string, number>;
}

type EngineAction =
    | { type: 'SET_SORTING_RESET_PAGE'; payload: SortingState }
    | { type: 'SET_PAGINATION'; payload: { pageIndex: number; pageSize: number } }
    | { type: 'SET_GLOBAL_FILTER_RESET_PAGE'; payload: string }
    | { type: 'SET_SELECTION'; payload: SelectionState }
    | { type: 'SET_COLUMN_FILTER'; payload: ColumnFilterState }
    | { type: 'SET_COLUMN_FILTER_RESET_PAGE'; payload: ColumnFilterState }
    | { type: 'SET_EXPANDED'; payload: Record<string, boolean> }
    | { type: 'SET_DENSITY'; payload: DataTableDensity }
    | { type: 'SET_COLUMN_ORDER'; payload: ColumnOrderState }
    | { type: 'SET_COLUMN_PINNING'; payload: ColumnPinningState }
    | { type: 'SET_COLUMN_VISIBILITY'; payload: Record<string, boolean> }
    | { type: 'SET_COLUMN_SIZING'; payload: Record<string, number> }
    | { type: 'RESET_ALL'; payload: Partial<EngineUIState> }
    | { type: 'RESTORE_LAYOUT'; payload: Partial<EngineUIState> };

function uiReducer(state: EngineUIState, action: EngineAction): EngineUIState {
    switch (action.type) {
        case 'SET_SORTING_RESET_PAGE':
            return { ...state, sorting: action.payload, pagination: { pageIndex: 0, pageSize: state.pagination.pageSize } };
        case 'SET_PAGINATION':
            return { ...state, pagination: action.payload };
        case 'SET_GLOBAL_FILTER_RESET_PAGE':
            return { ...state, globalFilter: action.payload, pagination: { pageIndex: 0, pageSize: state.pagination.pageSize } };
        case 'SET_SELECTION':
            return { ...state, selectionState: action.payload };
        case 'SET_COLUMN_FILTER':
            return { ...state, columnFilter: action.payload };
        case 'SET_COLUMN_FILTER_RESET_PAGE':
            return { ...state, columnFilter: action.payload, pagination: { pageIndex: 0, pageSize: state.pagination.pageSize } };
        case 'SET_EXPANDED':
            return { ...state, expanded: action.payload };
        case 'SET_DENSITY':
            return { ...state, density: action.payload };
        case 'SET_COLUMN_ORDER':
            return { ...state, columnOrder: action.payload };
        case 'SET_COLUMN_PINNING':
            return { ...state, columnPinning: action.payload };
        case 'SET_COLUMN_VISIBILITY':
            return { ...state, columnVisibility: action.payload };
        case 'SET_COLUMN_SIZING':
            return { ...state, columnSizing: action.payload };
        case 'RESTORE_LAYOUT':
        case 'RESET_ALL':
            return { ...state, ...action.payload };
        default:
            return state;
    }
}

function useLatestRef<T>(value: T) {
    const ref = useRef(value);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref;
}

function useEvent<T extends (...args: any[]) => any>(fn: T): T {
    const fnRef = useLatestRef(fn);
    return useCallback(((...args: any[]) => fnRef.current(...args)) as T, [fnRef]) as T;
}

/** Curated filter payload for server export — matches v1's shape (not the full table state). */
function curateExportFilters(s: any): Partial<TableFilters> {
    return { globalFilter: s.globalFilter, columnFilter: s.columnFilter, sorting: s.sorting, pagination: s.pagination };
}

export interface UseDataTableResult<T = any> {
    table: ReturnType<typeof useReactTable<T>>;
    refs: {
        tableContainerRef: RefObject<HTMLDivElement | null>;
        apiRef: RefObject<DataTableApi<T> | null>;
        exportControllerRef: RefObject<AbortController | null>;
    };
    derived: {
        isServerMode: boolean;
        isServerPagination: boolean;
        isServerFiltering: boolean;
        isServerSorting: boolean;
        tableData: T[];
        tableTotalRow: number;
        tableLoading: boolean;
        rows: ReturnType<ReturnType<typeof useReactTable<T>>['getRowModel']>['rows'];
        visibleLeafColumns: ReturnType<typeof useReactTable<T>>['getVisibleLeafColumns'];
        fitToScreen: boolean;
        density: DataTableDensity;
        isExporting: boolean;
        exportPhase: ExportPhase | null;
        exportProgress: ExportProgressPayload;
        isSomeRowsSelected: boolean;
        selectedRowCount: number;
    };
    state: EngineUIState;
    actions: {
        fetchData: (overrides?: Partial<TableState>, options?: { delay?: number; meta?: DataFetchMeta }) => Promise<any>;
        handleColumnFilterChangeHandler: (updater: any, isApply?: boolean) => void;
        handleColumnReorder: (draggedColumnId: string, targetColumnId: string) => void;
        resetAllAndReload: () => void;
        triggerRefresh: (options?: boolean | DataRefreshOptions, fallbackReason?: string) => Promise<void>;
        setDensity: (density: DataTableDensity) => void;
        handleCancelExport: () => void;
        renderRowModel: { rowVirtualizer: ReturnType<typeof useVirtualizer> };
    };
    api: DataTableApi<T>;
}

export function useDataTable<T extends Record<string, any>>(props: DataTableProps<T>): UseDataTableResult<T> {
    const {
        initialState,
        columns,
        data = [],
        idKey = 'id' as keyof T,
        getRowId: getRowIdProp,

        dataMode = 'client',
        initialLoadData = true,
        onFetchData,
        onFetchStateChange,
        onDataStateChange,

        enableRowSelection = false,
        enableMultiRowSelection = true,
        selectMode = 'page',
        isRowSelectable,
        onSelectionChange,
        enableBulkActions = false,

        enableColumnResizing = false,
        columnResizeMode = 'onChange',
        onColumnSizingChange,

        enableColumnPinning = false,
        onColumnPinningChange,

        onColumnVisibilityChange,
        enableColumnVisibility = true,

        getRowCanExpand,

        enablePagination = false,
        paginationMode = 'client',

        enableGlobalFilter = true,

        enableColumnFilter = false,
        filterMode = 'client',

        enableSorting = true,
        sortingMode = 'client',
        onSortingChange,

        exportFilename = 'export',
        exportConcurrency = 'cancelAndRestart',
        exportChunkSize = 1000,
        exportStrictTotalCheck = false,
        exportSanitizeCSV = true,
        exportMode = 'client',
        exportSink = 'auto',
        exportInterPageDelayMs = 0,
        exportFetchConcurrency = 1,
        exportMaxClientRows,
        exportTruncateXlsx = false,
        exportPollIntervalMs = 2000,
        exportRenameDownload = false,
        exportProgressEvery = 2000,
        onExportProgress,
        onExportComplete,
        onExportError,
        onServerExport,
        onExportStream,
        onExportPoll,
        onExportCancel,
        onExportStateChange,

        fitToScreen = true,
        enableVirtualization = false,

        loading = false,

        onPaginationChange,
        onGlobalFilterChange,

        slots = {},
        slotProps = {},

        logging,
    } = props;

    // --- resolve deprecated aliases (v1 names still accepted)
    const rowCount = props.rowCount ?? props.totalRow ?? 0;
    const enableColumnReordering = props.enableColumnReordering ?? props.enableColumnDragging ?? false;
    const onColumnOrderChange = props.onColumnOrderChange ?? props.onColumnDragEnd;
    const enableExpanding = props.enableRowExpansion ?? props.enableExpanding ?? false;
    const onColumnFilterChange = props.onColumnFilterChange ?? props.onColumnFiltersChange;
    // Density is controlled when `density` (or the deprecated `tableSize`) is passed;
    // otherwise it's uncontrolled (driven by the toolbar's density selector → ui.density).
    const controlledDensity: DataTableDensity | undefined =
        props.density ?? (props.tableSize === 'small' ? 'compact' : props.tableSize === 'medium' ? 'standard' : undefined);
    const initialDensity: DataTableDensity = controlledDensity ?? 'standard';
    const estimateRowHeight = props.estimatedRowHeight ?? props.estimateRowHeight ?? 52;

    const theme = useTheme();
    const log = useMemo(() => createLogger('engine', logging), [logging]);

    const isServerMode = dataMode === 'server';
    const isServerPagination = paginationMode === 'server' || isServerMode;
    const isServerFiltering = filterMode === 'server' || isServerMode;
    const isServerSorting = sortingMode === 'server' || isServerMode;

    const initialStateConfig = useMemo(() => ({ ...DEFAULT_INITIAL_STATE, ...initialState }), [initialState]);

    const initialUIState: EngineUIState = useMemo(
        () => ({
            sorting: initialStateConfig.sorting ?? DEFAULT_INITIAL_STATE.sorting,
            pagination: initialStateConfig.pagination ?? DEFAULT_INITIAL_STATE.pagination,
            globalFilter: initialStateConfig.globalFilter ?? DEFAULT_INITIAL_STATE.globalFilter,
            selectionState: initialStateConfig.selectionState ?? DEFAULT_INITIAL_STATE.selectionState,
            columnFilter: initialStateConfig.columnFilter ?? DEFAULT_INITIAL_STATE.columnFilter,
            expanded: initialStateConfig.expanded ?? {},
            density: initialDensity,
            columnOrder: initialStateConfig.columnOrder ?? DEFAULT_INITIAL_STATE.columnOrder,
            columnPinning: initialStateConfig.columnPinning ?? DEFAULT_INITIAL_STATE.columnPinning,
            columnVisibility: initialStateConfig.columnVisibility ?? DEFAULT_INITIAL_STATE.columnVisibility,
            columnSizing: initialStateConfig.columnSizing ?? DEFAULT_INITIAL_STATE.columnSizing,
        }),
        [initialStateConfig, initialDensity],
    );

    const [ui, dispatch] = useReducer(uiReducer, initialUIState);

    const [serverData, setServerData] = useState<T[] | null>(null);
    const [serverTotal, setServerTotal] = useState<number>(0);

    const [exportPhase, setExportPhase] = useState<ExportPhase | null>(null);
    const [exportProgress, setExportProgress] = useState<ExportProgressPayload>({});
    const [exportController, setExportController] = useState<AbortController | null>(null);
    const [queuedExportCount, setQueuedExportCount] = useState(0);

    const tableContainerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<DataTableApi<T> | null>(null);
    const exportControllerRef = useRef<AbortController | null>(null);
    const exportQueueRef = useRef<Promise<void>>(Promise.resolve());
    const lastSentRef = useRef<string>('');

    const uiRef = useLatestRef(ui);
    const dataRef = useLatestRef(data);
    const serverDataRef = useLatestRef(serverData);
    const nextFetchDelayRef = useRef<number>(0);

    const onFetchDataRef = useLatestRef(onFetchData);
    const onFetchStateChangeRef = useLatestRef(onFetchStateChange);
    const onDataStateChangeRef = useLatestRef(onDataStateChange);
    const onSortingChangeRef = useLatestRef(onSortingChange);
    const onPaginationChangeRef = useLatestRef(onPaginationChange);
    const onGlobalFilterChangeRef = useLatestRef(onGlobalFilterChange);
    const onColumnFilterChangeRef = useLatestRef(onColumnFilterChange);
    const onColumnOrderChangeRef = useLatestRef(onColumnOrderChange);
    const onColumnPinningChangeRef = useLatestRef(onColumnPinningChange);
    const onColumnVisibilityChangeRef = useLatestRef(onColumnVisibilityChange);
    const onColumnSizingChangeRef = useLatestRef(onColumnSizingChange);
    const onSelectionChangeRef = useLatestRef(onSelectionChange);
    const onExportProgressRef = useLatestRef(onExportProgress);
    const onExportCompleteRef = useLatestRef(onExportComplete);
    const onExportErrorRef = useLatestRef(onExportError);
    const onExportCancelRef = useLatestRef(onExportCancel);
    const onExportStateChangeRef = useLatestRef(onExportStateChange);
    const onServerExportRef = useLatestRef(onServerExport);
    const onExportStreamRef = useLatestRef(onExportStream);
    const onExportPollRef = useLatestRef(onExportPoll);

    const fetchHandler = useEvent((filters: any, opts: any) => onFetchDataRef.current?.(filters, opts));
    const { debouncedFetch, isLoading: fetchLoading } = useDebouncedFetch<T>(fetchHandler);

    const tableData = useMemo(() => (serverData !== null ? serverData : data), [serverData, data]);
    const tableTotalRow = useMemo(
        () => (serverData !== null ? serverTotal : rowCount || data.length),
        [serverData, serverTotal, rowCount, data],
    );
    const tableLoading = useMemo(
        () => (onFetchData ? loading || fetchLoading : loading),
        [onFetchData, loading, fetchLoading],
    );

    const getRowId = useCallback(
        (row: T, index: number) => (getRowIdProp ? getRowIdProp(row, index) : generateRowId(row, index, idKey)),
        [getRowIdProp, idKey],
    );

    const enhancedColumns = useMemo(() => {
        let cols = [...columns];
        if (enableExpanding) {
            cols = [
                createExpandingColumn<T>(
                    slotProps?.expandColumn && typeof slotProps.expandColumn === 'object' ? slotProps.expandColumn : {},
                ),
                ...cols,
            ];
        }
        if (enableRowSelection) {
            cols = [
                createSelectionColumn<T>({
                    ...(slotProps?.selectionColumn && typeof slotProps.selectionColumn === 'object'
                        ? slotProps.selectionColumn
                        : {}),
                    multiSelect: enableMultiRowSelection,
                }),
                ...cols,
            ];
        }
        return withIdsDeep(cols);
    }, [columns, enableExpanding, enableRowSelection, enableMultiRowSelection, slotProps?.expandColumn, slotProps?.selectionColumn]);

    const fetchData = useEvent(
        async (overrides: Partial<TableState> = {}, options?: { delay?: number; meta?: DataFetchMeta }) => {
            const s = uiRef.current;
            const filters: Partial<TableFilters> = {
                globalFilter: s.globalFilter,
                pagination: s.pagination,
                columnFilter: s.columnFilter,
                sorting: s.sorting,
                ...overrides,
            };
            onFetchStateChangeRef.current?.(filters, options?.meta);
            const handler = onFetchDataRef.current;
            if (!handler) return;
            const delay = options?.delay ?? 0;
            const result = await debouncedFetch(filters, { debounceDelay: delay, meta: options?.meta });
            if (result && Array.isArray(result.data) && result.total !== undefined) {
                setServerData(result.data);
                setServerTotal(result.total);
            }
            return result;
        },
    );

    const isSomeRowsSelected = useMemo(() => {
        if (!enableBulkActions || !enableRowSelection) return false;
        if (ui.selectionState.type === 'exclude') return ui.selectionState.ids.length < tableTotalRow;
        return ui.selectionState.ids.length > 0;
    }, [enableBulkActions, enableRowSelection, ui.selectionState, tableTotalRow]);

    const selectedRowCount = useMemo(() => {
        if (!enableBulkActions || !enableRowSelection) return 0;
        if (ui.selectionState.type === 'exclude') return tableTotalRow - ui.selectionState.ids.length;
        return ui.selectionState.ids.length;
    }, [enableBulkActions, enableRowSelection, ui.selectionState, tableTotalRow]);

    const table = useReactTable<T>({
        _features: [ColumnFilterFeature, SelectionFeature],
        data: tableData,
        columns: enhancedColumns,
        initialState: initialStateConfig as any,
        state: {
            ...(enableSorting ? { sorting: ui.sorting } : {}),
            ...(enablePagination ? { pagination: ui.pagination } : {}),
            ...(enableGlobalFilter ? { globalFilter: ui.globalFilter } : {}),
            ...(enableExpanding ? { expanded: ui.expanded } : {}),
            ...(enableColumnReordering ? { columnOrder: ui.columnOrder } : {}),
            ...(enableColumnPinning ? { columnPinning: ui.columnPinning } : {}),
            ...(enableColumnVisibility ? { columnVisibility: ui.columnVisibility } : {}),
            ...(enableColumnResizing ? { columnSizing: ui.columnSizing } : {}),
            ...(enableColumnFilter ? { columnFilter: ui.columnFilter } : {}),
            ...(enableRowSelection ? { selectionState: ui.selectionState } : {}),
        },

        selectMode,
        enableAdvanceSelection: !!enableRowSelection,
        isRowSelectable: isRowSelectable as any,

        ...(enableRowSelection
            ? {
                  onSelectionStateChange: (updaterOrValue: any) => {
                      dispatch({
                          type: 'SET_SELECTION',
                          payload:
                              typeof updaterOrValue === 'function'
                                  ? updaterOrValue(uiRef.current.selectionState)
                                  : updaterOrValue,
                      });
                  },
              }
            : {}),

        enableAdvanceColumnFilter: enableColumnFilter,
        onColumnFilterChange: (updater: any) => {
            const next = typeof updater === 'function' ? updater(uiRef.current.columnFilter) : updater;
            dispatch({ type: 'SET_COLUMN_FILTER', payload: next });
        },
        onColumnFilterApply: (state: ColumnFilterState) => {
            dispatch({ type: 'SET_COLUMN_FILTER_RESET_PAGE', payload: state });
        },

        ...(enableSorting
            ? {
                  onSortingChange: (updaterOrValue: any) => {
                      const prev = uiRef.current.sorting;
                      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
                      const cleaned = (next || []).filter((s: any) => s?.id);
                      onSortingChangeRef.current?.(cleaned);
                      dispatch({ type: 'SET_SORTING_RESET_PAGE', payload: cleaned });
                  },
              }
            : {}),

        ...(enablePagination
            ? {
                  onPaginationChange: (updater: any) => {
                      const prev = uiRef.current.pagination;
                      const next = typeof updater === 'function' ? updater(prev) : updater;
                      onPaginationChangeRef.current?.(next);
                      dispatch({ type: 'SET_PAGINATION', payload: next });
                  },
              }
            : {}),

        ...(enableGlobalFilter
            ? {
                  onGlobalFilterChange: (updaterOrValue: any) => {
                      const prev = uiRef.current.globalFilter;
                      const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
                      onGlobalFilterChangeRef.current?.(next);
                      nextFetchDelayRef.current = 400;
                      dispatch({ type: 'SET_GLOBAL_FILTER_RESET_PAGE', payload: next });
                  },
              }
            : {}),

        ...(enableExpanding
            ? {
                  onExpandedChange: (u: any) => {
                      const prev = uiRef.current.expanded;
                      const next = typeof u === 'function' ? u(prev) : u;
                      dispatch({ type: 'SET_EXPANDED', payload: next });
                  },
              }
            : {}),

        ...(enableColumnReordering
            ? {
                  onColumnOrderChange: (u: any) => {
                      const prev = uiRef.current.columnOrder;
                      const next = typeof u === 'function' ? u(prev) : u;
                      onColumnOrderChangeRef.current?.(next);
                      dispatch({ type: 'SET_COLUMN_ORDER', payload: next });
                  },
              }
            : {}),
        ...(enableColumnPinning
            ? {
                  onColumnPinningChange: (u: any) => {
                      const prev = uiRef.current.columnPinning;
                      const next = typeof u === 'function' ? u(prev) : u;
                      onColumnPinningChangeRef.current?.(next);
                      dispatch({ type: 'SET_COLUMN_PINNING', payload: next });
                  },
              }
            : {}),
        ...(enableColumnVisibility
            ? {
                  onColumnVisibilityChange: (u: any) => {
                      const prev = uiRef.current.columnVisibility;
                      const next = typeof u === 'function' ? u(prev) : u;
                      onColumnVisibilityChangeRef.current?.(next);
                      dispatch({ type: 'SET_COLUMN_VISIBILITY', payload: next });
                  },
              }
            : {}),
        ...(enableColumnResizing
            ? {
                  onColumnSizingChange: (u: any) => {
                      const prev = uiRef.current.columnSizing;
                      const next = typeof u === 'function' ? u(prev) : u;
                      onColumnSizingChangeRef.current?.(next);
                      dispatch({ type: 'SET_COLUMN_SIZING', payload: next });
                  },
              }
            : {}),

        getCoreRowModel: getCoreRowModel(),
        ...(enableSorting ? { getSortedRowModel: getSortedRowModel() } : {}),
        ...(enableColumnFilter || enableGlobalFilter ? { getFilteredRowModel: getCombinedFilteredRowModel<T>() } : {}),
        ...(enablePagination && !isServerPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),

        enableSorting,
        manualSorting: isServerSorting,
        manualFiltering: isServerFiltering,

        enableColumnResizing,
        columnResizeMode,
        columnResizeDirection: theme.direction,

        enableColumnPinning,
        ...(enableExpanding ? { getRowCanExpand: getRowCanExpand as any } : {}),

        manualPagination: isServerPagination,
        autoResetPageIndex: false,

        rowCount: enablePagination ? tableTotalRow ?? tableData.length : tableData.length,
        getRowId,
    });

    const rows = table.getRowModel().rows;
    const shouldVirtualize = enableVirtualization && rows.length > 0;
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => estimateRowHeight,
        overscan: 8,
        enabled: shouldVirtualize,
    });

    const serverKey = useMemo(() => {
        if (!(isServerMode || isServerPagination || isServerFiltering || isServerSorting)) return null;
        return JSON.stringify({
            sorting: ui.sorting,
            pagination: ui.pagination,
            globalFilter: ui.globalFilter,
            columnFilter: { filters: ui.columnFilter.filters, logic: ui.columnFilter.logic },
        });
    }, [isServerMode, isServerPagination, isServerFiltering, isServerSorting, ui.sorting, ui.pagination, ui.globalFilter, ui.columnFilter]);
    const serverKeyRef = useLatestRef(serverKey);
    const lastServerKeyRef = useRef<string | null>(null);

    useEffect(() => {
        if (!initialLoadData) return;
        if (serverKeyRef.current) lastServerKeyRef.current = serverKeyRef.current;
        if (onFetchData || onFetchStateChange) {
            void fetchData({}, { delay: 0, meta: { reason: 'initial' } });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!serverKey) return;
        if (serverKey === lastServerKeyRef.current) return;
        lastServerKeyRef.current = serverKey;
        const delay = nextFetchDelayRef.current ?? 0;
        nextFetchDelayRef.current = 0;
        const timeoutId = setTimeout(() => {
            log.debug('stateChange fetch', delay);
            void fetchData({}, { delay, meta: { reason: 'state-change' } });
        }, 0);
        return () => clearTimeout(timeoutId);
    }, [serverKey, fetchData, log]);

    const handleColumnFilterChangeHandler = useCallback(
        (updater: any, isApply = false) => {
            const prev = uiRef.current.columnFilter;
            const next = typeof updater === 'function' ? updater(prev) : updater;
            if (isApply) {
                nextFetchDelayRef.current = 0;
                dispatch({ type: 'SET_COLUMN_FILTER_RESET_PAGE', payload: next });
            } else {
                dispatch({ type: 'SET_COLUMN_FILTER', payload: next });
            }
            onColumnFilterChangeRef.current?.(next, isApply);
        },
        [onColumnFilterChangeRef, uiRef],
    );

    useEffect(() => {
        const cb = onDataStateChangeRef.current;
        if (!cb) return;
        const live = table.getState();
        const payload = {
            sorting: live.sorting,
            pagination: live.pagination,
            globalFilter: live.globalFilter,
            columnFilter: live.columnFilter,
            columnVisibility: live.columnVisibility,
            columnSizing: live.columnSizing,
            columnOrder: live.columnOrder,
            columnPinning: live.columnPinning,
        };
        const key = JSON.stringify(payload);
        if (key === lastSentRef.current) return;
        lastSentRef.current = key;
        cb(payload as Partial<TableState>);
    }, [table, ui.sorting, ui.pagination, ui.globalFilter, ui.columnFilter, ui.columnVisibility, ui.columnSizing, ui.columnOrder, ui.columnPinning, onDataStateChangeRef]);

    const normalizeRefreshOptions = useCallback(
        (options?: boolean | DataRefreshOptions, fallbackReason = 'refresh') => {
            if (typeof options === 'boolean') return { resetPagination: options, force: false, reason: fallbackReason };
            return {
                resetPagination: options?.resetPagination ?? false,
                force: options?.force ?? false,
                reason: options?.reason ?? fallbackReason,
            };
        },
        [],
    );

    const triggerRefresh = useCallback(
        async (options?: boolean | DataRefreshOptions, fallbackReason = 'refresh') => {
            const n = normalizeRefreshOptions(options, fallbackReason);
            const current = uiRef.current.pagination;
            const nextPagination = enablePagination
                ? { pageIndex: n.resetPagination ? 0 : current.pageIndex, pageSize: current.pageSize }
                : undefined;
            if (nextPagination) {
                nextFetchDelayRef.current = 0;
                dispatch({ type: 'SET_PAGINATION', payload: nextPagination });
                onPaginationChangeRef.current?.(nextPagination as PaginationState);
            }
            const paginationChanged =
                !!nextPagination &&
                (nextPagination.pageIndex !== current.pageIndex || nextPagination.pageSize !== current.pageSize);
            if (!paginationChanged) {
                await fetchData({}, { delay: 0, meta: { reason: n.reason, force: n.force } });
            }
        },
        [enablePagination, fetchData, normalizeRefreshOptions, onPaginationChangeRef, uiRef],
    );

    const getResetPayload = useCallback((): Partial<EngineUIState> => {
        const resetPagination = enablePagination
            ? initialStateConfig.pagination || { pageIndex: 0, pageSize: 10 }
            : uiRef.current.pagination;
        return {
            sorting: initialStateConfig.sorting || [],
            globalFilter: initialStateConfig.globalFilter ?? '',
            columnFilter: (initialStateConfig.columnFilter ?? DEFAULT_INITIAL_STATE.columnFilter) as ColumnFilterState,
            ...(enablePagination ? { pagination: resetPagination } : {}),
            selectionState: initialStateConfig.selectionState ?? DEFAULT_INITIAL_STATE.selectionState,
            expanded: {},
            columnVisibility: initialStateConfig.columnVisibility || {},
            columnSizing: initialStateConfig.columnSizing || {},
            columnOrder: initialStateConfig.columnOrder || [],
            columnPinning: initialStateConfig.columnPinning || { left: [], right: [] },
        };
    }, [enablePagination, initialStateConfig, uiRef]);

    const resetAllAndReload = useCallback(() => {
        const payload = getResetPayload();
        dispatch({ type: 'RESET_ALL', payload });
        void fetchData(
            {
                sorting: payload.sorting as any,
                globalFilter: payload.globalFilter as any,
                columnFilter: payload.columnFilter as any,
                ...(enablePagination ? { pagination: payload.pagination as any } : {}),
            },
            { delay: 0, meta: { reason: 'reset', force: true } },
        );
    }, [enablePagination, fetchData, getResetPayload]);

    // --- export policy
    const setExportControllerSafely = useCallback(
        (value: AbortController | null | ((current: AbortController | null) => AbortController | null)) => {
            setExportController((current) => {
                const next = typeof value === 'function' ? (value as any)(current) : value;
                exportControllerRef.current = next;
                return next;
            });
        },
        [],
    );

    const handleExportProgressInternal = useCallback((p: ExportProgressPayload) => {
        setExportProgress(p || {});
        onExportProgressRef.current?.(p);
    }, [onExportProgressRef]);

    const handleExportStateChangeInternal = useCallback((s: ExportStateChange) => {
        setExportPhase(s.phase);
        if (s.processedRows !== undefined || s.totalRows !== undefined || s.percentage !== undefined) {
            setExportProgress({ processedRows: s.processedRows, totalRows: s.totalRows, percentage: s.percentage });
        }
        onExportStateChangeRef.current?.(s);
    }, [onExportStateChangeRef]);

    const runExportWithPolicy = useCallback(
        async (options: {
            format: 'csv' | 'excel';
            filename: string;
            mode: 'client' | 'server';
            execute: (controller: AbortController) => Promise<void>;
        }) => {
            const { format, filename, mode, execute } = options;
            const startExecution = async () => {
                const controller = new AbortController();
                setExportProgress({});
                setExportControllerSafely(controller);
                try {
                    await execute(controller);
                } finally {
                    setExportControllerSafely((cur) => (cur === controller ? null : cur));
                }
            };

            if (exportConcurrency === 'queue') {
                setQueuedExportCount((p) => p + 1);
                const runQueued = async () => {
                    setQueuedExportCount((p) => Math.max(0, p - 1));
                    await startExecution();
                };
                const queuedPromise = exportQueueRef.current.catch(() => undefined).then(runQueued);
                exportQueueRef.current = queuedPromise;
                return queuedPromise;
            }

            const active = exportControllerRef.current;
            if (active) {
                if (exportConcurrency === 'ignoreIfRunning') {
                    handleExportStateChangeInternal({
                        phase: 'error',
                        mode,
                        format,
                        filename,
                        message: 'An export is already running',
                        code: 'EXPORT_IN_PROGRESS',
                    });
                    onExportErrorRef.current?.({ message: 'An export is already running', code: 'EXPORT_IN_PROGRESS' });
                    return;
                }
                if (exportConcurrency === 'cancelAndRestart') active.abort();
            }
            await startExecution();
        },
        [exportConcurrency, handleExportStateChangeInternal, onExportErrorRef, setExportControllerSafely],
    );

    const handleCancelExport = useCallback(() => {
        const active = exportControllerRef.current;
        if (!active) return;
        active.abort();
        setExportControllerSafely((cur) => (cur === active ? null : cur));
        onExportCancelRef.current?.();
    }, [onExportCancelRef, setExportControllerSafely]);

    const isExporting = exportController !== null;

    // --- stable API (created once, methods read latest via refs)
    if (!apiRef.current) {
        apiRef.current = {} as DataTableApi<T>;
    }
    const tableRef = useLatestRef(table);

    useEffect(() => {
        const api = apiRef.current!;
        api.table = { getTable: () => tableRef.current };

        api.state = {
            getTableState: () => tableRef.current.getState() as Partial<TableState>,
            getCurrentFilters: () => tableRef.current.getState().columnFilter,
            getCurrentSorting: () => tableRef.current.getState().sorting,
            getCurrentPagination: () => tableRef.current.getState().pagination,
            getCurrentSelection: () => uiRef.current.selectionState,
            getGlobalFilter: () => tableRef.current.getState().globalFilter,
        };

        const getBaseData = () => {
            const sData = serverDataRef.current;
            return sData !== null ? sData : dataRef.current;
        };
        const getRowIndexById = (arr: T[], rowId: string) =>
            arr.findIndex((row, i) => getRowId(row, i) === rowId);

        api.data = {
            refresh: (options?: DataRefreshApiInput) => void triggerRefresh(options, 'refresh'),
            reload: (options: DataRefreshApiOptions = {}) => void triggerRefresh({ ...options, reason: options.reason ?? 'reload' }, 'reload'),
            resetAll: () => resetAllAndReload(),
            getAllData: () => [...getBaseData()],
            getRowData: (rowId: string) => tableRef.current.getRowModel().rows.find((r: any) => r.id === rowId)?.original as T | undefined,
            getRowByIndex: (index: number) => tableRef.current.getRowModel().rows[index]?.original as T | undefined,
            getDataCount: () => getBaseData().length,
            getFilteredDataCount: () => tableRef.current.getFilteredRowModel().rows.length,
            updateRow: (rowId, updates) => {
                const base = getBaseData();
                const idx = getRowIndexById(base, rowId);
                if (idx === -1) return;
                const next = [...base];
                next[idx] = { ...next[idx], ...updates } as T;
                setServerData(next);
                setServerTotal(next.length);
            },
            updateRowByIndex: (index, updates) => {
                const base = getBaseData();
                if (index < 0 || index >= base.length) return;
                const next = [...base];
                next[index] = { ...next[index], ...updates } as T;
                setServerData(next);
                setServerTotal(next.length);
            },
            insertRow: (newRow, index) => {
                const base = getBaseData();
                const next = index == null ? [...base, newRow] : [...base.slice(0, index), newRow, ...base.slice(index)];
                setServerData(next);
                setServerTotal(next.length);
            },
            deleteRow: (rowId) => {
                const base = getBaseData();
                const idx = getRowIndexById(base, rowId);
                if (idx === -1) return;
                const next = base.filter((_, i) => i !== idx);
                setServerData(next);
                setServerTotal(next.length);
            },
            deleteRowByIndex: (index) => {
                const base = getBaseData();
                if (index < 0 || index >= base.length) return;
                const next = base.filter((_, i) => i !== index);
                setServerData(next);
                setServerTotal(next.length);
            },
            deleteSelectedRows: () => {
                const state = tableRef.current.getSelectionState?.();
                if (!state || state.type !== 'include' || !state.ids.length) return;
                const base = getBaseData();
                const ids = new Set(state.ids);
                const next = base.filter((row, i) => !ids.has(getRowId(row, i)));
                setServerData(next);
                setServerTotal(next.length);
                tableRef.current.deselectAll?.();
            },
            replaceAllData: (newData) => {
                setServerData(newData);
                setServerTotal(newData.length);
            },
            updateMultipleRows: (updates) => {
                const base = getBaseData();
                const next = [...base];
                for (const { rowId, data: u } of updates) {
                    const idx = getRowIndexById(next, rowId);
                    if (idx !== -1) next[idx] = { ...next[idx], ...u } as T;
                }
                setServerData(next);
                setServerTotal(next.length);
            },
            insertMultipleRows: (newRows, startIndex) => {
                const base = getBaseData();
                const idx = startIndex ?? base.length;
                const next = [...base.slice(0, idx), ...newRows, ...base.slice(idx)];
                setServerData(next);
                setServerTotal(next.length);
            },
            deleteMultipleRows: (rowIds) => {
                const ids = new Set(rowIds);
                const base = getBaseData();
                const next = base.filter((row, i) => !ids.has(getRowId(row, i)));
                setServerData(next);
                setServerTotal(next.length);
            },
            updateField: (rowId, fieldName, value) => api.data.updateRow(rowId, { [fieldName]: value } as Partial<T>),
            updateFieldByIndex: (index, fieldName, value) => api.data.updateRowByIndex(index, { [fieldName]: value } as Partial<T>),
            findRows: (predicate) => getBaseData().filter(predicate),
            findRowIndex: (predicate) => getBaseData().findIndex(predicate),
        };

        api.layout = {
            saveLayout: () => {
                const s = tableRef.current.getState();
                return {
                    columnVisibility: s.columnVisibility ?? {},
                    columnOrder: s.columnOrder ?? [],
                    columnSizing: s.columnSizing ?? {},
                    columnPinning: s.columnPinning ?? { left: [], right: [] },
                    pagination: s.pagination ?? { pageIndex: 0, pageSize: 10 },
                    globalFilter: s.globalFilter ?? '',
                    columnFilter: s.columnFilter,
                };
            },
            restoreLayout: (layout) => {
                if (layout.columnVisibility) dispatch({ type: 'SET_COLUMN_VISIBILITY', payload: layout.columnVisibility });
                if (layout.columnOrder) {
                    dispatch({ type: 'SET_COLUMN_ORDER', payload: layout.columnOrder });
                    onColumnOrderChangeRef.current?.(layout.columnOrder);
                }
                if (layout.columnSizing) {
                    dispatch({ type: 'SET_COLUMN_SIZING', payload: layout.columnSizing });
                    onColumnSizingChangeRef.current?.(layout.columnSizing);
                }
                if (layout.columnPinning) {
                    dispatch({ type: 'SET_COLUMN_PINNING', payload: layout.columnPinning });
                    onColumnPinningChangeRef.current?.(layout.columnPinning);
                }
                if (layout.pagination && enablePagination) dispatch({ type: 'SET_PAGINATION', payload: layout.pagination });
                if (layout.globalFilter !== undefined) dispatch({ type: 'SET_GLOBAL_FILTER_RESET_PAGE', payload: layout.globalFilter });
                if (layout.columnFilter) dispatch({ type: 'SET_COLUMN_FILTER', payload: layout.columnFilter });
            },
            resetLayout: () => {
                dispatch({ type: 'SET_COLUMN_VISIBILITY', payload: initialStateConfig.columnVisibility || {} });
                dispatch({ type: 'SET_COLUMN_ORDER', payload: initialStateConfig.columnOrder || [] });
                dispatch({ type: 'SET_COLUMN_SIZING', payload: initialStateConfig.columnSizing || {} });
                dispatch({ type: 'SET_COLUMN_PINNING', payload: initialStateConfig.columnPinning || { left: [], right: [] } });
                dispatch({ type: 'SET_GLOBAL_FILTER_RESET_PAGE', payload: '' });
                dispatch({ type: 'SET_COLUMN_FILTER', payload: (initialStateConfig.columnFilter || DEFAULT_INITIAL_STATE.columnFilter) as ColumnFilterState });
                dispatch({ type: 'SET_SORTING_RESET_PAGE', payload: initialStateConfig.sorting || [] });
                dispatch({ type: 'SET_PAGINATION', payload: initialStateConfig.pagination || { pageIndex: 0, pageSize: 10 } });
            },
            resetAll: () => {
                api.layout.resetLayout();
                resetAllAndReload();
            },
        };

        api.sorting = {
            setSorting: (next) => {
                const cleaned = (next || []).filter((s: any) => s?.id);
                onSortingChangeRef.current?.(cleaned);
                nextFetchDelayRef.current = 0;
                dispatch({ type: 'SET_SORTING_RESET_PAGE', payload: cleaned });
            },
            sortColumn: (columnId, direction) => {
                const next: SortingState = direction === false ? [] : [{ id: columnId, desc: direction === 'desc' }];
                onSortingChangeRef.current?.(next);
                nextFetchDelayRef.current = 0;
                dispatch({ type: 'SET_SORTING_RESET_PAGE', payload: next });
            },
            clearSorting: () => {
                onSortingChangeRef.current?.([]);
                nextFetchDelayRef.current = 0;
                dispatch({ type: 'SET_SORTING_RESET_PAGE', payload: [] });
            },
            resetSorting: () => {
                const next = (initialStateConfig.sorting || []) as SortingState;
                onSortingChangeRef.current?.(next);
                nextFetchDelayRef.current = 0;
                dispatch({ type: 'SET_SORTING_RESET_PAGE', payload: next });
            },
        };

        api.pagination = {
            goToPage: (pageIndex) => {
                const prev = uiRef.current.pagination;
                const next = { ...prev, pageIndex };
                onPaginationChangeRef.current?.(next as PaginationState);
                nextFetchDelayRef.current = 0;
                dispatch({ type: 'SET_PAGINATION', payload: next });
            },
            nextPage: () => {
                const prev = uiRef.current.pagination;
                api.pagination.goToPage(Math.min(prev.pageIndex + 1, Math.max(0, Math.ceil((tableTotalRow ?? 0) / prev.pageSize) - 1)));
            },
            previousPage: () => {
                const prev = uiRef.current.pagination;
                api.pagination.goToPage(Math.max(0, prev.pageIndex - 1));
            },
            setPageSize: (pageSize) => {
                const next = { pageIndex: 0, pageSize };
                onPaginationChangeRef.current?.(next as PaginationState);
                nextFetchDelayRef.current = 0;
                dispatch({ type: 'SET_PAGINATION', payload: next });
            },
            goToFirstPage: () => api.pagination.goToPage(0),
            goToLastPage: () => {
                const prev = uiRef.current.pagination;
                api.pagination.goToPage(Math.max(0, Math.ceil((tableTotalRow ?? 0) / prev.pageSize) - 1));
            },
            resetPagination: () => {
                const next = (initialStateConfig.pagination || { pageIndex: 0, pageSize: 10 }) as any;
                onPaginationChangeRef.current?.(next);
                nextFetchDelayRef.current = 0;
                dispatch({ type: 'SET_PAGINATION', payload: next });
            },
        };

        api.filtering = {
            setGlobalFilter: (filter) => {
                onGlobalFilterChangeRef.current?.(filter);
                nextFetchDelayRef.current = 400;
                dispatch({ type: 'SET_GLOBAL_FILTER_RESET_PAGE', payload: filter });
            },
            clearGlobalFilter: () => {
                onGlobalFilterChangeRef.current?.('');
                nextFetchDelayRef.current = 400;
                dispatch({ type: 'SET_GLOBAL_FILTER_RESET_PAGE', payload: '' });
            },
            setColumnFilters: (filters, isApply = false) => handleColumnFilterChangeHandler(filters, isApply),
            addColumnFilter: (columnId, operator, value) => tableRef.current.addColumnFilter?.(columnId, operator, value),
            removeColumnFilter: (filterId) => tableRef.current.removeColumnFilter?.(filterId),
            clearAllFilters: () => tableRef.current.resetColumnFilter?.(),
            resetFilters: () => {
                const reset = (initialStateConfig.columnFilter ?? DEFAULT_INITIAL_STATE.columnFilter) as ColumnFilterState;
                handleColumnFilterChangeHandler(reset, true);
            },
        };

        api.columnVisibility = {
            showColumn: (id) => dispatch({ type: 'SET_COLUMN_VISIBILITY', payload: { ...uiRef.current.columnVisibility, [id]: true } }),
            hideColumn: (id) => dispatch({ type: 'SET_COLUMN_VISIBILITY', payload: { ...uiRef.current.columnVisibility, [id]: false } }),
            toggleColumn: (id) => {
                // Read actual visibility (absent in the map = visible) so the first
                // toggle on a default-visible column correctly hides it.
                const isVisible = tableRef.current.getColumn(id)?.getIsVisible() ?? true;
                dispatch({ type: 'SET_COLUMN_VISIBILITY', payload: { ...uiRef.current.columnVisibility, [id]: !isVisible } });
            },
            showAllColumns: () => dispatch({ type: 'SET_COLUMN_VISIBILITY', payload: {} }),
            hideAllColumns: () => {
                const all = tableRef.current.getAllLeafColumns().reduce((acc, col) => ({ ...acc, [col.id]: false }), {} as Record<string, boolean>);
                dispatch({ type: 'SET_COLUMN_VISIBILITY', payload: all });
            },
            resetColumnVisibility: () => dispatch({ type: 'SET_COLUMN_VISIBILITY', payload: initialStateConfig.columnVisibility || {} }),
        };

        api.columnOrdering = {
            setColumnOrder: (next) => {
                dispatch({ type: 'SET_COLUMN_ORDER', payload: next });
                onColumnOrderChangeRef.current?.(next);
            },
            moveColumn: (columnId, toIndex) => {
                const order = uiRef.current.columnOrder.length ? uiRef.current.columnOrder : tableRef.current.getAllLeafColumns().map((c: any) => c.id);
                const from = order.indexOf(columnId);
                if (from === -1 || toIndex < 0 || toIndex >= order.length) return;
                const next = [...order];
                next.splice(from, 1);
                next.splice(toIndex, 0, columnId);
                dispatch({ type: 'SET_COLUMN_ORDER', payload: next });
                onColumnOrderChangeRef.current?.(next);
            },
            resetColumnOrder: () => dispatch({ type: 'SET_COLUMN_ORDER', payload: initialStateConfig.columnOrder || [] }),
        };

        api.columnPinning = {
            pinColumnLeft: (columnId) => {
                const cur = uiRef.current.columnPinning;
                const left = cur.left!.includes(columnId) ? cur.left! : [...cur.left!.filter((id) => id !== columnId), columnId];
                const right = cur.right!.filter((id) => id !== columnId);
                dispatch({ type: 'SET_COLUMN_PINNING', payload: { left, right } });
                onColumnPinningChangeRef.current?.({ left, right });
            },
            pinColumnRight: (columnId) => {
                const cur = uiRef.current.columnPinning;
                const left = cur.left!.filter((id) => id !== columnId);
                const right = cur.right!.includes(columnId) ? cur.right! : [...cur.right!.filter((id) => id !== columnId), columnId];
                dispatch({ type: 'SET_COLUMN_PINNING', payload: { left, right } });
                onColumnPinningChangeRef.current?.({ left, right });
            },
            unpinColumn: (columnId) => {
                const cur = uiRef.current.columnPinning;
                const left = cur.left!.filter((id) => id !== columnId);
                const right = cur.right!.filter((id) => id !== columnId);
                dispatch({ type: 'SET_COLUMN_PINNING', payload: { left, right } });
                onColumnPinningChangeRef.current?.({ left, right });
            },
            setPinning: (next) => {
                dispatch({ type: 'SET_COLUMN_PINNING', payload: next });
                onColumnPinningChangeRef.current?.(next);
            },
            resetColumnPinning: () => dispatch({ type: 'SET_COLUMN_PINNING', payload: initialStateConfig.columnPinning || { left: [], right: [] } }),
        };

        api.columnResizing = {
            resizeColumn: (columnId, width) => {
                const cur = uiRef.current.columnSizing;
                dispatch({ type: 'SET_COLUMN_SIZING', payload: { ...cur, [columnId]: width } });
                onColumnSizingChangeRef.current?.({ ...cur, [columnId]: width });
            },
            autoSizeColumn: () => undefined,
            autoSizeAllColumns: () => undefined,
            resetColumnSizing: () => dispatch({ type: 'SET_COLUMN_SIZING', payload: initialStateConfig.columnSizing || {} }),
        };

        api.selection = {
            selectRow: (rowId) => tableRef.current.selectRow?.(rowId),
            deselectRow: (rowId) => tableRef.current.deselectRow?.(rowId),
            toggleRowSelection: (rowId) => tableRef.current.toggleRowSelected?.(rowId),
            selectAll: () => tableRef.current.selectAll?.(),
            deselectAll: () => tableRef.current.deselectAll?.(),
            toggleSelectAll: () => tableRef.current.toggleAllRowsSelected?.(),
            getSelectionState: () => tableRef.current.getSelectionState?.() || ({ ids: [], type: 'include' } as const),
            getSelectedRows: () => tableRef.current.getSelectedRows(),
            getSelectedCount: () => tableRef.current.getSelectedCount(),
            isRowSelected: (rowId) => tableRef.current.getIsRowSelected(rowId) || false,
        };

        // Page rows for export via the grid's own data fetch (without disturbing the visible page).
        const fetchPageForExport = async (pageIndex: number, pageSize: number): Promise<{ data: any[]; total?: number }> => {
            const handler = onFetchDataRef.current;
            if (!handler) throw new Error('Server-data export needs onFetchData, onExportStream, or onServerExport.');
            const base = curateExportFilters(tableRef.current.getState());
            const result = await handler({ ...base, pagination: { pageIndex, pageSize } } as any, { reason: 'export' } as any);
            return { data: result?.data ?? [], total: result?.total };
        };

        // Build the request OPTIONS from current grid state; runExport resolves the descriptor.
        const buildExportRequestOptions = (format: 'csv' | 'excel', options: DataTableExportApiOptions) => {
            const state = tableRef.current.getState() as any;
            return {
                format,
                filename: options.filename ?? exportFilename,
                onlyVisibleColumns: options.onlyVisibleColumns ?? true,
                onlySelectedRows: options.onlySelectedRows,
                columns: options.columns,
                scope: options.scope,
                includeHeaders: options.includeHeaders,
                sanitizeCSV: options.sanitizeCSV ?? exportSanitizeCSV,
                delimiter: options.delimiter,
                filters: curateExportFilters(state),
                sorting: state.sorting,
                selection: tableRef.current.getSelectionState?.(),
            };
        };

        const runUnifiedExport = async (format: 'csv' | 'excel', options: DataTableExportApiOptions) => {
            const fn = options.filename ?? exportFilename;
            const mode = options.mode ?? exportMode;
            await runExportWithPolicy({
                format,
                filename: fn,
                mode: mode === 'client' ? 'client' : 'server',
                execute: async (controller) => {
                    await runExport(tableRef.current, {
                        mode,
                        dataMode,
                        request: buildExportRequestOptions(format, options),
                        sink: exportSink,
                        chunkSize: options.chunkSize ?? exportChunkSize,
                        interPageDelayMs: exportInterPageDelayMs,
                        fetchConcurrency: exportFetchConcurrency,
                        maxClientRows: exportMaxClientRows,
                        truncateXlsx: exportTruncateXlsx,
                        pollIntervalMs: exportPollIntervalMs,
                        renameDownload: exportRenameDownload,
                        progressEvery: exportProgressEvery,
                        signal: controller.signal,
                        fetchPage: fetchPageForExport,
                        onExportStream: onExportStreamRef.current,
                        onServerExport: onServerExportRef.current,
                        onExportPoll: onExportPollRef.current,
                        onProgress: handleExportProgressInternal,
                        onStateChange: (s) => handleExportStateChangeInternal({ ...s, mode, format, filename: fn }),
                        onComplete: onExportCompleteRef.current,
                        onError: onExportErrorRef.current,
                    });
                },
            });
        };

        api.export = {
            exportCSV: (options: DataTableExportApiOptions = {}) => runUnifiedExport('csv', options),
            exportExcel: (options: DataTableExportApiOptions = {}) => runUnifiedExport('excel', options),
            isExporting: () => exportControllerRef.current != null,
            cancelExport: () => handleCancelExport(),
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataMode, exportChunkSize, exportFilename, exportSanitizeCSV, exportStrictTotalCheck, exportMode, exportSink, exportInterPageDelayMs, exportFetchConcurrency, exportMaxClientRows, exportTruncateXlsx, exportPollIntervalMs, exportRenameDownload, exportProgressEvery, fetchData, handleCancelExport, handleColumnFilterChangeHandler, handleExportProgressInternal, handleExportStateChangeInternal, initialStateConfig, resetAllAndReload, runExportWithPolicy, triggerRefresh, tableTotalRow, getRowId, tableRef, uiRef, serverDataRef, dataRef, enablePagination]);

    const handleColumnReorder = useCallback(
        (draggedId: string, targetId: string) => {
            const currentOrder =
                uiRef.current.columnOrder.length > 0
                    ? uiRef.current.columnOrder
                    : enhancedColumns.map((c: any, idx: number) => c.id ?? c.accessorKey ?? `column_${idx}`);
            const from = currentOrder.indexOf(draggedId);
            const to = currentOrder.indexOf(targetId);
            if (from === -1 || to === -1) return;
            const next = [...currentOrder];
            next.splice(from, 1);
            next.splice(to, 0, draggedId);
            dispatch({ type: 'SET_COLUMN_ORDER', payload: next });
            onColumnOrderChangeRef.current?.(next);
        },
        [enhancedColumns, onColumnOrderChangeRef, uiRef],
    );

    useEffect(() => {
        onSelectionChangeRef.current?.(ui.selectionState);
    }, [onSelectionChangeRef, ui.selectionState]);

    return {
        table,
        refs: { tableContainerRef, apiRef, exportControllerRef },
        derived: {
            isServerMode,
            isServerPagination,
            isServerFiltering,
            isServerSorting,
            tableData,
            tableTotalRow,
            tableLoading,
            rows,
            visibleLeafColumns: table.getVisibleLeafColumns,
            fitToScreen,
            density: controlledDensity ?? ui.density,
            isExporting,
            exportPhase,
            exportProgress,
            isSomeRowsSelected,
            selectedRowCount,
        },
        state: ui,
        actions: {
            fetchData,
            handleColumnFilterChangeHandler,
            handleColumnReorder,
            resetAllAndReload,
            triggerRefresh,
            setDensity: (density: DataTableDensity) => dispatch({ type: 'SET_DENSITY', payload: density }),
            handleCancelExport,
            renderRowModel: { rowVirtualizer },
        },
        api: apiRef.current,
    };
}
