/**
 * Layout snapshot for `api.layout.saveLayout()` and saved views. Normalizes the
 * capture so a view round-trips only the APPLIED state and a dirty check is stable:
 *  - the column filter drops its `pendingFilters`/`pendingLogic` staging buffer (which
 *    churns merely on opening the filter panel), keeping only applied filters;
 *  - density is captured only when the engine owns it (omitted when it's a controlled
 *    prop, which the engine can't restore anyway).
 * Compare two snapshots with {@link stableStringify} so Record key-insertion order
 * (column visibility/sizing toggled in a different order) never reads as a change.
 */
import type { TableState } from '../types/state.types';
import type { DataTableDensity } from '../theme/tokens';
import type { ViewBody } from '../types/views.types';

/** JSON with object keys sorted recursively → structurally-equal values stringify equal. */
export function stableStringify(value: unknown): string {
    return JSON.stringify(value, (_key, v) =>
        v && typeof v === 'object' && !Array.isArray(v)
            ? Object.keys(v as Record<string, unknown>)
                  .sort()
                  .reduce((acc, k) => {
                      acc[k] = (v as Record<string, unknown>)[k];
                      return acc;
                  }, {} as Record<string, unknown>)
            : v,
    );
}

export function buildViewSnapshot(state: Partial<TableState>, density?: DataTableDensity): ViewBody {
    const cf = state.columnFilter;
    return {
        columnVisibility: state.columnVisibility ?? {},
        columnOrder: state.columnOrder ?? [],
        columnSizing: state.columnSizing ?? {},
        columnPinning: state.columnPinning ?? { left: [], right: [] },
        rowPinning: state.rowPinning ?? { top: [], bottom: [] },
        pagination: state.pagination ?? { pageIndex: 0, pageSize: 10 },
        globalFilter: state.globalFilter ?? '',
        // Applied filters only — the pending staging buffer never belongs in a view.
        columnFilter: cf ? { filters: cf.filters ?? [], logic: cf.logic ?? 'AND', pendingFilters: [], pendingLogic: cf.logic ?? 'AND' } : cf,
        sorting: state.sorting ?? [],
        ...(density !== undefined ? { density } : {}),
    };
}
