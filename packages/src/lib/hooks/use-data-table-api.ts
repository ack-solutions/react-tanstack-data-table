import { ColumnOrderState, ColumnPinningState, SortingState, Table } from '@tanstack/react-table';
import { Ref, useImperativeHandle } from 'react';

import { CustomColumnFilterState, TableFilters, TableState } from '../types';
import { DataTableApi } from '../types/data-table-api';
import { exportClientData, exportServerData } from '../utils/export-utils';


interface UseDataTableApiProps<T> {
    table: Table<T>;
    data: T[];
    idKey: keyof T;
    globalFilter: string;
    customColumnsFilter: CustomColumnFilterState;
    sorting: SortingState;
    pagination: { pageIndex: number; pageSize: number };
    columnOrder: ColumnOrderState;
    columnPinning: ColumnPinningState;
    enhancedColumns: any[];
    enablePagination: boolean;
    enableColumnPinning: boolean;
    initialPageIndex: number;
    initialPageSize?: number;
    pageSize: number;

    // Handlers
    handleColumnFilterStateChange: (filterState: CustomColumnFilterState) => void;

    // Callbacks
    onDataStateChange?: (state: Partial<TableState>) => void;
    onFetchData?: (filters: Partial<TableState>) => void;
    onDataChange?: (newData: T[]) => void;

