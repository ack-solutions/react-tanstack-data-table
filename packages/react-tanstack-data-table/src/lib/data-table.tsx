/**
 * Main DataTable Component
 *
 * A comprehensive, highly customizable data table component built with:
 * - Material-UI (MUI) for styling
 * - TanStack Table for table logic
 * - TypeScript for type safety
 */
import {
    Table,
    TableContainer,
    TableBody,
    Box,
    Paper,
    useTheme,
} from '@mui/material';
import {
    getCoreRowModel,
    useReactTable,
    SortingState,
    getSortedRowModel,
    ColumnOrderState,
    ColumnPinningState,
    getPaginationRowModel,
    Updater,
} from '@tanstack/react-table';

// Import custom features
import { ColumnFilterFeature, getCombinedFilteredRowModel } from './features/column-filter.feature';
import { SelectionFeature, SelectionState } from './features';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useState, useCallback, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';


// Import from new organized structure
import { DataTableProvider } from './contexts/data-table-context';
import { DataTableSize, exportClientData, exportServerData, generateRowId, createLogger, withIdsDeep } from './utils';
import { useDebouncedFetch } from './utils/debounced-fetch.utils';
import { getSlotComponentWithProps, mergeSlotProps } from './utils/slot-helpers';
import { TableHeader } from './components/headers';
import { DataTablePagination } from './components/pagination';
import { DataTableRow, LoadingRows, EmptyDataRow } from './components/rows';
import { DataTableToolbar, BulkActionsToolbar } from './components/toolbar';
import {
    DataFetchMeta,
    DataMutationAction,
    DataMutationContext,
    DataRefreshContext,
    DataRefreshOptions,
    DataTableProps,
} from './types/data-table.types';
import { ColumnFilterState, TableFiltersForFetch, TableState } from './types';
import { DataTableApi } from './types/data-table-api';
import {
    createExpandingColumn,
    createSelectionColumn,
} from './utils/special-columns.utils';



// Static default initial state - defined outside component
const DEFAULT_INITIAL_STATE = {
    sorting: [],
    pagination: {
        pageIndex: 0,
        pageSize: 10,
    },
    selectionState: { ids: [], type: 'include' } as SelectionState,
    globalFilter: '',
    expanded: {},
    columnOrder: [],
    columnPinning: {
        left: [],
        right: [],
    },
    columnVisibility: {},
    columnSizing: {},
    columnFilter: {
        filters: [],
        logic: 'AND',
        pendingFilters: [],
        pendingLogic: 'AND',
    } as ColumnFilterState,
};

/**
 * Main DataTable component with all features
 */
