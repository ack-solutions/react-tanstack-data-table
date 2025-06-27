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
    getPaginationRowModel,
    RowSelectionState,
    ColumnOrderState,
    ColumnPinningState,
} from '@tanstack/react-table';

// Import custom features
import { CustomColumnFilterFeature, getCombinedFilteredRowModel } from '../../features/custom-column-filter.feature';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useState, useCallback, useMemo, useRef, useEffect, forwardRef } from 'react';


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
import { DataTableProps, ServerSelectionState } from './data-table.types';
import { CustomColumnFilterState, TableFilters, TableFiltersForFetch, TableState } from '../../types';
import { DataTableApi } from '../../types/data-table-api';
import {
    createExpandingColumn,
    createSelectionColumn,
} from '../../utils/special-columns.utils';


// Static default initial state - defined outside component
const DEFAULT_INITIAL_STATE = {
    sorting: [] as SortingState,
    pagination: {
        pageIndex: 0,
        pageSize: 50,
    },
    rowSelection: {} as RowSelectionState,
    globalFilter: '',
    expanded: {},
    columnOrder: [] as ColumnOrderState,
    columnPinning: {
        left: [],
        right: [],
    } as ColumnPinningState,
    customColumnFilter: {
        filters: [],
        logic: 'AND',
        pendingFilters: [],
        pendingLogic: 'AND',
    },
} as const;

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
    initilaLoadData = true,
    onFetchData,
    onDataStateChange,

    // Selection props
    enableRowSelection = false,
    enableMultiRowSelection = true,
    selectMode = 'page',
    onRowSelectionChange,

    // Bulk action props
    enableBulkActions = false,
    bulkActions = null,

    // Column resizing props
    enableColumnResizing = false,
    columnResizeMode = 'onChange',

    // Column ordering props
    draggable = false,
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
    enableColumnFilters = false,
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

    // Custom column filters props
    enableCustomColumnsFilter = false,

    // Data CRUD callbacks
    onDataChange,

    // Slots
    slots = {},
    slotProps = {},

}: DataTableProps<T>, ref: React.Ref<DataTableApi<T>>) {
    // Convert mode-based props to boolean flags for internal use
    const isServerMode = dataMode === 'server';
    const isServerPagination = paginationMode === 'server' || isServerMode;
    const isServerFiltering = filterMode === 'server' || isServerMode;
    const isServerSorting = sortingMode === 'server' || isServerMode;

    // Virtualization setup
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const initialStateConfig = useMemo(() => {
        return {
            ...DEFAULT_INITIAL_STATE,
            ...initialState,
        };
    }, [initialState]);

    // Local state management - using the initial state
    const [sorting, setSorting] = useState<SortingState>(initialStateConfig.sorting);
    const [pagination, setPagination] = useState(initialStateConfig.pagination);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialStateConfig.rowSelection);
    const [globalFilter, setGlobalFilter] = useState(initialStateConfig.globalFilter);
    
    // Server-side selection state (only used when dataMode='server' && selectMode='all')
    const [serverSelection, setServerSelection] = useState<ServerSelectionState>({
        selectAllMatching: false,
        excludedIds: [],
    });
    const [customColumnsFilter, setCustomColumnsFilter] = useState<CustomColumnFilterState>({
        filters: [],
        logic: 'AND',
        pendingFilters: [],
        pendingLogic: 'AND'
    });
    const [expanded, setExpanded] = useState(initialStateConfig.expanded);
    const [tableSize, setTableSize] = useState<DataTableSize>(initialTableSize);
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(initialStateConfig.columnOrder);
    const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(initialStateConfig.columnPinning);

    // Create internal ref for API (needs to be before enhancedColumns)
    const internalApiRef = useRef<DataTableApi<T>>(null);

    // Build enhanced columns with special columns
    const enhancedColumns = useMemo(
        () => {
            let columnsMap = [...columns];

            // Add expanding column first if enabled
            if (enableExpanding) {
                const expandingColumnMap = createExpandingColumn<T>({
                    ...(slotProps?.expandColumn || {}),
                });
                columnsMap = [expandingColumnMap, ...columnsMap];
            }

            // Add selection column second if enabled
            if (enableRowSelection) {
                const selectionColumnMap = createSelectionColumn<T>({
                    ...(slotProps?.selectionColumn || {}),
                    multiSelect: enableMultiRowSelection,
                    apiRef: internalApiRef,
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

    const { debouncedFetch, isLoading: fetchLoading } = useDebouncedFetch(onFetchData);

    // Server data state (only used when onFetchData is provided)
    const [serverData, setServerData] = useState<T[]>([]);
    const [serverTotal, setServerTotal] = useState(0);

    const fetchData = useCallback(async (overrides: Partial<TableState> = {}) => {
        if (!onFetchData) return;

        const filters: TableFiltersForFetch = {
            globalFilter,
            pagination,
            customColumnsFilter,
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
        customColumnsFilter,
        sorting,
        debouncedFetch,
    ]);

    // Use server data when available, otherwise use props data
    const tableData = onFetchData ? serverData : data;
    const tableTotalRow = onFetchData ? serverTotal : totalRow;
    const tableLoading = onFetchData ? (loading || fetchLoading) : loading;


    // Common function to notify data state changes
    const notifyDataStateChange = useCallback((overrides: Partial<TableFilters> = {}) => {
        if (onDataStateChange) {
            const currentState: TableFilters = {
                globalFilter,
                customColumnsFilter,
                sorting,
                pagination,
                columnOrder,
                columnPinning,
                ...overrides, // Allow overriding specific parts of the state
            };
            onDataStateChange(currentState);
        }
    }, [
        onDataStateChange,
        globalFilter,
        customColumnsFilter,
        sorting,
        pagination,
        columnOrder,
        columnPinning,
    ]);
    // Handle sorting change with custom logic for three-state sorting
    const handleSortingChange = useCallback((updaterOrValue: any) => {
        // Handle both updater function and direct value
        let newSorting = typeof updaterOrValue === 'function'
            ? updaterOrValue(sorting)
            : updaterOrValue;

        newSorting = newSorting.filter((sort: any) => sort.id);
        setSorting(newSorting);

        // Call external sorting handler for server-side sorting
        if (onSortingChange) {
            onSortingChange(newSorting);
        }

        // Notify state change for dynamic data
        notifyDataStateChange({ sorting: newSorting });
        fetchData({
            sorting: newSorting,
        });
    }, [
        sorting,
        onSortingChange,
        notifyDataStateChange,
        fetchData,
    ]);

    // Handle column order change
    const handleColumnOrderChange = useCallback((updatedColumnOrder: ColumnOrderState) => {
        setColumnOrder(updatedColumnOrder);

        // Call external column order handler
        if (onColumnDragEnd) {
            onColumnDragEnd(updatedColumnOrder);
        }
    }, [onColumnDragEnd]);

    // Handle column pinning change with special columns logic
    const handleColumnPinningChange = useCallback((updatedColumnPinning: ColumnPinningState) => {
        setColumnPinning(updatedColumnPinning);

        // Call external column pinning handler
        if (onColumnPinningChange) {
            onColumnPinningChange(updatedColumnPinning);
        }
    }, [onColumnPinningChange]);


    // Handle row selection change
    const handleRowSelectionChange = useCallback((updaterOrValue: any) => {
        // Handle both updater function and direct value
        const newSelection = typeof updaterOrValue === 'function'
            ? updaterOrValue(rowSelection)
            : updaterOrValue;

        setRowSelection(newSelection);

        if (onRowSelectionChange) {
            const selectedRows = Object.keys(newSelection)
                .filter(key => newSelection[key])
                .map(key => tableData.find(row => String(row[idKey]) === key))
                .filter(Boolean) as T[];
            onRowSelectionChange(selectedRows);
        }
    }, [
        rowSelection,
        tableData,
        idKey,
        onRowSelectionChange,
    ]);

    // Create table instance with initial state
    const table = useReactTable({
        _features: [CustomColumnFilterFeature], // Add the custom feature
        data: tableData,
        columns: enhancedColumns,
        initialState: {
            ...initialStateConfig,
        },
        state: {
            sorting,
            pagination: enablePagination ? pagination : undefined,
            rowSelection: enableRowSelection ? rowSelection : {},
            globalFilter: enableGlobalFilter ? globalFilter : undefined,
            expanded: enableExpanding ? expanded : {},
            columnOrder: draggable ? columnOrder : undefined,
            columnPinning: columnPinning,
            customColumnFilter: customColumnsFilter,
        },
        onSortingChange: enableSorting ? handleSortingChange : undefined,
        onPaginationChange: enablePagination ? (updater) => {
            const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
            setPagination(newPagination as any);

            // Notify state change for dynamic data
            notifyDataStateChange({ pagination: newPagination });
            fetchData({
                pagination: newPagination,
            });
        } : undefined,
        onRowSelectionChange: enableRowSelection ? handleRowSelectionChange : undefined,
        onGlobalFilterChange: enableGlobalFilter ? (updaterOrValue: any) => {
            // Handle both updater function and direct value
            const newFilter = typeof updaterOrValue === 'function'
                ? updaterOrValue(globalFilter)
                : updaterOrValue;

            setGlobalFilter(newFilter);

            // Notify state change for dynamic data
            notifyDataStateChange({ globalFilter: newFilter });
            fetchData({ globalFilter: newFilter });
        } : undefined,
        onExpandedChange: enableExpanding ? setExpanded : undefined,
        onColumnOrderChange: draggable ? handleColumnOrderChange : undefined,
        onColumnPinningChange: enableColumnPinning ? handleColumnPinningChange : undefined,
        // Handle column filters change (this will be triggered by our custom feature)
    
        
        onCustomColumnFilterChange: (updater) => {
            const currentState = table.getCustomColumnFilterState?.() || { 
                filters: [], 
                logic: 'AND',
                pendingFilters: [],
                pendingLogic: 'AND'
            };
            const newState = typeof updater === 'function' 
                ? updater(currentState)
                : updater;
            
            // Convert the custom feature state to the expected CustomColumnFilterState format
            const legacyFilterState = {
                filters: newState.filters,
                logic: newState.logic,
                pendingFilters: newState.pendingFilters,
                pendingLogic: newState.pendingLogic
            };
            handleColumnFilterStateChange(legacyFilterState);
        },

        // Handle when filters are actually applied (only then fetch data)
        onCustomColumnFilterApply: (appliedState) => {
            if (isServerFiltering) {
                const serverFilterState = {
                    filters: appliedState.filters,
                    logic: appliedState.logic,
                    pendingFilters: appliedState.pendingFilters,
                    pendingLogic: appliedState.pendingLogic,
                };

                notifyDataStateChange({
                    customColumnsFilter: serverFilterState,
                });

                fetchData({
                    customColumnsFilter: serverFilterState,
                });
            }
        },

        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: enableSorting && !isServerSorting ? getSortedRowModel() : undefined,
        getFilteredRowModel: !isServerFiltering ? getCombinedFilteredRowModel<T>() : undefined,
        getPaginationRowModel: enablePagination && !isServerPagination ? getPaginationRowModel() : undefined,

        // Sorting
        enableSorting: enableSorting,
        manualSorting: isServerSorting,

        // Filtering
        manualFiltering: isServerFiltering,

        // Selection
        enableRowSelection: enableRowSelection,
        enableMultiRowSelection: enableMultiRowSelection,

        // Column resizing
        enableColumnResizing: enableColumnResizing,
        columnResizeMode: columnResizeMode,

        // Column pinning
        enableColumnPinning: enableColumnPinning,

        // Expanding
        getRowCanExpand: enableExpanding ? getRowCanExpand : undefined,

        // Pagination
        manualPagination: isServerPagination,
        pageCount: enablePagination ? Math.ceil(tableTotalRow / pagination.pageSize) : -1,

        // Row ID
        getRowId: (row, index) => generateRowId(row, index, idKey),

        // Debug
        debugTable: false, // Disabled to prevent infinite logs
    });

    // Virtualization setup - with safety checks
    const rows = table.getRowModel()?.rows || [];

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => tableContainerRef.current,
        estimateSize: () => estimateRowHeight,
        overscan: 10,
        enabled: enableVirtualization && !enablePagination && rows.length > 0, // Disable with pagination or empty data
    });

    // Handle column filter changes with logic from ColumnFilter component
    const handleColumnFilterStateChange = useCallback((filterState: CustomColumnFilterState) => {
        if (filterState && typeof filterState === 'object') {
            setCustomColumnsFilter(filterState);
            
            // Call external column filters handler
            if (onColumnFiltersChange) {
                onColumnFiltersChange(filterState);
            }

            // For server-side filtering, don't fetch here - only on apply
            // Client-side filtering will happen through filterFns automatically
        }
    }, [
        onColumnFiltersChange,
    ]);

    const tableWidth = useMemo(() => {
        if (fitToScreen) {
            return '100%';
        }
        if (enableColumnResizing) {
            return table.getCenterTotalSize();
        }
        return '100%';
    }, [
        table,
        enableColumnResizing,
        fitToScreen,
    ]);

    const tableStyle = useMemo(() => ({
        width: tableWidth,
        minWidth: '100%',
    }), [tableWidth]);

    // Handle column reorder via drag and drop
    const handleColumnReorder = useCallback((draggedColumnId: string, targetColumnId: string) => {
        const currentOrder = table.getState().columnOrder || table.getAllLeafColumns().map((col, index) => {
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
    }, [table, handleColumnOrderChange]);


    useEffect(() => {
        if (initilaLoadData) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initilaLoadData]);

    // Initialize column order when columns change
    useEffect(() => {
        if (draggable && columnOrder.length === 0) {
            const initialOrder = enhancedColumns.map((col, index) => {
                // Use id if available, otherwise use accessorKey, otherwise generate unique id
                if (col.id) return col.id;
                const anyCol = col as any;
                if (anyCol.accessorKey && typeof anyCol.accessorKey === 'string') {
                    return anyCol.accessorKey;
                }
                return `column_${index}`;
            });
            setColumnOrder(initialOrder);
        }
    }, [
        draggable,
        enhancedColumns,
        columnOrder.length,
    ]);



    // Get slot components for rows and cells
    const LoadingRowSlot = getSlotComponent(slots, 'loadingRow', LoadingRows);
    const EmptyRowSlot = getSlotComponent(slots, 'emptyRow', EmptyDataRow);

    // Render table rows with slot support
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

        // Virtualized rendering
        if (enableVirtualization && !enablePagination && rows.length > 0) {
            const virtualItems = rowVirtualizer.getVirtualItems();

            return (
                <>
                    {/* Virtual spacer before visible items */}
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

                    {/* Render visible rows with slot support */}
                    {virtualItems.map((virtualRow) => {
                        const row = rows[virtualRow.index];
                        if (!row) return null; // Safety check

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

                    {/* Virtual spacer after visible items */}
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

        // Regular rendering (non-virtualized)
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



    // Export state management
    const [exportController, setExportController] = useState<AbortController | null>(null);
    const isExporting = useMemo(() => exportController !== null, [exportController]);

    const handleCancelExport = useCallback(() => {
        if (exportController) {
            exportController.abort();
            setExportController(null);
            if (onExportCancel) {
                onExportCancel();
            }
        }
    }, [exportController, onExportCancel]);

    // Expose imperative API via ref using custom hook
    useDataTableApi({
        table,
        data: tableData,
        idKey,
        globalFilter,
        customColumnsFilter,
        sorting,
        pagination,
        columnOrder,
        columnPinning,
        enhancedColumns,
        enablePagination,
        enableColumnPinning,
        initialPageIndex: pagination.pageIndex,
        initialPageSize: pagination.pageSize,
        pageSize: pagination.pageSize,
        // Selection props
        selectMode,
        serverSelection,
        onServerSelectionChange: setServerSelection,
        onSelectModeChange: (mode) => {
            // You could add a prop for this if needed
            console.log('Selection mode changed to:', mode);
        },
        totalRow: tableTotalRow,
        handleColumnFilterStateChange,
        onDataStateChange,
        onFetchData: onFetchData,
        onDataChange,
        // Export props
        exportFilename,
        onExportProgress,
        onExportComplete,
        onExportError,
        onServerExport,
        exportController,
        setExportController,
        isExporting,
        dataMode,
    }, ref);

    // Also assign to internal ref for context
    useEffect(() => {
        if (ref && 'current' in ref) {
            internalApiRef.current = ref.current;
        }
    }, [ref]);

    // Get slot components with fallbacks
    const RootSlot = getSlotComponent(slots, 'root', Box);
    const ToolbarSlot = getSlotComponent(slots, 'toolbar', DataTableToolbar);
    const BulkActionsSlot = getSlotComponent(slots, 'bulkActionsToolbar', BulkActionsToolbar);
    const TableContainerSlot = getSlotComponent(slots, 'tableContainer', TableContainer);
    const TableSlot = getSlotComponent(slots, 'table', Table);
    const BodySlot = getSlotComponent(slots, 'body', TableBody);
    const FooterSlot = getSlotComponent(slots, 'footer', Box);
    const PaginationSlot = getSlotComponent(slots, 'pagination', DataTablePagination);

    // Base props for all slots
    const baseSlotProps = {
        table,
        data: tableData,
        columns: enhancedColumns,
    };

    return (
        <DataTableProvider
            table={table}
            apiRef={internalApiRef}
            dataMode={dataMode}
            tableSize={tableSize}
            onTableSizeChange={(size) => {
                setTableSize(size);
            }}
            customColumnsFilter={customColumnsFilter}
            onChangeCustomColumnsFilter={handleColumnFilterStateChange}
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
                {...baseSlotProps}
                {...slotProps?.root}
            >
                {/* Toolbar */}
                {(enableGlobalFilter || extraFilter) ? (
                    <ToolbarSlot
                        {...baseSlotProps}
                        extraFilter={extraFilter}
                        enableGlobalFilter={enableGlobalFilter}
                        enableColumnVisibility={enableColumnVisibility}
                        enableColumnFilter={enableCustomColumnsFilter}
                        enableExport={enableExport}
                        enableReset={enableReset}
                        enableTableSizeControl={enableTableSizeControl}
                        enableColumnPinning={enableColumnPinning}
                        {...slotProps?.toolbar}
                    />
                ) : null}

                {/* Bulk Actions Toolbar - shown when rows are selected */}
                {enableBulkActions && enableRowSelection && (
                    Object.keys(rowSelection).length > 0 || 
                    (isServerMode && selectMode === 'all' && serverSelection.selectAllMatching)
                ) ? (
                    <BulkActionsSlot
                        {...baseSlotProps}
                        selectedRows={table.getSelectedRowModel().rows.map(row => row.original)}
                        selectedRowCount={isServerMode && selectMode === 'all' && serverSelection.selectAllMatching
                            ? tableTotalRow - serverSelection.excludedIds.length
                            : Object.keys(rowSelection).filter(key => rowSelection[key]).length
                        }
                        bulkActions={(selectedRows) => {
                            // Pass the selection payload to bulk actions
                            const api = internalApiRef.current;
                            const payload = api?.selection.getSelectionPayload();
                            console.log('Bulk action payload:', payload);
                            return bulkActions ? bulkActions(selectedRows) : null;
                        }}
                        sx={{
                            position: 'relative',
                            zIndex: 2, // Higher than sticky header
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
                            draggable={draggable}
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
                            {...baseSlotProps}
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
