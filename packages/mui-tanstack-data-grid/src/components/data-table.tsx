/**
 * <DataTable> — the public component.
 *
 * Merges theme `defaultProps`/`styleOverrides` via `useThemeProps` (so it themes
 * like any MUI component), runs the headless `useDataTable` engine, and renders
 * the div/CSS-Grid `GridView`. Pass `apiRef` to get the imperative handle.
 */
import { useThemeProps } from '@mui/material/styles';
import { useEffect, type ReactNode } from 'react';

import { useDataTable } from '../core/use-data-table';
import type { DataTableProps } from '../types/data-table.types';
import { GridView } from './grid/grid-view';

export function DataTable<T extends Record<string, any>>(inProps: DataTableProps<T>): ReactNode {
    const props = useThemeProps({ props: inProps, name: 'MuiTanstackDataGrid' }) as DataTableProps<T>;
    const engine = useDataTable<T>(props);

    useEffect(() => {
        if (props.apiRef) props.apiRef.current = engine.api;
    });

    return <GridView<T> engine={engine} {...props} />;
}
