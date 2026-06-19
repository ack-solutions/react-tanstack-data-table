/**
 * Grid palette namespace — the "set colours once, in the theme" path.
 *
 * Mirrors MUI X DataGrid's `palette.DataGrid`. Every key DEFAULTS from the base
 * MUI palette, so it is never a second source of truth: set `palette.divider`
 * (or `palette.tanstackDataGrid.borderColor`) once and the grid follows.
 */
import type { Theme } from '@mui/material/styles';

export interface TanstackDataGridPalette {
    headerBg: string;
    headerColor: string;
    borderColor: string;
    pinnedBg: string;
    rowHoverBg: string;
    selectedBg: string;
    stripeBg: string;
}

/**
 * Resolve the effective grid palette: user overrides
 * (`theme.palette.tanstackDataGrid`) layered on defaults derived from the base
 * MUI palette.
 */
export function resolveDataGridPalette(theme: Theme): TanstackDataGridPalette {
    // Prefer the CSS-variable palette (`theme.vars`) so colours follow
    // `colorSchemes` under MUI `cssVariables: true`; fall back to the resolved
    // palette for classic themes (where `palette.mode` reflects the active scheme).
    const p: any = (theme.vars ?? theme).palette;
    const user = (theme.palette as unknown as { tanstackDataGrid?: Partial<TanstackDataGridPalette> }).tanstackDataGrid ?? {};
    const dark = theme.palette.mode === 'dark';
    return {
        // headerBg / stripeBg are mode-dependent: their scheme-aware defaults are
        // emitted by the GridRoot styled (via `applyStyles('dark')`). The values
        // below are only used by direct callers of this helper.
        headerBg: user.headerBg ?? (dark ? p.grey[900] : p.grey[50]),
        headerColor: user.headerColor ?? p.text.secondary,
        borderColor: user.borderColor ?? p.divider,
        pinnedBg: user.pinnedBg ?? p.background.paper,
        rowHoverBg: user.rowHoverBg ?? p.action.hover,
        selectedBg: user.selectedBg ?? p.action.selected,
        stripeBg: user.stripeBg ?? (dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
    };
}
