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
import { ColumnFilterFeature, getCombinedFilteredRowModel } from '../../features/column-filter.feature';
import { SelectionFeature, SelectionState } from '../../features';
import { useVirtualizer } from '@tanstack/react-virtual';
import React, { useState, useCallback, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';


// Import from new organized structure
import { DataTableProvider } from '../../contexts/data-table-context';
import { DataTableSize, exportClientData, exportServerData, generateRowId, createLogger, withIdsDeep } from '../../utils';
import { useDebouncedFetch } from '../../utils/debounced-fetch.utils';
import { getSlotComponentWithProps, mergeSlotProps } from '../../utils/slot-helpers';
import { TableHeader } from '../headers';
import { DataTablePagination } from '../pagination';
import { DataTableRow, LoadingRows, EmptyDataRow } from '../rows';
import { DataTableToolbar, BulkActionsToolbar } from '../toolbar';
import { DataTableProps } from './data-table.types';
import { ColumnFilterState, TableFiltersForFetch, TableState } from '../../types';
import { DataTableApi } from '../../types/data-table-api';
import {
    createExpandingColumn,
    createSelectionColumn,
} from '../../utils/special-columns.utils';



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
    onDataStateChange,

    // Selection props
    enableRowSelection = false,
    enableMultiRowSelection = true,
    selectMode = 'page',
    isRowSelectable,
    onSelectionChange,

    // Bulk action props
    enableBulkActions = false,
    bulkActions,

    // Column resizing props
    enableColumnResizing = false,
    columnResizeMode = 'onChange',

    // Column ordering props
    enableColumnDragging = false,
    onColumnDragEnd,

    // Column pinning props
    enableColumnPinning = false,
    onColumnPinningChange,

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
    enableColumnVisibility = true,
    enableTableSizeControl = true,
    enableExport = false,
    enableReset = true,

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

    console.log('initialStateConfig', initialStateConfig);

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
    const [serverData, setServerData] = useState<T[] | null>(null);
    const [serverTotal, setServerTotal] = useState(0);
    const [exportController, setExportController] = useState<AbortController | null>(null);

    // -------------------------------
    // Ref hooks (grouped together)
    // -------------------------------
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const internalApiRef = useRef<DataTableApi<T>>(null);

    const { debouncedFetch, isLoading: fetchLoading } = useDebouncedFetch(onFetchData);
    const tableData = useMemo(() => serverData ? serverData : data, [onFetchData, serverData, data]);
    const tableTotalRow = useMemo(() => serverData ? serverTotal : totalRow, [onFetchData, serverTotal, totalRow]);
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
        }, [columns, enableExpanding, enableRowSelection, enableMultiRowSelection, slotProps?.expandColumn, slotProps?.selectionColumn]);


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
    const tableWidth = useMemo(() => {
        if (fitToScreen) {
            return '100%';
        }
        if (enableColumnResizing) {
            return table.getCenterTotalSize();
        }
        return '100%';
    }, [
        fitToScreen,
        enableColumnResizing,
        // table is defined later, but this is safe as it's only used after table is defined
    ]);
    const tableStyle = useMemo(() => ({
        width: tableWidth,
        minWidth: '100%',
    }), [tableWidth]);

    // -------------------------------
    // Callback hooks (grouped together)
    // -------------------------------
    const fetchData = useCallback(async (overrides: Partial<TableState> = {}) => {
        if (!onFetchData) {
            if (logger.isLevelEnabled('debug')) {
                logger.debug('onFetchData not provided, skipping fetch', { overrides, columnFilter, sorting, pagination  });
            }
            return;
        }

        const filters: TableFiltersForFetch = {
            globalFilter,
            pagination,
            columnFilter,
            sorting,
            ...overrides,
        };

        console.log('filters', filters);
        if (logger.isLevelEnabled('info')) {
            logger.info('Requesting data', { filters });
        }

        try {
            const result = await debouncedFetch(filters);

            if (logger.isLevelEnabled('info')) {
                logger.info('Fetch resolved', {
                    rows: result?.data?.length ?? 0,
                    total: result?.total,
                });
            }

            if (result?.data && result?.total !== undefined) {
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



    const handleSelectionStateChange = useCallback((updaterOrValue: any) => {
        setSelectionState((prevState) => {
            const newSelectionState = typeof updaterOrValue === 'function'
                ? updaterOrValue(prevState)
                : updaterOrValue;
            setTimeout(() => {
                if (onSelectionChange) {
                    onSelectionChange(newSelectionState);
                }
            }, 0);
            return newSelectionState;
        });
    }, [onSelectionChange]);

    const handleColumnFilterStateChange = useCallback((filterState: ColumnFilterState) => {
        if (filterState && typeof filterState === 'object') {
            setColumnFilter(filterState);
        }
    }, [onColumnFiltersChange]);

    const tableStateChange = useCallback((overrides: Partial<TableState> = {}) => {
        if (!onDataStateChange) {
            if (logger.isLevelEnabled('debug')) {
                logger.debug('No onDataStateChange handler registered; skipping state update notification', { overrides });
            }
            return;
        }

        const currentState: Partial<TableState> = {
            globalFilter,
            columnFilter,
            sorting,
            pagination,
            columnOrder,
            columnPinning,
            ...overrides,
        };

        if (logger.isLevelEnabled('debug')) {
            logger.debug('Emitting tableStateChange', currentState);
        }

        onDataStateChange(currentState);
    }, [
        onDataStateChange,
        globalFilter,
        columnFilter,
        sorting,
        pagination,
        columnOrder,
        columnPinning,
        logger,
    ]);

    const handleSortingChange = useCallback((updaterOrValue: any) => {
        let newSorting = typeof updaterOrValue === 'function'
            ? updaterOrValue(sorting)
            : updaterOrValue;
        newSorting = newSorting.filter((sort: any) => sort.id);
        setSorting(newSorting);
        onSortingChange?.(newSorting);

        if (logger.isLevelEnabled('debug')) {
            logger.debug('Sorting change applied', {
                sorting: newSorting,
                serverMode: isServerMode,
                serverSorting: isServerSorting,
            });
        }

        if (isServerMode || isServerSorting) {
            const pagination = resetPageToFirst();
            if (logger.isLevelEnabled('debug')) {
                logger.debug('Sorting change triggered server fetch', { pagination, sorting: newSorting });
            }
            tableStateChange({ sorting: newSorting, pagination });
            fetchData({
                sorting: newSorting,
                pagination,
            });
        } else if (onDataStateChange) {
            const pagination = resetPageToFirst();
            setTimeout(() => {
                if (logger.isLevelEnabled('debug')) {
                    logger.debug('Sorting change notified client state change', { pagination, sorting: newSorting });
                }
                tableStateChange({ sorting: newSorting, pagination });
            }, 0);
        }
    }, [
        sorting,
        onSortingChange,
        fetchData,
        isServerMode,
        isServerSorting,
        onDataStateChange,
        tableStateChange,
        logger,
    ]);

    const handleColumnOrderChange = useCallback((updatedColumnOrder: Updater<ColumnOrderState>) => {
        const newColumnOrder = typeof updatedColumnOrder === 'function'
            ? updatedColumnOrder(columnOrder)
            : updatedColumnOrder;
        setColumnOrder(newColumnOrder);
        if (onColumnDragEnd) {
            onColumnDragEnd(newColumnOrder);
        }
    }, [onColumnDragEnd, columnOrder]);

    const handleColumnPinningChange = useCallback((updatedColumnPinning: Updater<ColumnPinningState>) => {
        const newColumnPinning = typeof updatedColumnPinning === 'function'
            ? updatedColumnPinning(columnPinning)
            : updatedColumnPinning;
        setColumnPinning(newColumnPinning);
        if (onColumnPinningChange) {
            onColumnPinningChange(newColumnPinning);
        }
    }, [onColumnPinningChange, columnPinning]);

    const handlePaginationChange = useCallback((updater: any) => {
        const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
        if (logger.isLevelEnabled('debug')) {
            logger.debug('Pagination change requested', {
                previous: pagination,
                next: newPagination,
                serverSide: isServerMode || isServerPagination,
            });
        }

        console.log('newPagination', newPagination);

        // Update pagination state
        setPagination(newPagination);
        onPaginationChange?.(newPagination);

        if (logger.isLevelEnabled('debug')) {
            logger.debug('Pagination state updated', newPagination);
        }

        // Notify state change and fetch data if needed
        if (isServerMode || isServerPagination) {
            setTimeout(() => {
                if (logger.isLevelEnabled('debug')) {
                    logger.debug('Notifying server-side pagination change', newPagination);
                }
                tableStateChange({ pagination: newPagination });
                fetchData({ pagination: newPagination });
            }, 0);
        } else if (onDataStateChange) {
            setTimeout(() => {
                if (logger.isLevelEnabled('debug')) {
                    logger.debug('Notifying client-side pagination change', newPagination);
                }
                tableStateChange({ pagination: newPagination });
            }, 0);
        }
    }, [
        pagination,
        isServerMode,
        isServerPagination,
        onDataStateChange,
        fetchData,
        tableStateChange,
        logger,
        onPaginationChange,
    ]);

    const handleGlobalFilterChange = useCallback((updaterOrValue: any) => {
        const newFilter = typeof updaterOrValue === 'function'
            ? updaterOrValue(globalFilter)
            : updaterOrValue;
        setGlobalFilter(newFilter);

        if (logger.isLevelEnabled('debug')) {
            logger.debug('Global filter change applied', {
                value: newFilter,
                serverMode: isServerMode,
                serverFiltering: isServerFiltering,
            });
        }

        if (isServerMode || isServerFiltering) {
            const pagination = resetPageToFirst();
            setTimeout(() => {
                if (logger.isLevelEnabled('debug')) {
                    logger.debug('Global filter change triggering server fetch', {
                        pagination,
                        value: newFilter,
                    });
                }
                tableStateChange({ globalFilter: newFilter, pagination });
                fetchData({ globalFilter: newFilter, pagination });
            }, 0);
        } else if (onDataStateChange) {
            const pagination = resetPageToFirst();
            setTimeout(() => {
                if (logger.isLevelEnabled('debug')) {
                    logger.debug('Global filter change notifying client listeners', {
                        pagination,
                        value: newFilter,
                    });
                }
                tableStateChange({ globalFilter: newFilter, pagination });
            }, 0);
        }
        onGlobalFilterChange?.(newFilter);
    }, [globalFilter, isServerMode, isServerFiltering, onDataStateChange, fetchData, tableStateChange, logger]);

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

    const onColumnFilterApplyHandler = useCallback((appliedState: any) => {
        const pagination = resetPageToFirst();
        if (isServerFiltering) {
            const serverFilterState = {
                filters: appliedState.filters,
                logic: appliedState.logic,
                pendingFilters: appliedState.pendingFilters,
                pendingLogic: appliedState.pendingLogic,
            };
            tableStateChange({
                columnFilter: serverFilterState,
                pagination,
            });
            fetchData({
                columnFilter: serverFilterState,
                pagination,
            });
        }
        setTimeout(() => {
            if (onColumnFiltersChange) {
                onColumnFiltersChange(appliedState);
            }
        }, 0);
    }, [isServerFiltering, fetchData, tableStateChange]);

    // -------------------------------
    // Table creation (after callbacks/memo)
    // -------------------------------
    const table = useReactTable({
        _features: [ColumnFilterFeature, SelectionFeature],
        data: tableData,
        columns: enhancedColumns,
        initialState: { ...DEFAULT_INITIAL_STATE },
        state: {
            ...(enableSorting ? { sorting } : {}),
            ...(enablePagination ? { pagination } : {}),
            ...(enableGlobalFilter ? { globalFilter } : {}),
            ...(enableExpanding ? { expanded } : {}),
            ...(enableColumnDragging ? { columnOrder } : {}),
            ...(enableColumnPinning ? { columnPinning } : {}),
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
        ...(enableRowSelection ? { onRowSelectionChange: handleSelectionStateChange } : {}),
        ...(enableGlobalFilter ? { onGlobalFilterChange: handleGlobalFilterChange } : {}),
        ...(enableExpanding ? { onExpandedChange: setExpanded } : {}),
        ...(enableColumnDragging ? { onColumnOrderChange: handleColumnOrderChange } : {}),
        ...(enableColumnPinning ? { onColumnPinningChange: handleColumnPinningChange } : {}),

        // Row model
        getCoreRowModel: getCoreRowModel(),
        ...(enableSorting ? { getSortedRowModel: getSortedRowModel() } : {}),
        ...(enableColumnFilter ? { getFilteredRowModel: getCombinedFilteredRowModel<T>() } : {}),
        ...(enablePagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
        // Sorting
        enableSorting: enableSorting,
        manualSorting: isServerSorting,
        // Filtering
        manualFiltering: isServerFiltering,
        // Column resizing
        enableColumnResizing: enableColumnResizing,
        columnResizeMode: columnResizeMode,
        // Column pinning
        enableColumnPinning: enableColumnPinning,
        // Expanding
        ...(enableExpanding ? { getRowCanExpand: getRowCanExpand } : {}),
        // Pagination
        manualPagination: isServerPagination,
        autoResetPageIndex: false, // Prevent automatic page reset on state changes
        // pageCount: enablePagination ? Math.ceil(tableTotalRow / pagination.pageSize) : -1,
        rowCount: tableTotalRow,
        // Row ID
        getRowId: (row: any, index: number) => generateRowId(row, index, idKey),
        // Debug
        debugAll: false, // Disabled for production
    });

    // -------------------------------
    // Virtualization and row memo
    // -------------------------------
    const rows = table.getRowModel()?.rows || [];
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => estimateRowHeight,
        overscan: 10,
        enabled: enableVirtualization && !enablePagination && rows.length > 0,
    });

    const resetPageToFirst = () => {
        if (logger.isLevelEnabled('info')) {
            logger.info('Resetting to first page due to state change', {
                previousPageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
            });
        }
        const newPagination = { pageIndex: 0, pageSize: pagination.pageSize };
        setPagination(newPagination);
        onPaginationChange?.(newPagination);
        console.log('newPagination', newPagination);
        console.log('onPaginationChange', onPaginationChange);
        return newPagination;
    };

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
        if (initialLoadData && onFetchData) {
            if (logger.isLevelEnabled('info')) {
                logger.info('Initial data load triggered', { initialLoadData });
            }
            fetchData();
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


    // -------------------------------
    // Expose imperative API via ref using custom hook
    // -------------------------------
    // useDataTableApi({
    //     table,
    //     idKey,
    //     enhancedColumns,
    //     enablePagination,
    //     enableColumnPinning,
    //     initialStateConfig: {
    //         ...DEFAULT_INITIAL_STATE,
    //         ...initialState,
    //     },
    //     selectMode,
    //     onSelectionChange: handleSelectionStateChange,
    //     handleColumnFilterStateChange,
    //     onDataStateChange,
    //     onFetchData: fetchData,
    //     exportFilename,
    //     onExportProgress,
    //     onExportComplete,
    //     onExportError,
    //     onServerExport,
    //     exportController,
    //     setExportController,
    //     isExporting,
    //     onDataChange: setServerData,
    //     dataMode,
    //     logging,
    // }, internalApiRef);

    const dataTableApi = useMemo(() => ({
        table: {
            getTable: () => table,
        },
        // Column Management
        columnVisibility: {
            showColumn: (columnId: string) => {
                table.getColumn(columnId)?.toggleVisibility(true);
            },
            hideColumn: (columnId: string) => {
                table.getColumn(columnId)?.toggleVisibility(false);
            },
            toggleColumn: (columnId: string) => {
                table.getColumn(columnId)?.toggleVisibility();
            },
            showAllColumns: () => {
                table.toggleAllColumnsVisible(true);
            },
            hideAllColumns: () => {
                table.toggleAllColumnsVisible(false);
            },
            resetColumnVisibility: () => {
                table.resetColumnVisibility();
            },
        },

        // Column Ordering
        columnOrdering: {
            setColumnOrder: (columnOrder: ColumnOrderState) => {
                table.setColumnOrder(columnOrder);
            },
            moveColumn: (columnId: string, toIndex: number) => {
                const currentOrder = table.getState().columnOrder || [];
                const currentIndex = currentOrder.indexOf(columnId);
                if (currentIndex === -1) return;

                const newOrder = [...currentOrder];
                newOrder.splice(currentIndex, 1);
                newOrder.splice(toIndex, 0, columnId);

                table.setColumnOrder(newOrder);
            },
            resetColumnOrder: () => {
                const initialOrder = enhancedColumns.map((col, index) => {
                    if (col.id) return col.id;
                    const anyCol = col as any;
                    if (anyCol.accessorKey && typeof anyCol.accessorKey === 'string') {
                        return anyCol.accessorKey;
                    }
                    return `column_${index}`;
                });
                table.setColumnOrder(initialOrder);
            },
        },

        // Column Pinning
        columnPinning: {
            pinColumnLeft: (columnId: string) => {
                const currentPinning = table.getState().columnPinning;
                const newPinning = { ...currentPinning };

                // Remove from right if exists
                newPinning.right = (newPinning.right || []).filter(id => id !== columnId);
                // Add to left if not exists
                newPinning.left = [...(newPinning.left || []).filter(id => id !== columnId), columnId];

                table.setColumnPinning(newPinning);
            },
            pinColumnRight: (columnId: string) => {
                const currentPinning = table.getState().columnPinning;
                const newPinning = { ...currentPinning };

                // Remove from left if exists
                newPinning.left = (newPinning.left || []).filter(id => id !== columnId);
                // Add to right if not exists
                newPinning.right = [...(newPinning.right || []).filter(id => id !== columnId), columnId];

                table.setColumnPinning(newPinning);
            },
            unpinColumn: (columnId: string) => {
                const currentPinning = table.getState().columnPinning;
                const newPinning = {
                    left: (currentPinning.left || []).filter(id => id !== columnId),
                    right: (currentPinning.right || []).filter(id => id !== columnId),
                };

                table.setColumnPinning(newPinning);
            },
            setPinning: (pinning: ColumnPinningState) => {
                table.setColumnPinning(pinning);
            },
            resetColumnPinning: () => {
                table.setColumnPinning(initialStateConfig.columnPinning || { left: [], right: [] });
            },
        },

        // Column Resizing
        columnResizing: {
            resizeColumn: (columnId: string, width: number) => {
                // Use table's setColumnSizing method
                const currentSizing = table.getState().columnSizing;
                table.setColumnSizing({
                    ...currentSizing,
                    [columnId]: width,
                });
            },
            autoSizeColumn: (columnId: string) => {
                // TanStack doesn't have built-in auto-size, so reset to default
                table.getColumn(columnId)?.resetSize();
            },
            autoSizeAllColumns: () => {
                table.resetColumnSizing();
            },
            resetColumnSizing: () => {
                table.resetColumnSizing();
            },
        },

        // Filtering
        filtering: {
            setGlobalFilter: (filter: string) => {
                table.setGlobalFilter(filter);
            },
            clearGlobalFilter: () => {
                table.setGlobalFilter('');
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
                const columnFilter = table.getState().columnFilter;

                const currentFilters = columnFilter.filters || [];
                const newFilters = [...currentFilters, newFilter];
                handleColumnFilterStateChange({
                    filters: newFilters,
                    logic: columnFilter.logic,
                    pendingFilters: columnFilter.pendingFilters || [],
                    pendingLogic: columnFilter.pendingLogic || 'AND',
                });
                if (logger.isLevelEnabled('debug')) {
                    logger.debug(`Adding column filter ${columnId} ${operator} ${value}`, newFilters);
                }
            },
            removeColumnFilter: (filterId: string) => {
                const columnFilter = table.getState().columnFilter;
                const currentFilters = columnFilter.filters || [];
                const newFilters = currentFilters.filter((f: any) => f.id !== filterId);
                handleColumnFilterStateChange({
                    filters: newFilters,
                    logic: columnFilter.logic,
                    pendingFilters: columnFilter.pendingFilters || [],
                    pendingLogic: columnFilter.pendingLogic || 'AND',
                });
                if (logger.isLevelEnabled('debug')) {
                    logger.debug(`Removing column filter ${filterId}`, newFilters);
                }
            },
            clearAllFilters: () => {
                table.setGlobalFilter('');
                handleColumnFilterStateChange({
                    filters: [],
                    logic: 'AND',
                    pendingFilters: [],
                    pendingLogic: 'AND',
                });
            },
            resetFilters: () => {
                handleColumnFilterStateChange({
                    filters: [],
                    logic: 'AND',
                    pendingFilters: [],
                    pendingLogic: 'AND',
                });
                if (logger.isLevelEnabled('debug')) {
                    logger.debug('Resetting filters');
                }
            },
        },

        // Sorting
        sorting: {
            setSorting: (sortingState: SortingState) => {
                table.setSorting(sortingState);
                if (logger.isLevelEnabled('debug')) {
                    logger.debug(`Setting sorting`, sortingState);
                }
            },
            sortColumn: (columnId: string, direction: 'asc' | 'desc' | false) => {
                const column = table.getColumn(columnId);
                if (!column) return;

                if (direction === false) {
                    column.clearSorting();
                } else {
                    column.toggleSorting(direction === 'desc');
                }
            },
            clearSorting: () => {
                table.resetSorting();
            },
            resetSorting: () => {
                table.setSorting(initialStateConfig.sorting || []);
            },
        },

        // Pagination
        pagination: {
            goToPage: (pageIndex: number) => {
                table.setPageIndex(pageIndex);
                if (logger.isLevelEnabled('debug')) {
                    logger.debug(`Going to page ${pageIndex}`);
                }
            },
            nextPage: () => {
                table.nextPage();
                if (logger.isLevelEnabled('debug')) {
                    logger.debug('Next page');
                }
            },
            previousPage: () => {
                table.previousPage();
                if (logger.isLevelEnabled('debug')) {
                    logger.debug('Previous page');
                }
            },
            setPageSize: (pageSize: number) => {
                table.setPageSize(pageSize);
                if (logger.isLevelEnabled('debug')) {
                    logger.debug(`Setting page size to ${pageSize}`);
                }
            },
            goToFirstPage: () => {
                table.setPageIndex(0);
                if (logger.isLevelEnabled('debug')) {
                    logger.debug('Going to first page');
                }
            },
            goToLastPage: () => {
                const pageCount = table.getPageCount();
                if (pageCount > 0) {
                    table.setPageIndex(pageCount - 1);
                    if (logger.isLevelEnabled('debug')) {
                        logger.debug(`Going to last page ${pageCount - 1}`);
                    }
                }
            },
            resetPagination: () => {
                table.setPagination(initialStateConfig.pagination || { pageIndex: 0, pageSize: 10 });
            },
        },

        // Access via table methods: table.selectRow(), table.getIsRowSelected(), etc.
        selection: {
            selectRow: (rowId: string) => table.selectRow?.(rowId),
            deselectRow: (rowId: string) => table.deselectRow?.(rowId),
            toggleRowSelection: (rowId: string) => table.toggleRowSelected?.(rowId),
            selectAll: () => table.selectAll?.(),
            deselectAll: () => table.deselectAll?.(),
            toggleSelectAll: () => table.toggleAllRowsSelected?.(),
            getSelectionState: () => table.getSelectionState?.() || { ids: [], type: 'include' as const },
            getSelectedRows: () => table.getSelectedRows(),
            getSelectedCount: () => table.getSelectedCount(),
            isRowSelected: (rowId) => table.getIsRowSelected(rowId) || false,
        },

        // Data Management
        data: {
            refresh: (resetPagination = false) => {
                const filters = table.getState();
                const pagination = {
                    pageIndex: resetPagination ? 0 : initialStateConfig.pagination?.pageIndex || 0,
                    pageSize: filters.pagination?.pageSize || initialStateConfig.pagination?.pageSize || 10,
                };
                const allState = table.getState();
                setPagination(pagination);
                onDataStateChange?.({ ...allState, pagination });
                fetchData?.({ pagination });
                if (logger.isLevelEnabled('debug')) {
                    logger.debug('Refreshing data using Ref', { pagination, allState });
                }
            },
            reload: () => {
                const allState = table.getState();

                onDataStateChange?.(allState);
                onFetchData?.({});
                if (logger.isLevelEnabled('debug')) {
                    logger.info('Reloading data', allState);
                }
            },
            // Data CRUD operations
            getAllData: () => {
                return table.getRowModel().rows?.map(row => row.original) || [];
            },
            getRowData: (rowId: string) => {
                return table.getRowModel().rows?.find(row => String(row.original[idKey]) === rowId)?.original;
            },
            getRowByIndex: (index: number) => {
                return table.getRowModel().rows?.[index]?.original;
            },
            updateRow: (rowId: string, updates: Partial<T>) => {
                const newData = table.getRowModel().rows?.map(row => String(row.original[idKey]) === rowId
                    ? {
                        ...row.original,
                        ...updates,
                    }
                    : row.original);
                setServerData?.(newData || []);
                if (logger.isLevelEnabled('debug')) {
                    logger.debug(`Updating row ${rowId}`, updates);
                }
            },
            updateRowByIndex: (index: number, updates: Partial<T>) => {
                const newData = table.getRowModel().rows?.map(row => row.original);
                if (newData?.[index]) {
                    newData[index] = {
                        ...newData[index]!,
                        ...updates,
                    };
                    setServerData(newData);
                    if (logger.isLevelEnabled('debug')) {
                        logger.debug(`Updating row by index ${index}`, updates);
                    }
                }
            },
            insertRow: (newRow: T, index?: number) => {
                const newData = table.getRowModel().rows?.map(row => row.original) || [];
                if (index !== undefined) {
                    newData.splice(index, 0, newRow);
                } else {
                    newData.push(newRow);
                }
                setServerData(newData || []);
                if (logger.isLevelEnabled('debug')) {
                    logger.debug(`Inserting row`, newRow);
                }
            },
            deleteRow: (rowId: string) => {
                const newData = (table.getRowModel().rows || [])?.filter(row => String(row.original[idKey]) !== rowId);
                setServerData?.(newData?.map(row => row.original) || []);
                if (logger.isLevelEnabled('debug')) {
                    logger.debug(`Deleting row ${rowId}`);
                }
            },
            deleteRowByIndex: (index: number) => {
                const newData = (table.getRowModel().rows || [])?.map(row => row.original);
                newData.splice(index, 1);
                setServerData(newData);
                if (logger.isLevelEnabled('debug')) {
                    logger.debug(`Deleting row by index ${index}`);
                }
            },
            deleteSelectedRows: () => {
                const selectedRowIds = Object.keys(table.getState().rowSelection)
                    .filter(key => table.getState().rowSelection[key]);
                const newData = (table.getRowModel().rows || [])?.filter(row => !selectedRowIds.includes(String(row.original[idKey])));
                setServerData(newData?.map(row => row.original) || []);
                // Clear selection after deletion
                table.resetRowSelection();
                if (logger.isLevelEnabled('debug')) {
                    logger.debug('Deleting selected rows');
                }
            },
            replaceAllData: (newData: T[]) => {
                setServerData?.(newData);
            },

            // Bulk operations
            updateMultipleRows: (updates: Array<{ rowId: string; data: Partial<T> }>) => {
                const updateMap = new Map(updates.map(u => [u.rowId, u.data]));
                const newData = (table.getRowModel().rows || [])?.map(row => {
                    const rowId = String(row.original[idKey]);
                    const updateData = updateMap.get(rowId);
                    return updateData ? {
                        ...row.original,
                        ...updateData,
                    } : row.original;
                });
                setServerData(newData || []);
            },
            insertMultipleRows: (newRows: T[], startIndex?: number) => {
                const newData = (table.getRowModel().rows || [])?.map(row => row.original);
                if (startIndex !== undefined) {
                    newData.splice(startIndex, 0, ...newRows);
                } else {
                    newData.push(...newRows);
                }
                setServerData?.(newData);
            },
            deleteMultipleRows: (rowIds: string[]) => {
                const idsToDelete = new Set(rowIds);
                const newData = (table.getRowModel().rows || [])?.filter(row => !idsToDelete.has(String(row.original[idKey])))?.map(row => row.original);
                setServerData(newData);
            },

            // Field-specific updates
            updateField: (rowId: string, fieldName: keyof T, value: any) => {
                const newData = (table.getRowModel().rows || [])?.map(row => String(row.original[idKey]) === rowId
                    ? {
                        ...row.original,
                        [fieldName]: value,
                    }
                    : row.original);
                setServerData?.(newData);
            },
            updateFieldByIndex: (index: number, fieldName: keyof T, value: any) => {
                const newData = (table.getRowModel().rows || [])?.map(row => row.original);
                if (newData[index]) {
                    newData[index] = {
                        ...newData[index],
                        [fieldName]: value,
                    };
                    setServerData?.(newData);
                }
            },

            // Data queries
            findRows: (predicate: (row: T) => boolean) => {
                return (table.getRowModel().rows || [])?.filter(row => predicate(row.original))?.map(row => row.original);
            },
            findRowIndex: (predicate: (row: T) => boolean) => {
                return (table.getRowModel().rows || [])?.findIndex(row => predicate(row.original));
            },
            getDataCount: () => {
                return (table.getRowModel().rows || [])?.length || 0;
            },
            getFilteredDataCount: () => {
                return table.getFilteredRowModel().rows.length;
            },
        },

        // Layout Management
        layout: {
            resetLayout: () => {
                table.resetColumnSizing();
                table.resetColumnVisibility();
                table.resetSorting();
                table.resetGlobalFilter();
            },
            resetAll: () => {
                // Reset everything to initial state
                table.resetColumnSizing();
                table.resetColumnVisibility();
                table.resetSorting();
                table.resetGlobalFilter();
                table.resetColumnOrder();
                table.resetExpanded();
                table.resetRowSelection();
                table.resetColumnPinning();

                handleColumnFilterStateChange(initialStateConfig.columnFilter || { filters: [], logic: 'AND', pendingFilters: [], pendingLogic: 'AND' });

                if (enablePagination) {
                    table.setPagination(initialStateConfig.pagination || { pageIndex: 0, pageSize: 10 });
                }

                if (enableColumnPinning) {
                    table.setColumnPinning(initialStateConfig.columnPinning || { left: [], right: [] });
                }
            },
            saveLayout: () => {
                return {
                    columnVisibility: table.getState().columnVisibility,
                    columnSizing: table.getState().columnSizing,
                    columnOrder: table.getState().columnOrder,
                    columnPinning: table.getState().columnPinning,
                    sorting: table.getState().sorting,
                    pagination: table.getState().pagination,
                    globalFilter: table.getState().globalFilter,
                    columnFilter: table.getState().columnFilter,
                };
            },
            restoreLayout: (layout: Partial<TableState>) => {
                if (layout.columnVisibility) {
                    table.setColumnVisibility(layout.columnVisibility);
                }
                if (layout.columnSizing) {
                    table.setColumnSizing(layout.columnSizing);
                }
                if (layout.columnOrder) {
                    table.setColumnOrder(layout.columnOrder);
                }
                if (layout.columnPinning) {
                    table.setColumnPinning(layout.columnPinning);
                }
                if (layout.sorting) {
                    table.setSorting(layout.sorting);
                }
                if (layout.pagination && enablePagination) {
                    table.setPagination(layout.pagination);
                }
                if (layout.globalFilter !== undefined) {
                    table.setGlobalFilter(layout.globalFilter);
                }
                if (layout.columnFilter) {
                    handleColumnFilterStateChange(layout.columnFilter);
                }
            },
        },

        // Table State
        state: {
            getTableState: () => {
                return table.getState();
            },
            getCurrentFilters: () => {
                return table.getState().columnFilter;
            },
            getCurrentSorting: () => {
                return table.getState().sorting;
            },
            getCurrentPagination: () => {
                return table.getState().pagination;
            },
            getCurrentSelection: () => {
                return Object.keys(table.getState().rowSelection)
                    .filter(key => table.getState().rowSelection[key]);
            },
        },

        // Simplified Export
        export: {
            exportCSV: async (options: any = {}) => {
                const { filename = exportFilename, } = options;

                try {
                    // Create abort controller for this export
                    const controller = new AbortController();
                    setExportController?.(controller);

                    if (dataMode === 'server' && onServerExport) {
                        // Server export with selection data
                        const currentFilters = {
                            globalFilter: table.getState().globalFilter,
                            columnFilter: table.getState().columnFilter,
                            sorting: table.getState().sorting,
                            pagination: table.getState().pagination,
                        };
                        if (logger.isLevelEnabled('debug')) {
                            logger.debug('Server export CSV', { currentFilters });
                        }
                        await exportServerData(table, {
                            format: 'csv',
                            filename,
                            fetchData: (filters, selection) => onServerExport(filters, selection),
                            currentFilters,
                            selection: table.getSelectionState?.(),
                            onProgress: onExportProgress,
                            onComplete: onExportComplete,
                            onError: onExportError,
                        });
                    } else {
                        // Client export - auto-detect selected rows if not specified
                        await exportClientData(table, {
                            format: 'csv',
                            filename,
                            onProgress: onExportProgress,
                            onComplete: onExportComplete,
                            onError: onExportError,
                        });
                        if (logger.isLevelEnabled('debug')) {
                            logger.debug('Client export CSV', filename);
                        }
                    }
                } catch (error: any) {
                    onExportError?.({
                        message: error.message || 'Export failed',
                        code: 'EXPORT_ERROR',
                    });
                } finally {
                    setExportController?.(null);
                }
            },
            exportExcel: async (options: any = {}) => {
                const { filename = exportFilename } = options;

                try {
                    // Create abort controller for this export
                    const controller = new AbortController();
                    setExportController?.(controller);

                    if (dataMode === 'server' && onServerExport) {
                        // Server export with selection data
                        const currentFilters = {
                            globalFilter: table.getState().globalFilter,
                            columnFilter: table.getState().columnFilter,
                            sorting: table.getState().sorting,
                            pagination: table.getState().pagination,
                        };

                        if (logger.isLevelEnabled('debug')) {
                            logger.debug('Server export Excel', { currentFilters });
                        }
                        await exportServerData(table, {
                            format: 'excel',
                            filename,
                            fetchData: (filters, selection) => onServerExport(filters, selection),
                            currentFilters,
                            selection: table.getSelectionState?.(),
                            onProgress: onExportProgress,
                            onComplete: onExportComplete,
                            onError: onExportError,
                        });
                    } else {
                        // Client export - auto-detect selected rows if not specified
                        await exportClientData(table, {
                            format: 'excel',
                            filename,
                            onProgress: onExportProgress,
                            onComplete: onExportComplete,
                            onError: onExportError,
                        });
                        if (logger.isLevelEnabled('debug')) {
                            logger.debug('Client export Excel', filename);
                        }
                    }
                } catch (error: any) {
                    onExportError?.({
                        message: error.message || 'Export failed',
                        code: 'EXPORT_ERROR',
                    });
                    if (logger.isLevelEnabled('debug')) {
                        logger.debug('Server export Excel failed', error);
                    }
                } finally {
                    setExportController?.(null);
                }
            },
            exportServerData: async (options) => {
                const {
                    format,
                    filename = exportFilename,
                    fetchData = onServerExport,
                } = options;

                if (!fetchData) {
                    onExportError?.({
                        message: 'No server export function provided',
                        code: 'NO_SERVER_EXPORT',
                    });
                    if (logger.isLevelEnabled('debug')) {
                        logger.debug('Server export data failed', 'No server export function provided');
                    }
                    return;
                }

                try {
                    // Create abort controller for this export
                    const controller = new AbortController();
                    setExportController?.(controller);

                    const currentFilters = {
                        globalFilter: table.getState().globalFilter,
                        columnFilter: table.getState().columnFilter,
                        sorting: table.getState().sorting,
                        pagination: table.getState().pagination,
                    };
                    if (logger.isLevelEnabled('debug')) {
                        logger.debug('Server export data', { currentFilters });
                    }
                    await exportServerData(table, {
                        format,
                        filename,
                        fetchData: (filters, selection) => fetchData(filters, selection),
                        currentFilters,
                        selection: table.getSelectionState?.(),
                        onProgress: onExportProgress,
                        onComplete: onExportComplete,
                        onError: onExportError,
                    });
                } catch (error: any) {
                    onExportError?.({
                        message: error.message || 'Export failed',
                        code: 'EXPORT_ERROR',
                    });
                    if (logger.isLevelEnabled('debug')) {
                        logger.debug('Server export data failed', error);
                    }
                } finally {
                    setExportController?.(null);
                }
            },
            // Export state
            isExporting: () => isExporting || false,
            cancelExport: () => {
                exportController?.abort();
                setExportController?.(null);
                if (logger.isLevelEnabled('debug')) {
                    logger.debug('Export cancelled');
                }
            },
        },
    }), [
        table,
        enhancedColumns,
        handleColumnFilterStateChange,
        idKey,
        onDataStateChange,
        onFetchData,
        enableColumnPinning,
        enablePagination,
        // Export dependencies
        exportFilename,
        onExportProgress,
        onExportComplete,
        onExportError,
        onServerExport,
        exportController,
        setExportController,
        isExporting,
        dataMode,
        selectMode,
        onSelectionChange,
        // Note: custom selection removed from dependency array
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
                        {...toolbarSlotProps}
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
                            tableLayout: fitToScreen ? 'fixed' : 'auto',
                            ...tableProps?.style,
                        }}
                        {...mergeSlotProps(tableProps || {}, tableComponentSlotProps)}
                    >
                        {/* Table Headers */}
                        <TableHeader
                            draggable={enableColumnDragging}
                            enableColumnResizing={enableColumnResizing}
                            enableStickyHeader={enableStickyHeaderOrFooter}
                            fitToScreen={fitToScreen}
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
