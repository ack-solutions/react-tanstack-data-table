/**
 * Custom Column Filter Feature for TanStack Table
 * 
 * This feature adds advanced column filtering capabilities to TanStack Table
 * following the official custom features pattern introduced in v8.14.0
 */
import {
    Table,
    TableFeature,
    RowData,
    Updater,
    functionalUpdate,
    makeStateUpdater,
    RowModel,
    Row,
    getFilteredRowModel as getDefaultFilter,
} from '@tanstack/react-table';

// Import from types to avoid circular dependency
import type { CustomColumnFilterState } from '../types/table.types';
import moment from 'moment';

// Types for the custom column filter feature
export interface ColumnFilterRule {
    id: string;
    columnId: string;
    operator: string;
    value: any;
    columnType?: string;
}



export interface CustomColumnFilterOptions {
    enableCustomColumnFilter?: boolean;
    onCustomColumnFilterChange?: (updater: Updater<CustomColumnFilterState>) => void;
    // Add callback for when filters are applied
    onCustomColumnFilterApply?: (state: CustomColumnFilterState) => void;
}

export interface CustomColumnFilterTableState {
    customColumnFilter: CustomColumnFilterState;
}

// Declaration merging to extend TanStack Table types
declare module '@tanstack/table-core' {
    interface TableState extends CustomColumnFilterTableState { }
    interface TableOptionsResolved<TData extends RowData>
        extends CustomColumnFilterOptions { }
    interface Table<TData extends RowData> extends CustomColumnFilterInstance<TData> { }
}

// Table instance methods for custom column filtering
export interface CustomColumnFilterInstance<TData extends RowData> {
    setCustomColumnFilter: (updater: Updater<CustomColumnFilterState>) => void;

    // Pending filter methods (for draft state)
    addPendingColumnFilter: (columnId: string, operator: string, value: any) => void;
    updatePendingColumnFilter: (filterId: string, updates: Partial<ColumnFilterRule>) => void;
    removePendingColumnFilter: (filterId: string) => void;
    clearAllPendingColumnFilters: () => void;
    setPendingFilterLogic: (logic: 'AND' | 'OR') => void;

    // Apply pending filters to active filters
    applyPendingColumnFilters: () => void;

    // Legacy methods (for backward compatibility)
    addColumnFilter: (columnId: string, operator: string, value: any) => void;
    updateColumnFilter: (filterId: string, updates: Partial<ColumnFilterRule>) => void;
    removeColumnFilter: (filterId: string) => void;
    clearAllColumnFilters: () => void;
    setFilterLogic: (logic: 'AND' | 'OR') => void;

    // Getters
    getActiveColumnFilters: () => ColumnFilterRule[];
    getPendingColumnFilters: () => ColumnFilterRule[];
    getCustomColumnFilterState: () => CustomColumnFilterState;
}

