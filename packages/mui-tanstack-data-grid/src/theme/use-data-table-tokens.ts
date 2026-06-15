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
        const d = DENSITY_PRESETS[density] ?? DENSITY_PRESETS.standard;
        const vars: Record<string, string | number> = {
            [DT_VARS.borderColor]: pal.borderColor,
            [DT_VARS.headerBg]: pal.headerBg,
            [DT_VARS.headerColor]: pal.headerColor,
            [DT_VARS.rowBg]: theme.palette.background.paper,
            [DT_VARS.rowBgHover]: pal.rowHoverBg,
            [DT_VARS.rowBgSelected]: pal.selectedBg,
            [DT_VARS.rowBgStripe]: pal.stripeBg,
            [DT_VARS.pinnedBg]: pal.pinnedBg,
            [DT_VARS.pinnedShadow]: theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.18)',
            [DT_VARS.resizeHandle]: theme.palette.primary.main,
            [DT_VARS.rowHeight]: `${d.rowHeight}px`,
            [DT_VARS.headerHeight]: `${d.headerHeight}px`,
            [DT_VARS.cellPaddingX]: `${d.cellPaddingX}px`,
            [DT_VARS.cellPaddingY]: `${d.cellPaddingY}px`,
            [DT_VARS.fontSize]: d.fontSize,
            // Outer card radius. Derives from the theme but floors at 8px so the
            // default reads modern; consumers can drop it via --dt-radius / sx.
            [DT_VARS.radius]: `${Math.max(Number(theme.shape.borderRadius) || 0, 8)}px`,
            [DT_VARS.zHeader]: 3,
            [DT_VARS.zPinned]: 2,
        };
        return vars as CSSProperties;
    }, [theme, density]);
}
