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
    /** Row / header heights are intrinsic layout dimensions, kept in px. */
    rowHeight: number;
    headerHeight: number;
    /** Cell padding, expressed in `theme.spacing()` UNITS (resolver multiplies by the theme's spacing). */
    cellPaddingX: number;
    cellPaddingY: number;
    /** Font-size multiplier applied to `theme.typography.body2.fontSize` (so size follows the theme). */
    fontScale: number;
}

// Padding is in spacing units and font-size is a scale on the theme's body2 size, so
// both track the MUI theme (`spacing` = 8px and `body2` = 0.875rem by default reproduce
// the previous 8/16px padding and 0.8125/0.875/0.9375rem sizes).
export const DENSITY_PRESETS: Record<DataTableDensity, DensityTokens> = {
    compact: { rowHeight: 36, headerHeight: 40, cellPaddingX: 1, cellPaddingY: 0.75, fontScale: 0.9286 },
    standard: { rowHeight: 48, headerHeight: 52, cellPaddingX: 2, cellPaddingY: 2, fontScale: 1 },
    comfortable: { rowHeight: 60, headerHeight: 64, cellPaddingX: 2.5, cellPaddingY: 2.5, fontScale: 1.0714 },
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
