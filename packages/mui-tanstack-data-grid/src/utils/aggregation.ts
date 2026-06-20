/**
 * Footer aggregation — per-column totals computed over the **filtered**
 * (pre-pagination) rows in client mode. Server-side totals are out of scope
 * (the grid only holds the current page); a column's `aggregation` is then
 * computed over the loaded page.
 */
import type { Table } from '@tanstack/react-table';

export type AggregationFn = 'sum' | 'avg' | 'min' | 'max' | 'count';

/** The math. `count` covers all rows; sum/avg/min/max use the numeric values only. */
export function computeAggregation(kind: AggregationFn, values: any[]): number | null {
    if (kind === 'count') return values.length;
    const nums: number[] = [];
    for (const v of values) {
        if (v === null || v === undefined || v === '') continue;
        const n = Number(v);
        if (!Number.isNaN(n)) nums.push(n);
    }
    if (kind === 'sum') return nums.reduce((a, b) => a + b, 0);
    if (!nums.length) return null;
    if (kind === 'avg') return nums.reduce((a, b) => a + b, 0) / nums.length;
    // reduce (not Math.min/max spread) so 100k+ values don't blow the argument limit
    if (kind === 'min') return nums.reduce((a, b) => (b < a ? b : a));
    if (kind === 'max') return nums.reduce((a, b) => (b > a ? b : a));
    return null;
}

/** Display string for a computed total (avg rounded to 2dp; locale-grouped). */
export function formatAggregation(kind: AggregationFn | 'custom', value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'number') return String(value);
    const n = kind === 'avg' ? Math.round(value * 100) / 100 : value;
    return n.toLocaleString();
}

export interface ColumnTotal {
    kind: AggregationFn | 'custom';
    value: any;
}

/** Compute every aggregated column's total over the filtered, pre-pagination rows. */
export function computeColumnTotals(table: Table<any>): Record<string, ColumnTotal> {
    const model = (table as any).getPrePaginationRowModel?.() ?? table.getRowModel();
    const rows = model.rows as any[];
    const out: Record<string, ColumnTotal> = {};
    for (const col of table.getAllLeafColumns()) {
        const agg = (col.columnDef as any).aggregation;
        if (!agg) continue;
        if (typeof agg === 'function') {
            out[col.id] = { kind: 'custom', value: agg(rows.map((r) => r.original)) };
        } else {
            out[col.id] = { kind: agg, value: computeAggregation(agg, rows.map((r) => r.getValue(col.id))) };
        }
    }
    return out;
}

/** True when any column declares an `aggregation`. */
export function hasAnyAggregation(table: Table<any>): boolean {
    return table.getAllLeafColumns().some((c) => (c.columnDef as any).aggregation != null);
}