// The custom feature implementation
export const CustomColumnFilterFeature: TableFeature<any> = {
    // Define the feature's initial state
    getInitialState: (state): CustomColumnFilterTableState => {
        return {
            customColumnFilter: {
                filters: [],
                logic: 'AND',
                pendingFilters: [],
                pendingLogic: 'AND',
            },
            ...state,
        };
    },

    // Define the feature's default options
    getDefaultOptions: <TData extends RowData>(
        table: Table<TData>
    ): CustomColumnFilterOptions => {
        return {
            enableCustomColumnFilter: true,
            onCustomColumnFilterChange: makeStateUpdater('customColumnFilter', table),
            onCustomColumnFilterApply: (state) => {
                // Implementation of onCustomColumnFilterApply
            },
        } as CustomColumnFilterOptions;
    },

    // Define the feature's table instance methods
    createTable: <TData extends RowData>(table: Table<TData>): void => {
        table.setCustomColumnFilter = (updater) => {
            const safeUpdater: Updater<CustomColumnFilterState> = (old) => {
                const newState = functionalUpdate(updater, old);
                return newState;
            };
            return table.options.onCustomColumnFilterChange?.(safeUpdater);
        };

        // === PENDING FILTER METHODS (Draft state) ===
        table.addPendingColumnFilter = (columnId: string, operator: string, value: any) => {
            table.setCustomColumnFilter((old) => {
                const newFilter: ColumnFilterRule = {
                    id: `filter_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    columnId,
                    operator,
                    value,
                };
                return {
                    ...old,
                    pendingFilters: [...old.pendingFilters, newFilter],
                };
            });
        };

        table.updatePendingColumnFilter = (filterId: string, updates: Partial<ColumnFilterRule>) => {
            table.setCustomColumnFilter((old) => {
                const updatedFilters = old.pendingFilters.map((filter) =>
                    filter.id === filterId ? { ...filter, ...updates } : filter
                );
                return {
                    ...old,
                    pendingFilters: updatedFilters,
                };
            });
        };

        table.removePendingColumnFilter = (filterId: string) => {
            table.setCustomColumnFilter((old) => ({
                ...old,
                pendingFilters: old.pendingFilters.filter((filter) => filter.id !== filterId),
            }));
        };

        table.clearAllPendingColumnFilters = () => {
            table.setCustomColumnFilter((old) => ({
                ...old,
                pendingFilters: [],
            }));
        };

        table.setPendingFilterLogic = (logic: 'AND' | 'OR') => {
            table.setCustomColumnFilter((old) => ({
                ...old,
                pendingLogic: logic,
            }));
        };

        // === APPLY PENDING FILTERS ===
        table.applyPendingColumnFilters = () => {
            table.setCustomColumnFilter((old) => {
                const newState = {
                    ...old,
                    filters: [...old.pendingFilters],
                    logic: old.pendingLogic,
                };

                // Call the apply callback after state update
                setTimeout(() => {
                    table.options.onCustomColumnFilterApply?.(newState);
                }, 0);

                return newState;
            });
        };

        // === LEGACY METHODS (for backward compatibility) ===
        table.addColumnFilter = (columnId: string, operator: string, value: any) => {
            // For backward compatibility, add directly to active filters
            table.setCustomColumnFilter((old) => {
                const newFilter: ColumnFilterRule = {
                    id: `filter_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    columnId,
                    operator,
                    value,
                };
                return {
                    ...old,
                    filters: [...old.filters, newFilter],
                };
            });
        };

        table.updateColumnFilter = (filterId: string, updates: Partial<ColumnFilterRule>) => {
            table.setCustomColumnFilter((old) => {
                const updatedFilters = old.filters.map((filter) =>
                    filter.id === filterId ? { ...filter, ...updates } : filter
                );
                return {
                    ...old,
                    filters: updatedFilters,
                };
            });
        };

        table.removeColumnFilter = (filterId: string) => {
            table.setCustomColumnFilter((old) => ({
                ...old,
                filters: old.filters.filter((filter) => filter.id !== filterId),
            }));
        };

        table.clearAllColumnFilters = () => {
            table.setCustomColumnFilter((old) => ({
                ...old,
                filters: [],
            }));
        };

        table.setFilterLogic = (logic: 'AND' | 'OR') => {
            table.setCustomColumnFilter((old) => ({
                ...old,
                logic,
            }));
        };

        // === GETTERS ===
        table.getActiveColumnFilters = () => {
            const state = table.getState().customColumnFilter;
            return state.filters.filter((f) => f.columnId && f.operator);
        };

        table.getPendingColumnFilters = () => {
            const state = table.getState().customColumnFilter;
            return state.pendingFilters.filter((f) => f.columnId && f.operator);
        };

        table.getCustomColumnFilterState = () => {
            return table.getState().customColumnFilter;
        };
    },
};

/**
 * Utility function to check if a row matches the custom column filters
 * This can be used for client-side filtering
 */
export function matchesCustomColumnFilters<TData extends RowData>(
    row: any,
    filters: ColumnFilterRule[],
    logic: 'AND' | 'OR' = 'AND'
): boolean {
    if (filters.length === 0) return true;

    const activeFilters = filters.filter((f) => f.columnId && f.operator);
    if (activeFilters.length === 0) return true;

    const results = activeFilters.map((filter) => {
        let columnValue;
        let columnType = filter.columnType || 'text';
        try {
            // Try to get the value safely to avoid infinite loops
            const column = row.getAllCells().find((cell: any) => cell.column.id === filter.columnId);
            if (column) {
                columnValue = column.getValue();
                // Try to get type from columnDef if not set
                if (!filter.columnType && column.column.columnDef && column.column.columnDef.type) {
                    columnType = column.column.columnDef.type;
                }
            }
        } catch (error) {
            console.warn(`Error getting value for column ${filter.columnId}:`, error);
            columnValue = row.original?.[filter.columnId] || '';
        }
        return evaluateFilterCondition(columnValue, filter.operator, filter.value, columnType);
    });

    return logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
}



