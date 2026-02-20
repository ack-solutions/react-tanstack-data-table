import {
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    PaginationState,
    useReactTable,
    type ColumnOrderState,
    type ColumnPinningState,
    type SortingState,
    type Updater,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTheme } from "@mui/material/styles";
import { useMemo, useReducer, useState, useRef, useCallback, useEffect, RefObject, CSSProperties } from "react";

// your types
import type {
    ColumnFilterState,
    DataFetchMeta,
    DataRefreshOptions,
    DataTableProps,
    ExportPhase,
    ExportProgressPayload,
    ExportStateChange,
    TableFiltersForFetch,
    TableState,
} from "../types";
import type { DataTableApi, DataTableExportApiOptions } from "../types/data-table-api";

// your features / utils
import { ColumnFilterFeature, getCombinedFilteredRowModel } from "../features/column-filter.feature";
import { SelectionFeature, SelectionState } from "../features";
import { createExpandingColumn, createSelectionColumn } from "../utils/special-columns.utils";
import {
    exportClientData,
    exportServerData,
    generateRowId,
    withIdsDeep,
    type DataTableSize,
} from "../utils";
import { useDebouncedFetch } from "../utils/debounced-fetch.utils";

const DEFAULT_INITIAL_STATE = {
    sorting: [] as SortingState,
    pagination: { pageIndex: 0, pageSize: 10 },
    selectionState: { ids: [], type: "include" } as SelectionState,
    globalFilter: "",
    expanded: {} as Record<string, boolean>,
    columnOrder: [] as ColumnOrderState,
    columnPinning: { left: [], right: [] } as ColumnPinningState,
    columnVisibility: {} as Record<string, boolean>,
    columnSizing: {} as Record<string, number>,
    columnFilter: {
        filters: [],
        logic: "AND",
        pendingFilters: [],
        pendingLogic: "AND",
    } as ColumnFilterState,
};

type EngineUIState = {
    sorting: SortingState;
    pagination: { pageIndex: number; pageSize: number };
    globalFilter: string;
    selectionState: SelectionState;
    columnFilter: ColumnFilterState;
    expanded: Record<string, boolean>;
    tableSize: DataTableSize;
    columnOrder: ColumnOrderState;
    columnPinning: ColumnPinningState;
    columnVisibility: Record<string, boolean>;
    columnSizing: Record<string, number>;
};
type EngineAction =
    | { type: "SET_SORTING_RESET_PAGE"; payload: SortingState }
    | { type: "SET_PAGINATION"; payload: { pageIndex: number; pageSize: number } }
    | { type: "SET_GLOBAL_FILTER_RESET_PAGE"; payload: string }
    | { type: "SET_SELECTION"; payload: SelectionState }
    | { type: "SET_COLUMN_FILTER"; payload: ColumnFilterState }
    | { type: "SET_COLUMN_FILTER_RESET_PAGE"; payload: ColumnFilterState }
    | { type: "SET_EXPANDED"; payload: Record<string, boolean> }
    | { type: "SET_TABLE_SIZE"; payload: DataTableSize }
    | { type: "SET_COLUMN_ORDER"; payload: ColumnOrderState }
    | { type: "SET_COLUMN_PINNING"; payload: ColumnPinningState }
    | { type: "SET_COLUMN_VISIBILITY"; payload: Record<string, boolean> }
    | { type: "SET_COLUMN_SIZING"; payload: Record<string, number> }
    | { type: "RESET_ALL"; payload: Partial<EngineUIState> } // payload = computed reset state
    | { type: "RESTORE_LAYOUT"; payload: Partial<EngineUIState> };


