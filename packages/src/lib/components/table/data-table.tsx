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
    getFilteredRowModel,
    getPaginationRowModel,
    RowSelectionState,
    ColumnOrderState,
    ColumnPinningState,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useState, useCallback, useMemo, useRef, useEffect, forwardRef } from 'react';


// Import from new organized structure
import { DataTableProvider } from '../../contexts/data-table-context';
import { useDataTableApi } from '../../hooks/use-data-table-api';
import { DataTableSize, generateRowId, getFormattedValue } from '../../utils';
import { useDebouncedFetch } from '../../utils/debounced-fetch.utils';
import { getSlotComponent } from '../../utils/slot-helpers';
import { TableHeader } from '../headers';
import { DataTablePagination } from '../pagination';
import { DataTableRow, LoadingRows, EmptyDataRow } from '../rows';
import { DataTableToolbar, BulkActionsToolbar } from '../toolbar';
import { DataTableProps } from './data-table.types';
import { ICustomColumnFilter, TableFilters, TableFiltersForFetch, TableState } from '../../types';
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

    // Data management mode (MUI DataGrid style)
    dataMode = 'client',
    initilaLoadData = true,
    onFetchData,
    onDataStateChange,

    // Selection props
    enableRowSelection = false,
    enableMultiRowSelection = true,
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

    // Build enhanced columns with special columns
    const enhancedColumns = useMemo(
        () => {
            let columnsMap = [...columns].map((col: any) => {
                // Auto-create cell for valueGetter/valueFormatter
                if ((col.valueGetter || col.valueFormatter) && !col.cell) {
                    return {
                        ...col,
                        cell: ({ row, getValue }: any) => {
                            return getFormattedValue({
                                row,
                                getValue,
                                column: col,
                            });
                        },
                    };
                }
                return col;
            });

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
    const [customColumnsFilter, setCustomColumnsFilter] = useState<ICustomColumnFilter>();
    const [expanded, setExpanded] = useState(initialStateConfig.expanded);
    const [tableSize, setTableSize] = useState<DataTableSize>(initialTableSize);
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(initialStateConfig.columnOrder);
    const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(initialStateConfig.columnPinning);

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

        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: enableSorting && !isServerSorting ? getSortedRowModel() : undefined,
        getFilteredRowModel: (enableGlobalFilter || enableColumnFilters) && !isServerFiltering ? getFilteredRowModel() : undefined,
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
        debugTable: process.env.NODE_ENV === 'development',
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
    const handleColumnFilterStateChange = useCallback((filterState: ICustomColumnFilter) => {
        if (filterState && typeof filterState === 'object') {
            setCustomColumnsFilter(filterState);
            // Call external column filters handler
            if (onColumnFiltersChange) {
                onColumnFiltersChange(filterState);
            }

            // Notify state change for server-side filtering
            if (isServerFiltering) {
                notifyDataStateChange({
                    customColumnsFilter: filterState,
                });

                fetchData({
                    customColumnsFilter: filterState,
                });
            }
        }
    }, [
        onColumnFiltersChange,
        isServerFiltering,
        notifyDataStateChange,
        fetchData,
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

    // Create internal ref for API
    const internalApiRef = useRef<DataTableApi<T>>(null);

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
        handleColumnFilterStateChange,
        onDataStateChange,
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
                        enableColumnFilter={enableColumnFilters}
                        enableExport={enableExport}
                        enableReset={enableReset}
                        enableTableSizeControl={enableTableSizeControl}
                        enableColumnPinning={enableColumnPinning}
                        {...slotProps?.toolbar}
                    />
                ) : null}

                {/* Bulk Actions Toolbar - shown when rows are selected */}
                {enableBulkActions && enableRowSelection && Object.keys(rowSelection).length > 0 ? (
                    <BulkActionsSlot
                        {...baseSlotProps}
                        selectedRows={Object.keys(rowSelection)
                            .filter(key => rowSelection[key])
                            .map(key => tableData.find(row => String(row[idKey]) === key))
                            .filter(Boolean) as T[]}
                        selectedRowCount={Object.keys(rowSelection).filter(key => rowSelection[key]).length}
                        bulkActions={bulkActions}
                        enableSelectAll={enableMultiRowSelection}
                        onSelectAll={() => {
                            const allRowIds = tableData.reduce((acc, row) => {
                                acc[String(row[idKey])] = true;
                                return acc;
                            }, {} as RowSelectionState);
                            setRowSelection(allRowIds);
                        }}
                        onDeselectAll={() => {
                            setRowSelection({});
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
