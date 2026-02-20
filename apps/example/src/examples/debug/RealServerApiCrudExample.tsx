import React from 'react';
import { Box, Typography } from '@mui/material';
import { ColumnDef, TableState } from '@ackplus/react-tanstack-data-table';
import CrudDataGrid from '../../app/components/data-grid/crud-data-grid';
import { DataTableStateProvider } from '../../app/components/data-grid/datatable-state-context';
import ConfirmProvider from '../../app/components/data-grid/hooks/confirm-dialog-context';
import {
    useGetManyPublicApi,
    fetchManyPublicApi,
    type PublicApiUserRow,
} from '../../app/components/data-grid/hooks/use-public-api-query';

const noopMutate = async () => {};
const stubUseDelete = () => ({ mutateAsync: noopMutate });
const stubUseRestore = () => ({ mutateAsync: noopMutate });
const stubUseDeleteForever = () => ({ mutateAsync: noopMutate });
const stubUseBulkDelete = () => ({ mutateAsync: noopMutate });
const stubUseBulkRestore = () => ({ mutateAsync: noopMutate });
const stubUseBulkDeleteForever = () => ({ mutateAsync: noopMutate });

const columns: ColumnDef<PublicApiUserRow>[] = [
    { accessorKey: 'id', header: 'ID', enableSorting: true, enableGlobalFilter: true },
    { accessorKey: 'firstName', header: 'First name', enableSorting: true, enableGlobalFilter: true },
    { accessorKey: 'lastName', header: 'Last name', enableSorting: true, enableGlobalFilter: true },
    { accessorKey: 'email', header: 'Email', enableSorting: true, enableGlobalFilter: true },
    { accessorKey: 'age', header: 'Age', enableSorting: true },
    { accessorKey: 'gender', header: 'Gender', enableSorting: true, enableGlobalFilter: true },
    { accessorKey: 'companyName', header: 'Company', enableSorting: true, enableGlobalFilter: true },
    { accessorKey: 'companyTitle', header: 'Title', enableSorting: true, enableGlobalFilter: true },
    { accessorKey: 'domain', header: 'Domain', enableSorting: true, enableGlobalFilter: true },
];

/**
 * Maps table query (skip, take, order, where) to public API shape.
 * Override for this example: we only need skip, take, order, search (globalFilter).
 */
function publicApiRequestMap(qb: any, filters?: Partial<TableState>) {
    return { ...qb, search: filters?.globalFilter ?? '' };
}

/**
 * Real server-side example using CrudDataGrid + TanStack Query.
 * Fetches from DummyJSON; edit/delete are no-ops (public API).
 * Page size options capped to reduce lag (no 1000 rows).
 */
export function RealServerApiCrudExample() {
    return (
        <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                CrudDataGrid + TanStack Query (DummyJSON). Edit/Delete ignored for public API.
            </Typography>
            <DataTableStateProvider stateStorage="session">
                <ConfirmProvider>
                    <CrudDataGrid<PublicApiUserRow>
                        crudName="Users"
                        idKey="id"
                        crudOperationHooks={{
                            useGetMany: (queryObj: any, opts?: { enabled?: boolean }) =>
                                useGetManyPublicApi(queryObj, opts),
                            fetchMany: fetchManyPublicApi,
                            useDelete: stubUseDelete,
                            useRestore: stubUseRestore,
                            useDeleteForever: stubUseDeleteForever,
                            useBulkDelete: stubUseBulkDelete,
                            useBulkRestore: stubUseBulkRestore,
                            useBulkDeleteForever: stubUseBulkDeleteForever,
                        }}
                        columns={columns}
                        dataTableApiRequestMap={publicApiRequestMap}
                        stateKey="real-api-crud-debug"
                        maxHeight={`calc(100svh - ${320}px)`}
                        initialState={{
                            pagination: { pageIndex: 0, pageSize: 25 },
                        }}
                        slotProps={{
                            pagination: { rowsPerPageOptions: [10, 25, 50, 100] },
                        }}
                    />
                </ConfirmProvider>
            </DataTableStateProvider>
        </Box>
    );
}
