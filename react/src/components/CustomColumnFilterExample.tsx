/**
 * Example: Custom Column Filter Feature Usage
 */
import React, { useCallback, useState } from 'react';
import { DataTable, DataTableColumn } from '../../../packages/src';
import { Box, Typography, Paper, Stack } from '@mui/material';

interface Person {
    id: number;
    name: string;
    age: number;
    email: string;
    city: string;
}

// Sample data
const sampleData: Person[] = [
    { id: 1, name: 'John Doe', age: 28, email: 'john@example.com', city: 'New York' },
    { id: 2, name: 'Jane Smith', age: 34, email: 'jane@example.com', city: 'Los Angeles' },
    { id: 3, name: 'Bob Johnson', age: 45, email: 'bob@example.com', city: 'Chicago' },
    { id: 4, name: 'Alice Brown', age: 31, email: 'alice@example.com', city: 'Houston' },
    { id: 5, name: 'Charlie Wilson', age: 29, email: 'charlie@example.com', city: 'Phoenix' },
    { id: 6, name: 'Diana Prince', age: 35, email: 'diana@example.com', city: 'New York' },
    { id: 7, name: 'Edward Norton', age: 42, email: 'edward@example.com', city: 'Los Angeles' },
    { id: 8, name: 'Fiona Green', age: 27, email: 'fiona@example.com', city: 'Chicago' },
];

export const CustomColumnFilterExample: React.FC = () => {
    const [clientData, setClientData] = useState<Person[]>(sampleData);
    const [serverData, setServerData] = useState<Person[]>(sampleData);
    const [serverLoading, setServerLoading] = useState(false);
    const [serverFetchCount, setServerFetchCount] = useState(0);

    // Simulate server-side data fetching
    const handleServerFetchData = useCallback(async (params: any) => {
        console.log('🚀 Server fetch triggered with params:', params);
        setServerFetchCount(prev => prev + 1);
        setServerLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate server-side filtering
        let filteredData = [...sampleData];

        if (params.customColumnsFilter?.filters?.length > 0) {
            const { filters, logic } = params.customColumnsFilter;
            console.log('🔍 Server filtering with:', { filters, logic });

            filteredData = filteredData.filter(item => {
                const results = filters.map((filter: any) => {
                    const value = (item as any)[filter.columnId];
                    switch (filter.operator) {
                        case 'contains':
                            return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
                        case 'equals':
                            return value === filter.value;
                        case 'greaterThan':
                            return Number(value) > Number(filter.value);
                        case 'lessThan':
                            return Number(value) < Number(filter.value);
                        default:
                            return true;
                    }
                });

                return logic === 'AND' ? results.every(Boolean) : results.some(Boolean);
            });
        }

        console.log(`📊 Server returning ${filteredData.length} rows out of ${sampleData.length}`);
        return {
            data: filteredData,
            total: filteredData.length,
        };
    }, []);

    const columns: DataTableColumn<Person>[] = [
        { accessorKey: 'id', header: 'ID', size: 80, type: 'number' },
        { accessorKey: 'name', header: 'Name', size: 150 },
        { accessorKey: 'age', header: 'Age', size: 80, type: 'number', },
        { accessorKey: 'email', header: 'Email', size: 200 },
        { accessorKey: 'city', header: 'City', size: 120, type: 'select', options: [{ label: 'New York', value: 'New York' }, { label: 'Los Angeles', value: 'Los Angeles' }, { label: 'Chicago', value: 'Chicago' }, { label: 'Houston', value: 'Houston' }, { label: 'Phoenix', value: 'Phoenix' }] },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Custom Column Filter Example
            </Typography>

            <Typography variant="body1" sx={{ mb: 3 }}>
                This example demonstrates custom column filtering in both client-side and server-side modes.
            </Typography>

            <Stack spacing={4}>
                {/* Client-side filtering example */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Client-Side Filtering
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                        Filters are applied immediately using the custom filter function.
                        Check console for "🔍 Custom filter function called!" logs.
                    </Typography>

                    <DataTable
                        columns={columns}
                        data={clientData}
                        dataMode="client"
                        filterMode="client"
                        enableCustomColumnsFilter={true}
                        enableGlobalFilter={true}
                        enablePagination={false}
                        maxHeight="400px"
                        enableStickyHeaderOrFooter={true}
                    />
                </Paper>

                {/* Server-side filtering example */}
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Server-Side Filtering
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Data is fetched only when "Apply Filters" is clicked, not on every filter change.
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Server Fetch Count: {serverFetchCount}
                        </Typography>
                    </Box>

                    <DataTable
                        columns={columns}
                        dataMode="server"
                        filterMode="server"
                        onFetchData={handleServerFetchData}
                        enableCustomColumnsFilter={true}
                        enableGlobalFilter={true}
                        enablePagination={false}
                        maxHeight="400px"
                        enableStickyHeaderOrFooter={true}
                    />
                </Paper>

                {/* Instructions */}
                <Paper sx={{ p: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="h6" gutterBottom>
                        How to Test:
                    </Typography>
                    <Typography variant="body2" component="div">
                        <ol>
                            <li><strong>Client-side:</strong> Open custom filters, add filters, click Apply. Check console for filter function logs.</li>
                            <li><strong>Server-side:</strong> Open custom filters, add filters, click Apply. Notice the fetch count increases only on Apply.</li>
                            <li><strong>Try filters like:</strong>
                                <ul>
                                    <li>Name contains "John"</li>
                                    <li>Age greater than 30</li>
                                    <li>City equals "New York"</li>
                                </ul>
                            </li>
                        </ol>
                    </Typography>
                </Paper>
            </Stack>
        </Box>
    );
}; 