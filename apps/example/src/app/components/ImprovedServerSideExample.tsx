import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
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
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Grid,
} from '@mui/material';
import { DataTable, DEFAULT_EXPANDING_COLUMN_NAME, DEFAULT_SELECTION_COLUMN_NAME, createLogger, DataTableLoggingOptions } from '@ackplus/react-tanstack-data-table';
import { DataTableApi, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { TableFilters } from '@ackplus/react-tanstack-data-table';
import { SelectionState } from '@ackplus/react-tanstack-data-table';

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
    status: 'active' | 'inactive' | 'pending';
}

// Mock server data with more realistic data
const generateMockEmployees = (count: number): Employee[] => {
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];
    const roles = ['Manager', 'Developer', 'Designer', 'Analyst', 'Coordinator', 'Specialist'];
    const statuses: ('active' | 'inactive' | 'pending')[] = ['active', 'inactive', 'pending'];

    return Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        name: `Employee ${index + 1}`,
        email: `employee${index + 1}@company.com`,
        department: departments[Math.floor(Math.random() * departments.length)],
        role: roles[Math.floor(Math.random() * roles.length)],
        salary: Math.floor(Math.random() * 100000) + 30000,
        isActive: Math.random() > 0.3,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        joinDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    }));
};

const MOCK_EMPLOYEES = generateMockEmployees(1000);

