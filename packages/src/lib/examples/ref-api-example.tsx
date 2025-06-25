import { Button, Stack, Typography, Box } from '@mui/material';
import { useRef, useCallback } from 'react';

import { DataTable, DataTableApi } from '../index';


interface ExampleData {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'inactive';
    created: string;
}

const sampleData: ExampleData[] = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        status: 'active',
        created: '2024-01-01',
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        status: 'inactive',
        created: '2024-01-02',
    },
    {
        id: 3,
        name: 'Bob Johnson',
        email: 'bob@example.com',
        status: 'active',
        created: '2024-01-03',
    },
];

const columns = [
    {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
        size: 150,
    },
    {
        id: 'email',
        accessorKey: 'email',
        header: 'Email',
        size: 200,
    },
    {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        valueFormatter: ({ value }: any) => value?.toUpperCase() || '',
        size: 100,
    },
    {
        id: 'created',
        accessorKey: 'created',
        header: 'Created',
        size: 120,
    },
];

export function RefApiExample() {
    // Create ref for DataTable - similar to MUI DataGrid
    const dataTableRef = useRef<DataTableApi<ExampleData>>(null);

    // Example handlers using the ref API
    const handleRefresh = useCallback(() => {
        // Refresh data
        dataTableRef.current?.data.refresh();
    }, []);

    const handleSelectAll = useCallback(() => {
        // Select all rows
        dataTableRef.current?.selection.selectAllRows();
    }, []);

    const handleGetSelected = useCallback(() => {
        // Get selected rows
        const selectedRows = dataTableRef.current?.selection.getSelectedRows();
        console.log('Selected rows:', selectedRows);
        alert(`Selected ${selectedRows?.length || 0} rows. Check console for details.`);
    }, []);

    const handleResetLayout = useCallback(() => {
        // Reset entire layout
        dataTableRef.current?.layout.resetAll();
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Typography
                variant="h4"
                gutterBottom
            >
                DataTable Ref API Example
            </Typography>

            <Typography
                variant="body1"
                sx={{ mb: 3 }}
            >
                This example shows how to use the DataTable with a ref API similar to MUI DataGrid.
            </Typography>

            {/* Control Buttons */}
            <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 3 }}
            >
                <Button
                    variant="outlined"
                    onClick={handleRefresh}
                >
                    Refresh Data
                </Button>
                <Button
                    variant="outlined"
                    onClick={handleSelectAll}
                >
                    Select All
                </Button>
                <Button
                    variant="outlined"
                    onClick={handleGetSelected}
                >
                    Get Selected
                </Button>
                <Button
                    variant="outlined"
                    onClick={handleResetLayout}
                >
                    Reset Layout
                </Button>
            </Stack>

            {/* DataTable with ref */}
            <DataTable
                ref={dataTableRef}
                columns={columns}
                data={sampleData}
                enableRowSelection
                enableColumnResizing
                draggable
                enableColumnPinning
                enableSorting
                enableGlobalFilter
                enableColumnFilters
                enablePagination
            />
        </Box>
    );
}
