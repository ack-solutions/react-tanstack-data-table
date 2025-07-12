import { ColumnOrderState, ColumnPinningState, SortingState, Table } from '@tanstack/react-table';
import { Ref, useCallback, useImperativeHandle } from 'react';

import { ColumnFilterState,  TableFilters,  TableState } from '../types';
import { DataTableApi } from '../types/data-table-api';
import { exportClientData, exportServerData } from '../utils/export-utils';
import { SelectionState } from '../features';
// import { 
//     toggleSelectAll as helperToggleSelectAll,
//     selectAll as helperSelectAll,
//     deselectAll as helperDeselectAll,
//     toggleRowSelection as helperToggleRowSelection,
//     isAllSelected as helperIsAllSelected,
//     isSomeSelected as helperIsSomeSelected,
//     isRowSelected as helperIsRowSelected,
//     getSelectedCount as helperGetSelectedCount,
//     SelectionHelperConfig
// } from '../utils/selection-helpers';


interface UseDataTableApiProps<T> {
    table: Table<T>;
    idKey: keyof T;
    enhancedColumns: any[];
    enablePagination: boolean;
    enableColumnPinning: boolean;
    initialStateConfig: Partial<TableState>;

    // Selection props
    selectMode?: 'page' | 'all';
    // Selection state now handled by TanStack Table custom feature
    onSelectionChange?: (state: SelectionState) => void;

    // Handlers
    handleColumnFilterStateChange: (filterState: ColumnFilterState) => void;

    // Callbacks
    onDataStateChange?: (state: Partial<TableState>) => void;
    onFetchData?: (filters: Partial<TableFilters>) => void;
    onDataChange?: (newData: T[]) => void;

    // Export props
    exportFilename?: string;
    onExportProgress?: (progress: { processedRows?: number; totalRows?: number; percentage?: number }) => void;
    onExportComplete?: (result: { success: boolean; filename: string; totalRows: number }) => void;
    onExportError?: (error: { message: string; code: string }) => void;
    onServerExport?: (filters?: Partial<TableFilters>, selection?: any) => Promise<{ data: any[]; total: number }>;
    exportController?: AbortController | null;
    setExportController?: (controller: AbortController | null) => void;
    isExporting?: boolean;
    dataMode?: 'client' | 'server';
}

