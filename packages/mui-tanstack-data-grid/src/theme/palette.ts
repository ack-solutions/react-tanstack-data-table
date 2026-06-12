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
    const p = theme.palette;
    const user = (p as unknown as { tanstackDataGrid?: Partial<TanstackDataGridPalette> }).tanstackDataGrid ?? {};
    const dark = p.mode === 'dark';
    return {
        headerBg: user.headerBg ?? (dark ? p.grey[900] : p.grey[100]),
        headerColor: user.headerColor ?? p.text.secondary,
        borderColor: user.borderColor ?? p.divider,
        pinnedBg: user.pinnedBg ?? p.background.paper,
        rowHoverBg: user.rowHoverBg ?? p.action.hover,
        selectedBg: user.selectedBg ?? p.action.selected,
        stripeBg: user.stripeBg ?? (dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
    };
}
