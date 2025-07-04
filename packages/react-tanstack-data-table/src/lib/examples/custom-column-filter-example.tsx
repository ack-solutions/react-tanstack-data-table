/**
 * Example: Custom Column Filter Feature Usage
 */
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';

import { DataTable } from '../components/table/data-table';
import { DataTableColumn } from '../types';

interface Person {
    id: number;
    name: string;
    age: number;
    department: string;
    salary: number;
    isActive: boolean;
}

const sampleData: Person[] = [
    { id: 1, name: 'John Doe', age: 30, department: 'Engineering', salary: 75000, isActive: true },
    { id: 2, name: 'Jane Smith', age: 25, department: 'Marketing', salary: 60000, isActive: true },
    { id: 3, name: 'Bob Johnson', age: 35, department: 'Engineering', salary: 85000, isActive: false },
    { id: 4, name: 'Alice Brown', age: 28, department: 'HR', salary: 55000, isActive: true },
    { id: 5, name: 'Charlie Wilson', age: 42, department: 'Sales', salary: 70000, isActive: true },
];

const columns: DataTableColumn<Person>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
        type: 'text',
    },
    {
        accessorKey: 'age',
        header: 'Age',
        type: 'number',
    },
    {
        accessorKey: 'department',
        header: 'Department',
        type: 'select',
        options: [
            { label: 'Engineering', value: 'Engineering' },
            { label: 'Marketing', value: 'Marketing' },
            { label: 'HR', value: 'HR' },
            { label: 'Sales', value: 'Sales' },
        ],
    },
    {
        accessorKey: 'salary',
        header: 'Salary',
        type: 'number',
        cell: ({ getValue }) => {
            const value = getValue() as number;
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(value);
        },
    },
    {
        accessorKey: 'isActive',
        header: 'Active',
        type: 'boolean',
    },
];

export function CustomColumnFilterExample() {
    const [data] = useState<Person[]>(sampleData);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Custom Column Filter Feature Example
            </Typography>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
                Click the filter icon in the toolbar to test the custom column filter feature.
            </Typography>

            <DataTable
                data={data}
                columns={columns}
                enableColumnFilter={true}
                enableGlobalFilter={true}
                enablePagination={true}
                enableSorting={true}
                onColumnFiltersChange={(filterState) => {
                    console.log('Custom Column Filter State Changed:', filterState);
                }}
            />
        </Box>
    );
} 