function uiReducer(state: EngineUIState, action: EngineAction): EngineUIState {
    switch (action.type) {
        case "SET_SORTING_RESET_PAGE":
            return { ...state, sorting: action.payload, pagination: { pageIndex: 0, pageSize: state.pagination.pageSize } };
        case "SET_PAGINATION":
            return { ...state, pagination: action.payload };
        case "SET_GLOBAL_FILTER_RESET_PAGE":
            return { ...state, globalFilter: action.payload, pagination: { pageIndex: 0, pageSize: state.pagination.pageSize } };
        case "SET_SELECTION":
            return { ...state, selectionState: action.payload };
        case "SET_COLUMN_FILTER":
            return { ...state, columnFilter: action.payload };
        case "SET_COLUMN_FILTER_RESET_PAGE":
            return { ...state, columnFilter: action.payload, pagination: { pageIndex: 0, pageSize: state.pagination.pageSize } };
        case "SET_EXPANDED":
            return { ...state, expanded: action.payload };
        case "SET_TABLE_SIZE":
            return { ...state, tableSize: action.payload };
        case "SET_COLUMN_ORDER":
            return { ...state, columnOrder: action.payload };
        case "SET_COLUMN_PINNING":
            return { ...state, columnPinning: action.payload };
        case "SET_COLUMN_VISIBILITY":
            return { ...state, columnVisibility: action.payload };
        case "SET_COLUMN_SIZING":
            return { ...state, columnSizing: action.payload };
        case "RESTORE_LAYOUT":
            return { ...state, ...action.payload };
        case "RESET_ALL":
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


export interface EngineResult<T = any> {
    table: ReturnType<typeof useReactTable<T>>;
    refs: {
        tableContainerRef: RefObject<HTMLDivElement>;
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
        rows: ReturnType<ReturnType<typeof useReactTable<T>>["getRowModel"]>["rows"];
        visibleLeafColumns: ReturnType<typeof useReactTable<T>>["getVisibleLeafColumns"];
        useFixedLayout: boolean;
        tableStyle: CSSProperties;
        isExporting: boolean;
        exportPhase: ExportPhase | null;
        exportProgress: ExportProgressPayload;
        isSomeRowsSelected: boolean;
        selectedRowCount: number;
    };
    state: EngineUIState;
    actions: {
        fetchData: (overrides?: Partial<TableState>, options?: { delay?: number; meta?: DataFetchMeta }) => Promise<any>;
        handleSortingChange: (updaterOrValue: any) => void;
        handlePaginationChange: (updater: any) => void;
        handleGlobalFilterChange: (updaterOrValue: any) => void;
        handleColumnFilterChangeHandler: (updater: any, isApply?: boolean) => void;
        handleColumnOrderChange: (updatedColumnOrder: Updater<ColumnOrderState>) => void;
        handleColumnPinningChange: (updater: Updater<ColumnPinningState>) => void;
        handleColumnVisibilityChange: (updater: any) => void;
        handleColumnSizingChange: (updater: any) => void;
        handleColumnReorder: (draggedColumnId: string, targetColumnId: string) => void;
        resetAllAndReload: () => void;
        triggerRefresh: (options?: boolean | DataRefreshOptions, fallbackReason?: string) => Promise<void>;
        setTableSize: (size: DataTableSize) => void;
        handleCancelExport: () => void;
        renderRowModel: { rowVirtualizer: ReturnType<typeof useVirtualizer> };
    };
    api: DataTableApi<T>;
    providerProps: {
        table: ReturnType<typeof useReactTable<T>>;
        apiRef: RefObject<DataTableApi<T> | null>;
        dataMode: "client" | "server";
        tableSize: DataTableSize;
        onTableSizeChange: (size: DataTableSize) => void;
        columnFilter: ColumnFilterState;
        onChangeColumnFilter: (filter: ColumnFilterState) => void;
        slots: Record<string, any>;
        slotProps: Record<string, any>;
        isExporting: boolean;
        exportController: AbortController | null;
        exportPhase: ExportPhase | null;
        exportProgress: ExportProgressPayload;
        onCancelExport: () => void;
        exportFilename: string;
        onExportProgress?: (progress: ExportProgressPayload) => void;
        onExportComplete?: (result: { success: boolean; filename: string; totalRows: number }) => void;
        onExportError?: (error: { message: string; code: string }) => void;
        onServerExport?: (filters?: Partial<any>, selection?: SelectionState, signal?: AbortSignal) => Promise<any>;
    };
}

export function useDataTableEngine<T extends Record<string, any>>(
    props: DataTableProps<T>
): EngineResult<T> {
    const {
        initialState,
        columns,
        data = [],
        totalRow = 0,
        idKey = "id" as keyof T,

        dataMode = "client",
        initialLoadData = true,
        onFetchData,
        onFetchStateChange,
        onDataStateChange,

        enableRowSelection = false,
        enableMultiRowSelection = true,
        selectMode = "page",
        isRowSelectable,
        onSelectionChange,
        enableBulkActions = false,

        enableColumnResizing = false,
        columnResizeMode = "onChange",
        onColumnSizingChange,

        enableColumnDragging = false,
        onColumnDragEnd,

        enableColumnPinning = false,
        onColumnPinningChange,

        onColumnVisibilityChange,
        enableColumnVisibility = true,

        enableExpanding = false,
        getRowCanExpand,

        enablePagination = false,
        paginationMode = "client",

        enableGlobalFilter = true,

        enableColumnFilter = false,
        filterMode = "client",

        enableSorting = true,
        sortingMode = "client",
        onSortingChange,

        exportFilename = "export",
        exportConcurrency = "cancelAndRestart",
        exportChunkSize = 1000,
        exportStrictTotalCheck = false,
        exportSanitizeCSV = true,
        onExportProgress,
        onExportComplete,
        onExportError,
        onServerExport,
        onExportCancel,
        onExportStateChange,

        fitToScreen = true,
        tableSize: initialTableSize = "medium",
        enableVirtualization = false,
        estimateRowHeight = 52,

        loading = false,

        onColumnFiltersChange,
        onPaginationChange,
        onGlobalFilterChange,

        slots = {},
        slotProps = {},
    } = props;

    const theme = useTheme();

    const isServerMode = dataMode === "server";
    const isServerPagination = paginationMode === "server" || isServerMode;
    const isServerFiltering = filterMode === "server" || isServerMode;
    const isServerSorting = sortingMode === "server" || isServerMode;

    // --- initial config (memo)
    const initialStateConfig = useMemo(() => {
        const config = { ...DEFAULT_INITIAL_STATE, ...initialState };
        return config;
    }, [initialState]);

    const initialUIState: EngineUIState = useMemo(
        () => ({
            sorting: initialStateConfig.sorting ?? DEFAULT_INITIAL_STATE.sorting,
            pagination: initialStateConfig.pagination ?? DEFAULT_INITIAL_STATE.pagination,
            globalFilter: initialStateConfig.globalFilter ?? DEFAULT_INITIAL_STATE.globalFilter,
            selectionState: initialStateConfig.selectionState ?? DEFAULT_INITIAL_STATE.selectionState,
            columnFilter: initialStateConfig.columnFilter ?? DEFAULT_INITIAL_STATE.columnFilter,
            expanded: initialStateConfig.expanded ?? {},
            tableSize: (initialTableSize || "medium") as DataTableSize,
            columnOrder: initialStateConfig.columnOrder ?? DEFAULT_INITIAL_STATE.columnOrder,
            columnPinning: initialStateConfig.columnPinning ?? DEFAULT_INITIAL_STATE.columnPinning,
            columnVisibility: initialStateConfig.columnVisibility ?? DEFAULT_INITIAL_STATE.columnVisibility,
            columnSizing: initialStateConfig.columnSizing ?? DEFAULT_INITIAL_STATE.columnSizing,
        }),
        [initialStateConfig, initialTableSize]
    );

    // --- UI state (reducer)
    const [ui, dispatch] = useReducer(uiReducer, initialUIState);

    // --- server data state (UI-affecting)
    const [serverData, setServerData] = useState<T[] | null>(null);
    const [serverTotal, setServerTotal] = useState<number>(0);

    // --- export UI state
    const [exportPhase, setExportPhase] = useState<ExportPhase | null>(null);
    const [exportProgress, setExportProgress] = useState<ExportProgressPayload>({});
    const [exportController, setExportController] = useState<AbortController | null>(null);
    const [queuedExportCount, setQueuedExportCount] = useState(0);

    // --- refs (no-render control)
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const apiRef = useRef<DataTableApi<T> | null>(null);
    const exportControllerRef = useRef<AbortController | null>(null);
    const exportQueueRef = useRef<Promise<void>>(Promise.resolve());
    const lastSentRef = useRef<string>("");

    // --- latest refs (prevent stale closures in stable API)
    const uiRef = useLatestRef(ui);
    const dataRef = useLatestRef(data);;
    const serverDataRef = useLatestRef(serverData);
    const nextFetchDelayRef = useRef<number>(0);

    // callbacks refs (super important)
    const onFetchDataRef = useLatestRef(onFetchData);
    const onFetchStateChangeRef = useLatestRef(onFetchStateChange);
    const onDataStateChangeRef = useLatestRef(onDataStateChange);

    const onSortingChangeRef = useLatestRef(onSortingChange);
    const onPaginationChangeRef = useLatestRef(onPaginationChange);
    const onGlobalFilterChangeRef = useLatestRef(onGlobalFilterChange);
    const onColumnFiltersChangeRef = useLatestRef(onColumnFiltersChange);

    const onColumnDragEndRef = useLatestRef(onColumnDragEnd);
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


    // --- debounced fetch helper (can stay as-is)
    const fetchHandler = useEvent((filters: any, opts: any) => onFetchDataRef.current?.(filters, opts));
    const { debouncedFetch, isLoading: fetchLoading } = useDebouncedFetch(fetchHandler);

    const tableData = useMemo(() => {
        return serverData !== null ? serverData : data;
    }, [serverData, data]);

    const tableTotalRow = useMemo(() => {
        return serverData !== null ? serverTotal : totalRow || data.length;
    }, [serverData, serverTotal, totalRow, data]);

    const tableLoading = useMemo(() => {
        return onFetchData ? loading || fetchLoading : loading;
    }, [onFetchData, loading, fetchLoading]);


    // --- columns enhancement
    const enhancedColumns = useMemo(() => {
        let cols = [...columns];
        if (enableExpanding) {
            cols = [
                createExpandingColumn<T>({
                    ...(slotProps?.expandColumn && typeof slotProps.expandColumn === "object"
                        ? slotProps.expandColumn
                        : {}),
                }),
                ...cols,
            ];
        }
        if (enableRowSelection) {
            cols = [
                createSelectionColumn<T>({
                    ...(slotProps?.selectionColumn && typeof slotProps.selectionColumn === "object"
                        ? slotProps.selectionColumn
                        : {}),
                    multiSelect: enableMultiRowSelection,
                }),
                ...cols,
            ];
        }
        return withIdsDeep(cols);
    }, [
        columns,
        enableExpanding,
        enableRowSelection,
        enableMultiRowSelection,
        slotProps?.expandColumn,
        slotProps?.selectionColumn,
    ]);

    // --- fetchData: useEvent so it's stable but reads latest state refs
    const fetchData = useEvent(async (overrides: Partial<TableState> = {}, options?: { delay?: number; meta?: DataFetchMeta }) => {
        const s = uiRef.current;

        const filters: Partial<TableFiltersForFetch> = {
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
    });

    // --- derived selection counts
    const isSomeRowsSelected = useMemo(() => {
        if (!enableBulkActions || !enableRowSelection) return false;
        if (ui.selectionState.type === "exclude") return ui.selectionState.ids.length < tableTotalRow;
        return ui.selectionState.ids.length > 0;
    }, [enableBulkActions, enableRowSelection, ui.selectionState, tableTotalRow]);

    const selectedRowCount = useMemo(() => {
        if (!enableBulkActions || !enableRowSelection) return 0;
        if (ui.selectionState.type === "exclude") return tableTotalRow - ui.selectionState.ids.length;
        return ui.selectionState.ids.length;
    }, [enableBulkActions, enableRowSelection, ui.selectionState, tableTotalRow]);



    // --- TanStack Table
    const table = useReactTable({
        _features: [ColumnFilterFeature, SelectionFeature],
        data: tableData,
        columns: enhancedColumns,
        initialState: initialStateConfig,
        state: {
            ...(enableSorting ? { sorting: ui.sorting } : {}),
            ...(enablePagination ? { pagination: ui.pagination } : {}),
            ...(enableGlobalFilter ? { globalFilter: ui.globalFilter } : {}),
            ...(enableExpanding ? { expanded: ui.expanded } : {}),
            ...(enableColumnDragging ? { columnOrder: ui.columnOrder } : {}),
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
                        type: "SET_SELECTION",
                        payload:
                            typeof updaterOrValue === "function"
                                ? updaterOrValue(uiRef.current.selectionState)
                                : updaterOrValue,
                    });
                },
            }
            : {}),

        enableAdvanceColumnFilter: enableColumnFilter,
        onColumnFilterChange: (updater: any) => {
            const next = typeof updater === "function" ? updater(uiRef.current.columnFilter) : updater;
            dispatch({ type: "SET_COLUMN_FILTER", payload: next });
        },
        onColumnFilterApply: (state: ColumnFilterState) => {
            dispatch({ type: "SET_COLUMN_FILTER_RESET_PAGE", payload: state });
        },

        ...(enableSorting
            ? {
                onSortingChange: (updaterOrValue: any) => {
                    const prev = uiRef.current.sorting;
                    const next = typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue;
                    const cleaned = (next || []).filter((s: any) => s?.id);
                    onSortingChangeRef.current?.(cleaned);
                    dispatch({ type: "SET_SORTING_RESET_PAGE", payload: cleaned });
                },
            }
            : {}),

        ...(enablePagination
            ? {
                onPaginationChange: (updater: any) => {
                    const prev = uiRef.current.pagination;
                    const next = typeof updater === "function" ? updater(prev) : updater;
                    onPaginationChangeRef.current?.(next);
                    dispatch({ type: "SET_PAGINATION", payload: next });
                },
            }
            : {}),

        ...(enableGlobalFilter
            ? {
                onGlobalFilterChange: (updaterOrValue: any) => {
                    const prev = uiRef.current.globalFilter;
                    const next = typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue;
                    onGlobalFilterChangeRef.current?.(next);
                    nextFetchDelayRef.current = 400;
                    dispatch({ type: "SET_GLOBAL_FILTER_RESET_PAGE", payload: next });
                },
            }
            : {}),

        ...(enableExpanding ? { onExpandedChange: (u: any) => dispatch({ type: "SET_EXPANDED", payload: typeof u === "function" ? u(uiRef.current.expanded) : u }) } : {}),
        ...(enableColumnDragging ? { onColumnOrderChange: (u: any) => dispatch({ type: "SET_COLUMN_ORDER", payload: typeof u === "function" ? u(uiRef.current.columnOrder) : u }) } : {}),
        ...(enableColumnPinning ? { onColumnPinningChange: (u: any) => dispatch({ type: "SET_COLUMN_PINNING", payload: typeof u === "function" ? u(uiRef.current.columnPinning) : u }) } : {}),
        ...(enableColumnVisibility ? { onColumnVisibilityChange: (u: any) => dispatch({ type: "SET_COLUMN_VISIBILITY", payload: typeof u === "function" ? u(uiRef.current.columnVisibility) : u }) } : {}),
        ...(enableColumnResizing ? { onColumnSizingChange: (u: any) => dispatch({ type: "SET_COLUMN_SIZING", payload: typeof u === "function" ? u(uiRef.current.columnSizing) : u }) } : {}),

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

        rowCount: enablePagination ? (tableTotalRow ?? tableData.length) : tableData.length,
        getRowId: (row: any, index: number) => generateRowId(row, index, idKey),
    });

    // --- layout sizing
    const allLeafColumns = table.getAllLeafColumns();
    const hasExplicitSizing = allLeafColumns.some((col) => {
        const { size, minSize, maxSize } = col.columnDef;
        return size !== undefined || minSize !== undefined || maxSize !== undefined;
    });
    const useFixedLayout = fitToScreen || enableColumnResizing || hasExplicitSizing;
    const tableTotalSize = table.getTotalSize();
    const tableWidth = fitToScreen ? "100%" : useFixedLayout ? tableTotalSize : "100%";

    const tableStyle: CSSProperties = {
        width: tableWidth,
        minWidth: fitToScreen ? tableTotalSize : undefined,
        tableLayout: useFixedLayout ? "fixed" : "auto",
    };

    // --- virtualization
    const rows = table.getRowModel().rows;
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => estimateRowHeight,
        overscan: 10,
        enabled: enableVirtualization && !enablePagination && rows.length > 0,
    });


    const serverKey = useMemo(() => {
        if (!(isServerMode || isServerPagination || isServerFiltering || isServerSorting)) return null;

        return JSON.stringify({
            sorting: ui.sorting,
            pagination: ui.pagination,
            globalFilter: ui.globalFilter,
            columnFilter: { filters: ui.columnFilter.filters, logic: ui.columnFilter.logic }, // only applied
        });
    }, [isServerMode, isServerPagination, isServerFiltering, isServerSorting, ui.sorting, ui.pagination, ui.globalFilter, ui.columnFilter]);
    const serverKeyRef = useLatestRef(serverKey);
    const lastServerKeyRef = useRef<string | null>(null);

    // --- initial fetch
    useEffect(() => {
        if (!initialLoadData) return;
        // If we're in server mode, mark current serverKey as already handled
        // so the serverKey effect doesn't immediately fetch again.
        if (serverKeyRef.current) {
            lastServerKeyRef.current = serverKeyRef.current;
        }
        if (onFetchData || onFetchStateChange) {
            void fetchData({}, { delay: 0, meta: { reason: "initial" } });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!serverKey) return;
        if (serverKey === lastServerKeyRef.current) return;
        lastServerKeyRef.current = serverKey;

        const delay = nextFetchDelayRef.current ?? 0;
        nextFetchDelayRef.current = 0; // reset after using

        void fetchData({}, { delay, meta: { reason: "stateChange" } });
    }, [serverKey, fetchData]);

    // columnFilter apply handler stays explicit (button), but you can also auto-fetch on change if needed
    const handleColumnFilterChangeHandler = useCallback(
        (updater: any, isApply = false) => {
            const prev = uiRef.current.columnFilter;
            const next = typeof updater === "function" ? updater(prev) : updater;
            if (isApply) {
                nextFetchDelayRef.current = 0;
                dispatch({ type: "SET_COLUMN_FILTER_RESET_PAGE", payload: next });
            } else {
                dispatch({ type: "SET_COLUMN_FILTER", payload: next });
            }
            onColumnFiltersChangeRef.current?.(next, isApply);
        },
        [onColumnFiltersChangeRef, uiRef]
    );

    // --- emit table state (dedupe)
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
        cb(payload);
    }, [table, ui.sorting, ui.pagination, ui.globalFilter, ui.columnFilter, ui.columnVisibility, ui.columnSizing, ui.columnOrder, ui.columnPinning, onDataStateChangeRef]);

    // --- helpers
    const resetPageToFirst = useCallback(() => {
        return { pageIndex: 0, pageSize: uiRef.current.pagination.pageSize };
    }, [uiRef]);

    const normalizeRefreshOptions = useCallback(
        (options?: boolean | DataRefreshOptions, fallbackReason: string = "refresh") => {
            if (typeof options === "boolean") return { resetPagination: options, force: false, reason: fallbackReason };
            return {
                resetPagination: options?.resetPagination ?? false,
                force: options?.force ?? false,
                reason: options?.reason ?? fallbackReason,
            };
        },
        []
    );

    const triggerRefresh = useCallback(
        async (options?: boolean | DataRefreshOptions, fallbackReason: string = "refresh") => {
            const n = normalizeRefreshOptions(options, fallbackReason);
            const current = uiRef.current.pagination;
            const nextPagination = enablePagination
                ? { pageIndex: n.resetPagination ? 0 : current.pageIndex, pageSize: current.pageSize }
                : undefined;

            if (nextPagination) {
                nextFetchDelayRef.current = 0;
                dispatch({ type: "SET_PAGINATION", payload: nextPagination });
                onPaginationChangeRef.current?.(nextPagination);
            }
            const paginationChanged = !!nextPagination &&
                (nextPagination.pageIndex !== current.pageIndex || nextPagination.pageSize !== current.pageSize);

            if (!paginationChanged) {
                await fetchData({}, { delay: 0, meta: { reason: n.reason, force: n.force } });
            }
        },
        [enablePagination, fetchData, normalizeRefreshOptions, onPaginationChangeRef, uiRef]
    );

    const getResetPayload = useCallback((): Partial<EngineUIState> => {
        const resetSorting = initialStateConfig.sorting || [];
        const resetGlobalFilter = initialStateConfig.globalFilter ?? "";
        const resetColumnFilter = (initialStateConfig.columnFilter ?? DEFAULT_INITIAL_STATE.columnFilter) as ColumnFilterState;

        const resetPagination = enablePagination
            ? (initialStateConfig.pagination || { pageIndex: 0, pageSize: 10 })
            : uiRef.current.pagination;

        return {
            sorting: resetSorting,
            globalFilter: resetGlobalFilter,
            columnFilter: resetColumnFilter,
            ...(enablePagination ? { pagination: resetPagination } : {}),
            selectionState: initialStateConfig.selectionState ?? DEFAULT_INITIAL_STATE.selectionState,
            expanded: {},
            columnVisibility: initialStateConfig.columnVisibility || {},
            columnSizing: initialStateConfig.columnSizing || {},
            columnOrder: initialStateConfig.columnOrder || [],
            columnPinning: initialStateConfig.columnPinning || { left: [], right: [] },
        };
    }, [enablePagination, initialStateConfig]);

    const resetAllAndReload = useCallback(() => {
        const payload = getResetPayload();
        dispatch({ type: "RESET_ALL", payload });
        void fetchData(
            {
                sorting: payload.sorting as any,
                globalFilter: payload.globalFilter as any,
                columnFilter: payload.columnFilter as any,
                ...(enablePagination ? { pagination: payload.pagination as any } : {}),
            },
            { delay: 0, meta: { reason: "reset", force: true } }
        );
    }, [enablePagination, fetchData, getResetPayload]);

    // --- export (refs + small UI state)
    const setExportControllerSafely = useCallback(
        (value: AbortController | null | ((current: AbortController | null) => AbortController | null)) => {
            setExportController((current) => {
                const next = typeof value === "function" ? (value as any)(current) : value;
                exportControllerRef.current = next;
                return next;
            });
        },
        []
    );

    const handleExportProgressInternal = useCallback((p: ExportProgressPayload) => {
        setExportProgress(p || {});
        onExportProgressRef.current?.(p);
    }, []);

    const handleExportStateChangeInternal = useCallback((s: ExportStateChange) => {
        setExportPhase(s.phase);
        if (s.processedRows !== undefined || s.totalRows !== undefined || s.percentage !== undefined) {
            setExportProgress({
                processedRows: s.processedRows,
                totalRows: s.totalRows,
                percentage: s.percentage,
            });
        }
        onExportStateChangeRef.current?.(s);
    }, []);

    const runExportWithPolicy = useCallback(
        async (options: { format: "csv" | "excel"; filename: string; mode: "client" | "server"; execute: (controller: AbortController) => Promise<void> }) => {
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

            if (exportConcurrency === "queue") {
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
                if (exportConcurrency === "ignoreIfRunning") {
                    handleExportStateChangeInternal({
                        phase: "error",
                        mode,
                        format,
                        filename,
                        message: "An export is already running",
                        code: "EXPORT_IN_PROGRESS",
                        endedAt: Date.now(),
                    } as any);
                    onExportErrorRef.current?.({ message: "An export is already running", code: "EXPORT_IN_PROGRESS" });
                    return;
                }
                if (exportConcurrency === "cancelAndRestart") active.abort();
            }

            await startExecution();
        },
        [exportConcurrency, handleExportStateChangeInternal, onExportErrorRef, setExportControllerSafely]
    );

    const handleCancelExport = useCallback(() => {
        const active = exportControllerRef.current;
        if (!active) return;
        active.abort();
        setExportControllerSafely((cur) => (cur === active ? null : cur));
        onExportCancelRef.current?.();
    }, [onExportCancelRef, setExportControllerSafely]);

    const isExporting = exportController !== null;

    // --- stable API (created once)
    if (!apiRef.current) {
        apiRef.current = {} as DataTableApi<T>;

        // IMPORTANT: do NOT capture `table/ui/data` here. Always read from refs inside methods.
        (apiRef.current as any).table = { getTable: () => table }; // will be updated below via tableRef
        // We'll overwrite getTable below with a ref-backed function.
    }

    // table ref so API always returns latest table instance
    const tableRef = useLatestRef(table);


    useEffect(() => {
        const api = apiRef.current!;
        api.table = { getTable: () => tableRef.current } as any;

        // --- state getters
        api.state = {
            getTableState: () => tableRef.current.getState(),
            getCurrentFilters: () => tableRef.current.getState().columnFilter,
            getCurrentSorting: () => tableRef.current.getState().sorting,
            getCurrentPagination: () => tableRef.current.getState().pagination,
            getCurrentSelection: () => uiRef.current.selectionState,
            getGlobalFilter: () => tableRef.current.getState().globalFilter,
        };

        // --- data
        api.data = {
            refresh: (options?: boolean | DataRefreshOptions) => void triggerRefresh(options, "refresh"),
            reload: (options: DataRefreshOptions = {}) => void triggerRefresh({ ...options, reason: options.reason ?? "reload" }, "reload"),
            resetAll: () => resetAllAndReload(),

            getAllData: () => {
                const sData = serverDataRef.current;
                const base = sData !== null ? sData : dataRef.current;
                return [...base];
            },
            getDataCount: () => {
                const sData = serverDataRef.current;
                const base = sData !== null ? sData : dataRef.current;
                return base.length;
            },
            getFilteredDataCount: () => tableRef.current.getFilteredRowModel().rows.length,
        } as any;

        // --- sorting/pagination/filtering - dispatch + callbacks + server fetch policies
        api.sorting = {
            setSorting: (next: SortingState) => {
                const cleaned = (next || []).filter((s: any) => s?.id);
                onSortingChangeRef.current?.(cleaned);
                nextFetchDelayRef.current = 0;
                dispatch({ type: "SET_SORTING_RESET_PAGE", payload: cleaned });
            },
            clearSorting: () => {
                onSortingChangeRef.current?.([]);
                nextFetchDelayRef.current = 0;
                dispatch({ type: "SET_SORTING_RESET_PAGE", payload: [] });
            },
            resetSorting: () => {
                const next = (initialStateConfig.sorting || []) as SortingState;
                onSortingChangeRef.current?.(next);
                nextFetchDelayRef.current = 0;
                dispatch({ type: "SET_SORTING_RESET_PAGE", payload: next });
            },
        } as any;

        api.pagination = {
            goToPage: (pageIndex: number) => {
                const prev = uiRef.current.pagination;
                const next = { ...prev, pageIndex };
                onPaginationChangeRef.current?.(next);
                nextFetchDelayRef.current = 0;
                dispatch({ type: "SET_PAGINATION", payload: next });
            },
            setPageSize: (pageSize: number) => {
                const next = { pageIndex: 0, pageSize };
                onPaginationChangeRef.current?.(next);
                nextFetchDelayRef.current = 0;
                dispatch({ type: "SET_PAGINATION", payload: next });
            },
            resetPagination: () => {
                const next = (initialStateConfig.pagination || { pageIndex: 0, pageSize: 10 }) as any;
                onPaginationChangeRef.current?.(next);
                nextFetchDelayRef.current = 0;
                dispatch({ type: "SET_PAGINATION", payload: next });
            },
        } as any;

        api.filtering = {
            setGlobalFilter: (filter: string) => {
                onGlobalFilterChangeRef.current?.(filter);
                nextFetchDelayRef.current = 400;
                dispatch({ type: "SET_GLOBAL_FILTER_RESET_PAGE", payload: filter });
            },
            clearGlobalFilter: () => {
                onGlobalFilterChangeRef.current?.("");
                nextFetchDelayRef.current = 400;
                dispatch({ type: "SET_GLOBAL_FILTER_RESET_PAGE", payload: "" });
            },
            setColumnFilters: (filters: ColumnFilterState, isApply = false) => handleColumnFilterChangeHandler(filters, isApply),
        } as any;

        api.columnVisibility = {
            showColumn: (id: string) => dispatch({ type: "SET_COLUMN_VISIBILITY", payload: { ...uiRef.current.columnVisibility, [id]: true } }),
            hideColumn: (id: string) => dispatch({ type: "SET_COLUMN_VISIBILITY", payload: { ...uiRef.current.columnVisibility, [id]: false } }),
            resetColumnVisibility: () => dispatch({ type: "SET_COLUMN_VISIBILITY", payload: initialStateConfig.columnVisibility || {} }),
        } as any;

        api.columnOrdering = {
            setColumnOrder: (next: ColumnOrderState) => {
                dispatch({ type: "SET_COLUMN_ORDER", payload: next });
                onColumnDragEndRef.current?.(next);
            },
            resetColumnOrder: () => dispatch({ type: "SET_COLUMN_ORDER", payload: initialStateConfig.columnOrder || [] }),
        } as any;

        api.columnPinning = {
            setPinning: (next: ColumnPinningState) => {
                dispatch({ type: "SET_COLUMN_PINNING", payload: next });
                onColumnPinningChangeRef.current?.(next);
            },
            resetColumnPinning: () => dispatch({ type: "SET_COLUMN_PINNING", payload: initialStateConfig.columnPinning || { left: [], right: [] } }),
        } as any;

        api.columnResizing = {
            resetColumnSizing: () => dispatch({ type: "SET_COLUMN_SIZING", payload: initialStateConfig.columnSizing || {} }),
        } as any;

        api.selection = {
            getSelectionState: () => tableRef.current.getSelectionState?.() || ({ ids: [], type: "include" } as const),
            getSelectedRows: () => tableRef.current.getSelectedRows(),
            getSelectedCount: () => tableRef.current.getSelectedCount(),
            isRowSelected: (rowId: string) => tableRef.current.getIsRowSelected(rowId) || false,
            // keep using your table extension methods if you have them:
            selectAll: () => tableRef.current.selectAll?.(),
            deselectAll: () => tableRef.current.deselectAll?.(),
        } as any;

        // --- export API (use your existing exportClientData/exportServerData)
        api.export = {
            exportCSV: async (options: DataTableExportApiOptions = {}) => {
                const fn = options.filename ?? exportFilename;
                const chunkSize = options.chunkSize ?? exportChunkSize;
                const strictTotalCheck = options.strictTotalCheck ?? exportStrictTotalCheck;
                const sanitizeCSV = options.sanitizeCSV ?? exportSanitizeCSV;

                const mode: "client" | "server" = dataMode === "server" && !!onServerExportRef.current ? "server" : "client";

                await runExportWithPolicy({
                    format: "csv",
                    filename: fn,
                    mode,
                    execute: async (controller) => {
                        // TODO: keep your state-change event mapping (starting/progress/completed/cancel/error)
                        if (mode === "server" && onServerExportRef.current) {
                            await exportServerData(tableRef.current, {
                                format: "csv",
                                filename: fn,
                                fetchData: (filters: any, selection: any, signal?: AbortSignal) =>
                                    onServerExportRef.current?.(filters, selection, signal),
                                currentFilters: {
                                    globalFilter: tableRef.current.getState().globalFilter,
                                    columnFilter: tableRef.current.getState().columnFilter,
                                    sorting: tableRef.current.getState().sorting,
                                    pagination: tableRef.current.getState().pagination,
                                },
                                selection: tableRef.current.getSelectionState?.(),
                                onProgress: handleExportProgressInternal,
                                onComplete: onExportCompleteRef.current,
                                onError: onExportErrorRef.current,
                                onStateChange: (s: any) => handleExportStateChangeInternal({ ...s, mode, format: "csv", filename: fn, queueLength: queuedExportCount } as any),
                                signal: controller.signal,
                                chunkSize,
                                strictTotalCheck,
                                sanitizeCSV,
                            });
                            return;
                        }

                        await exportClientData(tableRef.current, {
                            format: "csv",
                            filename: fn,
                            onProgress: handleExportProgressInternal,
                            onComplete: onExportCompleteRef.current,
                            onError: onExportErrorRef.current,
                            onStateChange: (s: any) => handleExportStateChangeInternal({ ...s, mode, format: "csv", filename: fn, queueLength: queuedExportCount } as any),
                            signal: controller.signal,
                            sanitizeCSV,
                        });
                    },
                });
            },

            exportExcel: async (options: DataTableExportApiOptions = {}) => {
                const fn = options.filename ?? exportFilename;
                const chunkSize = options.chunkSize ?? exportChunkSize;
                const strictTotalCheck = options.strictTotalCheck ?? exportStrictTotalCheck;
                const sanitizeCSV = options.sanitizeCSV ?? exportSanitizeCSV;

                const mode: "client" | "server" = dataMode === "server" && !!onServerExportRef.current ? "server" : "client";

                await runExportWithPolicy({
                    format: "excel",
                    filename: fn,
                    mode,
                    execute: async (controller) => {
                        // TODO: keep your state-change event mapping (starting/progress/completed/cancel/error)
                        if (mode === "server" && onServerExportRef.current) {
                            await exportServerData(tableRef.current, {
                                format: "excel",
                                filename: fn,
                                fetchData: (filters: any, selection: any, signal?: AbortSignal) =>
                                    onServerExportRef.current?.(filters, selection, signal),
                                currentFilters: {
                                    globalFilter: tableRef.current.getState().globalFilter,
                                    columnFilter: tableRef.current.getState().columnFilter,
                                    sorting: tableRef.current.getState().sorting,
                                    pagination: tableRef.current.getState().pagination,
                                },
                                selection: tableRef.current.getSelectionState?.(),
                                onProgress: handleExportProgressInternal,
                                onComplete: onExportCompleteRef.current,
                                onError: onExportErrorRef.current,
                                onStateChange: (s: any) => handleExportStateChangeInternal({ ...s, mode, format: "csv", filename: fn, queueLength: queuedExportCount } as any),
                                signal: controller.signal,
                                chunkSize,
                                strictTotalCheck,
                                sanitizeCSV,
                            });
                            return;
                        }

                        await exportClientData(tableRef.current, {
                            format: "excel",
                            filename: fn,
                            onProgress: handleExportProgressInternal,
                            onComplete: onExportCompleteRef.current,
                            onError: onExportErrorRef.current,
                            onStateChange: (s: any) => handleExportStateChangeInternal({ ...s, mode, format: "csv", filename: fn, queueLength: queuedExportCount } as any),
                            signal: controller.signal,
                            sanitizeCSV,
                        });
                    },
                });
            },

            isExporting: () => exportControllerRef.current != null,
            cancelExport: () => handleCancelExport(),
        } as any;
    }, [dataMode, exportChunkSize, exportFilename, exportSanitizeCSV, exportStrictTotalCheck, fetchData, handleCancelExport, handleColumnFilterChangeHandler, handleExportProgressInternal, handleExportStateChangeInternal, initialStateConfig, isServerMode, isServerPagination, isServerSorting, resetAllAndReload, resetPageToFirst, runExportWithPolicy, triggerRefresh, queuedExportCount, tableRef, uiRef, serverDataRef, dataRef, onSortingChangeRef, onPaginationChangeRef, onGlobalFilterChangeRef, onColumnDragEndRef, onColumnPinningChangeRef, onServerExportRef, onExportCompleteRef, onExportErrorRef]);

    // --- imperative handlers (used by TanStack callbacks above or view)
    const handleSortingChange = useCallback(
        (updaterOrValue: Updater<SortingState>) => {
            const prev = uiRef.current.sorting;
            const next = typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue;
            const cleaned = (next || []).filter((s: any) => s?.id);
            onSortingChangeRef.current?.(cleaned);
            nextFetchDelayRef.current = 0;
            dispatch({ type: "SET_SORTING_RESET_PAGE", payload: cleaned });
        },
        [onSortingChangeRef, uiRef]
    );

    const handlePaginationChange = useCallback(
        (updater: Updater<PaginationState>) => {
            const prev = uiRef.current.pagination;
            const next = typeof updater === "function" ? updater(prev) : updater;
            onPaginationChangeRef.current?.(next);
            nextFetchDelayRef.current = 0;
            dispatch({ type: "SET_PAGINATION", payload: next });
        },
        [onPaginationChangeRef, uiRef]
    );

    const handleGlobalFilterChange = useCallback(
        (updaterOrValue: Updater<string>) => {
            const prev = uiRef.current.globalFilter;
            const next = typeof updaterOrValue === "function" ? updaterOrValue(prev) : updaterOrValue;
            onGlobalFilterChangeRef.current?.(next);
            nextFetchDelayRef.current = 400;
            dispatch({ type: "SET_GLOBAL_FILTER_RESET_PAGE", payload: next });
        },
        [onGlobalFilterChangeRef, uiRef]
    );

    const handleColumnOrderChange = useCallback(
        (updated: Updater<ColumnOrderState>) => {
            const prev = uiRef.current.columnOrder;
            const next = typeof updated === "function" ? updated(prev) : updated;
            dispatch({ type: "SET_COLUMN_ORDER", payload: next });
            onColumnDragEndRef.current?.(next);
        },
        [onColumnDragEndRef, uiRef]
    );

    const handleColumnPinningChange = useCallback(
        (updated: Updater<ColumnPinningState>) => {
            const prev = uiRef.current.columnPinning;
            const next = typeof updated === "function" ? updated(prev) : updated;
            dispatch({ type: "SET_COLUMN_PINNING", payload: next });
            onColumnPinningChangeRef.current?.(next);
        },
        [onColumnPinningChangeRef, uiRef]
    );

    const handleColumnVisibilityChange = useCallback(
        (updated: any) => {
            const prev = uiRef.current.columnVisibility;
            const next = typeof updated === "function" ? updated(prev) : updated;
            dispatch({ type: "SET_COLUMN_VISIBILITY", payload: next });
            onColumnVisibilityChangeRef.current?.(next);
        },
        [onColumnVisibilityChangeRef, uiRef]
    );

    const handleColumnSizingChange = useCallback(
        (updated: any) => {
            const prev = uiRef.current.columnSizing;
            const next = typeof updated === "function" ? updated(prev) : updated;
            dispatch({ type: "SET_COLUMN_SIZING", payload: next });
            onColumnSizingChangeRef.current?.(next);
        },
        [onColumnSizingChangeRef, uiRef]
    );

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

            handleColumnOrderChange(next);
        },
        [enhancedColumns, handleColumnOrderChange, uiRef]
    );

    // optional: selection callback
    useEffect(() => {
        onSelectionChangeRef.current?.(ui.selectionState);
    }, [onSelectionChangeRef, ui.selectionState]);



    // --- provider props
    const providerProps = useMemo(
        () => ({
            table,
            apiRef,
            dataMode,
            tableSize: ui.tableSize,
            onTableSizeChange: (size: DataTableSize) => dispatch({ type: "SET_TABLE_SIZE", payload: size }),
            columnFilter: ui.columnFilter,
            onChangeColumnFilter: (f: ColumnFilterState) => handleColumnFilterChangeHandler(f, false),
            slots,
            slotProps,
            isExporting,
            exportController,
            exportPhase,
            exportProgress,
            onCancelExport: handleCancelExport,
            exportFilename,
            onExportProgress,
            onExportComplete,
            onExportError,
            onServerExport,
        }),
        [
            table,
            dataMode,
            ui.tableSize,
            ui.columnFilter,
            slots,
            slotProps,
            isExporting,
            exportController,
            exportPhase,
            exportProgress,
            handleCancelExport,
            exportFilename,
            onExportProgress,
            onExportComplete,
            onExportError,
            onServerExport,
            handleColumnFilterChangeHandler,
        ]
    );


    return {
        table,
        refs: {
            tableContainerRef,
            apiRef,
            exportControllerRef,
        },
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
            useFixedLayout,
            tableStyle,
            isExporting,
            exportPhase,
            exportProgress,
            isSomeRowsSelected,
            selectedRowCount,
        },
        state: ui,
        actions: {
            fetchData,
            handleSortingChange,
            handlePaginationChange,
            handleGlobalFilterChange,
            handleColumnFilterChangeHandler,
            handleColumnOrderChange,
            handleColumnPinningChange,
            handleColumnVisibilityChange,
            handleColumnSizingChange,
            handleColumnReorder,
            resetAllAndReload,
            triggerRefresh,
            setTableSize: (size: DataTableSize) => dispatch({ type: "SET_TABLE_SIZE", payload: size }),
            handleCancelExport,
            renderRowModel: { rowVirtualizer },
        },
        api: apiRef.current!,
        providerProps,
    };
}