export const getCombinedFilteredRowModel = <TData,>() => {
    return (table: Table<TData>) => (): RowModel<TData> => {
        // Run the built-in global + column filters first:
        const baseFilteredModel = getDefaultFilter<TData>()(table)();

        const { filters, logic } = table.getState().customColumnFilter ?? {
            filters: [],
            logic: 'AND',
        };

        if (!filters.length) return baseFilteredModel;

        // Apply custom column filters to pre-filtered rows
        const filteredRows = baseFilteredModel.rows.filter(row =>
            matchesCustomColumnFilters(row, filters, logic)
        );

        const flatRows: Row<TData>[] = [];
        const rowsById: Record<string, Row<TData>> = {};

        const addRow = (row: Row<TData>) => {
            flatRows.push(row);
            rowsById[row.id] = row;
            row.subRows?.forEach(addRow);
        };

        filteredRows.forEach(addRow);

        return {
            rows: filteredRows,
            flatRows,
            rowsById,
        };
    };
};
/**
 * Evaluate a single filter condition
 */
function evaluateFilterCondition(columnValue: any, operator: string, filterValue: any, type: string = 'text'): boolean {
    // --- Date helpers using moment ---
    function toMoment(val: any) {
        if (!val) return null;
        const m = moment(val);
        return m.isValid() ? m : null;
    }

    // --- Date type logic ---
    if (type === 'date') {
        const mCol = toMoment(columnValue);
        const mFilter = toMoment(filterValue);
        if (!mCol || !mFilter) return false;
        switch (operator) {
            case 'equals':
                return mCol.isSame(mFilter, 'day');
            case 'notEquals':
                return !mCol.isSame(mFilter, 'day');
            case 'after':
                return mCol.isAfter(mFilter, 'day');
            case 'before':
                return mCol.isBefore(mFilter, 'day');
            case 'isEmpty':
                return !columnValue;
            case 'isNotEmpty':
                return !!columnValue;
            default:
                return true;
        }
    }

    // --- Boolean type logic ---
    if (type === 'boolean') {
        switch (operator) {
            case 'is':
                if (filterValue === 'any') return true;
                if (filterValue === 'true') return (columnValue === true || columnValue === 'true' || columnValue === 1 || columnValue === '1' || columnValue === 'Yes' || columnValue === 'yes');
                if (filterValue === 'false') return (columnValue === false || columnValue === 'false' || columnValue === 0 || columnValue === '0' || columnValue === 'No' || columnValue === 'no');
                return false;

            default:
                return true;
        }
    }

    // --- Select type logic (in, notIn, single select) ---
    if (type === 'select') {
        if (operator === 'in' || operator === 'notIn') {
            if (Array.isArray(filterValue)) {
                if (operator === 'in') return filterValue.includes(columnValue);
                if (operator === 'notIn') return !filterValue.includes(columnValue);
            }
            return false;
        }
        if (operator === 'equals' || operator === 'notEquals') {
            return operator === 'equals'
                ? columnValue === filterValue
                : columnValue !== filterValue;
        }
    }

    // --- Text/Number type logic ---
    switch (operator) {
        case 'contains':
            return String(columnValue).toLowerCase().includes(String(filterValue).toLowerCase());
        case 'notContains':
            return !String(columnValue).toLowerCase().includes(String(filterValue).toLowerCase());
        case 'startsWith':
            return String(columnValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
        case 'endsWith':
            return String(columnValue).toLowerCase().endsWith(String(filterValue).toLowerCase());
        case 'isEmpty':
            return columnValue === null || columnValue === undefined || columnValue === '';
        case 'isNotEmpty':
            return columnValue !== null && columnValue !== undefined && columnValue !== '';
        case 'greaterThan':
            return Number(columnValue) > Number(filterValue);
        case 'greaterThanOrEqual':
            return Number(columnValue) >= Number(filterValue);
        case 'lessThan':
            return Number(columnValue) < Number(filterValue);
        case 'lessThanOrEqual':
            return Number(columnValue) <= Number(filterValue);
        default:
            return true;
    }
} 