export function useDataTableApi<T extends Record<string, any>>(
    props: UseDataTableApiProps<T>,
    ref: Ref<DataTableApi<T>>,
) {
    const {
        table,
        idKey,
        enhancedColumns,
        enablePagination,
        enableColumnPinning,
        initialStateConfig,
        // Selection props
        selectMode = 'page',
        onSelectionChange,
        handleColumnFilterStateChange,
        onDataStateChange,
        onFetchData,
        onDataChange,
        // Export props
        exportFilename = 'export',
        onExportProgress,
        onExportComplete,
        onExportError,
        onServerExport,
        exportController,
        setExportController,
        isExporting,
        dataMode = 'client',
    } = props;

    // Note: Custom selection is now handled by TanStack Table CustomSelectionFeature

    const getTableFilters = useCallback(( withAllState: boolean = false)=> {
        const state = table.getState();
        return {
            sorting: state.sorting,
            globalFilter: state.globalFilter,
            columnFilter: state.columnFilter,
            pagination: state.pagination,
            ...(withAllState ? {
                columnOrder: state.columnOrder,
                columnPinning: state.columnPinning,
                columnVisibility: state.columnVisibility,
                columnSizing: state.columnSizing,
            } : {}),
           
        } as Partial<TableFilters>;
    }, [table]);

    useImperativeHandle(ref, () => ({
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
                table.setColumnPinning(table.initialState.columnPinning);
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
                table.resetGlobalFilter();
                handleColumnFilterStateChange({
                    filters: [],
                    logic: 'AND',
                    pendingFilters: [],
                    pendingLogic: 'AND',
                });
            },
        },

        // Sorting
        sorting: {
            setSorting: (sortingState: SortingState) => {
                table.setSorting(sortingState);
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
                table.resetSorting();
            },
        },

        // Pagination
        pagination: {
            goToPage: (pageIndex: number) => {
                table.setPageIndex(pageIndex);
            },
            nextPage: () => {
                table.nextPage();
            },
            previousPage: () => {
                table.previousPage();
            },
            setPageSize: (pageSize: number) => {
                table.setPageSize(pageSize);
            },
            goToFirstPage: () => {
                table.setPageIndex(0);
            },
            goToLastPage: () => {
                const pageCount = table.getPageCount();
                if (pageCount > 0) {
                    table.setPageIndex(pageCount - 1);
                }
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
            getSelectedRows: ()=>table.getSelectedRows(),
            getSelectedCount: () => table.getSelectedCount(),
            isRowSelected: (rowId) => table.getIsRowSelected(rowId) || false,
        },

        // Data Management
        data: {
            refresh: () => {
                const filters = getTableFilters();
                filters.pagination = {
                    pageIndex: 0,
                    pageSize: filters.pagination?.pageSize || initialStateConfig.pagination?.pageSize || 10,
                };
                const allState = getTableFilters(true);

                onDataStateChange?.(allState);
                onFetchData?.(filters);
            },
            reload: () => {
                const filters = getTableFilters();
                const allState = getTableFilters(true);

                onDataStateChange?.(allState);
                onFetchData?.(filters);
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
                onDataChange?.(newData || []);
            },
            updateRowByIndex: (index: number, updates: Partial<T>) => {
                const newData = table.getRowModel().rows?.map(row => row.original);
                if (newData?.[index]) {
                    newData[index] = {
                        ...newData[index]!,
                        ...updates,
                    };
                    onDataChange(newData);
                }
            },
            insertRow: (newRow: T, index?: number) => {
                const newData = table.getRowModel().rows?.map(row => row.original) || [];
                if (index !== undefined) {
                    newData.splice(index, 0, newRow);
                } else {
                    newData.push(newRow);
                }
                onDataChange(newData || []);
            },
            deleteRow: (rowId: string) => {
                const newData = (table.getRowModel().rows || [])?.filter(row => String(row.original[idKey]) !== rowId);
                onDataChange?.(newData?.map(row => row.original) || []);
            },
            deleteRowByIndex: (index: number) => {
                const newData = (table.getRowModel().rows || [])?.map(row => row.original);
                newData.splice(index, 1);
                onDataChange(newData);
            },
            deleteSelectedRows: () => {
                const selectedRowIds = Object.keys(table.getState().rowSelection)
                    .filter(key => table.getState().rowSelection[key]);
                const newData = (table.getRowModel().rows || [])?.filter(row => !selectedRowIds.includes(String(row.original[idKey])));
                onDataChange(newData?.map(row => row.original) || []);
                // Clear selection after deletion
                table.resetRowSelection();
            },
            replaceAllData: (newData: T[]) => {
                onDataChange?.(newData);
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
                onDataChange(newData || []);
            },
            insertMultipleRows: (newRows: T[], startIndex?: number) => {
                const newData = (table.getRowModel().rows || [])?.map(row => row.original);
                if (startIndex !== undefined) {
                    newData.splice(startIndex, 0, ...newRows);
                } else {
                    newData.push(...newRows);
                }
                onDataChange?.(newData);
            },
            deleteMultipleRows: (rowIds: string[]) => {
                const idsToDelete = new Set(rowIds);
                const newData = (table.getRowModel().rows || [])?.filter(row => !idsToDelete.has(String(row.original[idKey])))?.map(row => row.original);
                onDataChange(newData);
            },

            // Field-specific updates
            updateField: (rowId: string, fieldName: keyof T, value: any) => {
                const newData = (table.getRowModel().rows || [])?.map(row => String(row.original[idKey]) === rowId
                    ? {
                        ...row.original,
                        [fieldName]: value,
                    }
                    : row.original);
                onDataChange?.(newData);
            },
            updateFieldByIndex: (index: number, fieldName: keyof T, value: any) => {
                const newData = (table.getRowModel().rows || [])?.map(row => row.original);
                if (newData[index]) {
                    newData[index] = {
                        ...newData[index],
                        [fieldName]: value,
                    };
                    onDataChange?.(newData);
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
            exportCSV: async (options = {}) => {
                const { filename = exportFilename, } = options;

                try {
                    // Create abort controller for this export
                    const controller = new AbortController();
                    setExportController?.(controller);

                    if (dataMode === 'server' && onServerExport) {
                        // Server export with selection data
                        const currentFilters = {
                            globalFilter : table.getState().globalFilter,
                            columnFilter: table.getState().columnFilter,
                            sorting: table.getState().sorting,
                            pagination: table.getState().pagination,
                        };
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
            exportExcel: async (options = {}) => {
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
                } finally {
                    setExportController?.(null);
                }
            },
            // Export state
            isExporting: () => isExporting || false,
            cancelExport: () => {
                exportController?.abort();
                setExportController?.(null);
            },
        },
    }), [
        table,
        enhancedColumns,
        handleColumnFilterStateChange,
        idKey,
        onDataStateChange,
        onFetchData,
        onDataChange,
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
}
