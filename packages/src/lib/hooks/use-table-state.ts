/**
 * Table State Management Hook
 *
 * Centralized state management for DataTable component
 */
import {
    SortingState,
    VisibilityState,
    ColumnOrderState,
    ColumnPinningState,
    PaginationState,
} from '@tanstack/react-table';
import { useState, useCallback, useMemo } from 'react';


// Import types from centralized location
import type { UseTableStateOptions, TableStateActions, CustomColumnFilterState } from '../types';


/**
 * Hook for managing all table state in one place
 */
export function useTableState(options: UseTableStateOptions = {}) {
    const {
        initialSorting = [],
        initialColumnFilters = {
            filters: [],
            logic: 'AND',
            pendingFilters: [],
            pendingLogic: 'AND',
        },
        initialGlobalFilter = '',
        initialColumnVisibility = {},
        initialColumnOrder = [],
        initialColumnPinning = {},
        initialPagination = {
            pageIndex: 0,
            pageSize: 50,
        },
    } = options;

    // State
    const [sorting, setSorting] = useState<SortingState>(initialSorting);
    const [columnFilters, setColumnFilters] = useState<CustomColumnFilterState>(initialColumnFilters);
    const [globalFilter, setGlobalFilter] = useState<string>(initialGlobalFilter);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility);
    const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(initialColumnOrder);
    const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(initialColumnPinning);
    const [pagination, setPagination] = useState<PaginationState>(initialPagination);

    // Reset function
    const resetTableState = useCallback(() => {
        setSorting(initialSorting);
        setColumnFilters(initialColumnFilters);
        setGlobalFilter(initialGlobalFilter);
        setColumnVisibility(initialColumnVisibility);
        setColumnOrder(initialColumnOrder);
        setColumnPinning(initialColumnPinning);
        setPagination(initialPagination);
    }, [
        initialSorting,
        initialColumnFilters,
        initialGlobalFilter,
        initialColumnVisibility,
        initialColumnOrder,
        initialColumnPinning,
        initialPagination,
    ]);

    // Combined state object
    const tableState = useMemo(() => ({
        sorting,
        columnFilters,
        globalFilter,
        columnVisibility,
        columnOrder,
        columnPinning,
        pagination,
    }), [
        sorting,
        columnFilters,
        globalFilter,
        columnVisibility,
        columnOrder,
        columnPinning,
        pagination,
    ]);

    // Actions object
    const actions: TableStateActions = useMemo(() => ({
        setSorting,
        setColumnFilters,
        setGlobalFilter,
        setColumnVisibility,
        setColumnOrder,
        setColumnPinning,
        setPagination,
        resetTableState,
    }), [resetTableState]);

    return {
        state: tableState,
        actions,
    };
}
