/**
 * Server-Side Data Fetching Example
 * 
 * This example demonstrates:
 * - Server-side data fetching with onFetchData
 * - Proper API ref usage with state management
 * - Page-based selection (selectMode = 'page')
 * - Filtering, sorting, and pagination
 * - Bulk actions with server selection
 * - Export functionality
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Alert,
    Chip,
    Stack,
    CircularProgress,
    Divider,
    Paper
} from '@mui/material';
import { DataTable } from '../components/table/data-table';
import { DataTableApi, DataTableColumn, DEFAULT_SELECTION_COLUMN_NAME } from '../types';
import { TableFilters } from '../types';
import { SelectionState } from '../features';

// Sample data interface
interface Employee {
    id: number;
    name: string;
    email: string;
    department: string;
    role: string;
    salary: number;
    isActive: boolean;
    joinDate: string;
}

// Mock server data - In real app, this would be your API endpoint
const MOCK_EMPLOYEES: Employee[] = Array.from({ length: 1000 }, (_, index) => {
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    const roles = ['Manager', 'Senior', 'Junior', 'Lead', 'Director', 'Specialist'];
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return {
        id: index + 1,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@company.com`,
        department: departments[Math.floor(Math.random() * departments.length)],
        role: roles[Math.floor(Math.random() * roles.length)],
        salary: Math.floor(Math.random() * 80000) + 40000,
        isActive: Math.random() > 0.15, // 85% active
        joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    };
});

export function ServerSideFetchingExample() {
    // State management
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectionInfo, setSelectionInfo] = useState<SelectionState | null>(null);
    const [lastFetchParams, setLastFetchParams] = useState<any>(null);
    const [fetchCount, setFetchCount] = useState(0);
    const [tab, setTab] = useState('all');

    // API ref for programmatic control
    const apiRef = useRef<DataTableApi<Employee>>(null);

    // Simulate server API call with realistic delays and filtering
    const handleFetchData = useCallback(async (filters: Partial<TableFilters>) => {
        console.log('🔄 Fetching data with filters:', filters);
        setLoading(true);
        setError(null);
        setLastFetchParams(filters);
        setFetchCount(prev => prev + 1);

        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

            let filteredData = [...MOCK_EMPLOYEES];

            // Apply global filter (search)
            if (filters.globalFilter) {
                const searchTerm = filters.globalFilter.toLowerCase();
                filteredData = filteredData.filter(employee =>
                    employee.name.toLowerCase().includes(searchTerm) ||
                    employee.email.toLowerCase().includes(searchTerm) ||
                    employee.department.toLowerCase().includes(searchTerm) ||
                    employee.role.toLowerCase().includes(searchTerm)
                );
            }

            // Apply custom column filters
            if (filters.columnFilter?.filters?.length) {
                filteredData = filteredData.filter(employee => {
                    return filters.columnFilter!.filters.every((filter: any) => {
                        const value = employee[filter.columnId as keyof Employee];
                        const filterValue = filter.value;

                        switch (filter.operator) {
                            case 'equals':
                                return value === filterValue;
                            case 'contains':
                                return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
                            case 'startsWith':
                                return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());
                            case 'endsWith':
                                return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());
                            case 'greaterThan':
                                return Number(value) > Number(filterValue);
                            case 'lessThan':
                                return Number(value) < Number(filterValue);
                            default:
                                return true;
                        }
                    });
                });
            }

            // Apply sorting
            if (filters.sorting?.length) {
                filteredData.sort((a, b) => {
                    for (const sort of filters.sorting!) {
                        const aValue = a[sort.id as keyof Employee];
                        const bValue = b[sort.id as keyof Employee];

                        let comparison = 0;
                        if (aValue < bValue) comparison = -1;
                        else if (aValue > bValue) comparison = 1;

                        if (comparison !== 0) {
                            return sort.desc ? -comparison : comparison;
                        }
                    }
                    return 0;
                });
            }

            const total = filteredData.length;

            // Apply pagination
            let pageData = filteredData;
            if (filters.pagination) {
                const { pageIndex = 0, pageSize = 10 } = filters.pagination;
                const start = pageIndex * pageSize;
                const end = start + pageSize;
                pageData = filteredData.slice(start, end);
            }
            return {
                data: pageData,
                total: total,
            };
        } catch (err) {
            console.error('❌ Error fetching data:', err);
            setError('Failed to fetch data. Please try again.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [tab]);

    // Handle selection changes
    const handleSelectionChange = useCallback((selection: SelectionState) => {
        console.log('🔄 Selection changed:', selection);
        setSelectionInfo(selection);
    }, []);

    useEffect(() => {
        console.log('🔄 Tab changed:', tab);
        if (tab && tab !== 'all') {
            apiRef.current?.data.refresh();
        }
    }, [tab]);

    // Handle server export
    const handleServerExport = useCallback(async (filters: any, selection: SelectionState) => {
        console.log('📤 Exporting data with filters:', filters);
        console.log('📤 Export selection:', selection);

        // Simulate export API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In real app, you would send filters and selection to your export API
        let exportData = [...MOCK_EMPLOYEES];

        // Apply the same filtering logic as fetch
        if (filters?.globalFilter) {
            const searchTerm = filters.globalFilter.toLowerCase();
            exportData = exportData.filter(employee =>
                employee.name.toLowerCase().includes(searchTerm) ||
                employee.email.toLowerCase().includes(searchTerm) ||
                employee.department.toLowerCase().includes(searchTerm) ||
                employee.role.toLowerCase().includes(searchTerm)
            );
        }

        // Apply selection filtering for export
        if (selection.type === 'include' && selection.ids.length > 0) {
            // Export only selected rows
            exportData = exportData.filter(employee =>
                selection.ids.includes(employee.id.toString())
            );
        } else if (selection.type === 'exclude' && selection.ids.length > 0) {
            // Export all except excluded rows
            exportData = exportData.filter(employee =>
                !selection.ids.includes(employee.id.toString())
            );
        }

        return {
            data: exportData,
            total: exportData.length,
        };
    }, []);

    // Define columns
    const columns: DataTableColumn<Employee>[] = [
        {
            id: 'name',
            accessorKey: 'name',
            header: 'Name',
            size: 200,
            enableGlobalFilter: true,
        },
        {
            id: 'email',
            accessorKey: 'email',
            header: 'Email',
            size: 250,
            enableGlobalFilter: true,
        },
        {
            id: 'department',
            accessorKey: 'department',
            header: 'Department',
            size: 150,
            enableGlobalFilter: true,
        },
        {
            id: 'role',
            accessorKey: 'role',
            header: 'Role',
            size: 120,
            enableGlobalFilter: true,
        },
        {
            id: 'salary',
            accessorKey: 'salary',
            header: 'Salary',
            size: 120,
            accessorFn: (row) => `$${row.salary.toLocaleString()}`,
            hideInExport: true, // This column will be excluded from exports
        },
        {
            id: 'isActive',
            accessorKey: 'isActive',
            header: 'Status',
            size: 100,
            accessorFn: (row) => row.isActive ? 'Active' : 'Inactive',
            cell: ({ getValue }) => (
                <Chip
                    label={getValue<boolean>() ? 'Active' : 'Inactive'}
                    color={getValue<boolean>() ? 'success' : 'default'}
                    size="small"
                />
            ),
        },
        {
            id: 'joinDate',
            accessorKey: 'joinDate',
            header: 'Join Date',
            size: 120,
            accessorFn: (row) => new Date(row.joinDate).toLocaleDateString(),
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Server-Side Data Fetching Example
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Demonstrates server-side data fetching with proper API ref state management and page-based selection.
                The Salary column has `hideInExport: true` so it will be excluded from exports.
            </Typography>

            <Button onClick={() => setTab('all')}>All</Button>
            <Button onClick={() => setTab('active')}>Active</Button>
            <Button onClick={() => setTab('inactive')}>Inactive</Button>

            {/* Status Cards */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Card variant="outlined">
                    <CardContent sx={{ pb: 2 }}>
                        <Typography variant="h6" color="primary">
                            {fetchCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            API Calls Made
                        </Typography>
                    </CardContent>
                </Card>

                <Card variant="outlined">
                    <CardContent sx={{ pb: 2 }}>
                        <Typography variant="h6" color="secondary">
                            {selectionInfo?.ids.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Selected Items
                        </Typography>
                    </CardContent>
                </Card>

                <Card variant="outlined">
                    <CardContent sx={{ pb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography variant="h6" color={loading ? 'warning.main' : 'success.main'}>
                                {loading ? 'Loading...' : 'Ready'}
                            </Typography>
                            {loading && <CircularProgress size={16} />}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                            Server Status
                        </Typography>
                    </CardContent>
                </Card>
            </Stack>

            {/* Error Display */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* API Controls */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        API Controls (via apiRef)
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                const state = apiRef.current?.selection.getSelectionState();
                                console.log('Current Selection State:', state);
                                alert(`Selection: ${JSON.stringify(state, null, 2)}`);
                            }}
                        >
                            Get Selection State
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                const count = apiRef.current?.selection.getSelectedCount();
                                console.log('Selected Count:', count);
                                alert(`Selected Count: ${count}`);
                            }}
                        >
                            Get Selected Count
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                apiRef.current?.selection.selectAll();
                                console.log('Selected all rows on current page');
                            }}
                        >
                            Select All (Page)
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                apiRef.current?.selection.deselectAll();
                                console.log('Deselected all rows');
                            }}
                        >
                            Deselect All
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                apiRef.current?.data.refresh();
                                console.log('Refreshed data');
                            }}
                        >
                            Refresh Data
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* Selection Info */}
            {selectionInfo && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Current Selection Info
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <Stack spacing={1}>
                                <Typography variant="body2">
                                    <strong>Selection Type:</strong> {selectionInfo.type}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Selected IDs:</strong> [{selectionInfo.ids.join(', ')}]
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Count:</strong> {selectionInfo.ids.length}
                                </Typography>
                            </Stack>
                        </Paper>
                    </CardContent>
                </Card>
            )}

            {/* Export & Column Info */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Export & Column Configuration
                    </Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>hideInExport Demo:</strong> The Salary column has `hideInExport: true`
                            so it will be excluded from CSV/Excel exports. Try exporting to see the difference!
                        </Typography>
                    </Alert>
                    <Stack spacing={1}>
                        <Typography variant="body2">
                            <strong>Exportable columns:</strong> Name, Email, Department, Role, Status, Join Date
                        </Typography>
                        <Typography variant="body2" color="warning.main">
                            <strong>Hidden from export:</strong> Salary (contains sensitive data)
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>

            {/* Last Fetch Parameters */}
            {lastFetchParams && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Last Fetch Parameters
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                            <pre style={{ fontSize: '12px', margin: 0, overflow: 'auto' }}>
                                {JSON.stringify(lastFetchParams, null, 2)}
                            </pre>
                        </Paper>
                    </CardContent>
                </Card>
            )}

            <Divider sx={{ mb: 3 }} />

            {/* Data Table */}
            <DataTable
                ref={apiRef}
                columns={columns}
                dataMode="server"
                initialLoadData={true}
                onFetchData={handleFetchData}
                loading={loading}

                // Selection Configuration
                enableRowSelection={true}
                enableMultiRowSelection={true}
                selectMode="page" // Page-based selection
                onSelectionChange={handleSelectionChange}
                enableColumnPinning
                enableColumnResizing
                enableColumnDragging
                // Bulk Actions
                enableBulkActions={true}
                bulkActions={(selectionState) => (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            size="small"
                            color="error"
                            onClick={() => {
                                console.log('Bulk delete action triggered');
                                console.log('Selection state:', selectionState);
                                alert(`Would delete ${selectionState.ids.length} items`);
                            }}
                        >
                            Delete Selected ({selectionState.ids.length})
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                console.log('Bulk update action triggered');
                                console.log('Selection state:', selectionState);
                                alert(`Would update ${selectionState.ids.length} items`);
                            }}
                        >
                            Update Selected
                        </Button>
                    </Stack>
                )}

                // Filtering & Sorting
                enableGlobalFilter={true}
                enableColumnFilter={true}
                enableSorting={true}

                // Pagination
                enablePagination={true}
                initialState={{
                    pagination: {
                        pageIndex: 0,
                        pageSize: 10,
                    },
                    columnPinning: {
                        left: [DEFAULT_SELECTION_COLUMN_NAME],
                        right: [],
                    },
                }}

                // Export
                enableExport={true}
                exportFilename="employees"
                onServerExport={handleServerExport}
                onExportProgress={(progress) => {
                    console.log('Export progress:', progress);
                }}
                onExportComplete={(result) => {
                    console.log('Export completed:', result);
                }}
                onExportError={(error) => {
                    console.error('Export error:', error);
                }}

                // Styling
                enableHover={true}
                enableStripes={true}
                tableSize="medium"

                // Other features
                enableColumnVisibility={true}
                enableTableSizeControl={true}
                enableReset={true}

                // Empty state
                emptyMessage="No employees found matching your criteria"
                skeletonRows={10}
            />
        </Box>
    );
} 