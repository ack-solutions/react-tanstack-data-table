/**
 * Custom Selection Feature for TanStack Table
 * 
 * This feature adds custom selection capabilities to TanStack Table
 * following the official custom features pattern (same as CustomColumnFilterFeature)
 */
import {
    Table,
    TableFeature,
    RowData,
    Updater,
    functionalUpdate,
    makeStateUpdater,
    Row,
} from '@tanstack/react-table';

// Selection state interface
export interface SelectionState {
    ids: string[];
    type: 'include' | 'exclude';
    selectMode?: 'page' | 'all';
}

// Row selectability function type (like MUI DataGrid)
export type IsRowSelectableFunction<T = any> = (params: { row: T; id: string }) => boolean;

// Selection mode type
export type SelectMode = 'page' | 'all';

// Options for the custom selection feature
export interface SelectionOptions {
    enableAdvanceSelection?: boolean;
    selectMode?: SelectMode;
    isRowSelectable?: IsRowSelectableFunction;
    onSelectionStateChange?: (updater: Updater<SelectionState>) => void;
}

// Table state interface for selection
export interface SelectionTableState {
    selectionState: SelectionState;
}

// Declaration merging to extend TanStack Table types
declare module '@tanstack/react-table' {
    interface TableState extends SelectionTableState { }
    interface TableOptionsResolved<TData extends RowData>
        extends SelectionOptions { }
    interface Table<TData extends RowData> extends SelectionInstance<TData> { }
}

// Table instance methods for custom selection
export interface SelectionInstance<TData extends RowData> {
    // Basic selection methods
    setSelectionState: (updater: Updater<SelectionState>) => void;
    toggleAllRowsSelected: () => void;
    toggleRowSelected: (rowId: string) => void;
    selectRow: (rowId: string) => void;
    deselectRow: (rowId: string) => void;
    selectAll: () => void;
    deselectAll: () => void;

    // State checkers
    getIsAllRowsSelected: () => boolean;
    getIsSomeRowsSelected: () => boolean;
    getIsRowSelected: (rowId: string) => boolean;

    // Getters
    getSelectionState: () => SelectionState;
    getSelectedCount: () => number;
    getSelectedRows: () => Row<TData>[];
    getSelectedRowIds: () => string[];

    // Helper methods
    canSelectRow: (rowId: string) => boolean;
}

