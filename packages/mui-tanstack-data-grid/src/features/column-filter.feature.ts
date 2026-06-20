/**
 * Custom Column Filter feature for TanStack Table.
 *
 * Advanced column filtering: draft (pending) → apply, AND/OR logic, per-type
 * operators (text/number/date/boolean/select). Ported from v1 with `moment`
 * replaced by `dayjs` (lightweight pass). Shared types now live in
 * `../types/filter.types`.
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
import dayjs from 'dayjs';

import type { ColumnFilterRule, ColumnFilterState } from '../types/filter.types';

export interface ColumnFilterOptions {
    enableAdvanceColumnFilter?: boolean;
    onColumnFilterChange?: (updater: Updater<ColumnFilterState>) => void;
    onColumnFilterApply?: (state: ColumnFilterState) => void;
}

declare module '@tanstack/react-table' {
    interface TableState {
        columnFilter: ColumnFilterState;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface TableOptionsResolved<TData extends RowData> {
        enableAdvanceColumnFilter?: boolean;
        onColumnFilterChange?: (updater: Updater<ColumnFilterState>) => void;
        onColumnFilterApply?: (state: ColumnFilterState) => void;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Table<TData extends RowData> {
        setColumnFilterState: (updater: Updater<ColumnFilterState> | ColumnFilterState) => void;
        addPendingColumnFilter: (columnId: string, operator: string, value: any) => void;
        updatePendingColumnFilter: (filterId: string, updates: Partial<ColumnFilterRule>) => void;
        removePendingColumnFilter: (filterId: string) => void;
        clearAllPendingColumnFilters: () => void;
        setPendingFilterLogic: (logic: 'AND' | 'OR') => void;
        applyPendingColumnFilters: () => void;
        resetColumnFilter: () => void;
        addColumnFilter: (columnId: string, operator: string, value: any) => void;
        updateColumnFilter: (filterId: string, updates: Partial<ColumnFilterRule>) => void;
        removeColumnFilter: (filterId: string) => void;
        clearAllColumnFilters: () => void;
        setFilterLogic: (logic: 'AND' | 'OR') => void;
        getActiveColumnFilters: () => ColumnFilterRule[];
        getPendingColumnFilters: () => ColumnFilterRule[];
        getColumnFilterState: () => ColumnFilterState;
    }
}

const makeFilterId = () => `filter_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const ColumnFilterFeature: TableFeature<any> = {
    getInitialState: (state): { columnFilter: ColumnFilterState } => ({
        columnFilter: { filters: [], logic: 'AND', pendingFilters: [], pendingLogic: 'AND' },
        ...state,
    }),

    getDefaultOptions: <TData extends RowData>(table: Table<TData>): ColumnFilterOptions => ({
        enableAdvanceColumnFilter: true,
        onColumnFilterChange: makeStateUpdater('columnFilter', table),
        onColumnFilterApply: () => undefined,
    } as ColumnFilterOptions),

    createTable: <TData extends RowData>(table: Table<TData>): void => {
        table.setColumnFilterState = (updater) => {
            if (!table.options.enableAdvanceColumnFilter) return;
            const safeUpdater: Updater<ColumnFilterState> = (old) => functionalUpdate(updater, old);
            return table.options.onColumnFilterChange?.(safeUpdater);
        };

        // Pending (draft) filters
        table.addPendingColumnFilter = (columnId, operator, value) => {
            if (!table.options.enableAdvanceColumnFilter) return;
            table.setColumnFilterState((old) => ({
                ...old,
                pendingFilters: [...old.pendingFilters, { id: makeFilterId(), columnId, operator, value }],
            }));
        };

        table.updatePendingColumnFilter = (filterId, updates) => {
            if (!table.options.enableAdvanceColumnFilter) return;
            table.setColumnFilterState((old) => ({
                ...old,
                pendingFilters: old.pendingFilters.map((f) => (f.id === filterId ? { ...f, ...updates } : f)),
            }));
        };

        table.removePendingColumnFilter = (filterId) => {
            if (!table.options.enableAdvanceColumnFilter) return;
            table.setColumnFilterState((old) => ({
                ...old,
                pendingFilters: old.pendingFilters.filter((f) => f.id !== filterId),
            }));
        };

        table.clearAllPendingColumnFilters = () => {
            if (!table.options.enableAdvanceColumnFilter) return;
            table.setColumnFilterState((old) => ({ ...old, pendingFilters: [] }));
        };

        table.resetColumnFilter = () => {
            if (!table.options.enableAdvanceColumnFilter) return;
            const newState: ColumnFilterState = { pendingFilters: [], pendingLogic: 'AND', filters: [], logic: 'AND' };
            table.setColumnFilterState(newState);
            table.options.onColumnFilterApply?.(newState);
        };

        table.setPendingFilterLogic = (logic) => {
            if (!table.options.enableAdvanceColumnFilter) return;
            table.setColumnFilterState((old) => ({ ...old, pendingLogic: logic }));
        };

        table.applyPendingColumnFilters = () => {
            if (!table.options.enableAdvanceColumnFilter) return;
            table.setColumnFilterState((old) => {
                const newState = { ...old, filters: [...old.pendingFilters], logic: old.pendingLogic };
                setTimeout(() => table.options.onColumnFilterApply?.(newState), 0);
                return newState;
            });
        };

        // Active filters (direct)
        table.addColumnFilter = (columnId, operator, value) => {
            if (!table.options.enableAdvanceColumnFilter) return;
            table.setColumnFilterState((old) => ({
                ...old,
                filters: [...old.filters, { id: makeFilterId(), columnId, operator, value }],
            }));
        };

        table.updateColumnFilter = (filterId, updates) => {
            if (!table.options.enableAdvanceColumnFilter) return;
            table.setColumnFilterState((old) => ({
                ...old,
                filters: old.filters.map((f) => (f.id === filterId ? { ...f, ...updates } : f)),
            }));
        };

        table.removeColumnFilter = (filterId) => {
            if (!table.options.enableAdvanceColumnFilter) return;
            table.setColumnFilterState((old) => ({ ...old, filters: old.filters.filter((f) => f.id !== filterId) }));
        };

        table.clearAllColumnFilters = () => {
            if (!table.options.enableAdvanceColumnFilter) return;
            table.setColumnFilterState((old) => ({ ...old, filters: [] }));
        };

        table.setFilterLogic = (logic) => {
            if (!table.options.enableAdvanceColumnFilter) return;
            table.setColumnFilterState((old) => ({ ...old, logic }));
        };

        // Getters
        table.getActiveColumnFilters = () =>
            table.getState().columnFilter.filters.filter((f) => f.columnId && f.operator);
        table.getPendingColumnFilters = () =>
            table.getState().columnFilter.pendingFilters.filter((f) => f.columnId && f.operator);
        table.getColumnFilterState = () => table.getState().columnFilter;
    },
};

/** Client-side predicate: does a row match the given custom column filters? */
export function matchesCustomColumnFilters(
    row: any,
    filters: ColumnFilterRule[],
    logic: 'AND' | 'OR' = 'AND',
): boolean {
    if (filters.length === 0) return true;
    const activeFilters = filters.filter((f) => f.columnId && f.operator);
    if (activeFilters.length === 0) return true;

    const results = activeFilters.map((filter) => {
        let columnValue: any;
        let columnType = filter.columnType || 'text';
        try {
            const cell = row.getAllCells().find((c: any) => c.column.id === filter.columnId);
            if (cell) {
                columnValue = cell.getValue();
                if (!filter.columnType && cell.column.columnDef?.type) {
                    columnType = cell.column.columnDef.type;
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
        if (table.options.manualFiltering) {
            return table.getCoreRowModel();
        }

        const baseFilteredModel = getDefaultFilter<TData>()(table)();
        const { filters, logic } = table.getState().columnFilter ?? { filters: [], logic: 'AND' };

        if (!filters.length || !table.options.enableAdvanceColumnFilter) {
            return baseFilteredModel;
        }

        const filteredRows = baseFilteredModel.rows.filter((row) =>
            matchesCustomColumnFilters(row, filters, logic),
        );

        const flatRows: Row<TData>[] = [];
        const rowsById: Record<string, Row<TData>> = {};
        const addRow = (row: Row<TData>) => {
            flatRows.push(row);
            rowsById[row.id] = row;
            row.subRows?.forEach(addRow);
        };
        filteredRows.forEach(addRow);

        return { rows: filteredRows, flatRows, rowsById };
    };
};

function evaluateFilterCondition(columnValue: any, operator: string, filterValue: any, type = 'text'): boolean {
    const toDay = (val: any) => {
        if (!val) return null;
        const d = dayjs(val);
        return d.isValid() ? d : null;
    };

    if (type === 'date') {
        if (operator === 'isEmpty') return columnValue === null || columnValue === undefined || columnValue === '';
        if (operator === 'isNotEmpty') return columnValue !== null && columnValue !== undefined && columnValue !== '';

        const dCol = columnValue ? toDay(columnValue) : null;

        if (operator === 'between') {
            // Inclusive range; `{ from, to }`. Either bound may be omitted (open-ended).
            const { from, to } = filterValue && typeof filterValue === 'object' ? filterValue : ({} as any);
            const dFrom = from ? toDay(from) : null;
            const dTo = to ? toDay(to) : null;
            if (!dCol || (!dFrom && !dTo)) return false;
            if (dFrom && dCol.isBefore(dFrom, 'day')) return false;
            if (dTo && dCol.isAfter(dTo, 'day')) return false;
            return true;
        }

        const dFilter = filterValue ? toDay(filterValue) : null;
        if (!dCol || !dFilter) return false;
        switch (operator) {
            case 'equals':
                return dCol.isSame(dFilter, 'day');
            case 'notEquals':
                return !dCol.isSame(dFilter, 'day');
            case 'after':
                return dCol.isAfter(dFilter, 'day');
            case 'before':
                return dCol.isBefore(dFilter, 'day');
            default:
                return true;
        }
    }

    if (type === 'boolean') {
        if (operator === 'is') {
            if (filterValue === 'any') return true;
            if (filterValue === 'true') return columnValue === true || columnValue === 'true' || columnValue === 1 || columnValue === '1' || columnValue === 'Yes' || columnValue === 'yes';
            if (filterValue === 'false') return columnValue === false || columnValue === 'false' || columnValue === 0 || columnValue === '0' || columnValue === 'No' || columnValue === 'no';
            return false;
        }
        return true;
    }

    if (type === 'select') {
        if (operator === 'in' || operator === 'notIn') {
            const values = Array.isArray(filterValue)
                ? filterValue
                : [filterValue].filter((v) => v !== undefined && v !== null && v !== '');
            if (values.length === 0) return operator === 'notIn';
            return operator === 'in' ? values.includes(columnValue) : !values.includes(columnValue);
        }
        if (operator === 'equals' || operator === 'notEquals') {
            return operator === 'equals' ? columnValue === filterValue : columnValue !== filterValue;
        }
    }

    if (type === 'number') {
        switch (operator) {
            case 'equals':
                return Number(columnValue) === Number(filterValue);
            case 'notEquals':
                return Number(columnValue) !== Number(filterValue);
            case 'greaterThan':
                return Number(columnValue) > Number(filterValue);
            case 'greaterThanOrEqual':
                return Number(columnValue) >= Number(filterValue);
            case 'lessThan':
                return Number(columnValue) < Number(filterValue);
            case 'lessThanOrEqual':
                return Number(columnValue) <= Number(filterValue);
            case 'between': {
                // Inclusive range; `{ from, to }`. Either bound may be omitted (open-ended).
                // A blank/whitespace/unparseable bound is treated as absent — with no
                // usable bound the rule is a no-op (matches nothing), never match-all.
                const { from, to } = filterValue && typeof filterValue === 'object' ? filterValue : ({} as any);
                if (columnValue === null || columnValue === undefined || columnValue === '') return false;
                const n = Number(columnValue);
                if (Number.isNaN(n)) return false;
                const lo = String(from ?? '').trim() === '' ? NaN : Number(from);
                const hi = String(to ?? '').trim() === '' ? NaN : Number(to);
                const loOk = !Number.isNaN(lo);
                const hiOk = !Number.isNaN(hi);
                if (!loOk && !hiOk) return false;
                if (loOk && n < lo) return false;
                if (hiOk && n > hi) return false;
                return true;
            }
        }
    }

    switch (operator) {
        case 'contains':
            return String(columnValue).toLowerCase().includes(String(filterValue).toLowerCase());
        case 'notContains':
            return !String(columnValue).toLowerCase().includes(String(filterValue).toLowerCase());
        case 'startsWith':
            return String(columnValue).toLowerCase().startsWith(String(filterValue).toLowerCase());
        case 'endsWith':
            return String(columnValue).toLowerCase().endsWith(String(filterValue).toLowerCase());
        case 'equals':
            return columnValue === filterValue;
        case 'notEquals':
            return columnValue !== filterValue;
        case 'isEmpty':
            return columnValue === null || columnValue === undefined || columnValue === '';
        case 'isNotEmpty':
            return columnValue !== null && columnValue !== undefined && columnValue !== '';
        default:
            return true;
    }
}
