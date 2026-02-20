import {
    DataTable,
    DataTableApi,
    DataTableProps,
} from '@ackplus/react-tanstack-data-table';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useDataTablePersistence } from './hooks/use-data-table-persistence';

interface DataGridProps<T> extends DataTableProps<T> {
    stateKey?: string;
    defaultHiddenColumns?: string[];
}

const DataGrid = forwardRef<DataTableApi<any>, DataGridProps<any>>(
    (
        {
            columns,
            totalRow = 0,
            idKey,
            maxHeight = '100%',
            stateKey,
            defaultHiddenColumns,
            onDataStateChange,
            initialState: initialStateProp,
            ...props
        },
        ref,
    ) => {
        const tableRef = useRef<DataTableApi<any>>(null);
        useImperativeHandle(ref, () => tableRef.current!, []);

        const { initialState, handleTableStateChange, handleLayoutChange } =
            useDataTablePersistence({
                stateKey,
                tableRef,
                defaultHiddenColumns,
                initialState: initialStateProp,
                onDataStateChange,
            });

        return (
            <DataTable
                ref={tableRef}
                columns={columns}
                idKey={idKey}
                totalRow={totalRow}
                enableStickyHeaderOrFooter
                enableColumnDragging
                enableGlobalFilter
                enableColumnFilter
                enableSorting
                enableHover
                enableColumnResizing
                enableColumnPinning
                enableStripes
                maxHeight={maxHeight}
                onDataStateChange={handleTableStateChange}
                onColumnVisibilityChange={handleLayoutChange}
                onColumnDragEnd={handleLayoutChange}
                onColumnPinningChange={handleLayoutChange}
                onColumnSizingChange={handleLayoutChange}
                initialState={initialState}
                {...props}
                slotProps={{
                    pagination: { rowsPerPageOptions: [10, 25, 50, 100, 500] },
                    toolbar: { sx: { minHeight: '48px !important' } },
                    ...props.slotProps,
                }}
            />
        );
    },
);

DataGrid.displayName = 'DataGrid';

export default DataGrid;
