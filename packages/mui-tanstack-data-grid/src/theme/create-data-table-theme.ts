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
    palette?: Partial<TanstackDataGridPalette>;
    defaultProps?: Partial<DataTableProps<any>>;
    styleOverrides?: Partial<Record<DataTableClassKey, any>>;
}

export function createDataTableTheme(options: CreateDataTableThemeOptions = {}): ThemeOptions {
    const { palette, defaultProps, styleOverrides } = options;

    const result: ThemeOptions = {
        components: {
            MuiTanstackDataGrid: {
                ...(defaultProps ? { defaultProps } : {}),
                ...(styleOverrides ? { styleOverrides } : {}),
            },
        },
    };

    if (palette) {
        result.palette = { tanstackDataGrid: palette };
    }

    return result;
}
