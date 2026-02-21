import React, { useState } from 'react';
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
} from '@mui/material';
import { ColumnDef, TableState } from '@ackplus/react-tanstack-data-table';
import CrudDataGrid from '../../app/components/data-grid/crud-data-grid';
import { DataTableStateProvider } from '../../app/components/data-grid/datatable-state-context';
import ConfirmProvider from '../../app/components/data-grid/hooks/confirm-dialog-context';
import {
    useGetManyPublicApi,
    fetchManyPublicApi,
    type PublicApiUserRow,
} from '../../app/components/data-grid/hooks/use-public-api-query';
import {
    useGetManyFdaApi,
    fetchManyFdaApi,
    type FdaEventRow,
} from '../../app/components/data-grid/hooks/use-fda-api-query';

type DataSource = 'users' | 'events';

const noopMutate = async () => {};
const stubUseDelete = () => ({ mutateAsync: noopMutate });
const stubUseRestore = () => ({ mutateAsync: noopMutate });
const stubUseDeleteForever = () => ({ mutateAsync: noopMutate });
const stubUseBulkDelete = () => ({ mutateAsync: noopMutate });
const stubUseBulkRestore = () => ({ mutateAsync: noopMutate });
const stubUseBulkDeleteForever = () => ({ mutateAsync: noopMutate });

const userColumns: ColumnDef<PublicApiUserRow>[] = [
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

const eventColumns: ColumnDef<FdaEventRow>[] = [
    { accessorKey: 'id', header: 'Report ID', enableSorting: false, enableGlobalFilter: true },
    { accessorKey: 'receivedate', header: 'Receive date', enableSorting: true, enableGlobalFilter: true },
    { accessorKey: 'serious', header: 'Serious', enableSorting: false },
    { accessorKey: 'country', header: 'Country', enableSorting: false, enableGlobalFilter: true },
    { accessorKey: 'patientSex', header: 'Sex', enableSorting: false },
    { accessorKey: 'drug', header: 'Drug', enableSorting: false, enableGlobalFilter: true },
    { accessorKey: 'reaction', header: 'Reaction', enableSorting: false, enableGlobalFilter: true },
];

/** Maps table query to public API shape (skip, take, order, search). */
function publicApiRequestMap(qb: any, filters?: Partial<TableState>) {
    return { ...qb, search: filters?.globalFilter ?? '' };
}

/** Maps table query to FDA API shape (skip, take, order, search). */
function fdaApiRequestMap(qb: any, filters?: Partial<TableState>) {
    return { ...qb, search: filters?.globalFilter ?? '' };
}

/**
 * Real server-side example using CrudDataGrid + TanStack Query.
 * Data source: Users (DummyJSON, ~208) or Events (openFDA, ~20M). Edit/Delete are no-ops (public APIs).
 */
export function RealServerApiCrudExample() {
    const [dataSource, setDataSource] = useState<DataSource>('events');

    return (
        <Box>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }} flexWrap="wrap">
                <Typography variant="subtitle2" color="text.secondary">
                    CrudDataGrid + TanStack Query. Edit/Delete ignored (public API).
                </Typography>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel>Data source</InputLabel>
                    <Select
                        value={dataSource}
                        label="Data source"
                        onChange={(e) => setDataSource(e.target.value as DataSource)}
                    >
                        <MenuItem value="users">DummyJSON – Users (~208)</MenuItem>
                        <MenuItem value="events">openFDA – Drug events (~20M)</MenuItem>
                    </Select>
                </FormControl>
            </Stack>
            <DataTableStateProvider stateStorage="session">
                <ConfirmProvider>
                    {dataSource === 'users' ? (
                        <CrudDataGrid<PublicApiUserRow>
                            key="crud-users"
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
                            columns={userColumns}
                            dataTableApiRequestMap={publicApiRequestMap}
                            stateKey="real-api-crud-users"
                            maxHeight={`calc(100svh - ${320}px)`}
                            initialState={{
                                pagination: { pageIndex: 0, pageSize: 25 },
                            }}
                            slotProps={{
                                pagination: { rowsPerPageOptions: [10, 25, 50, 100] },
                            }}
                        />
                    ) : (
                        <CrudDataGrid<FdaEventRow>
                            key="crud-events"
                            crudName="Events"
                            idKey="id"
                            crudOperationHooks={{
                                useGetMany: (queryObj: any, opts?: { enabled?: boolean }) =>
                                    useGetManyFdaApi(queryObj, opts),
                                fetchMany: fetchManyFdaApi,
                                useDelete: stubUseDelete,
                                useRestore: stubUseRestore,
                                useDeleteForever: stubUseDeleteForever,
                                useBulkDelete: stubUseBulkDelete,
                                useBulkRestore: stubUseBulkRestore,
                                useBulkDeleteForever: stubUseBulkDeleteForever,
                            }}
                            columns={eventColumns}
                            dataTableApiRequestMap={fdaApiRequestMap}
                            stateKey="real-api-crud-events"
                            maxHeight={`calc(100svh - ${320}px)`}
                            // enableVirtualization={true}
                            // estimateRowHeight={72}
                            initialState={{
                                pagination: { pageIndex: 0, pageSize: 25 },
                            }}
                            slotProps={{
                                pagination: { rowsPerPageOptions: [10, 25, 50, 100, 500, 1000] },
                            }}
                        />
                    )}
                </ConfirmProvider>
            </DataTableStateProvider>
        </Box>
    );
}
