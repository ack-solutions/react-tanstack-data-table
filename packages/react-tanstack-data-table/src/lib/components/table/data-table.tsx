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
import { useDataTableApi } from '../../hooks/use-data-table-api';
import { DataTableSize, generateRowId } from '../../utils';
import { useDebouncedFetch } from '../../utils/debounced-fetch.utils';
import { getSlotComponent } from '../../utils/slot-helpers';
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
    rowSelection: {},
    globalFilter: '',
    expanded: {},
    columnOrder: [],
    columnPinning: {
        left: [],
        right: [],
    },
    customColumnFilter: {
        filters: [],
        logic: 'AND' as const,
        pendingFilters: [],
        pendingLogic: 'AND' as const,
    },
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
    enablePagination = true,
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
    tableContainerProps = {},
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
    enableExport = true,
    enableReset = true,

    // Loading and empty states
    loading = false,
    emptyMessage = 'No data available',
    skeletonRows = 5,

    // Column filters props
    onColumnFiltersChange,

    // Slots
    slots = {},
    slotProps = {},

}: DataTableProps<T>, ref: React.Ref<DataTableApi<T>>) {
    // Convert mode-based props to boolean flags for internal use
    const isServerMode = dataMode === 'server';
    const isServerPagination = paginationMode === 'server' || isServerMode;
    const isServerFiltering = filterMode === 'server' || isServerMode;
    const isServerSorting = sortingMode === 'server' || isServerMode;

    // -------------------------------
    // State hooks (grouped together)
    // -------------------------------
    // const [fetchLoading, setFetchLoading] = useState(false);
    const [sorting, setSorting] = useState<SortingState>(DEFAULT_INITIAL_STATE.sorting);
    const [pagination, setPagination] = useState(DEFAULT_INITIAL_STATE.pagination);
    const [globalFilter, setGlobalFilter] = useState(DEFAULT_INITIAL_STATE.globalFilter);
    const [selectionState, setSelectionState] = useState<SelectionState>(
        initialState?.selectionState || { ids: [], type: 'include' as const }
    );
    const [columnFilter, setColumnFilter] = useState<ColumnFilterState>({
        filters: [],
        logic: 'AND',
        pendingFilters: [],
        pendingLogic: 'AND'
    });
    const [expanded, setExpanded] = useState(DEFAULT_INITIAL_STATE.expanded);
    const [tableSize, setTableSize] = useState<DataTableSize>(initialTableSize);
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(DEFAULT_INITIAL_STATE.columnOrder);
    const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(DEFAULT_INITIAL_STATE.columnPinning);
    const [serverData, setServerData] = useState<T[]>(null);
    const [serverTotal, setServerTotal] = useState(0);
    const [exportController, setExportController] = useState<AbortController | null>(null);

    // -------------------------------
    // Ref hooks (grouped together)
    // -------------------------------
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const internalApiRef = useRef<DataTableApi<T>>(null);

    // -------------------------------
    // Memoized values (grouped together)
    // -------------------------------
    const initialStateConfig = useMemo(() => {
        return {
            ...DEFAULT_INITIAL_STATE,
            ...initialState,
        };
    }, [initialState]);

    // Re-initialize state if initialState changes
    useEffect(() => {
        setSorting(initialStateConfig.sorting);
        setPagination(initialStateConfig.pagination);
        setGlobalFilter(initialStateConfig.globalFilter);
        setExpanded(initialStateConfig.expanded);
        setColumnOrder(initialStateConfig.columnOrder);
        setColumnPinning(initialStateConfig.columnPinning);
    }, [initialStateConfig]);

    const { debouncedFetch, isLoading: fetchLoading } = useDebouncedFetch(onFetchData);
    const tableData = useMemo(() => serverData ? serverData : data, [onFetchData, serverData, data]);
    const tableTotalRow = useMemo(() => serverData ? serverTotal : totalRow, [onFetchData, serverTotal, totalRow]);
    const tableLoading = useMemo(() => onFetchData ? (loading || fetchLoading) : loading, [onFetchData, loading, fetchLoading]);
    const enhancedColumns = useMemo(
        () => {
            let columnsMap = [...columns];
            if (enableExpanding) {
                const expandingColumnMap = createExpandingColumn<T>({
                    ...(slotProps?.expandColumn || {}),
                });
                columnsMap = [expandingColumnMap, ...columnsMap];
            }
            if (enableRowSelection) {
                const selectionColumnMap = createSelectionColumn<T>({
                    ...(slotProps?.selectionColumn || {}),
                    multiSelect: enableMultiRowSelection,
                });
                columnsMap = [selectionColumnMap, ...columnsMap];
            }
            return columnsMap;
        },
        [
            columns,
            slotProps?.selectionColumn,
            slotProps?.expandColumn,
            enableRowSelection,
            enableExpanding,
            enableMultiRowSelection,
        ],
    );
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
        if (!onFetchData) return;
        const filters: TableFiltersForFetch = {
            globalFilter,
            pagination,
            columnFilter,
            sorting,
            ...overrides,
        };
        const result = await debouncedFetch(filters);
        if (result?.data && result?.total !== undefined) {
            setServerData(result.data);
            setServerTotal(result.total);
        }
    }, [
        onFetchData,
        globalFilter,
        pagination,
        columnFilter,
        sorting,
        debouncedFetch,
    ]);

    const fetchDataRef = useRef<typeof fetchData>(fetchData);
    fetchDataRef.current = fetchData;

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
            setTimeout(() => {
                if (onColumnFiltersChange) {
                    onColumnFiltersChange(filterState);
                }
            }, 0);
        }
    }, [onColumnFiltersChange]);

    const notifyDataStateChange = useCallback((overrides: Partial<TableState> = {}) => {
        if (onDataStateChange) {
            const currentState: Partial<TableState> = {
                globalFilter,
                columnFilter,
                sorting,
                pagination,
                columnOrder,
                columnPinning,
                ...overrides,
            };
            onDataStateChange(currentState);
        }
    }, [
        onDataStateChange,
        globalFilter,
        columnFilter,
        sorting,
        pagination,
        columnOrder,
        columnPinning,
    ]);

    const stateChangeRef = useRef<typeof notifyDataStateChange>(notifyDataStateChange);
    stateChangeRef.current = notifyDataStateChange;

    const handleSortingChange = useCallback((updaterOrValue: any) => {
        let newSorting = typeof updaterOrValue === 'function'
            ? updaterOrValue(sorting)
            : updaterOrValue;
        console.log('handleSortingChange', newSorting);
        newSorting = newSorting.filter((sort: any) => sort.id);
        setSorting(newSorting);
        if (onSortingChange) {
            onSortingChange(newSorting);
        }
        if (isServerMode || isServerSorting) {
            stateChangeRef.current({ sorting: newSorting });
            fetchDataRef?.current({
                sorting: newSorting,
            });
        } else if (onDataStateChange) {
            setTimeout(() => {
                stateChangeRef.current({ sorting: newSorting });
            }, 0);
        }
    }, [
        sorting,
        onSortingChange,
        isServerMode,
        isServerSorting,
        onDataStateChange,
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
        setPagination(updater);
        const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
        if (isServerMode || isServerPagination) {
            setTimeout(() => {
                stateChangeRef.current({ pagination: newPagination });
                fetchDataRef?.current({ pagination: newPagination });
            }, 0);
        } else if (onDataStateChange) {
            setTimeout(() => {
                stateChangeRef.current({ pagination: newPagination });
            }, 0);
        }
    }, [pagination, isServerMode, isServerPagination, onDataStateChange]);

    const handleGlobalFilterChange = useCallback((updaterOrValue: any) => {
        const newFilter = typeof updaterOrValue === 'function'
            ? updaterOrValue(globalFilter)
            : updaterOrValue;
        setGlobalFilter(newFilter);
        if (isServerMode || isServerFiltering) {
            setTimeout(() => {
                stateChangeRef.current({ globalFilter: newFilter });
                fetchDataRef?.current({ globalFilter: newFilter });
            }, 0);
        } else if (onDataStateChange) {
            setTimeout(() => {
                stateChangeRef.current({ globalFilter: newFilter });
            }, 0);
        }
    }, [globalFilter, isServerMode, isServerFiltering, onDataStateChange]);

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
        if (isServerFiltering) {
            const serverFilterState = {
                filters: appliedState.filters,
                logic: appliedState.logic,
                pendingFilters: appliedState.pendingFilters,
                pendingLogic: appliedState.pendingLogic,
            };
            stateChangeRef.current({
                columnFilter: serverFilterState,
            });
            fetchDataRef?.current({
                columnFilter: serverFilterState,
            });
        }
    }, [isServerFiltering]);

    // -------------------------------
    // Table creation (after callbacks/memo)
    // -------------------------------
    const table = useReactTable({
        _features: [ColumnFilterFeature, SelectionFeature], 
        data: tableData,
        columns: enhancedColumns,
        initialState: {
            ...initialStateConfig,
        },
        state: {
            sorting,
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
        onSelectionStateChange: enableRowSelection ? handleSelectionStateChange : undefined,
        // Column filter
        enableAdvanceColumnFilter: enableColumnFilter,
        onColumnFilterChange: onColumnFilterChangeHandler, // Handle column filters change
        onColumnFilterApply: onColumnFilterApplyHandler, // Handle when filters are actually applied

        // Sorting
        onSortingChange: enableSorting ? handleSortingChange : undefined,
        onPaginationChange: enablePagination ? handlePaginationChange : undefined,
        onRowSelectionChange: enableRowSelection ? handleSelectionStateChange : undefined,
        onGlobalFilterChange: enableGlobalFilter ? handleGlobalFilterChange : undefined,
        onExpandedChange: enableExpanding ? setExpanded : undefined,
        onColumnOrderChange: enableColumnDragging ? handleColumnOrderChange : undefined,
        onColumnPinningChange: enableColumnPinning ? handleColumnPinningChange : undefined,

        // Row model
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: (enableSorting && !isServerSorting) ? getSortedRowModel() : undefined,
        getFilteredRowModel: (enableColumnFilter && !isServerFiltering) ? getCombinedFilteredRowModel<T>() : undefined,
        getPaginationRowModel: (enablePagination && !isServerPagination) ? getPaginationRowModel() : undefined,
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
        getRowCanExpand: enableExpanding ? getRowCanExpand : undefined,
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
            fetchDataRef.current();
        }
    }, [initialLoadData, onFetchData]);

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
    // Render table rows with slot support (callback)
    // -------------------------------
    const LoadingRowSlot = getSlotComponent(slots, 'loadingRow', LoadingRows);
    const EmptyRowSlot = getSlotComponent(slots, 'emptyRow', EmptyDataRow);
    const renderTableRows = useCallback(() => {
        if (tableLoading) {
            return (
                <LoadingRowSlot
                    rowCount={enablePagination ? Math.min(pagination.pageSize, skeletonRows) : skeletonRows}
                    colSpan={table.getAllColumns().length}
                    slots={slots}
                    slotProps={slotProps}
                    {...slotProps?.loadingRow}
                />
            );
        }
        if (rows.length === 0) {
            return (
                <EmptyRowSlot
                    colSpan={table.getAllColumns().length}
                    message={emptyMessage}
                    slots={slots}
                    slotProps={slotProps}
                    {...slotProps?.emptyRow}
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
                                {...slotProps?.row}
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
        LoadingRowSlot,
        pagination.pageSize,
        skeletonRows,
        table,
        slotProps,
        EmptyRowSlot,
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
    // Expose imperative API via ref using custom hook
    // -------------------------------
    useDataTableApi({
        table,
        idKey,
        enhancedColumns,
        enablePagination,
        enableColumnPinning,
        initialStateConfig,
        selectMode,
        onSelectionChange: handleSelectionStateChange,
        handleColumnFilterStateChange,
        onDataStateChange,
        onFetchData: fetchData,
        exportFilename,
        onExportProgress,
        onExportComplete,
        onExportError,
        onServerExport,
        exportController,
        setExportController,
        isExporting,
        onDataChange: setServerData,
        dataMode,
    }, internalApiRef);

    useImperativeHandle(ref, () => internalApiRef.current!, []);

    // -------------------------------
    // Slot components
    // -------------------------------
    const RootSlot = getSlotComponent(slots, 'root', Box);
    const ToolbarSlot = getSlotComponent(slots, 'toolbar', DataTableToolbar);
    const BulkActionsSlot = getSlotComponent(slots, 'bulkActionsToolbar', BulkActionsToolbar);
    const TableContainerSlot = getSlotComponent(slots, 'tableContainer', TableContainer);
    const TableSlot = getSlotComponent(slots, 'table', Table);
    const BodySlot = getSlotComponent(slots, 'body', TableBody);
    const FooterSlot = getSlotComponent(slots, 'footer', Box);
    const PaginationSlot = getSlotComponent(slots, 'pagination', DataTablePagination);

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
            <RootSlot
                {...slotProps?.root}
            >
                {/* Toolbar */}
                {(enableGlobalFilter || extraFilter) ? (
                    <ToolbarSlot
                        extraFilter={extraFilter}
                        enableGlobalFilter={enableGlobalFilter}
                        enableColumnVisibility={enableColumnVisibility}
                        enableColumnFilter={enableColumnFilter}
                        enableExport={enableExport}
                        enableReset={enableReset}
                        enableTableSizeControl={enableTableSizeControl}
                        enableColumnPinning={enableColumnPinning}
                        {...slotProps?.toolbar}
                    />
                ) : null}

                {/* Bulk Actions Toolbar - shown when rows are selected */}
                {enableBulkActions && enableRowSelection && isSomeRowsSelected ? (
                    <BulkActionsSlot
                        selectionState={selectionState}
                        selectedRowCount={selectedRowCount}
                        bulkActions={bulkActions}
                        sx={{
                            position: 'relative',
                            zIndex: 2,
                        }}
                        {...slotProps?.bulkActionsToolbar}
                    />
                ) : null}

                {/* Table Container */}
                <TableContainerSlot
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
                        ...tableContainerProps?.sx,
                    }}
                    {...tableContainerProps}
                    {...slotProps?.tableContainer}
                >
                    <TableSlot
                        size={tableSize}
                        stickyHeader={enableStickyHeaderOrFooter}
                        style={{
                            ...tableStyle,
                            tableLayout: fitToScreen ? 'fixed' : 'auto',
                            ...tableProps?.style,
                        }}
                        {...tableProps}
                        {...slotProps?.table}
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
                        <BodySlot
                            {...slotProps?.body}
                        >
                            {renderTableRows()}
                        </BodySlot>
                    </TableSlot>
                </TableContainerSlot>

                {/* Pagination */}
                {enablePagination ? (
                    <FooterSlot
                        sx={{
                            ...(enableStickyHeaderOrFooter && {
                                position: 'sticky',
                                bottom: 0,
                                backgroundColor: 'background.paper',
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                zIndex: 1,
                            }),
                        }}
                        {...slotProps?.footer}
                    >
                        <PaginationSlot
                            footerFilter={footerFilter}
                            {...slotProps?.pagination}
                            pagination={pagination}
                            totalRow={tableTotalRow}
                        />
                    </FooterSlot>
                ) : null}
            </RootSlot>
        </DataTableProvider>
    );
});
