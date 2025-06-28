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
    interface TableState extends CustomColumnFilterTableState {}
    interface TableOptionsResolved<TData extends RowData>
        extends CustomColumnFilterOptions {}
    interface Table<TData extends RowData> extends CustomColumnFilterInstance<TData> {}
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
        
        try {
            // Try to get the value safely to avoid infinite loops
            const column = row.getAllCells().find((cell: any) => cell.column.id === filter.columnId);
            if (column) {
                // Get the raw value from the row data instead of using getValue() to avoid accessorFn loops
                const rowData = row.original;
                const columnDef = column.column.columnDef;
                
                if (columnDef.accessorFn) {
                    // Use accessorFn directly on the row data
                    columnValue = columnDef.accessorFn(rowData);
                } else if (columnDef.accessorKey) {
                    // Use direct property access
                    columnValue = rowData[columnDef.accessorKey];
                } else {
                    // Fallback to getValue if no other option
                    columnValue = column.getValue();
                }
            } else {
                // Fallback: try direct property access on row data
                columnValue = row.original[filter.columnId];
            }
        } catch (error) {
            console.warn(`Error getting value for column ${filter.columnId}:`, error);
            columnValue = row.original[filter.columnId];
        }
        
        return evaluateFilterCondition(columnValue, filter.operator, filter.value);
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
function evaluateFilterCondition(columnValue: any, operator: string, filterValue: any): boolean {
    switch (operator) {
        case 'equals':
            return columnValue === filterValue;
        case 'notEquals':
            return columnValue !== filterValue;
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
        case 'between':
            if (Array.isArray(filterValue) && filterValue.length === 2) {
                const [min, max] = filterValue;
                return Number(columnValue) >= Number(min) && Number(columnValue) <= Number(max);
            }
            return false;
        case 'in':
            if (Array.isArray(filterValue)) {
                return filterValue.includes(columnValue);
            }
            return false;
        case 'notIn':
            if (Array.isArray(filterValue)) {
                return !filterValue.includes(columnValue);
            }
            return true;
        default:
            return true;
    }
} 