export const DataTable = forwardRef<DataTableApi<any>, DataTableProps<any>>(function DataTable<T extends Record<string, any>>({
    initialState,
    columns,
    data = [],
    totalRow = 0,
    idKey = 'id' as keyof T,
    extraFilter = null,
    footerFilter = null,

    // Data management mode (MUI DataGrid style)
    dataMode = 'client',
    initialLoadData = true,
    onFetchData,
    onRefreshData,
    onDataChange,
    onDataStateChange,

    // Selection props
    enableRowSelection = false,
    enableMultiRowSelection = true,
    selectMode = 'page',
    isRowSelectable,
    onSelectionChange,

    // Row click props
    onRowClick,
    selectOnRowClick = false,

    // Bulk action props
    enableBulkActions = false,
    bulkActions,

    // Column resizing props
    enableColumnResizing = false,
    columnResizeMode = 'onChange',
    onColumnSizingChange,

    // Column ordering props
    enableColumnDragging = false,
    onColumnDragEnd,

    // Column pinning props
    enableColumnPinning = false,
    onColumnPinningChange,

    // Column visibility props
    onColumnVisibilityChange,
    enableColumnVisibility = true,

    // Expandable rows props
    enableExpanding = false,
    getRowCanExpand,
    renderSubComponent,

    // Pagination props
    enablePagination = false,
    paginationMode = 'client',

    // Filtering props
    enableGlobalFilter = true,
    enableColumnFilter = false,
    filterMode = 'client',

    // Sorting props
    enableSorting = true,
    sortingMode = 'client',
    onSortingChange,
    exportFilename = 'export',
    onExportProgress,
    onExportComplete,
    onExportError,
    onServerExport,
    onExportCancel,

    // Styling props
    enableHover = true,
    enableStripes = false,
    tableProps = {},
    fitToScreen = true,
    tableSize: initialTableSize = 'medium',

    // Sticky header/footer props
    enableStickyHeaderOrFooter = false,
    maxHeight = '400px',

    // Virtualization props
    enableVirtualization = false,
    estimateRowHeight = 52,

    // Toolbar props
    enableTableSizeControl = true,
    enableExport = false,
    enableReset = true,
    enableRefresh = false,

    // Loading and empty states
    loading = false,
    emptyMessage = 'No data available',
    skeletonRows = 5,

    // Column filters props
    onColumnFiltersChange,
    onPaginationChange,
    onGlobalFilterChange,

    // Slots
    slots = {},
    slotProps = {},

    // Logging
    logging,

}: DataTableProps<T>, ref: React.Ref<DataTableApi<T>>) {
    // Convert mode-based props to boolean flags for internal use
    const isServerMode = dataMode === 'server';
    const isServerPagination = paginationMode === 'server' || isServerMode;
    const isServerFiltering = filterMode === 'server' || isServerMode;
    const isServerSorting = sortingMode === 'server' || isServerMode;

    const theme = useTheme();
    const logger = useMemo(() => createLogger('DataTable', logging), [logging]);

    useEffect(() => {
        if (logger.isLevelEnabled('info')) {
            logger.info('mounted', {
                dataMode,
                paginationMode,
                filterMode,
                sortingMode,
            });
        }
        return () => {
            if (logger.isLevelEnabled('info')) {
                logger.info('unmounted');
            }
        };
    }, [logger, dataMode, paginationMode, filterMode, sortingMode]);

    // -------------------------------
    // Memoized values (grouped together)
    // -------------------------------
    const initialStateConfig = useMemo(() => {
        const config = {
            ...DEFAULT_INITIAL_STATE,
            ...initialState,
        };
        if (logger.isLevelEnabled('info')) {
            logger.info('initialStateConfig', { config });
        }
        return config;
    }, [initialState, logger]);


    const initialSelectionState = useMemo(() => {
        return initialStateConfig.selectionState || DEFAULT_INITIAL_STATE.selectionState;
    }, [initialStateConfig.selectionState]);

    // -------------------------------
    // State hooks (grouped together)
    // -------------------------------
    // const [fetchLoading, setFetchLoading] = useState(false);
    const [sorting, setSorting] = useState<SortingState>(initialState?.sorting || DEFAULT_INITIAL_STATE.sorting);
    const [pagination, setPagination] = useState(initialState?.pagination || DEFAULT_INITIAL_STATE.pagination);
    const [globalFilter, setGlobalFilter] = useState(initialState?.globalFilter || DEFAULT_INITIAL_STATE.globalFilter);
    const [selectionState, setSelectionState] = useState<SelectionState>(initialState?.selectionState || DEFAULT_INITIAL_STATE.selectionState);
    const [columnFilter, setColumnFilter] = useState<ColumnFilterState>(initialState?.columnFilter || DEFAULT_INITIAL_STATE.columnFilter);
    const [expanded, setExpanded] = useState({});
    const [tableSize, setTableSize] = useState<DataTableSize>(initialTableSize || 'medium');
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(initialState?.columnOrder || DEFAULT_INITIAL_STATE.columnOrder);
    const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(initialState?.columnPinning || DEFAULT_INITIAL_STATE.columnPinning);
    const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(initialState?.columnVisibility || DEFAULT_INITIAL_STATE.columnVisibility);
    const [columnSizing, setColumnSizing] = useState<Record<string, number>>(initialState?.columnSizing || DEFAULT_INITIAL_STATE.columnSizing);
    const [serverData, setServerData] = useState<T[] | null>(null);
    const [serverTotal, setServerTotal] = useState(0);
    const [exportController, setExportController] = useState<AbortController | null>(null);

    // -------------------------------
    // Ref hooks (grouped together)
    // -------------------------------
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const internalApiRef = useRef<DataTableApi<T>>(null);

    const isExternallyControlledData = useMemo(
        () => !onFetchData && (!!onDataChange || !!onRefreshData),
        [onFetchData, onDataChange, onRefreshData]
    );

    const { debouncedFetch, isLoading: fetchLoading } = useDebouncedFetch(onFetchData);
    const tableData = useMemo(() => {
        if (isExternallyControlledData) return data;
        return serverData !== null ? serverData : data;
    }, [isExternallyControlledData, serverData, data]);
    const tableTotalRow = useMemo(
        () => (isExternallyControlledData ? (totalRow || data.length) : (serverData !== null ? serverTotal : totalRow || data.length)),
        [isExternallyControlledData, serverData, serverTotal, totalRow, data]
    );
    const tableLoading = useMemo(() => onFetchData ? (loading || fetchLoading) : loading, [onFetchData, loading, fetchLoading]);


    const enhancedColumns = useMemo(
        () => {
            let columnsMap = [...columns];
            if (enableExpanding) {
                const expandingColumnMap = createExpandingColumn<T>({
                    ...(slotProps?.expandColumn && typeof slotProps.expandColumn === 'object' ? slotProps.expandColumn : {}),
                });
                columnsMap = [expandingColumnMap, ...columnsMap];
            }
            if (enableRowSelection) {
                const selectionColumnMap = createSelectionColumn<T>({
                    ...(slotProps?.selectionColumn && typeof slotProps.selectionColumn === 'object' ? slotProps.selectionColumn : {}),
                    multiSelect: enableMultiRowSelection,
                });
                columnsMap = [selectionColumnMap, ...columnsMap];
            }
            const enhancedColumns = withIdsDeep(columnsMap);
            if (logger.isLevelEnabled('info')) {
                logger.info('enhancedColumns', { enhancedColumns });
            }
            return enhancedColumns;
        }, [columns, enableExpanding, enableRowSelection, logger, slotProps.expandColumn, slotProps.selectionColumn, enableMultiRowSelection]);


    const isExporting = useMemo(() => exportController !== null, [exportController]);
    const isSomeRowsSelected = useMemo(() => {
        if (!enableBulkActions || !enableRowSelection) return false;
        if (selectionState.type === 'exclude') {
            return selectionState.ids.length < tableTotalRow;
        } else {
            return selectionState.ids.length > 0;
        }
    }, [enableBulkActions, enableRowSelection, selectionState, tableTotalRow]);
    const selectedRowCount = useMemo(() => {
        if (!enableBulkActions || !enableRowSelection) return 0;
        if (selectionState.type === 'exclude') {
            return tableTotalRow - selectionState.ids.length;
        } else {
            return selectionState.ids.length;
        }
    }, [enableBulkActions, enableRowSelection, selectionState, tableTotalRow]);
    // -------------------------------
    // Callback hooks (grouped together)
    // -------------------------------
    const fetchData = useCallback(async (
        overrides: Partial<TableState> = {},
        options?: { delay?: number; meta?: DataFetchMeta }
    ) => {
        if (!onFetchData) {
            if (logger.isLevelEnabled('debug')) {
                logger.debug('onFetchData not provided, skipping fetch', { overrides, columnFilter, sorting, pagination });
            }
            return;
        }

        const filters: Partial<TableFiltersForFetch> = {
            globalFilter,
            pagination,
            columnFilter,
            sorting,
            ...overrides,
        };

        if (logger.isLevelEnabled('info')) {
            logger.info('Requesting data', {
                filters,
                reason: options?.meta?.reason,
                force: options?.meta?.force,
            });
        }

        try {
            const delay = options?.delay ?? 300; // respects 0
            const result = await debouncedFetch(filters, {
                debounceDelay: delay,
                meta: options?.meta,
            });

            if (logger.isLevelEnabled('info')) {
                logger.info('Fetch resolved', {
                    rows: result?.data?.length ?? 0,
                    total: result?.total,
                });
            }

            if (result && Array.isArray(result.data) && result.total !== undefined) {
                setServerData(result.data);
                setServerTotal(result.total);
            } else if (logger.isLevelEnabled('warn')) {
                logger.warn('Fetch handler returned unexpected shape', result);
            }

            return result;
        } catch (error) {
            logger.error('Fetch failed', error);
            throw error;
        }
    }, [
        onFetchData,
        globalFilter,
        pagination,
        columnFilter,
        sorting,
        debouncedFetch,
        logger,
    ]);

    const normalizeRefreshOptions = useCallback((
        options?: boolean | DataRefreshOptions,
        fallbackReason: string = 'refresh'
    ) => {
        if (typeof options === 'boolean') {
            return {
                resetPagination: options,
                force: false,
                reason: fallbackReason,
            };
        }

        return {
            resetPagination: options?.resetPagination ?? false,
            force: options?.force ?? false,
            reason: options?.reason ?? fallbackReason,
        };
    }, []);


    const handleSelectionStateChange = useCallback((updaterOrValue) => {
        setSelectionState((prevState) => {
            const next =
                typeof updaterOrValue === 'function' ? updaterOrValue(prevState) : updaterOrValue;
            onSelectionChange?.(next);
            return next;
        });
    }, [onSelectionChange]);

    const handleColumnFilterStateChange = useCallback((filterState: ColumnFilterState) => {
        if (!filterState || typeof filterState !== 'object') return;

        setColumnFilter(filterState);
        onColumnFiltersChange?.(filterState);
        return filterState;
    }, [onColumnFiltersChange]);


    const resetPageToFirst = useCallback(() => {
        if (logger.isLevelEnabled('info')) {
            logger.info('Resetting to first page due to state change', {
                previousPageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
            });
        }
        const newPagination = { pageIndex: 0, pageSize: pagination.pageSize };
        setPagination(newPagination);
        onPaginationChange?.(newPagination);
        return newPagination;
    }, [pagination, logger, onPaginationChange]);


    const handleSortingChange = useCallback((updaterOrValue: any) => {

        setSorting((prev) => {
            const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
            const cleaned = next.filter((s: any) => s?.id);
            onSortingChange?.(cleaned);
            const nextPagination = resetPageToFirst();
            if (isServerMode || isServerSorting) {
                fetchData({ sorting: cleaned, pagination: nextPagination }, { delay: 0 });
            }
            return cleaned;
        });
    }, [onSortingChange, isServerMode, isServerSorting, resetPageToFirst, fetchData]);

    const handleColumnOrderChange = useCallback((updatedColumnOrder: Updater<ColumnOrderState>) => {
        const newColumnOrder = typeof updatedColumnOrder === 'function'
            ? updatedColumnOrder(columnOrder)
            : updatedColumnOrder;
        setColumnOrder(newColumnOrder);
        if (onColumnDragEnd) {
            onColumnDragEnd(newColumnOrder);
        }
    }, [onColumnDragEnd, columnOrder]);

    const handleColumnPinningChange = useCallback(
        (updater: Updater<ColumnPinningState>) => {
            setColumnPinning((prev) => {
                const next = typeof updater === "function" ? updater(prev) : updater;
                // keep direct callback here (optional)
                onColumnPinningChange?.(next);
                return next;
            });
        },
        [onColumnPinningChange]
    );

    // Column visibility change handler - same pattern as column order
    const handleColumnVisibilityChange = useCallback((updater: any) => {
        setColumnVisibility((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            onColumnVisibilityChange?.(next);
            return next;
        });
    }, [onColumnVisibilityChange]);

    // Column sizing change handler - same pattern as column order
    const handleColumnSizingChange = useCallback((updater: any) => {
        setColumnSizing((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            onColumnSizingChange?.(next);
            return next;
        });
    }, [onColumnSizingChange]);

    const handlePaginationChange = useCallback((updater: any) => {
        setPagination((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            onPaginationChange?.(next);
            if (isServerMode || isServerPagination) {
                fetchData({ pagination: next }, { delay: 0 });
            }
            return next;
        });
    }, [isServerMode, isServerPagination, fetchData, onPaginationChange]);



    const handleGlobalFilterChange = useCallback((updaterOrValue: any) => {
        setGlobalFilter((prev) => {
            const next = typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;

            onGlobalFilterChange?.(next);

            if (isServerMode || isServerFiltering) {
                const nextPagination = { pageIndex: 0, pageSize: pagination.pageSize };
                setPagination(nextPagination);
                fetchData({ globalFilter: next, pagination: nextPagination }, { delay: 0 });
            }

            return next;
        });
    }, [isServerMode, isServerFiltering, onGlobalFilterChange, fetchData, pagination.pageSize]);

    const onColumnFilterChangeHandler = useCallback((updater: any) => {
        const currentState = columnFilter;
        const newState = typeof updater === 'function'
            ? updater(currentState)
            : updater;
        const legacyFilterState = {
            filters: newState.filters,
            logic: newState.logic,
            pendingFilters: newState.pendingFilters,
            pendingLogic: newState.pendingLogic
        };
        handleColumnFilterStateChange(legacyFilterState);
    }, [columnFilter, handleColumnFilterStateChange]);

    const onColumnFilterApplyHandler = useCallback((appliedState: ColumnFilterState) => {
        const pagination = resetPageToFirst();
        if (isServerFiltering) {
            fetchData({
                columnFilter: appliedState,
                pagination,
            });
        }

        onColumnFiltersChange?.(appliedState);
    }, [resetPageToFirst, isServerFiltering, fetchData, onColumnFiltersChange]);

    // -------------------------------
    // Table creation (after callbacks/memo)
    // -------------------------------
    const table = useReactTable({
        _features: [ColumnFilterFeature, SelectionFeature],
        data: tableData,
        columns: enhancedColumns,
        // Use merged initial state so built-in reset helpers align with our controlled state defaults
        initialState: initialStateConfig,
        state: {
            ...(enableSorting ? { sorting } : {}),
            ...(enablePagination ? { pagination } : {}),
            ...(enableGlobalFilter ? { globalFilter } : {}),
            ...(enableExpanding ? { expanded } : {}),
            ...(enableColumnDragging ? { columnOrder } : {}),
            ...(enableColumnPinning ? { columnPinning } : {}),
            ...(enableColumnVisibility ? { columnVisibility } : {}),
            ...(enableColumnResizing ? { columnSizing } : {}),
            ...(enableColumnFilter ? { columnFilter } : {}),
            ...(enableRowSelection ? { selectionState } : {}),
        },
        // Selection options (same pattern as column filter)
        // Add custom features
        selectMode: selectMode,
        enableAdvanceSelection: !!enableRowSelection,
        isRowSelectable: isRowSelectable,
        ...(enableRowSelection ? { onSelectionStateChange: handleSelectionStateChange } : {}),
        // Column filter
        enableAdvanceColumnFilter: enableColumnFilter,
        onColumnFilterChange: onColumnFilterChangeHandler, // Handle column filters change
        onColumnFilterApply: onColumnFilterApplyHandler, // Handle when filters are actually applied


        ...(enableSorting ? { onSortingChange: handleSortingChange } : {}),
        ...(enablePagination ? { onPaginationChange: handlePaginationChange } : {}),
        ...(enableGlobalFilter ? { onGlobalFilterChange: handleGlobalFilterChange } : {}),
        ...(enableExpanding ? { onExpandedChange: setExpanded } : {}),
        ...(enableColumnDragging ? { onColumnOrderChange: handleColumnOrderChange } : {}),
        ...(enableColumnPinning ? { onColumnPinningChange: handleColumnPinningChange } : {}),
        ...(enableColumnVisibility ? { onColumnVisibilityChange: handleColumnVisibilityChange } : {}),
        ...(enableColumnResizing ? { onColumnSizingChange: handleColumnSizingChange } : {}),

        // Row model
        getCoreRowModel: getCoreRowModel(),
        ...(enableSorting ? { getSortedRowModel: getSortedRowModel() } : {}),
        ...(enableColumnFilter || enableGlobalFilter ? { getFilteredRowModel: getCombinedFilteredRowModel<T>() } : {}),
        // Only use getPaginationRowModel for client-side pagination
        ...(enablePagination && !isServerPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
        // Sorting
        enableSorting: enableSorting,
        manualSorting: isServerSorting,
        // Filtering
        manualFiltering: isServerFiltering,
        // Column resizing
        enableColumnResizing: enableColumnResizing,
        columnResizeMode: columnResizeMode,
        columnResizeDirection: theme.direction,
        // Column pinning
        enableColumnPinning: enableColumnPinning,
        // Expanding
        ...(enableExpanding ? { getRowCanExpand: getRowCanExpand } : {}),
        // Pagination
        manualPagination: isServerPagination,
        autoResetPageIndex: false, // Prevent automatic page reset on state changes
        // pageCount: enablePagination ? Math.ceil(tableTotalRow / pagination.pageSize) : -1,
        rowCount: enablePagination ? (tableTotalRow ?? tableData.length) : tableData.length,
        // Row ID
        getRowId: (row: any, index: number) => generateRowId(row, index, idKey),
        // Debug
        debugAll: false, // Disabled for production
    });

    // Compute width after table is created so column resizing is safe and reflects changes
    const allLeafColumns = table.getAllLeafColumns();
    const visibleLeafColumns = table.getVisibleLeafColumns();
    const hasExplicitSizing = allLeafColumns.some((column) => {
        const { size, minSize, maxSize } = column.columnDef;
        return size !== undefined || minSize !== undefined || maxSize !== undefined;
    });
    const useFixedLayout = fitToScreen || enableColumnResizing || hasExplicitSizing;
    const tableTotalSize = table.getTotalSize();
    const tableWidth = fitToScreen ? '100%' : (useFixedLayout ? tableTotalSize : '100%');
    const tableStyle = {
        width: tableWidth,
        minWidth: fitToScreen ? tableTotalSize : undefined,
        tableLayout: useFixedLayout ? 'fixed' : 'auto',
    };


    // -------------------------------
    // Virtualization and row memo
    // -------------------------------
    // Note: globalFilter is needed in dependencies to trigger recalculation when filter changes
    // The table object is stable, so we need to depend on the filter state directly
    const rows = table.getRowModel().rows;
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => estimateRowHeight,
        overscan: 10,
        enabled: enableVirtualization && !enablePagination && rows.length > 0,
    });


    // -------------------------------
    // Callbacks (after table creation)
    // -------------------------------
    const handleColumnReorder = useCallback((draggedColumnId: string, targetColumnId: string) => {
        const currentOrder = columnOrder.length > 0 ? columnOrder : enhancedColumns.map((col, index) => {
            if (col.id) return col.id;
            const anyCol = col as any;
            if (anyCol.accessorKey && typeof anyCol.accessorKey === 'string') {
                return anyCol.accessorKey;
            }
            return `column_${index}`;
        });
        const draggedIndex = currentOrder.indexOf(draggedColumnId);
        const targetIndex = currentOrder.indexOf(targetColumnId);
        if (draggedIndex === -1 || targetIndex === -1) return;
        const newOrder = [...currentOrder];
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedColumnId);
        handleColumnOrderChange(newOrder);
    }, [columnOrder, enhancedColumns, handleColumnOrderChange]);

    // -------------------------------
    // Effects (after callbacks)
    // -------------------------------
    useEffect(() => {
        if (!isExternallyControlledData || serverData === null) return;
        setServerData(null);
        setServerTotal(0);
    }, [isExternallyControlledData, serverData]);

    useEffect(() => {
        if (initialLoadData && onFetchData) {
            if (logger.isLevelEnabled('info')) {
                logger.info('Initial data load triggered', { initialLoadData });
            }
            fetchData({}, {
                delay: 0,
                meta: { reason: 'initial' },
            });
        } else if (logger.isLevelEnabled('debug')) {
            logger.debug('Skipping initial data load', {
                initialLoadData,
                hasOnFetchData: !!onFetchData
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (enableColumnDragging && columnOrder.length === 0) {
            const initialOrder = enhancedColumns.map((col, index) => {
                if (col.id) return col.id;
                const anyCol = col as any;
                if (anyCol.accessorKey && typeof anyCol.accessorKey === 'string') {
                    return anyCol.accessorKey;
                }
                return `column_${index}`;
            });
            setColumnOrder(initialOrder);
        }
    }, [enableColumnDragging, enhancedColumns, columnOrder.length]);


    const lastSentRef = useRef<string>("");

    const emitTableState = useCallback(() => {
        if (!onDataStateChange) return;

        const live = table.getState();

        // only keep what you persist/store
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
        onDataStateChange(payload);
    }, [onDataStateChange, table]);

    useEffect(() => {
        emitTableState();
    }, [
        emitTableState,
        sorting,
        pagination,
        globalFilter,
        columnFilter,
        columnVisibility,
        columnSizing,
        columnOrder,
        columnPinning,
    ]);


    const getResetState = useCallback((): Partial<TableState> => {
        const resetSorting = initialStateConfig.sorting || [];
        const resetGlobalFilter = initialStateConfig.globalFilter ?? '';
        const resetColumnFilter =
            initialStateConfig.columnFilter || { filters: [], logic: 'AND', pendingFilters: [], pendingLogic: 'AND' };

        const resetPagination = enablePagination
            ? (initialStateConfig.pagination || { pageIndex: 0, pageSize: 10 })
            : undefined;

        return {
            sorting: resetSorting,
            globalFilter: resetGlobalFilter,
            columnFilter: resetColumnFilter,
            ...(resetPagination ? { pagination: resetPagination } : {}),
        };
    }, [initialStateConfig, enablePagination]);

    const applyDataMutation = useCallback((
        action: DataMutationAction,
        updater: (rows: T[]) => T[],
        details: Partial<Omit<DataMutationContext<T>, 'action' | 'previousData' | 'nextData'>> = {}
    ) => {
        const previousData = [...tableData];
        const nextData = updater(previousData);

        if (nextData === previousData) return nextData;

        const nextTotal = Math.max(0, tableTotalRow + (nextData.length - previousData.length));

        if (!isExternallyControlledData) {
            setServerData(nextData);
            setServerTotal(nextTotal);
        }
        onDataChange?.(nextData, {
            action,
            previousData,
            nextData,
            totalRow: nextTotal,
            ...details,
        });

        if (logger.isLevelEnabled('debug')) {
            logger.debug('Applied data mutation', {
                action,
                previousCount: previousData.length,
                nextCount: nextData.length,
                totalRow: nextTotal,
            });
        }

        return nextData;
    }, [isExternallyControlledData, logger, onDataChange, tableData, tableTotalRow]);

    const buildRefreshContext = useCallback((
        options: ReturnType<typeof normalizeRefreshOptions>,
        paginationOverride?: { pageIndex: number; pageSize: number }
    ): DataRefreshContext => {
        const state = table.getState();
        const nextPagination = paginationOverride || state.pagination || pagination;

        return {
            filters: {
                globalFilter,
                pagination: nextPagination,
                columnFilter,
                sorting,
            },
            state: {
                sorting,
                pagination: nextPagination,
                globalFilter,
                columnFilter,
                columnVisibility: state.columnVisibility,
                columnSizing: state.columnSizing,
                columnOrder: state.columnOrder,
                columnPinning: state.columnPinning,
            },
            options,
        };
    }, [table, pagination, globalFilter, columnFilter, sorting]);

    const triggerRefresh = useCallback(async (
        options?: boolean | DataRefreshOptions,
        fallbackReason: string = 'refresh'
    ) => {
        const normalizedOptions = normalizeRefreshOptions(options, fallbackReason);
        const nextPagination = enablePagination
            ? {
                pageIndex: normalizedOptions.resetPagination ? 0 : pagination.pageIndex,
                pageSize: pagination.pageSize,
            }
            : undefined;

        const shouldUpdatePagination = !!nextPagination
            && (nextPagination.pageIndex !== pagination.pageIndex || nextPagination.pageSize !== pagination.pageSize);

        if (nextPagination && shouldUpdatePagination) {
            setPagination(nextPagination);
            onPaginationChange?.(nextPagination);
        }

        const refreshContext = buildRefreshContext(normalizedOptions, nextPagination);

        if (onRefreshData) {
            await onRefreshData(refreshContext);
            return;
        }

        if (onFetchData) {
            await fetchData(
                nextPagination ? { pagination: nextPagination } : {},
                {
                    delay: 0,
                    meta: {
                        reason: normalizedOptions.reason,
                        force: normalizedOptions.force,
                    },
                }
            );
            return;
        }

        if (logger.isLevelEnabled('debug')) {
            logger.debug('Refresh skipped because no refresh handler is configured', refreshContext);
        }
    }, [
        normalizeRefreshOptions,
        enablePagination,
        pagination,
        onPaginationChange,
        buildRefreshContext,
        onRefreshData,
        onFetchData,
        fetchData,
        logger,
    ]);

    const resetAllAndReload = useCallback(() => {
        const resetState = getResetState();

        setSorting(resetState.sorting || []);
        setGlobalFilter(resetState.globalFilter ?? '');
        setColumnFilter(resetState.columnFilter as any);

        if (resetState.pagination) {
            setPagination(resetState.pagination);
            onPaginationChange?.(resetState.pagination);
        }

        setSelectionState(initialSelectionState);
        setExpanded({});

        // layout state
        setColumnVisibility(initialStateConfig.columnVisibility || {});
        setColumnSizing(initialStateConfig.columnSizing || {});
        setColumnOrder(initialStateConfig.columnOrder || []);
        setColumnPinning(initialStateConfig.columnPinning || { left: [], right: [] });

        const resetOptions = normalizeRefreshOptions({
            resetPagination: true,
            force: true,
            reason: 'reset',
        }, 'reset');

        const refreshContext = buildRefreshContext(resetOptions, resetState.pagination);

        if (onRefreshData) {
            void onRefreshData(refreshContext);
            return;
        }

        if (onFetchData) {
            void fetchData(resetState, {
                delay: 0,
                meta: {
                    reason: resetOptions.reason,
                    force: resetOptions.force,
                },
            });
        }
    }, [
        getResetState,
        initialSelectionState,
        initialStateConfig,
        onPaginationChange,
        normalizeRefreshOptions,
        buildRefreshContext,
        onRefreshData,
        onFetchData,
        fetchData,
    ]);

    const dataTableApi = useMemo(() => {
        // helpers (avoid repeating boilerplate)
        const buildInitialOrder = () =>
            enhancedColumns.map((col, index) => {
                if ((col as any).id) return (col as any).id as string;
                const anyCol = col as any;
                if (anyCol.accessorKey && typeof anyCol.accessorKey === "string") return anyCol.accessorKey;
                return `column_${index}`;
            });

        const applyColumnOrder = (next: ColumnOrderState) => {
            // handleColumnOrderChange supports both Updater<ColumnOrderState> and array in your impl
            handleColumnOrderChange(next as any);
        };

        const applyPinning = (next: ColumnPinningState) => {
            handleColumnPinningChange(next as any);
        };

        const applyVisibility = (next: Record<string, boolean>) => {
            handleColumnVisibilityChange(next as any);
        };

        const applySizing = (next: Record<string, number>) => {
            handleColumnSizingChange(next as any);
        };

        const applyPagination = (next: any) => {
            handlePaginationChange(next);
        };

        const applySorting = (next: any) => {
            handleSortingChange(next);
        };

        const applyGlobalFilter = (next: any) => {
            handleGlobalFilterChange(next);
        };

        const getRowIndexById = (rowsToSearch: T[], rowId: string) =>
            rowsToSearch.findIndex((row, index) => String(generateRowId(row, index, idKey)) === rowId);

        const clampInsertIndex = (rowsToMutate: T[], insertIndex?: number) => {
            if (insertIndex === undefined) return rowsToMutate.length;
            return Math.max(0, Math.min(insertIndex, rowsToMutate.length));
        };

        return {
            table: {
                getTable: () => table,
            },

            // -------------------------------
            // Column Management
            // -------------------------------
            columnVisibility: {
                showColumn: (columnId: string) => {
                    applyVisibility({ ...table.getState().columnVisibility, [columnId]: true });
                },
                hideColumn: (columnId: string) => {
                    applyVisibility({ ...table.getState().columnVisibility, [columnId]: false });
                },
                toggleColumn: (columnId: string) => {
                    const curr = table.getState().columnVisibility?.[columnId] ?? true;
                    applyVisibility({ ...table.getState().columnVisibility, [columnId]: !curr });
                },
                showAllColumns: () => {
                    // set all known columns true
                    const all: Record<string, boolean> = {};
                    table.getAllLeafColumns().forEach((c) => (all[c.id] = true));
                    applyVisibility(all);
                },
                hideAllColumns: () => {
                    const all: Record<string, boolean> = {};
                    table.getAllLeafColumns().forEach((c) => (all[c.id] = false));
                    applyVisibility(all);
                },
                resetColumnVisibility: () => {
                    const initialVisibility = initialStateConfig.columnVisibility || {};
                    applyVisibility(initialVisibility);
                },
            },

            // -------------------------------
            // Column Ordering
            // -------------------------------
            columnOrdering: {
                setColumnOrder: (nextOrder: ColumnOrderState) => {
                    applyColumnOrder(nextOrder);
                },
                moveColumn: (columnId: string, toIndex: number) => {
                    const currentOrder =
                        (table.getState().columnOrder?.length ? table.getState().columnOrder : buildInitialOrder()) || [];
                    const fromIndex = currentOrder.indexOf(columnId);
                    if (fromIndex === -1) return;

                    const next = [...currentOrder];
                    next.splice(fromIndex, 1);
                    next.splice(toIndex, 0, columnId);

                    applyColumnOrder(next);
                },
                resetColumnOrder: () => {
                    applyColumnOrder(buildInitialOrder());
                },
            },

            // -------------------------------
            // Column Pinning
            // -------------------------------
            columnPinning: {
                pinColumnLeft: (columnId: string) => {
                    const current = table.getState().columnPinning || { left: [], right: [] };
                    const next: ColumnPinningState = {
                        left: [...(current.left || []).filter((id) => id !== columnId), columnId],
                        right: (current.right || []).filter((id) => id !== columnId),
                    };
                    applyPinning(next);
                },
                pinColumnRight: (columnId: string) => {
                    const current = table.getState().columnPinning || { left: [], right: [] };
                    const next: ColumnPinningState = {
                        left: (current.left || []).filter((id) => id !== columnId),
                        // keep your "prepend" behavior
                        right: [columnId, ...(current.right || []).filter((id) => id !== columnId)],
                    };
                    applyPinning(next);
                },
                unpinColumn: (columnId: string) => {
                    const current = table.getState().columnPinning || { left: [], right: [] };
                    const next: ColumnPinningState = {
                        left: (current.left || []).filter((id) => id !== columnId),
                        right: (current.right || []).filter((id) => id !== columnId),
                    };
                    applyPinning(next);
                },
                setPinning: (pinning: ColumnPinningState) => {
                    applyPinning(pinning);
                },
                resetColumnPinning: () => {
                    const initialPinning = initialStateConfig.columnPinning || { left: [], right: [] };
                    applyPinning(initialPinning);
                },
            },

            // -------------------------------
            // Column Resizing
            // -------------------------------
            columnResizing: {
                resizeColumn: (columnId: string, width: number) => {
                    const currentSizing = table.getState().columnSizing || {};
                    applySizing({ ...currentSizing, [columnId]: width });
                },
                autoSizeColumn: (columnId: string) => {
                    // safe to call tanstack helper; it will feed into onColumnSizingChange if wired,
                    // but since you're controlled, we still prefer to update through handler:
                    const col = table.getColumn(columnId);
                    if (!col) return;

                    col.resetSize();
                    // after resetSize, read state and emit via handler so controlled stays synced
                    applySizing({ ...(table.getState().columnSizing || {}) });
                },
                autoSizeAllColumns: () => {
                    const initialSizing = initialStateConfig.columnSizing || {};
                    applySizing(initialSizing);
                },
                resetColumnSizing: () => {
                    const initialSizing = initialStateConfig.columnSizing || {};
                    applySizing(initialSizing);
                },
            },

            // -------------------------------
            // Filtering
            // -------------------------------
            filtering: {
                setGlobalFilter: (filter: string) => {
                    applyGlobalFilter(filter);
                },
                clearGlobalFilter: () => {
                    applyGlobalFilter("");
                },
                setColumnFilters: (filters: ColumnFilterState) => {
                    handleColumnFilterStateChange(filters);
                },
                addColumnFilter: (columnId: string, operator: string, value: any) => {
                    const newFilter = {
                        id: `filter_${Date.now()}`,
                        columnId,
                        operator,
                        value,
                    };

                    const current = table.getState().columnFilter;
                    const currentFilters = current?.filters || [];
                    const nextFilters = [...currentFilters, newFilter];

                    handleColumnFilterStateChange({
                        filters: nextFilters,
                        logic: current?.logic,
                        pendingFilters: current?.pendingFilters || [],
                        pendingLogic: current?.pendingLogic || "AND",
                    });

                    if (logger.isLevelEnabled("debug")) {
                        logger.debug(`Adding column filter ${columnId} ${operator} ${value}`, nextFilters);
                    }
                },
                removeColumnFilter: (filterId: string) => {
                    const current = table.getState().columnFilter;
                    const currentFilters = current?.filters || [];
                    const nextFilters = currentFilters.filter((f: any) => f.id !== filterId);

                    handleColumnFilterStateChange({
                        filters: nextFilters,
                        logic: current?.logic,
                        pendingFilters: current?.pendingFilters || [],
                        pendingLogic: current?.pendingLogic || "AND",
                    });

                    if (logger.isLevelEnabled("debug")) {
                        logger.debug(`Removing column filter ${filterId}`, nextFilters);
                    }
                },
                clearAllFilters: () => {
                    applyGlobalFilter("");
                    handleColumnFilterStateChange({
                        filters: [],
                        logic: "AND",
                        pendingFilters: [],
                        pendingLogic: "AND",
                    });
                },
                resetFilters: () => {
                    handleColumnFilterStateChange({
                        filters: [],
                        logic: "AND",
                        pendingFilters: [],
                        pendingLogic: "AND",
                    });

                    if (logger.isLevelEnabled("debug")) {
                        logger.debug("Resetting filters");
                    }
                },
            },

            // -------------------------------
            // Sorting
            // -------------------------------
            sorting: {
                setSorting: (sortingState: SortingState) => {
                    applySorting(sortingState);
                    if (logger.isLevelEnabled("debug")) logger.debug("Setting sorting", sortingState);
                },

                // NOTE: toggleSorting is okay, but can become "one behind" in controlled server mode.
                // So we implement deterministic sorting through handler.
                sortColumn: (columnId: string, direction: "asc" | "desc" | false) => {
                    const current = table.getState().sorting || [];
                    const filtered = current.filter((s: any) => s.id !== columnId);

                    if (direction === false) {
                        applySorting(filtered);
                        return;
                    }

                    applySorting([{ id: columnId, desc: direction === "desc" }, ...filtered]);
                },

                clearSorting: () => {
                    applySorting([]);
                },
                resetSorting: () => {
                    const initialSorting = initialStateConfig.sorting || [];
                    applySorting(initialSorting);
                },
            },

            // -------------------------------
            // Pagination
            // -------------------------------
            pagination: {
                goToPage: (pageIndex: number) => {
                    applyPagination((prev: any) => ({ ...prev, pageIndex }));
                    if (logger.isLevelEnabled("debug")) logger.debug(`Going to page ${pageIndex}`);
                },
                nextPage: () => {
                    applyPagination((prev: any) => ({ ...prev, pageIndex: (prev?.pageIndex ?? 0) + 1 }));
                    if (logger.isLevelEnabled("debug")) logger.debug("Next page");
                },
                previousPage: () => {
                    applyPagination((prev: any) => ({ ...prev, pageIndex: Math.max(0, (prev?.pageIndex ?? 0) - 1) }));
                    if (logger.isLevelEnabled("debug")) logger.debug("Previous page");
                },
                setPageSize: (pageSize: number) => {
                    // usually want pageIndex reset
                    applyPagination(() => ({ pageIndex: 0, pageSize }));
                    if (logger.isLevelEnabled("debug")) logger.debug(`Setting page size to ${pageSize}`);
                },
                goToFirstPage: () => {
                    applyPagination((prev: any) => ({ ...prev, pageIndex: 0 }));
                    if (logger.isLevelEnabled("debug")) logger.debug("Going to first page");
                },
                goToLastPage: () => {
                    // pageCount can be derived; keep safe fallback
                    const pageCount = table.getPageCount?.() ?? 0;
                    if (pageCount > 0) {
                        applyPagination((prev: any) => ({ ...prev, pageIndex: pageCount - 1 }));
                        if (logger.isLevelEnabled("debug")) logger.debug(`Going to last page ${pageCount - 1}`);
                    }
                },
                resetPagination: () => {
                    const initialPagination = initialStateConfig.pagination || { pageIndex: 0, pageSize: 10 };
                    applyPagination(initialPagination);
                },
            },

            // -------------------------------
            // Selection
            // -------------------------------
            selection: {
                selectRow: (rowId: string) => table.selectRow?.(rowId),
                deselectRow: (rowId: string) => table.deselectRow?.(rowId),
                toggleRowSelection: (rowId: string) => table.toggleRowSelected?.(rowId),
                selectAll: () => table.selectAll?.(),
                deselectAll: () => table.deselectAll?.(),
                toggleSelectAll: () => table.toggleAllRowsSelected?.(),
                getSelectionState: () => table.getSelectionState?.() || ({ ids: [], type: "include" } as const),
                getSelectedRows: () => table.getSelectedRows(),
                getSelectedCount: () => table.getSelectedCount(),
                isRowSelected: (rowId: string) => table.getIsRowSelected(rowId) || false,
            },

            // -------------------------------
            // Data Management (kept same, but ensure state changes go through handlers)
            // -------------------------------
            data: {
                refresh: (options?: boolean | DataRefreshOptions) => {
                    void triggerRefresh(options, 'refresh');
                },

                reload: (options: DataRefreshOptions = {}) => {
                    void triggerRefresh(
                        {
                            ...options,
                            resetPagination: options.resetPagination ?? false,
                            reason: options.reason ?? 'reload',
                        },
                        'reload'
                    );
                },

                resetAll: () => resetAllAndReload(),

                getAllData: () => [...tableData],
                getRowData: (rowId: string) => {
                    const rowIndex = getRowIndexById(tableData, rowId);
                    return rowIndex === -1 ? undefined : tableData[rowIndex];
                },
                getRowByIndex: (index: number) => tableData[index],

                updateRow: (rowId: string, updates: Partial<T>) => {
                    applyDataMutation('updateRow', (rowsToMutate) => {
                        const rowIndex = getRowIndexById(rowsToMutate, rowId);
                        if (rowIndex === -1) return rowsToMutate;
                        const nextData = [...rowsToMutate];
                        nextData[rowIndex] = { ...nextData[rowIndex], ...updates };
                        return nextData;
                    }, { rowId });
                },

                updateRowByIndex: (index: number, updates: Partial<T>) => {
                    applyDataMutation('updateRowByIndex', (rowsToMutate) => {
                        if (!rowsToMutate[index]) return rowsToMutate;
                        const nextData = [...rowsToMutate];
                        nextData[index] = { ...nextData[index], ...updates };
                        return nextData;
                    }, { index });
                },

                insertRow: (newRow: T, index?: number) => {
                    applyDataMutation('insertRow', (rowsToMutate) => {
                        const nextData = [...rowsToMutate];
                        nextData.splice(clampInsertIndex(nextData, index), 0, newRow);
                        return nextData;
                    }, { index });
                },

                deleteRow: (rowId: string) => {
                    applyDataMutation('deleteRow', (rowsToMutate) => {
                        const rowIndex = getRowIndexById(rowsToMutate, rowId);
                        if (rowIndex === -1) return rowsToMutate;
                        const nextData = [...rowsToMutate];
                        nextData.splice(rowIndex, 1);
                        return nextData;
                    }, { rowId });
                },

                deleteRowByIndex: (index: number) => {
                    applyDataMutation('deleteRowByIndex', (rowsToMutate) => {
                        if (index < 0 || index >= rowsToMutate.length) return rowsToMutate;
                        const nextData = [...rowsToMutate];
                        nextData.splice(index, 1);
                        return nextData;
                    }, { index });
                },

                deleteSelectedRows: () => {
                    const selectedRows = table.getSelectedRows?.() || [];
                    if (selectedRows.length === 0) return;

                    const selectedIds = new Set(selectedRows.map((row) => String(row.id)));
                    applyDataMutation(
                        'deleteSelectedRows',
                        (rowsToMutate) =>
                            rowsToMutate.filter((row, index) => !selectedIds.has(String(generateRowId(row, index, idKey)))),
                        { rowIds: Array.from(selectedIds) }
                    );
                    table.deselectAll?.();
                },

                replaceAllData: (newData: T[]) => {
                    applyDataMutation('replaceAllData', () => [...newData]);
                },

                updateMultipleRows: (updates: Array<{ rowId: string; data: Partial<T> }>) => {
                    const updateMap = new Map(updates.map((update) => [update.rowId, update.data]));
                    applyDataMutation('updateMultipleRows', (rowsToMutate) =>
                        rowsToMutate.map((row, index) => {
                            const currentRowId = String(generateRowId(row, index, idKey));
                            const updateData = updateMap.get(currentRowId);
                            return updateData ? { ...row, ...updateData } : row;
                        })
                    );
                },

                insertMultipleRows: (newRows: T[], startIndex?: number) => {
                    applyDataMutation('insertMultipleRows', (rowsToMutate) => {
                        const nextData = [...rowsToMutate];
                        nextData.splice(clampInsertIndex(nextData, startIndex), 0, ...newRows);
                        return nextData;
                    }, { index: startIndex });
                },

                deleteMultipleRows: (rowIds: string[]) => {
                    const idsToDelete = new Set(rowIds);
                    applyDataMutation(
                        'deleteMultipleRows',
                        (rowsToMutate) =>
                            rowsToMutate.filter((row, index) => !idsToDelete.has(String(generateRowId(row, index, idKey)))),
                        { rowIds }
                    );
                },

                updateField: (rowId: string, fieldName: keyof T, value: any) => {
                    applyDataMutation('updateField', (rowsToMutate) => {
                        const rowIndex = getRowIndexById(rowsToMutate, rowId);
                        if (rowIndex === -1) return rowsToMutate;
                        const nextData = [...rowsToMutate];
                        nextData[rowIndex] = { ...nextData[rowIndex], [fieldName]: value };
                        return nextData;
                    }, { rowId });
                },

                updateFieldByIndex: (index: number, fieldName: keyof T, value: any) => {
                    applyDataMutation('updateFieldByIndex', (rowsToMutate) => {
                        if (!rowsToMutate[index]) return rowsToMutate;
                        const nextData = [...rowsToMutate];
                        nextData[index] = { ...nextData[index], [fieldName]: value };
                        return nextData;
                    }, { index });
                },

                findRows: (predicate: (row: T) => boolean) => tableData.filter(predicate),

                findRowIndex: (predicate: (row: T) => boolean) => tableData.findIndex(predicate),

                getDataCount: () => tableData.length,
                getFilteredDataCount: () => table.getFilteredRowModel().rows.length,
            },

            // -------------------------------
            // Layout Management
            // -------------------------------
            layout: {
                resetLayout: () => {
                    // go through handlers so controlled state updates + emit works
                    applySizing(initialStateConfig.columnSizing || {});
                    applyVisibility(initialStateConfig.columnVisibility || {});
                    applySorting(initialStateConfig.sorting || []);
                    applyGlobalFilter(initialStateConfig.globalFilter ?? "");
                },
                resetAll: () => resetAllAndReload(),
                saveLayout: () => ({
                    columnVisibility: table.getState().columnVisibility,
                    columnSizing: table.getState().columnSizing,
                    columnOrder: table.getState().columnOrder,
                    columnPinning: table.getState().columnPinning,
                    sorting: table.getState().sorting,
                    pagination: table.getState().pagination,
                    globalFilter: table.getState().globalFilter,
                    columnFilter: table.getState().columnFilter,
                }),
                restoreLayout: (layout: Partial<TableState>) => {
                    if (layout.columnVisibility) applyVisibility(layout.columnVisibility as any);
                    if (layout.columnSizing) applySizing(layout.columnSizing as any);
                    if (layout.columnOrder) applyColumnOrder(layout.columnOrder as any);
                    if (layout.columnPinning) applyPinning(layout.columnPinning as any);
                    if (layout.sorting) applySorting(layout.sorting as any);
                    if (layout.pagination && enablePagination) applyPagination(layout.pagination as any);
                    if (layout.globalFilter !== undefined) applyGlobalFilter(layout.globalFilter);
                    if (layout.columnFilter) handleColumnFilterStateChange(layout.columnFilter as any);
                },
            },

            // -------------------------------
            // Table State
            // -------------------------------
            state: {
                getTableState: () => table.getState(),
                getCurrentFilters: () => table.getState().columnFilter,
                getCurrentSorting: () => table.getState().sorting,
                getCurrentPagination: () => table.getState().pagination,
                getCurrentSelection: () => table.getSelectionState?.(),
            },

            // -------------------------------
            // Export (unchanged mostly)
            // -------------------------------
            export: {
                exportCSV: async (options: any = {}) => {
                    const { filename = exportFilename } = options;

                    try {
                        const controller = new AbortController();
                        setExportController?.(controller);

                        if (dataMode === "server" && onServerExport) {
                            const currentFilters = {
                                globalFilter: table.getState().globalFilter,
                                columnFilter: table.getState().columnFilter,
                                sorting: table.getState().sorting,
                                pagination: table.getState().pagination,
                            };

                            if (logger.isLevelEnabled("debug")) logger.debug("Server export CSV", { currentFilters });

                            await exportServerData(table, {
                                format: "csv",
                                filename,
                                fetchData: (filters: any, selection: any) => onServerExport(filters, selection),
                                currentFilters,
                                selection: table.getSelectionState?.(),
                                onProgress: onExportProgress,
                                onComplete: onExportComplete,
                                onError: onExportError,
                            });
                        } else {
                            await exportClientData(table, {
                                format: "csv",
                                filename,
                                onProgress: onExportProgress,
                                onComplete: onExportComplete,
                                onError: onExportError,
                            });

                            if (logger.isLevelEnabled("debug")) logger.debug("Client export CSV", filename);
                        }
                    } catch (error: any) {
                        onExportError?.({ message: error.message || "Export failed", code: "EXPORT_ERROR" });
                    } finally {
                        setExportController?.(null);
                    }
                },

                exportExcel: async (options: any = {}) => {
                    const { filename = exportFilename } = options;

                    try {
                        const controller = new AbortController();
                        setExportController?.(controller);

                        if (dataMode === "server" && onServerExport) {
                            const currentFilters = {
                                globalFilter: table.getState().globalFilter,
                                columnFilter: table.getState().columnFilter,
                                sorting: table.getState().sorting,
                                pagination: table.getState().pagination,
                            };

                            if (logger.isLevelEnabled("debug")) logger.debug("Server export Excel", { currentFilters });

                            await exportServerData(table, {
                                format: "excel",
                                filename,
                                fetchData: (filters: any, selection: any) => onServerExport(filters, selection),
                                currentFilters,
                                selection: table.getSelectionState?.(),
                                onProgress: onExportProgress,
                                onComplete: onExportComplete,
                                onError: onExportError,
                            });
                        } else {
                            await exportClientData(table, {
                                format: "excel",
                                filename,
                                onProgress: onExportProgress,
                                onComplete: onExportComplete,
                                onError: onExportError,
                            });

                            if (logger.isLevelEnabled("debug")) logger.debug("Client export Excel", filename);
                        }
                    } catch (error: any) {
                        onExportError?.({ message: error.message || "Export failed", code: "EXPORT_ERROR" });
                        if (logger.isLevelEnabled("debug")) logger.debug("Server export Excel failed", error);
                    } finally {
                        setExportController?.(null);
                    }
                },

                exportServerData: async (options: any) => {
                    const { format, filename = exportFilename, fetchData: fetchFn = onServerExport } = options;

                    if (!fetchFn) {
                        onExportError?.({ message: "No server export function provided", code: "NO_SERVER_EXPORT" });
                        if (logger.isLevelEnabled("debug")) logger.debug("Server export data failed", "No server export function provided");
                        return;
                    }

                    try {
                        const controller = new AbortController();
                        setExportController?.(controller);

                        const currentFilters = {
                            globalFilter: table.getState().globalFilter,
                            columnFilter: table.getState().columnFilter,
                            sorting: table.getState().sorting,
                            pagination: table.getState().pagination,
                        };

                        if (logger.isLevelEnabled("debug")) logger.debug("Server export data", { currentFilters });

                        await exportServerData(table, {
                            format,
                            filename,
                            fetchData: (filters: any, selection: any) => fetchFn(filters, selection),
                            currentFilters,
                            selection: table.getSelectionState?.(),
                            onProgress: onExportProgress,
                            onComplete: onExportComplete,
                            onError: onExportError,
                        });
                    } catch (error: any) {
                        onExportError?.({ message: error.message || "Export failed", code: "EXPORT_ERROR" });
                        if (logger.isLevelEnabled("debug")) logger.debug("Server export data failed", error);
                    } finally {
                        setExportController?.(null);
                    }
                },

                isExporting: () => isExporting || false,
                cancelExport: () => {
                    exportController?.abort();
                    setExportController?.(null);
                    if (logger.isLevelEnabled("debug")) logger.debug("Export cancelled");
                },
            },
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        table,
        enhancedColumns,
        handleColumnOrderChange,
        handleColumnPinningChange,
        handleColumnVisibilityChange,
        handleColumnSizingChange,
        handlePaginationChange,
        handleSortingChange,
        handleGlobalFilterChange,
        handleColumnFilterStateChange,
        initialStateConfig,
        enablePagination,
        idKey,
        triggerRefresh,
        applyDataMutation,
        tableData,
        // export
        exportFilename,
        onExportProgress,
        onExportComplete,
        onExportError,
        onServerExport,
        exportController,
        isExporting,
        dataMode,
        logger,
        resetAllAndReload,
    ]);

    internalApiRef.current = dataTableApi;

    useImperativeHandle(ref, () => dataTableApi, [dataTableApi]);


    // -------------------------------
    // Render table rows with slot support (callback)
    // -------------------------------
    const renderTableRows = useCallback(() => {
        if (tableLoading) {
            const { component: LoadingRowComponent, props: loadingRowProps } = getSlotComponentWithProps(
                slots,
                slotProps || {},
                'loadingRow',
                LoadingRows,
                {}
            );
            return (
                <LoadingRowComponent
                    rowCount={enablePagination ? Math.min(pagination.pageSize, skeletonRows) : skeletonRows}
                    colSpan={table.getAllColumns().length}
                    slots={slots}
                    slotProps={slotProps}
                    {...loadingRowProps}
                />
            );
        }
        if (rows.length === 0) {
            const { component: EmptyRowComponent, props: emptyRowProps } = getSlotComponentWithProps(
                slots,
                slotProps || {},
                'emptyRow',
                EmptyDataRow,
                {}
            );
            return (
                <EmptyRowComponent
                    colSpan={table.getAllColumns().length}
                    message={emptyMessage}
                    slots={slots}
                    slotProps={slotProps}
                    {...emptyRowProps}
                />
            );
        }
        if (enableVirtualization && !enablePagination && rows.length > 0) {
            const virtualItems = rowVirtualizer.getVirtualItems();
            return (
                <>
                    {virtualItems.length > 0 && (
                        <tr>
                            <td
                                colSpan={table.getAllColumns().length}
                                style={{
                                    height: `${virtualItems[0]?.start ?? 0}px`,
                                    padding: 0,
                                    border: 0,
                                }}
                            />
                        </tr>
                    )}
                    {virtualItems.map((virtualRow) => {
                        const row = rows[virtualRow.index];
                        if (!row) return null;
                        return (
                            <DataTableRow
                                key={row.id}
                                row={row}
                                enableHover={enableHover}
                                enableStripes={enableStripes}
                                isOdd={virtualRow.index % 2 === 1}
                                renderSubComponent={renderSubComponent}
                                disableStickyHeader={enableStickyHeaderOrFooter}
                                onRowClick={onRowClick}
                                selectOnRowClick={selectOnRowClick}
                                slots={slots}
                                slotProps={slotProps}
                            />
                        );
                    })}
                    {virtualItems.length > 0 && (
                        <tr>
                            <td
                                colSpan={table.getAllColumns().length}
                                style={{
                                    height: `${rowVirtualizer.getTotalSize() -
                                        (virtualItems[virtualItems.length - 1]?.end ?? 0)}px`,
                                    padding: 0,
                                    border: 0,
                                }}
                            />
                        </tr>
                    )}
                </>
            );
        }
        return rows.map((row, index) => (
            <DataTableRow
                key={row.id}
                row={row}
                enableHover={enableHover}
                enableStripes={enableStripes}
                isOdd={index % 2 === 1}
                renderSubComponent={renderSubComponent}
                disableStickyHeader={enableStickyHeaderOrFooter}
                onRowClick={onRowClick}
                selectOnRowClick={selectOnRowClick}
                slots={slots}
                slotProps={slotProps}
            />
        ));
    }, [
        tableLoading,
        rows,
        enableVirtualization,
        enablePagination,
        pagination.pageSize,
        skeletonRows,
        table,
        slotProps,
        emptyMessage,
        rowVirtualizer,
        enableHover,
        enableStripes,
        renderSubComponent,
        enableStickyHeaderOrFooter,
        onRowClick,
        selectOnRowClick,
        slots,
    ]);

    // -------------------------------
    // Export cancel callback
    // -------------------------------
    const handleCancelExport = useCallback(() => {
        if (exportController) {
            exportController.abort();
            setExportController(null);
            if (onExportCancel) {
                onExportCancel();
            }
        }
    }, [exportController, onExportCancel]);

    // -------------------------------
    // Slot components
    // -------------------------------
    const { component: RootComponent, props: rootSlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'root',
        Box,
        {}
    );
    const { component: ToolbarComponent, props: toolbarSlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'toolbar',
        DataTableToolbar,
        {}
    );
    const { component: BulkActionsComponent, props: bulkActionsSlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'bulkActionsToolbar',
        BulkActionsToolbar,
        {}
    );
    const { component: TableContainerComponent, props: tableContainerSlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'tableContainer',
        TableContainer,
        {}
    );
    const { component: TableComponent, props: tableComponentSlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'table',
        Table,
        {}
    );
    const { component: BodyComponent, props: bodySlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'body',
        TableBody,
        {}
    );
    const { component: FooterComponent, props: footerSlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'footer',
        Box,
        {}
    );
    const { component: PaginationComponent, props: paginationSlotProps } = getSlotComponentWithProps(
        slots,
        slotProps || {},
        'pagination',
        DataTablePagination,
        {}
    );

    // -------------------------------
    // Render
    // -------------------------------
    return (
        <DataTableProvider
            table={table}
            apiRef={internalApiRef}
            dataMode={dataMode}
            tableSize={tableSize}
            onTableSizeChange={(size) => {
                setTableSize(size);
            }}
            columnFilter={columnFilter}
            onChangeColumnFilter={handleColumnFilterStateChange}
            slots={slots}
            slotProps={slotProps}
            isExporting={isExporting}
            exportController={exportController}
            onCancelExport={handleCancelExport}
            exportFilename={exportFilename}
            onExportProgress={onExportProgress}
            onExportComplete={onExportComplete}
            onExportError={onExportError}
            onServerExport={onServerExport}
        >
            <RootComponent
                {...rootSlotProps}
            >
                {/* Toolbar */}
                {(enableGlobalFilter || extraFilter) ? (
                    <ToolbarComponent
                        extraFilter={extraFilter}
                        enableGlobalFilter={enableGlobalFilter}
                        enableColumnVisibility={enableColumnVisibility}
                        enableColumnFilter={enableColumnFilter}
                        enableExport={enableExport}
                        enableReset={enableReset}
                        enableTableSizeControl={enableTableSizeControl}
                        enableColumnPinning={enableColumnPinning}
                        enableRefresh={enableRefresh}
                        {...toolbarSlotProps}
                        refreshButtonProps={{
                            loading: tableLoading, // disable while fetching
                            showSpinnerWhileLoading: false,
                            onRefresh: () => internalApiRef.current?.data?.refresh?.(true),
                            ...toolbarSlotProps.refreshButtonProps,
                        }}

                    />
                ) : null}

                {/* Bulk Actions Toolbar - shown when rows are selected */}
                {enableBulkActions && enableRowSelection && isSomeRowsSelected ? (
                    <BulkActionsComponent
                        selectionState={selectionState}
                        selectedRowCount={selectedRowCount}
                        bulkActions={bulkActions}
                        sx={{
                            position: 'relative',
                            zIndex: 2,
                            ...bulkActionsSlotProps.sx,
                        }}
                        {...bulkActionsSlotProps}
                    />
                ) : null}

                {/* Table Container */}
                <TableContainerComponent
                    component={Paper}
                    ref={tableContainerRef}
                    sx={{
                        width: '100%',
                        overflowX: 'auto',
                        ...(enableStickyHeaderOrFooter && {
                            maxHeight: maxHeight,
                            overflowY: 'auto',
                        }),
                        ...(enableVirtualization && {
                            maxHeight: maxHeight,
                            overflowY: 'auto',
                        }),
                        ...tableContainerSlotProps?.sx,
                    }}
                    {...tableContainerSlotProps}
                >
                    <TableComponent
                        size={tableSize}
                        stickyHeader={enableStickyHeaderOrFooter}
                        style={{
                            ...tableStyle,
                            ...tableProps?.style,
                        }}
                        {...mergeSlotProps(tableProps || {}, tableComponentSlotProps)}
                    >
                        {useFixedLayout ? (
                            <colgroup>
                                {visibleLeafColumns.map((column) => (
                                    <col
                                        key={column.id}
                                        style={{
                                            width: column.getSize(),
                                            minWidth: column.columnDef.minSize,
                                            maxWidth: column.columnDef.maxSize,
                                        }}
                                    />
                                ))}
                            </colgroup>
                        ) : null}
                        {/* Table Headers */}
                        <TableHeader
                            draggable={enableColumnDragging}
                            enableColumnResizing={enableColumnResizing}
                            enableStickyHeader={enableStickyHeaderOrFooter}
                            onColumnReorder={handleColumnReorder}
                            slots={slots}
                            slotProps={slotProps}
                        />

                        {/* Table Body */}
                        <BodyComponent
                            {...bodySlotProps}
                        >
                            {renderTableRows()}
                        </BodyComponent>
                    </TableComponent>
                </TableContainerComponent>

                {/* Pagination */}
                {enablePagination ? (
                    <FooterComponent
                        sx={{
                            ...(enableStickyHeaderOrFooter && {
                                position: 'sticky',
                                bottom: 0,
                                backgroundColor: 'background.paper',
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                zIndex: 1,
                            }),
                            ...footerSlotProps.sx,
                        }}
                        {...footerSlotProps}
                    >
                        <PaginationComponent
                            footerFilter={footerFilter}
                            pagination={pagination}
                            totalRow={tableTotalRow}
                            {...paginationSlotProps}
                        />
                    </FooterComponent>
                ) : null}
            </RootComponent>
        </DataTableProvider>
    );
});