    // Export props
    exportFilename?: string;
    onExportProgress?: (progress: { processedRows: number; totalRows: number; percentage: number }) => void;
    onExportComplete?: (result: { success: boolean; filename: string; totalRows: number }) => void;
    onExportError?: (error: { message: string; code: string }) => void;
    onServerExport?: (filters?: Partial<TableState>) => Promise<{ data: any[]; total: number }>;
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
        data,
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
        initialPageIndex,
        initialPageSize,
        pageSize,
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
            setCustomColumnFilters: (filters: CustomColumnFilterState) => {
                handleColumnFilterStateChange(filters);
            },
            addColumnFilter: (columnId: string, operator: string, value: any) => {
                const newFilter = {
                    id: `filter_${Date.now()}`,
                    columnId,
                    operator,
                    value,
                };

                const currentFilters = customColumnsFilter.filters || [];
                const newFilters = [...currentFilters, newFilter];
                handleColumnFilterStateChange({
                    filters: newFilters,
                    logic: customColumnsFilter.logic,
                });
            },
            removeColumnFilter: (filterId: string) => {
                const currentFilters = customColumnsFilter.filters || [];
                const newFilters = currentFilters.filter((f: any) => f.id !== filterId);
                handleColumnFilterStateChange({
                    filters: newFilters,
                    logic: customColumnsFilter.logic,
                });
            },
            clearAllFilters: () => {
                table.setGlobalFilter('');
                handleColumnFilterStateChange({
                    filters: [],
                    logic: 'AND',
                });
            },
            resetFilters: () => {
                table.resetGlobalFilter();
                handleColumnFilterStateChange({
                    filters: [],
                    logic: 'AND',
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

        // Row Selection
        selection: {
            selectRow: (rowId: string) => {
                table.getRow(rowId)?.toggleSelected(true);
            },
            deselectRow: (rowId: string) => {
                table.getRow(rowId)?.toggleSelected(false);
            },
            toggleRowSelection: (rowId: string) => {
                table.getRow(rowId)?.toggleSelected();
            },
            selectAllRows: () => {
                table.toggleAllRowsSelected(true);
            },
            deselectAllRows: () => {
                table.toggleAllRowsSelected(false);
            },
            getSelectedRows: () => {
                return Object.keys(table.getState().rowSelection)
                    .filter(key => table.getState().rowSelection[key])
                    .map(key => data.find(row => String(row[idKey]) === key))
                    .filter(Boolean) as T[];
            },
            getSelectedRowIds: () => {
                return Object.keys(table.getState().rowSelection)
                    .filter(key => table.getState().rowSelection[key]);
            },
        },

        // Data Management
        data: {
            refresh: () => {
                // Call external data state change handler to trigger refresh
                const currentFilters = {
                    globalFilter,
                    customColumnsFilter: customColumnsFilter,
                    sorting,
                    pagination,
                };
                if (onDataStateChange) {
                    const currentState: TableFilters = {
                        ...currentFilters,
                        columnOrder,
                        columnPinning,
                    };
                    onDataStateChange(currentState);
                }
                if (onFetchData) {
                    onFetchData(currentFilters)
                }
            },
            reload: () => {
                // Same as refresh for now
                const currentFilters = {
                    globalFilter,
                    customColumnsFilter: customColumnsFilter,
                    sorting,
                    pagination,
                };
                if (onDataStateChange) {
                    const currentState: TableFilters = {
                        ...currentFilters,
                        columnOrder,
                        columnPinning,
                    };
                    onDataStateChange({ ...currentState });
                }
                if (onFetchData) {
                    onFetchData({ ...currentFilters });
                }
            },
            // Data CRUD operations
            getAllData: () => {
                return [...data];
            },
            getRowData: (rowId: string) => {
                return data.find(row => String(row[idKey]) === rowId);
            },
            getRowByIndex: (index: number) => {
                return data[index];
            },
            updateRow: (rowId: string, updates: Partial<T>) => {
                const newData = data.map(row => String(row[idKey]) === rowId
                    ? {
                        ...row,
                        ...updates,
                    }
                    : row);
                onDataChange?.(newData);
            },
            updateRowByIndex: (index: number, updates: Partial<T>) => {
                const newData = [...data];
                if (newData[index]) {
                    newData[index] = {
                        ...newData[index],
                        ...updates,
                    };
                    onDataChange?.(newData);
                }
            },
            insertRow: (newRow: T, index?: number) => {
                const newData = [...data];
                if (index !== undefined) {
                    newData.splice(index, 0, newRow);
                } else {
                    newData.push(newRow);
                }
                onDataChange?.(newData);
            },
            deleteRow: (rowId: string) => {
                const newData = data.filter(row => String(row[idKey]) !== rowId);
                onDataChange?.(newData);
            },
            deleteRowByIndex: (index: number) => {
                const newData = [...data];
                newData.splice(index, 1);
                onDataChange?.(newData);
            },
            deleteSelectedRows: () => {
                const selectedRowIds = Object.keys(table.getState().rowSelection)
                    .filter(key => table.getState().rowSelection[key]);
                const newData = data.filter(row => !selectedRowIds.includes(String(row[idKey])));
                onDataChange?.(newData);
                // Clear selection after deletion
                table.resetRowSelection();
            },
            replaceAllData: (newData: T[]) => {
                onDataChange?.(newData);
            },

            // Bulk operations
            updateMultipleRows: (updates: Array<{ rowId: string; data: Partial<T> }>) => {
                const updateMap = new Map(updates.map(u => [u.rowId, u.data]));
                const newData = data.map(row => {
                    const rowId = String(row[idKey]);
                    const updateData = updateMap.get(rowId);
                    return updateData ? {
                        ...row,
                        ...updateData,
                    } : row;
                });
                onDataChange?.(newData);
            },
            insertMultipleRows: (newRows: T[], startIndex?: number) => {
                const newData = [...data];
                if (startIndex !== undefined) {
                    newData.splice(startIndex, 0, ...newRows);
                } else {
                    newData.push(...newRows);
                }
                onDataChange?.(newData);
            },
            deleteMultipleRows: (rowIds: string[]) => {
                const idsToDelete = new Set(rowIds);
                const newData = data.filter(row => !idsToDelete.has(String(row[idKey])));
                onDataChange?.(newData);
            },

            // Field-specific updates
            updateField: (rowId: string, fieldName: keyof T, value: any) => {
                const newData = data.map(row => String(row[idKey]) === rowId
                    ? {
                        ...row,
                        [fieldName]: value,
                    }
                    : row);
                onDataChange?.(newData);
            },
            updateFieldByIndex: (index: number, fieldName: keyof T, value: any) => {
                const newData = [...data];
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
                return data.filter(predicate);
            },
            findRowIndex: (predicate: (row: T) => boolean) => {
                return data.findIndex(predicate);
            },
            getDataCount: () => {
                return data.length;
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

                handleColumnFilterStateChange({
                    filters: [],
                    logic: 'AND',
                });

                if (enablePagination) {
                    table.setPageIndex(initialPageIndex);
                    table.setPageSize(initialPageSize || pageSize);
                }

                if (enableColumnPinning) {
                    table.setColumnPinning({
                        left: [],
                        right: [],
                    });
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
                    customColumnsFilter: customColumnsFilter,
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
                if (layout.customColumnsFilter) {
                    handleColumnFilterStateChange(layout.customColumnsFilter);
                }
            },
        },

        // Table State
        state: {
            getTableState: () => {
                return table.getState();
            },
            getCurrentFilters: () => {
                return customColumnsFilter;
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
                const {
                    filename = exportFilename,
                    onlyVisibleColumns = true,
                    onlySelectedRows,
                    includeHeaders = true,
                } = options;

                try {
                    // Create abort controller for this export
                    const controller = new AbortController();
                    setExportController?.(controller);

                    if (dataMode === 'server' && onServerExport) {
                        // Server export
                        const currentFilters = {
                            globalFilter,
                            customColumnsFilter,
                            sorting,
                            pagination,
                            columnOrder,
                            columnPinning,
                        };

                        await exportServerData(table, {
                            format: 'csv',
                            filename,
                            fetchData: onServerExport,
                            currentFilters,
                            pageSize: 1000,
                            includeHeaders,
                            onProgress: onExportProgress,
                            onComplete: onExportComplete,
                            onError: onExportError,
                        });
                    } else {
                        // Client export - auto-detect selected rows if not specified
                        const hasSelectedRows = Object.keys(table.getState().rowSelection).some(
                            key => table.getState().rowSelection[key],
                        );
                        const shouldExportSelected = onlySelectedRows !== undefined
                            ? onlySelectedRows
                            : hasSelectedRows;

                        await exportClientData(table, {
                            format: 'csv',
                            filename,
                            onlyVisibleColumns,
                            onlySelectedRows: shouldExportSelected,
                            includeHeaders,
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
                const {
                    filename = exportFilename,
                    onlyVisibleColumns = true,
                    onlySelectedRows,
                    includeHeaders = true,
                } = options;

                try {
                    // Create abort controller for this export
                    const controller = new AbortController();
                    setExportController?.(controller);

                    if (dataMode === 'server' && onServerExport) {
                        // Server export
                        const currentFilters = {
                            globalFilter,
                            customColumnsFilter,
                            sorting,
                            pagination,
                            columnOrder,
                            columnPinning,
                        };

                        await exportServerData(table, {
                            format: 'excel',
                            filename,
                            fetchData: onServerExport,
                            currentFilters,
                            pageSize: 1000,
                            includeHeaders,
                            onProgress: onExportProgress,
                            onComplete: onExportComplete,
                            onError: onExportError,
                        });
                    } else {
                        // Client export - auto-detect selected rows if not specified
                        const hasSelectedRows = Object.keys(table.getState().rowSelection).some(
                            key => table.getState().rowSelection[key],
                        );
                        const shouldExportSelected = onlySelectedRows !== undefined
                            ? onlySelectedRows
                            : hasSelectedRows;

                        await exportClientData(table, {
                            format: 'excel',
                            filename,
                            onlyVisibleColumns,
                            onlySelectedRows: shouldExportSelected,
                            includeHeaders,
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
                    pageSize = 1000,
                    includeHeaders = true,
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
                        globalFilter,
                        customColumnsFilter,
                        sorting,
                        pagination,
                        columnOrder,
                        columnPinning,
                    };

                    await exportServerData(table, {
                        format,
                        filename,
                        fetchData,
                        currentFilters,
                        pageSize,
                        includeHeaders,
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
        customColumnsFilter,
        data,
        idKey,
        onDataStateChange,
        onFetchData,
        globalFilter,
        sorting,
        pagination,
        columnOrder,
        columnPinning,
        onDataChange,
        enableColumnPinning,
        enablePagination,
        initialPageIndex,
        initialPageSize,
        pageSize,
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
    ]);
}