export function ImprovedServerSideExample() {
    // State management
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectionInfo, setSelectionInfo] = useState<SelectionState | null>(null);
    const [lastFetchParams, setLastFetchParams] = useState<any>(null);
    const [fetchCount, setFetchCount] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // API ref for programmatic control
    const apiRef = useRef<DataTableApi<Employee>>(null);

    const logger = useMemo(() => createLogger('Examples.ImprovedServerSide'), []);
    const fetchLogger = useMemo(() => logger.child('fetch'), [logger]);
    const paginationLogger = useMemo(() => logger.child('pagination'), [logger]);
    const selectionLogger = useMemo(() => logger.child('selection'), [logger]);
    const tableLoggingConfig = useMemo(() => ({
        enabled: true,
        level: 'debug',
        prefix: 'ImprovedServerSide',
        includeTimestamp: true,
    }), []);

    // Simulate server API call with proper filtering
    const handleFetchData = useCallback(async (filters: Partial<TableFilters>) => {
        if (fetchLogger.isLevelEnabled('debug')) {
            fetchLogger.debug('Request received', { filters, statusFilter, departmentFilter, searchTerm });
        }
        setLoading(true);
        setError(null);
        setLastFetchParams(filters);
        setFetchCount(prev => prev + 1);

        try {
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 800));

            let filteredData = [...MOCK_EMPLOYEES];

            // Apply status filter
            if (statusFilter !== 'all') {
                filteredData = filteredData.filter(employee => employee.status === statusFilter);
            }

            // Apply department filter
            if (departmentFilter !== 'all') {
                filteredData = filteredData.filter(employee => employee.department === departmentFilter);
            }

            // Apply global search
            if (filters.globalFilter) {
                const searchTerm = filters.globalFilter.toLowerCase();
                filteredData = filteredData.filter(employee =>
                    employee.name.toLowerCase().includes(searchTerm) ||
                    employee.email.toLowerCase().includes(searchTerm) ||
                    employee.department.toLowerCase().includes(searchTerm) ||
                    employee.role.toLowerCase().includes(searchTerm)
                );
            }

            // Apply column filters
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

                        if (aValue < bValue) return sort.desc ? 1 : -1;
                        if (aValue > bValue) return sort.desc ? -1 : 1;
                    }
                    return 0;
                });
            }

            // Apply pagination
            const pageIndex = filters.pagination?.pageIndex || 0;
            const pageSize = filters.pagination?.pageSize || 50;
            const startIndex = pageIndex * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedData = filteredData.slice(startIndex, endIndex);

            const result = {
                data: paginatedData,
                total: filteredData.length,
            };

            if (fetchLogger.isLevelEnabled('debug')) {
                fetchLogger.debug('Response ready', {
                    ...filters,
                    pageIndex,
                    pageSize,
                    returnedRows: paginatedData.length,
                    totalRows: filteredData.length,
                });
            }

            return result;
        } catch (err) {
            fetchLogger.error('Fetch failed', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
            return { data: [], total: 0 };
        } finally {
            setLoading(false);
        }
    }, [statusFilter, departmentFilter, fetchLogger, searchTerm]);

    // Handle selection changes
    const handleSelectionChange = useCallback((selection: SelectionState) => {
        if (selectionLogger.isLevelEnabled('debug')) {
            selectionLogger.debug('Selection updated', selection);
        }
        setSelectionInfo(selection);
    }, []);

    // Refresh data when filters change
    useEffect(() => {
        if (apiRef.current) {
            apiRef.current.data.refresh();
        }
    }, [statusFilter, departmentFilter]);

    // Handle server export
    const handleServerExport = useCallback(async (filters: any, selection: SelectionState) => {
        logger.info('Exporting data', { filters, selection });

        // Simulate export API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        let exportData = [...MOCK_EMPLOYEES];

        // Apply the same filtering logic as fetch
        if (statusFilter !== 'all') {
            exportData = exportData.filter(employee => {
                if (statusFilter === 'active') return employee.isActive;
                if (statusFilter === 'inactive') return !employee.isActive;
                if (statusFilter === 'pending') return employee.status === 'pending';
                return true;
            });
        }

        if (departmentFilter !== 'all') {
            exportData = exportData.filter(employee => employee.department === departmentFilter);
        }

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
            exportData = exportData.filter(employee =>
                selection.ids.includes(employee.id.toString())
            );
        } else if (selection.type === 'exclude' && selection.ids.length > 0) {
            exportData = exportData.filter(employee =>
                !selection.ids.includes(employee.id.toString())
            );
        }

        return {
            data: exportData,
            total: exportData.length,
        };
    }, [statusFilter, departmentFilter]);

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
            filterable: true,
            type: 'select',
            options: [
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Marketing', label: 'Marketing' },
                { value: 'Sales', label: 'Sales' },
                { value: 'HR', label: 'HR' },
                { value: 'Finance', label: 'Finance' },
                { value: 'Operations', label: 'Operations' },
            ],
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
            hideInExport: true,
        },
        {
            id: 'isActive',
            accessorKey: 'isActive',
            header: 'Is Active',
            size: 100,
            accessorFn: (row) => row.isActive ? 'Active' : 'Inactive',
            cell: ({ getValue }) => (
                <Chip
                    label={getValue<boolean>() ? 'Yes' : 'No'}
                    color={getValue<boolean>() ? 'success' : 'default'}
                    size="small"
                />
            ),
            filterable: true,
            type: 'select',
            options: [
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' },
            ],
        },
        {
            id: 'status',
            accessorKey: 'status',
            header: 'Work Status',
            size: 120,
            cell: ({ getValue }) => {
                const status = getValue<string>();
                const color = status === 'active' ? 'success' : status === 'inactive' ? 'error' : 'warning';
                return (
                    <Chip
                        label={status.charAt(0).toUpperCase() + status.slice(1)}
                        color={color}
                        size="small"
                    />
                );
            },
            filterable: true,
            type: 'select',
            options: [
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'pending', label: 'Pending' },
            ],
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
                Improved Server-Side Data Fetching
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Enhanced example with proper status filtering, department filtering, and improved data management.
                Notice how the status and department filters work correctly with server-side data.
            </Typography>

            {/* Filter Controls */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Filter Controls
                </Typography>
                <Grid container spacing={2}>
                    <Grid size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status Filter</InputLabel>
                            <Select
                                value={statusFilter}
                                label="Status Filter"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Status</MenuItem>
                                <MenuItem value="active">Active Only</MenuItem>
                                <MenuItem value="inactive">Inactive Only</MenuItem>
                                <MenuItem value="pending">Pending Only</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Department Filter</InputLabel>
                            <Select
                                value={departmentFilter}
                                label="Department Filter"
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Departments</MenuItem>
                                <MenuItem value="Engineering">Engineering</MenuItem>
                                <MenuItem value="Marketing">Marketing</MenuItem>
                                <MenuItem value="Sales">Sales</MenuItem>
                                <MenuItem value="HR">HR</MenuItem>
                                <MenuItem value="Finance">Finance</MenuItem>
                                <MenuItem value="Operations">Operations</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search employees..."
                        />
                    </Grid>
                    <Grid size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setStatusFilter('all');
                                setDepartmentFilter('all');
                                setSearchTerm('');
                                if (apiRef.current) {
                                    apiRef.current.filtering.clearGlobalFilter();
                                    apiRef.current.data.refresh();
                                }
                            }}
                            fullWidth
                        >
                            Clear Filters
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

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

            {/* Data Table */}
            <DataTable
                ref={apiRef}
                columns={columns}
                dataMode="server"
                onFetchData={handleFetchData}
                onSelectionChange={handleSelectionChange}
                onServerExport={handleServerExport}
                onPaginationChange={(pagination) => {
                    if (paginationLogger.isLevelEnabled('debug')) {
                        paginationLogger.debug('Pagination change', pagination);
                    }
                }}
                enableRowSelection
                enableMultiRowSelection
                enableColumnVisibility
                enableExport
                enableGlobalFilter
                enableColumnFilter
                enableSorting
                enablePagination
                paginationMode="server"
                sortingMode="server"
                filterMode="server"
                selectMode="page"
                initialState={{
                    columnPinning: {
                        left: [DEFAULT_EXPANDING_COLUMN_NAME, DEFAULT_SELECTION_COLUMN_NAME],
                        right: ['action'],
                    },
                    pagination: {
                        pageIndex: 0,
                        pageSize: 50,
                    },
                }}
                slotProps={{
                    pagination: {
                        rowsPerPageOptions: [
                            5,
                            50,
                            100,
                            200,
                        ],
                    },
                    toolbar: {
                        sx: {
                            minHeight: '48px !important',
                        },
                    },
                }}
                loading={loading}
                logging={{
                    enabled: true,
                    level: 'debug',
                    logger: { ...console, debug: console.log },
                }}

            />
        </Box>
    );
}