// The custom selection feature implementation (same pattern as CustomColumnFilterFeature)
export const SelectionFeature: TableFeature<any> = {
    // Define the feature's initial state
    getInitialState: (state): SelectionTableState => {
        return {
            selectionState: {
                ids: [],
                type: 'include',
                selectMode: 'page',
            },
            ...state,
        };
    },

    // Define the feature's default options
    getDefaultOptions: <TData extends RowData>(
        table: Table<TData>
    ): SelectionOptions => {
        return {
            enableAdvanceSelection: true,
            selectMode: 'page',
            onSelectionStateChange: makeStateUpdater('selectionState', table),
        } as SelectionOptions;
    },

    // Define the feature's table instance methods
    createTable: <TData extends RowData>(table: Table<TData>): void => {
        const getRowsForSelection = () => {
            // In client mode with pagination we can inspect all loaded rows.
            // In manual/server pagination only the loaded slice exists locally.
            if (table.options.manualPagination) {
                return table.getRowModel().rows;
            }
            return table.getPrePaginationRowModel?.().rows || table.getRowModel().rows;
        };

        table.setSelectionState = (updater) => {
            if (!table.options.enableAdvanceSelection) return;
            const safeUpdater: Updater<SelectionState> = (old) => {
                const newState = functionalUpdate(updater, old);
                return newState;
            };
            return table.options.onSelectionStateChange?.(safeUpdater);
        };

        // === BASIC SELECTION METHODS ===
        table.selectRow = (rowId: string) => {
            if (!table.options.enableAdvanceSelection) return;
            if (!table.canSelectRow(rowId)) return;

            table.setSelectionState((old) => {
                if (old.type === 'exclude') {
                    // In exclude mode, selecting means removing from exclude list
                    return {
                        ...old,
                        ids: old.ids.filter(id => id !== rowId),
                    };
                } else {
                    // In include mode, selecting means adding to include list
                    const newIds = old.ids.includes(rowId) ? old.ids : [...old.ids, rowId];
                    return {
                        ...old,
                        ids: newIds,
                    };
                }
            });
        };

        table.deselectRow = (rowId: string) => {
            if (!table.options.enableAdvanceSelection) return;
            table.setSelectionState((old) => {
                if (old.type === 'exclude') {
                    // In exclude mode, deselecting means adding to exclude list
                    const newIds = old.ids.includes(rowId) ? old.ids : [...old.ids, rowId];
                    return {
                        ...old,
                        ids: newIds,
                    };
                } else {
                    // In include mode, deselecting means removing from include list
                    return {
                        ...old,
                        ids: old.ids.filter(id => id !== rowId),
                    };
                }
            });
        };

        table.toggleRowSelected = (rowId: string) => {
            if (!table.options.enableAdvanceSelection) return;
            if (table.getIsRowSelected(rowId)) {
                table.deselectRow(rowId);
            } else {
                table.selectRow(rowId);
            }
        };

        table.selectAll = () => {
            if (!table.options.enableAdvanceSelection) return;
            const selectMode = table.options.selectMode || 'page';

            const currentRows =
                table.getPaginationRowModel?.()?.rows ||
                table.getRowModel().rows;

            if (selectMode === 'all') {
                // In 'all' mode, use exclude type with empty list (select all)
                table.setSelectionState((old) => ({
                    ...old,
                    ids: [],
                    type: 'exclude',
                }));
            } else {
                // In 'page' mode, select current page rows
                const selectableRowIds = currentRows
                    .filter(row => table.canSelectRow(row.id))
                    .map(row => row.id);

                table.setSelectionState((old) => ({
                    ...old,
                    ids: selectableRowIds,
                    type: 'include',
                }));
            }
        };

        table.deselectAll = () => {
            if (!table.options.enableAdvanceSelection) return;
            table.setSelectionState((old) => ({
                ...old,
                ids: [],
                type: 'include',
            }));
        };

        table.toggleAllRowsSelected = () => {
            if (!table.options.enableAdvanceSelection) return;
            if (table.getIsAllRowsSelected()) {
                table.deselectAll();
            } else {
                table.selectAll();
            }
        };

        // === STATE CHECKERS ===
        table.getIsRowSelected = (rowId: string) => {
            const state = table.getSelectionState();
            if (state.type === 'exclude') {
                // In exclude mode, selected if NOT in exclude list
                return !state.ids.includes(rowId);
            } else {
                // In include mode, selected if in include list
                return state.ids.includes(rowId);
            }
        };

        table.getIsAllRowsSelected = () => {
            const state = table.getSelectionState();
            const selectMode = table.options.selectMode || 'page';

            if (selectMode === 'all') {
                const totalCount = table.getRowCount();
                if (totalCount === 0) return false;

                if (state.type === 'exclude') {
                    return state.ids.length === 0;
                } else {
                    return state.ids.length === totalCount;
                }
            } else {
                // Page mode - check if all selectable rows on current page are selected
                const currentPageRows = table.getPaginationRowModel?.()?.rows || table.getRowModel().rows;
                const selectableRows = currentPageRows.filter(row => table.canSelectRow(row.id));

                if (selectableRows.length === 0) return false;
                return selectableRows.every(row => table.getIsRowSelected(row.id));
            }
        };

        table.getIsSomeRowsSelected = () => {
            const state = table.getSelectionState();
            const selectMode = table.options.selectMode || 'page';

            if (selectMode === 'all' && state.type === 'exclude') {
                // In exclude mode, we have some selected if not all are excluded
                const totalCount = table.getRowCount();
                return totalCount > 0 && state.ids.length < totalCount;
            } else {
                // In include mode, we have some selected if list has items
                return state.ids.length > 0;
            }
        };

        // === GETTERS ===
        table.getSelectionState = () => {
            return table.getState().selectionState || {
                ids: [],
                type: 'include',
                selectMode: 'page',
            };
        };

        table.getSelectedCount = () => {
            const state = table.getSelectionState();
            const selectMode = table.options.selectMode || 'page';

            if (selectMode === 'all' && state.type === 'exclude') {
                // For server-side data, use rowCount which includes total from server
                // For client-side data, this will be the same as getRowModel().rows.length
                const totalCount = table.getRowCount();
                return Math.max(0, totalCount - state.ids.length);
            } else {
                return state.ids.length;
            }
        };

        table.getSelectedRowIds = () => {
            const state = table.getSelectionState();
            if (state.type === 'exclude') {
                return table.getSelectedRows().map((row) => row.id);
            }
            return state.ids;
        };

        table.getSelectedRows = () => {
            const state = table.getSelectionState();
            const allRows = getRowsForSelection();

            if (state.type === 'exclude') {
                // Return all rows except excluded ones
                return allRows.filter(row => !state.ids.includes(row.id))
            } else {
                // Return only included rows
                return allRows.filter(row => state.ids.includes(row.id))
            }
        };

        // === HELPER METHODS ===
        table.canSelectRow = (rowId: string) => {
            if (!table.options.isRowSelectable) return true;

            const row = table.getRowModel().rows.find(r => r.id === rowId);
            if (!row) return false;

            return table.options.isRowSelectable({ row: row.original, id: rowId });
        };
    },
};
