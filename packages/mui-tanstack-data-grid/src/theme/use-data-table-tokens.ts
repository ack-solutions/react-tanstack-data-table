/**
 * Resolves the full set of `--dt-*` CSS variables from the MUI theme + density.
 * Apply the returned object to the grid root's `style`; every cell/row/header
 * then reads its visuals from `var(--dt-*)`, so a theme change restyles the grid
 * with no per-cell work.
 */
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';

import { DENSITY_PRESETS, DT_VARS, type DataTableDensity } from './tokens';
import { resolveDataGridPalette } from './palette';

export function useDataTableTokens(density: DataTableDensity = 'standard'): CSSProperties {
    const theme = useTheme();
    return useMemo(() => {
        const pal = resolveDataGridPalette(theme);
        const p: any = (theme.vars ?? theme).palette;
        // Raw overrides only (so an unset mode-dependent token falls through to the
        // GridRoot styled's scheme-aware default instead of pinning to one mode).
        const userPal = (theme.palette as unknown as { tanstackDataGrid?: Record<string, string> }).tanstackDataGrid ?? {};
        const d = DENSITY_PRESETS[density] ?? DENSITY_PRESETS.standard;
        // Font size follows the theme's body2 size, scaled per density (via CSS calc so
        // any unit — rem/px/em — works). A numeric fontSize is normalised to px first.
        const baseFont = theme.typography.body2?.fontSize ?? '0.875rem';
        const baseFontStr = typeof baseFont === 'number' ? `${baseFont}px` : baseFont;
        const fontSize = d.fontScale === 1 ? baseFontStr : `calc(${baseFontStr} * ${d.fontScale})`;
        const vars: Record<string, string | number> = {
            [DT_VARS.borderColor]: pal.borderColor,
            [DT_VARS.headerColor]: pal.headerColor,
            [DT_VARS.rowBg]: p.background.paper,
            [DT_VARS.rowBgHover]: pal.rowHoverBg,
            [DT_VARS.rowBgSelected]: pal.selectedBg,
            [DT_VARS.pinnedBg]: pal.pinnedBg,
            [DT_VARS.resizeHandle]: p.primary.main,
            // Selection ("bulk actions") bar. Defaults from the primary palette (like the
            // resize handle) — self-flips per colorScheme via `p = (theme.vars ?? theme).palette`.
            // Retint per-instance with `sx={{ '--dt-bulkbar-bg': … }}`, theme-wide via
            // `styleOverrides.bulkActionsToolbar`, or per-instance via `slotProps.bulkActionsToolbar`.
            [DT_VARS.bulkBarBg]: p.primary.main,
            [DT_VARS.bulkBarFg]: p.primary.contrastText,
            // headerBg / stripe / pinnedShadow defaults are scheme-aware in the
            // GridRoot styled; only emit them inline when explicitly overridden.
            ...(userPal.headerBg ? { [DT_VARS.headerBg]: userPal.headerBg } : {}),
            ...(userPal.stripeBg ? { [DT_VARS.rowBgStripe]: userPal.stripeBg } : {}),
            [DT_VARS.rowHeight]: `${d.rowHeight}px`,
            [DT_VARS.headerHeight]: `${d.headerHeight}px`,
            // Padding tracks the theme's spacing scale (units → theme.spacing()).
            [DT_VARS.cellPaddingX]: theme.spacing(d.cellPaddingX),
            [DT_VARS.cellPaddingY]: theme.spacing(d.cellPaddingY),
            [DT_VARS.fontSize]: fontSize,
            // Outer card radius. Derives from the theme but floors at 8px so the
            // default reads modern; consumers can drop it via --dt-radius / sx.
            [DT_VARS.radius]: `${Math.max(Number(theme.shape.borderRadius) || 0, 8)}px`,
            [DT_VARS.zHeader]: 3,
            [DT_VARS.zPinned]: 2,
            // Pinned-row bands sit above the header corner (so a both-row+column-pinned
            // cell out-ranks the sticky header and other pinned columns).
            [DT_VARS.zRowPinned]: 4,
        };
        return vars as CSSProperties;
    }, [theme, density]);
}
