import { Box, Typography, Button, ButtonGroup, Chip } from '@mui/material';
import { ColumnDef } from '@tanstack/react-table';
import React, { useState, useMemo } from 'react';

import { DataTable } from '../components';


// Sample data interface
interface SampleData {
    id: number;
    name: string;
    email: string;
    age: number;
    department: string;
    salary: number;
    joinDate: string;
    status: 'active' | 'inactive';
}

// Generate sample data
const generateSampleData = (count: number): SampleData[] => {
    const departments = [
        'Engineering',
        'Marketing',
        'Sales',
        'HR',
        'Finance',
    ];
    const statuses: ('active' | 'inactive')[] = ['active', 'inactive'];

    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        age: Math.floor(Math.random() * 40) + 25,
        department: departments[Math.floor(Math.random() * departments.length)],
        salary: Math.floor(Math.random() * 100000) + 40000,
        joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        status: statuses[Math.floor(Math.random() * statuses.length)],
    }));
};

export function VirtualizedExample() {
    const [datasetSize, setDatasetSize] = useState(1000);
    const [enableVirtualization, setEnableVirtualization] = useState(true);

    // Generate data based on selected size
    const data = useMemo(() => generateSampleData(datasetSize), [datasetSize]);

    // Define columns
    const columns: ColumnDef<SampleData>[] = [
        {
            id: 'id',
            header: 'ID',
            size: 80,
        },
        {
            accessorKey: 'name',
            header: 'Name',
            size: 150,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            size: 200,
        },
        {
            accessorKey: 'age',
            header: 'Age',
            size: 80,
        },
        {
            accessorKey: 'department',
            header: 'Department',
            size: 120,
        },
        {
            accessorKey: 'salary',
            header: 'Salary',
            size: 120,
            cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
        },
        {
            accessorKey: 'joinDate',
            header: 'Join Date',
            size: 120,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            size: 100,
            cell: ({ getValue }) => {
                const status = getValue<string>();
                return (
                    <Chip
                        label={status}
                        color={status === 'active' ? 'success' : 'default'}
                        size="small"
                    />
                );
            },
        },
    ];

    const datasetOptions = [
        {
            size: 100,
            label: '100 rows',
        },
        {
            size: 500,
            label: '500 rows',
        },
        {
            size: 1000,
            label: '1K rows',
        },
        {
            size: 5000,
            label: '5K rows',
        },
        {
            size: 10000,
            label: '10K rows',
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography
                variant="h4"
                gutterBottom
            >
                Virtualized DataTable Performance Test
            </Typography>

            <Typography
                variant="body1"
                sx={{ mb: 3 }}
            >
                Test the performance of the DataTable with different dataset sizes.
                Virtualization is recommended for datasets with 1000+ rows.
            </Typography>

            {/* Controls */}
            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                }}
            >
                <Typography variant="subtitle1">Dataset Size:</Typography>
                <ButtonGroup size="small">
                    {datasetOptions.map((option) => (
                        <Button
                            key={option.size}
                            variant={datasetSize === option.size ? 'contained' : 'outlined'}
                            onClick={() => setDatasetSize(option.size)}
                        >
                            {option.label}
                        </Button>
                    ))}
                </ButtonGroup>

                <Button
                    variant={enableVirtualization ? 'contained' : 'outlined'}
                    onClick={() => setEnableVirtualization(!enableVirtualization)}
                    color={enableVirtualization ? 'primary' : 'secondary'}
                >
                    Virtualization:
                    {' '}
                    {enableVirtualization ? 'ON' : 'OFF'}
                </Button>
            </Box>

            {/* Performance Info */}
            <Box
                sx={{
                    mb: 2,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Typography
                    variant="subtitle2"
                    gutterBottom
                >
                    Current Configuration:
                </Typography>
                <Typography variant="body2">
                    • Dataset:
                    {' '}
                    {datasetSize.toLocaleString()}
                    {' '}
                    rows ×
                    {' '}
                    {columns.length}
                    {' '}
                    columns
                </Typography>
                <Typography variant="body2">
                    • Virtualization:
                    {' '}
                    {enableVirtualization ? 'Enabled' : 'Disabled'}
                </Typography>
                <Typography variant="body2">
                    • Pagination:
                    {' '}
                    {enableVirtualization ? 'Disabled (not compatible with virtualization)' : 'Enabled'}
                </Typography>
                {datasetSize >= 1000 && !enableVirtualization && (
                    <Typography
                        variant="body2"
                        color="warning.main"
                    >
                        ⚠️ Large dataset without virtualization may cause performance issues
                    </Typography>
                )}
            </Box>

            {/* DataTable */}
            <DataTable
                columns={columns}
                data={data}
                enableRowSelection
                enableColumnResizing
                enableSorting
                enableGlobalFilter
                enableHover
                enableStripes
                fitToScreen
                maxHeight="500px"
                enableStickyHeaderOrFooter
                // Virtualization settings
                enableVirtualization={enableVirtualization}
                estimateRowHeight={52}
                // Disable pagination when virtualization is enabled
                enablePagination={!enableVirtualization}
            />
        </Box>
    );
}
