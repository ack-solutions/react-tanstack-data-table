/**
 * Design tokens for the data grid.
 *
 * Tokens are CSS custom properties whose DEFAULTS derive from the MUI theme
 * (see `use-data-table-tokens.ts`). They are an optional override surface — the
 * MUI theme remains the single source of truth. This mirrors how MUI X DataGrid
 * exposes `--DataGrid-*` variables that default from `palette.DataGrid`.
 */

export type DataTableDensity = 'compact' | 'standard' | 'comfortable';

export interface DensityTokens {
    rowHeight: number;
    headerHeight: number;
    cellPaddingX: number;
    cellPaddingY: number;
    fontSize: string;
}

export const DENSITY_PRESETS: Record<DataTableDensity, DensityTokens> = {
    compact: { rowHeight: 36, headerHeight: 40, cellPaddingX: 8, cellPaddingY: 4, fontSize: '0.8125rem' },
    standard: { rowHeight: 48, headerHeight: 52, cellPaddingX: 16, cellPaddingY: 8, fontSize: '0.875rem' },
    comfortable: { rowHeight: 60, headerHeight: 64, cellPaddingX: 16, cellPaddingY: 12, fontSize: '0.9375rem' },
};

/**
 * The themeable CSS-variable names. Keep this the single registry of token names
 * so render components and the resolver never drift.
 */
export const DT_VARS = {
    borderColor: '--dt-border-color',
    headerBg: '--dt-header-bg',
    headerColor: '--dt-header-color',
    rowBg: '--dt-row-bg',
    rowBgHover: '--dt-row-bg-hover',
    rowBgSelected: '--dt-row-bg-selected',
    rowBgStripe: '--dt-row-bg-stripe',
    pinnedBg: '--dt-pinned-bg',
    pinnedShadow: '--dt-pinned-shadow',
    resizeHandle: '--dt-resize-handle',
    rowHeight: '--dt-row-height',
    headerHeight: '--dt-header-height',
    cellPaddingX: '--dt-cell-padding-x',
    cellPaddingY: '--dt-cell-padding-y',
    fontSize: '--dt-font-size',
    radius: '--dt-radius',
    zHeader: '--dt-z-header',
    zPinned: '--dt-z-pinned',
    zRowPinned: '--dt-z-row-pinned',
} as const;

export type DataTableVarName = (typeof DT_VARS)[keyof typeof DT_VARS];
