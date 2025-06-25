/**
 * Hook Configuration Types
 * Consolidated hook-related interfaces from various hook files
 */
import {
    SortingState,
    VisibilityState,
    ColumnOrderState,
    ColumnPinningState,
    PaginationState,
} from '@tanstack/react-table';

import { ICustomColumnFilter } from './table.types';


/**
 * Table state hook options
 */
export interface UseTableStateOptions {
    initialSorting?: SortingState;
    initialColumnFilters?: ICustomColumnFilter;
    initialGlobalFilter?: string;
    initialColumnVisibility?: VisibilityState;
    initialColumnOrder?: ColumnOrderState;
    initialColumnPinning?: ColumnPinningState;
    initialPagination?: PaginationState;
}

/**
 * Table state actions for hooks
 */
export interface TableStateActions {
    setSorting: (sorting: SortingState) => void;
    setColumnFilters: (filters: ICustomColumnFilter) => void;
    setGlobalFilter: (filter: string) => void;
    setColumnVisibility: (visibility: VisibilityState) => void;
    setColumnOrder: (order: ColumnOrderState) => void;
    setColumnPinning: (pinning: ColumnPinningState) => void;
    setPagination: (pagination: PaginationState) => void;
    resetTableState: () => void;
}
