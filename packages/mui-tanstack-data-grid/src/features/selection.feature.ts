/**
 * Custom Selection feature for TanStack Table.
 *
 * Adds advanced selection (page vs all, include/exclude semantics) following the
 * official custom-features pattern. Ported from v1 with no behaviour change;
 * `SelectionState`/`SelectMode` now live in `../types/selection.types`.
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

import type { SelectionState, SelectMode } from '../types/selection.types';

export type IsRowSelectableFunction<T = any> = (params: { row: T; id: string }) => boolean;

export interface SelectionOptions {
    enableAdvanceSelection?: boolean;
    selectMode?: SelectMode;
    isRowSelectable?: IsRowSelectableFunction;
    onSelectionStateChange?: (updater: Updater<SelectionState>) => void;
}

export interface SelectionTableState {
    selectionState: SelectionState;
}

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface TableState extends SelectionTableState {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-interface
    interface TableOptionsResolved<TData extends RowData> extends SelectionOptions {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-interface
    interface Table<TData extends RowData> extends SelectionInstance<TData> {}
}

export interface SelectionInstance<TData extends RowData> {
    setSelectionState: (updater: Updater<SelectionState>) => void;
    toggleAllRowsSelected: () => void;
    toggleRowSelected: (rowId: string) => void;
    selectRow: (rowId: string) => void;
    deselectRow: (rowId: string) => void;
    selectAll: () => void;
    deselectAll: () => void;
    getIsAllRowsSelected: () => boolean;
    getIsSomeRowsSelected: () => boolean;
    getIsRowSelected: (rowId: string) => boolean;
    getSelectionState: () => SelectionState;
    getSelectedCount: () => number;
    getSelectedRows: () => Row<TData>[];
    getSelectedRowIds: () => string[];
    canSelectRow: (rowId: string) => boolean;
}

export const SelectionFeature: TableFeature<any> = {
    getInitialState: (state): SelectionTableState => ({
        selectionState: { ids: [], type: 'include', selectMode: 'page' },
        ...state,
    }),

    getDefaultOptions: <TData extends RowData>(table: Table<TData>): SelectionOptions => ({
        enableAdvanceSelection: true,
        selectMode: 'page',
        onSelectionStateChange: makeStateUpdater('selectionState', table),
    } as SelectionOptions),

    createTable: <TData extends RowData>(table: Table<TData>): void => {
        const getRowsForSelection = () => {
            if (table.options.manualPagination) {
                return table.getRowModel().rows;
            }
            return table.getPrePaginationRowModel?.().rows || table.getRowModel().rows;
        };

        table.setSelectionState = (updater) => {
            if (!table.options.enableAdvanceSelection) return;
            const safeUpdater: Updater<SelectionState> = (old) => functionalUpdate(updater, old);
            return table.options.onSelectionStateChange?.(safeUpdater);
        };

        table.selectRow = (rowId: string) => {
            if (!table.options.enableAdvanceSelection) return;
            if (!table.canSelectRow(rowId)) return;
            table.setSelectionState((old) => {
                if (old.type === 'exclude') {
                    return { ...old, ids: old.ids.filter((id) => id !== rowId) };
                }
                const newIds = old.ids.includes(rowId) ? old.ids : [...old.ids, rowId];
                return { ...old, ids: newIds };
            });
        };

        table.deselectRow = (rowId: string) => {
            if (!table.options.enableAdvanceSelection) return;
            table.setSelectionState((old) => {
                if (old.type === 'exclude') {
                    const newIds = old.ids.includes(rowId) ? old.ids : [...old.ids, rowId];
                    return { ...old, ids: newIds };
                }
                return { ...old, ids: old.ids.filter((id) => id !== rowId) };
            });
        };

        table.toggleRowSelected = (rowId: string) => {
            if (!table.options.enableAdvanceSelection) return;
            if (table.getIsRowSelected(rowId)) table.deselectRow(rowId);
            else table.selectRow(rowId);
        };

        table.selectAll = () => {
            if (!table.options.enableAdvanceSelection) return;
            const selectMode = table.options.selectMode || 'page';
            const currentRows = table.getPaginationRowModel?.()?.rows || table.getRowModel().rows;
            if (selectMode === 'all') {
                table.setSelectionState((old) => ({ ...old, ids: [], type: 'exclude' }));
            } else {
                const selectableRowIds = currentRows
                    .filter((row) => table.canSelectRow(row.id))
                    .map((row) => row.id);
                table.setSelectionState((old) => ({ ...old, ids: selectableRowIds, type: 'include' }));
            }
        };

        table.deselectAll = () => {
            if (!table.options.enableAdvanceSelection) return;
            table.setSelectionState((old) => ({ ...old, ids: [], type: 'include' }));
        };

        table.toggleAllRowsSelected = () => {
            if (!table.options.enableAdvanceSelection) return;
            if (table.getIsAllRowsSelected()) table.deselectAll();
            else table.selectAll();
        };

        table.getIsRowSelected = (rowId: string) => {
            const state = table.getSelectionState();
            return state.type === 'exclude' ? !state.ids.includes(rowId) : state.ids.includes(rowId);
        };

        table.getIsAllRowsSelected = () => {
            const state = table.getSelectionState();
            const selectMode = table.options.selectMode || 'page';
            if (selectMode === 'all') {
                const totalCount = table.getRowCount();
                if (totalCount === 0) return false;
                return state.type === 'exclude' ? state.ids.length === 0 : state.ids.length === totalCount;
            }
            const currentPageRows = table.getPaginationRowModel?.()?.rows || table.getRowModel().rows;
            const selectableRows = currentPageRows.filter((row) => table.canSelectRow(row.id));
            if (selectableRows.length === 0) return false;
            return selectableRows.every((row) => table.getIsRowSelected(row.id));
        };

        table.getIsSomeRowsSelected = () => {
            const state = table.getSelectionState();
            const selectMode = table.options.selectMode || 'page';
            if (selectMode === 'all' && state.type === 'exclude') {
                const totalCount = table.getRowCount();
                return totalCount > 0 && state.ids.length < totalCount;
            }
            return state.ids.length > 0;
        };

        table.getSelectionState = () =>
            table.getState().selectionState || { ids: [], type: 'include', selectMode: 'page' };

        table.getSelectedCount = () => {
            const state = table.getSelectionState();
            const selectMode = table.options.selectMode || 'page';
            if (selectMode === 'all' && state.type === 'exclude') {
                const totalCount = table.getRowCount();
                return Math.max(0, totalCount - state.ids.length);
            }
            return state.ids.length;
        };

        table.getSelectedRowIds = () => {
            const state = table.getSelectionState();
            if (state.type === 'exclude') return table.getSelectedRows().map((row) => row.id);
            return state.ids;
        };

        table.getSelectedRows = () => {
            const state = table.getSelectionState();
            const allRows = getRowsForSelection();
            return state.type === 'exclude'
                ? allRows.filter((row) => !state.ids.includes(row.id))
                : allRows.filter((row) => state.ids.includes(row.id));
        };

        table.canSelectRow = (rowId: string) => {
            if (!table.options.isRowSelectable) return true;
            const row = table.getRowModel().rows.find((r) => r.id === rowId);
            if (!row) return false;
            return table.options.isRowSelectable({ row: row.original, id: rowId });
        };
    },
};
