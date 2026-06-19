/**
 * Convenience helper to build a `ThemeOptions` fragment for the grid, to spread
 * into `createTheme()`. Equivalent to writing `palette.tanstackDataGrid` +
 * `components.MuiTanstackDataGrid` by hand.
 */
import type { ThemeOptions } from '@mui/material/styles';

import type { TanstackDataGridPalette } from './palette';
import type { DataTableClassKey } from './mui-augmentation';
import type { DataTableProps } from '../types/data-table.types';

export interface CreateDataTableThemeOptions {
    /** Grid palette overrides (applied to the light scheme, and dark unless `darkPalette` is set). */
    palette?: Partial<TanstackDataGridPalette>;
    /** Dark-scheme grid palette overrides. Defaults to `palette`. */
    darkPalette?: Partial<TanstackDataGridPalette>;
    defaultProps?: Partial<DataTableProps<any>>;
    styleOverrides?: Partial<Record<DataTableClassKey, any>>;
}

export function createDataTableTheme(options: CreateDataTableThemeOptions = {}): ThemeOptions {
    const { palette, darkPalette, defaultProps, styleOverrides } = options;

    const result: ThemeOptions = {
        components: {
            MuiTanstackDataGrid: {
                ...(defaultProps ? { defaultProps } : {}),
                ...(styleOverrides ? { styleOverrides } : {}),
            },
        },
    };

    if (palette || darkPalette) {
        // Emit per-scheme overrides instead of a flat top-level `palette`, so the
        // result composes cleanly with a `cssVariables` + `colorSchemes` app theme
        // and the grid palette stays dark-mode aware.
        result.colorSchemes = {
            light: { palette: { tanstackDataGrid: palette ?? {} } },
            dark: { palette: { tanstackDataGrid: darkPalette ?? palette ?? {} } },
        } as unknown as ThemeOptions['colorSchemes'];
    }

    return result;
}
