/**
 * Main DataTable Component (thin wrapper)
 *
 * Composes useDataTableEngine + DataTableProvider + DataTableView.
 * Preserves forwardRef API and DataTableApi surface.
 */
import React, { forwardRef, useImperativeHandle } from 'react';

import { DataTableProvider } from './contexts/data-table-context';
import { useDataTableEngine } from './hooks/use-data-table-engine';
import { DataTableView } from './components/data-table-view';
import type { DataTableProps } from './types/data-table.types';
import type { DataTableApi } from './types/data-table-api';


export const DataTable = forwardRef(function DataTable<T extends Record<string, any>>(
    props: DataTableProps<T>,
    ref: React.Ref<DataTableApi<T>>,
) {
    const engine = useDataTableEngine<T>(props);

    useImperativeHandle(ref, () => engine.refs.apiRef.current!, []);

    return (
        <DataTableProvider {...engine.providerProps}>
            <DataTableView<T> engine={engine} {...props} />
        </DataTableProvider>
    );
});