import type { ComponentType } from 'react';

/**
 * Replaceable parts of the grid — the MUI `slots`/`slotProps` pattern.
 *
 * Like MUI, slots are a **flat** map of descriptively-named keys (not nested by
 * section): pass a component to swap a whole part, or an icon to swap just an
 * icon. Pair with {@link DataTableSlotProps} to inject props/`sx` into a part
 * without replacing it. Every entry is optional and falls back to the built-in.
 *
 * The keys fall into three groups — structural parts, toolbar controls, and
 * icons — separated by the comments below.
 */
export interface DataTableSlots {
    // ── Structure ─────────────────────────────────────────────
    root?: ComponentType<any>;
    scroller?: ComponentType<any>;
    grid?: ComponentType<any>;
    header?: ComponentType<any>;
    headerRow?: ComponentType<any>;
    headerCell?: ComponentType<any>;
    body?: ComponentType<any>;
    row?: ComponentType<any>;
    cell?: ComponentType<any>;
    detailPanel?: ComponentType<any>;
    footer?: ComponentType<any>;
    pagination?: ComponentType<any>;

    // ── Overlays ──────────────────────────────────────────────
    loadingOverlay?: ComponentType<any>;
    noRowsOverlay?: ComponentType<any>;

    // ── Toolbar & controls ────────────────────────────────────
    toolbar?: ComponentType<any>;
    searchInput?: ComponentType<any>;
    columnVisibilityControl?: ComponentType<any>;
    columnFilterControl?: ComponentType<any>;
    columnPinningControl?: ComponentType<any>;
    densityControl?: ComponentType<any>;
    resetButton?: ComponentType<any>;
    refreshButton?: ComponentType<any>;
    exportButton?: ComponentType<any>;
    bulkActionsToolbar?: ComponentType<any>;

    // ── Icons ─────────────────────────────────────────────────
    // Swap in your own icon set (e.g. lucide). Defaults are built-in line icons
    // (inline SVG / per-path MUI), so the grid never bundles the
    // `@mui/icons-material` barrel.
    sortIconAsc?: ComponentType<any>; // sorted ascending
    sortIconDesc?: ComponentType<any>; // sorted descending
    searchIcon?: ComponentType<any>; // global search
    filterIcon?: ComponentType<any>; // column-filter button
    addFilterIcon?: ComponentType<any>; // "Add filter" (filter popover)
    clearIcon?: ComponentType<any>; // clear search / remove a filter rule
    columnsIcon?: ComponentType<any>; // columns menu (visibility + pinning)
    densityIcon?: ComponentType<any>; // density selector
    exportIcon?: ComponentType<any>; // export button + menu
    refreshIcon?: ComponentType<any>; // refresh button
    resetIcon?: ComponentType<any>; // reset button
    expandIcon?: ComponentType<any>; // collapsed row (expand)
    collapseIcon?: ComponentType<any>; // expanded row (collapse)
    moreActionsIcon?: ComponentType<any>; // row-actions overflow menu (defaults to ⋮)
}

/**
 * Props injected into each slot, keyed by slot name (MUI `slotProps`). Three extra
 * keys configure the auto-generated special columns:
 *  - `selectionColumn` — overrides spread into the checkbox column
 *  - `expandColumn` — overrides spread into the expander column
 *  - `actionsColumn` — overrides spread into the row-actions column
 */
export type DataTableSlotProps = { [K in keyof DataTableSlots]?: Record<string, any> } & {
    selectionColumn?: Record<string, any>;
    expandColumn?: Record<string, any>;
    actionsColumn?: Record<string, any>;
};

export type PartialSlotProps = DataTableSlotProps;
