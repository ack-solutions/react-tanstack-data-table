import type { Column, ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';

export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'actions';

/**
 * Display formatter for a typed column — number via `Intl`, date via `dayjs`
 * (avoids the `new Date('YYYY-MM-DD')` UTC-shift), boolean → Yes/No, select →
 * option label. Build once per column and reuse (the `Intl` instance is cached).
 * Empty values pass through untouched.
 */
export function makeTypeCellFormatter(def: any): (value: any) => any {
    const type = def?.type;
    if (type === 'number') {
        const nf = new Intl.NumberFormat();
        return (v) => (v === null || v === undefined || v === '' || Number.isNaN(Number(v)) ? v : nf.format(Number(v)));
    }
    if (type === 'date') {
        return (v) => {
            if (!v) return v;
            const d = dayjs(v);
            return d.isValid() ? d.format('MMM D, YYYY') : v;
        };
    }
    if (type === 'boolean') {
        return (v) => (v === null || v === undefined || v === '' ? v : v ? 'Yes' : 'No');
    }
    if (type === 'select') {
        const opts: any[] = def?.options || [];
        return (v) => {
            const o = opts.find((x) => x.value === v);
            return o ? o.label : v;
        };
    }
    return (v) => v;
}

/**
 * Normalize a user column:
 *  - compile `valueGetter` → a TanStack `accessorFn` (only when there's no
 *    `accessorKey`/`accessorFn`), so sorting, filtering, and export all read the
 *    derived value;
 *  - supply a default display `cell` when none is given. Precedence:
 *    explicit `cell` > `valueFormatter` > type default > raw value.
 * Display formatting (cell) never affects export, which reads the raw value.
 */
export function normalizeUserColumn<T>(col: ColumnDef<T, any>): ColumnDef<T, any> {
    const def: any = { ...col };
    if (Array.isArray(def.columns)) def.columns = def.columns.map((c: any) => normalizeUserColumn(c));

    if (typeof def.valueGetter === 'function' && def.accessorKey == null && def.accessorFn == null) {
        const vg = def.valueGetter;
        def.accessorFn = (row: T) => vg({ row });
    }
    if (def.cell == null) {
        if (typeof def.valueFormatter === 'function') {
            const vf = def.valueFormatter;
            def.cell = (ctx: any) => vf({ value: ctx.getValue(), row: ctx.row.original });
        } else if (def.type && def.type !== 'text') {
            const fmt = makeTypeCellFormatter(def);
            def.cell = (ctx: any) => fmt(ctx.getValue());
        }
    }
    return def;
}

export function getColumnType(column: Column<any, unknown>): ColumnType {
    if (column?.columnDef?.type) return column.columnDef.type as ColumnType;
    return 'text';
}

export function getCustomFilterComponent(column: Column<any, unknown>): any {
    return column?.columnDef?.filterComponent;
}

/** A column's custom cell editor (`columnDef.editComponent`), if any. */
export function getCustomEditComponent(column: Column<any, unknown>): any {
    return column?.columnDef?.editComponent;
}

export function getColumnOptions(column: Column<any, unknown>): any[] {
    if (column?.columnDef?.options) return column.columnDef.options || [];
    if (getColumnType(column) === 'boolean') {
        return [
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
        ];
    }
    // Faceted: auto-populate `select` options from the data's distinct values when none
    // are declared (needs the faceted model mounted; cardinality-guarded). These reflect
    // the data, not other active filters (the custom column filter isn't native).
    if (getColumnType(column) === 'select' && typeof (column as any).getFacetedUniqueValues === 'function') {
        try {
            const map: Map<any, number> = (column as any).getFacetedUniqueValues();
            if (map && map.size > 0 && map.size <= 200) {
                return Array.from(map.keys())
                    .filter((v) => v !== null && v !== undefined && v !== '')
                    .sort((a, b) =>
                        typeof a === 'number' && typeof b === 'number'
                            ? a - b
                            : String(a).localeCompare(String(b), undefined, { numeric: true }),
                    )
                    .map((v) => ({ label: String(v), value: v }));
            }
        } catch {
            /* faceted model not mounted — fall through */
        }
    }
    return [];
}

/** Ensure every column (and nested group) has a stable `id`. */
export function withIdsDeep<T>(cols: ColumnDef<T, any>[]): ColumnDef<T, any>[] {
    return cols.map((c, i) => ({
        ...c,
        id: c.id ?? (c as any).accessorKey ?? `col_${i}`,
        ...(Array.isArray((c as any).columns) && { columns: withIdsDeep((c as any).columns) }),
    }));
}

export function isColumnFilterable(column: Column<any, unknown>): boolean {
    if (column?.columnDef?.filterable !== undefined) return column.columnDef.filterable;
    return true;
}
