/**
 * Registers the grid as a first-class MUI themeable component, so consumers
 * override it with the SAME standard patterns as `MuiButton` / `MuiDataGrid`:
 *
 *   createTheme({
 *     palette: { tanstackDataGrid: { headerBg: '#eaeff5' } },
 *     components: {
 *       MuiTanstackDataGrid: {
 *         defaultProps: { density: 'compact' },
 *         styleOverrides: { root: { '--dt-border-color': '#e3e8ef' }, cell: { paddingInline: 12 } },
 *       },
 *     },
 *   })
 */
import type { ComponentsOverrides } from '@mui/material/styles';

import type { TanstackDataGridPalette } from './palette';
import type { DataTableProps } from '../types/data-table.types';

/** styleOverrides slot keys — exactly the styled slots in components/grid/styled.tsx. */
export type DataTableClassKey =
    | 'root'
    | 'scroller'
    | 'grid'
    | 'toolbar'
    | 'bulkActionsToolbar'
    | 'header'
    | 'headerRow'
    | 'headerCell'
    | 'body'
    | 'row'
    | 'cell'
    | 'listItem'
    | 'footerRow'
    | 'pinnedTopBand'
    | 'pinnedBottomBand'
    | 'detailPanel'
    | 'footer'
    | 'pagination'
    | 'loadingOverlay'
    | 'noRowsOverlay';

declare module '@mui/material/styles' {
    // Enables components.MuiTanstackDataGrid.styleOverrides.<slot>
    interface ComponentNameToClassKey {
        MuiTanstackDataGrid: DataTableClassKey;
    }

    // Enables components.MuiTanstackDataGrid.defaultProps
    interface ComponentsPropsList {
        MuiTanstackDataGrid: Partial<DataTableProps<any>>;
    }

    // Registers the component in the theme's component registry
    interface Components<Theme = unknown> {
        MuiTanstackDataGrid?: {
            defaultProps?: ComponentsPropsList['MuiTanstackDataGrid'];
            styleOverrides?: ComponentsOverrides<Theme>['MuiTanstackDataGrid'];
        };
    }

    // Palette namespace (single-source colours, like DataGrid's palette.DataGrid)
    interface Palette {
        tanstackDataGrid: TanstackDataGridPalette;
    }
    interface PaletteOptions {
        tanstackDataGrid?: Partial<TanstackDataGridPalette>;
    }
}
