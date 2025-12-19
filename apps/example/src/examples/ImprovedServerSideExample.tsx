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
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  DataTable,
  DataTableApi,
  ColumnDef,
  TableFilters,
  SelectionState,
  DEFAULT_SELECTION_COLUMN_NAME,
} from '@ackplus/react-tanstack-data-table';
import { Employee, employees } from './data';
// Extend the employee list to simulate larger dataset
const MOCK_EMPLOYEES: Employee[] = Array.from({ length: 10 }, (_, i) =>
  employees.map((emp) => ({
    ...emp,
    id: `${emp.id}-${i}`,
    name: `${emp.name} ${i > 0 ? `(${i})` : ''}`,
    email: emp.email.replace('@', `-${i}@`),
  }))
).flat();


export function ImprovedServerSideExample() {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectionInfo, setSelectionInfo] = useState<SelectionState | null>(null);
  const [fetchCount, setFetchCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // API ref for programmatic control
  const apiRef = useRef<DataTableApi<Employee>>(null);

  // Simulate server API call with proper filtering
  const handleFetchData = useCallback(
    async (filters: Partial<TableFilters>) => {
      setLoading(true);
      setError(null);
      setFetchCount((prev) => prev + 1);

      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        let filteredData = [...MOCK_EMPLOYEES];

        // Apply status filter
        if (statusFilter !== 'all') {
          filteredData = filteredData.filter((employee) => employee.status === statusFilter);
        }

        // Apply department filter
        if (departmentFilter !== 'all') {
          filteredData = filteredData.filter((employee) => employee.department === departmentFilter);
        }

        // Apply global search
        if (filters.globalFilter) {
          const searchTerm = filters.globalFilter.toLowerCase();
          filteredData = filteredData.filter(
            (employee) =>
              employee.name.toLowerCase().includes(searchTerm) ||
              employee.email.toLowerCase().includes(searchTerm) ||
              employee.department.toLowerCase().includes(searchTerm) ||
              employee.position.toLowerCase().includes(searchTerm)
          );
        }

        // Apply column filters
        if (filters.columnFilter?.filters?.length) {
          filteredData = filteredData.filter((employee) => {
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
        const pageSize = filters.pagination?.pageSize || 10;
        const startIndex = pageIndex * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        setLoading(false);

        return {
          data: paginatedData,
          total: filteredData.length,
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
        return { data: [], total: 0 };
      }
    },
    [statusFilter, departmentFilter]
  );

  // Handle selection changes
  const handleSelectionChange = useCallback((selection: SelectionState) => {
    setSelectionInfo(selection);
  }, []);

  // Refresh data when filters change
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (apiRef.current) {
      apiRef.current.data.refresh();
    }
  }, [statusFilter, departmentFilter]);

  // Handle server export
  const handleServerExport = useCallback(
    async (filters: any, selection: SelectionState) => {
      // Simulate export API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let exportData = [...MOCK_EMPLOYEES];

      // Apply the same filtering logic as fetch
      if (statusFilter !== 'all') {
        exportData = exportData.filter((employee) => employee.status === statusFilter);
      }

      if (departmentFilter !== 'all') {
        exportData = exportData.filter((employee) => employee.department === departmentFilter);
      }

      if (filters?.globalFilter) {
        const searchTerm = filters.globalFilter.toLowerCase();
        exportData = exportData.filter(
          (employee) =>
            employee.name.toLowerCase().includes(searchTerm) ||
            employee.email.toLowerCase().includes(searchTerm) ||
            employee.department.toLowerCase().includes(searchTerm) ||
            employee.position.toLowerCase().includes(searchTerm)
        );
      }

      // Apply selection filtering for export
      if (selection.type === 'include' && selection.ids.length > 0) {
        exportData = exportData.filter((employee) => selection.ids.includes(employee.id.toString()));
      } else if (selection.type === 'exclude' && selection.ids.length > 0) {
        exportData = exportData.filter((employee) => !selection.ids.includes(employee.id.toString()));
      }

      return {
        data: exportData,
        total: exportData.length,
      };
    },
    [statusFilter, departmentFilter]
  );

  // Define columns using ColumnDef
  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'position',
      header: 'Position',
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      enableSorting: true,
      cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const color = status === 'active' ? 'success' : 'error';
        return (
          <Chip label={status.charAt(0).toUpperCase() + status.slice(1)} color={color} size="small" />
        );
      },
    },
    {
      accessorKey: 'joinDate',
      header: 'Join Date',
      enableSorting: true,
      cell: ({ getValue }) => new Date(getValue<string>()).toLocaleDateString(),
    },
    {
      accessorKey: 'location',
      header: 'Location',
      enableSorting: true,
    },
  ];

  // Get unique departments from data
  const departments = Array.from(new Set(MOCK_EMPLOYEES.map((emp) => emp.department))).sort();

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Improved Server-Side Data Fetching
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Enhanced example with proper status filtering, department filtering, and improved data management.
        This example includes 500 employees with server-side pagination, sorting, and filtering.
      </Typography>

      {/* Filter Controls */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: '1rem' }}>
          Additional Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select value={statusFilter} label="Status Filter" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active Only</MenuItem>
                <MenuItem value="inactive">Inactive Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Department Filter</InputLabel>
              <Select value={departmentFilter} label="Department Filter" onChange={(e) => setDepartmentFilter(e.target.value)}>
                <MenuItem value="all">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setStatusFilter('all');
                setDepartmentFilter('all');
                if (apiRef.current) {
                  apiRef.current.filtering.clearGlobalFilter();
                  apiRef.current.data.refresh();
                }
              }}
              fullWidth
            >
              Clear All Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Status Cards */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
              {fetchCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              API Calls Made
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="h5" color="secondary" sx={{ fontWeight: 700 }}>
              {selectionInfo?.ids.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Selected Items
            </Typography>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ flex: 1 }}>
          <CardContent sx={{ py: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h5" color={loading ? 'warning.main' : 'success.main'} sx={{ fontWeight: 700 }}>
                {loading ? 'Loading' : 'Ready'}
              </Typography>
              {loading && <CircularProgress size={20} />}
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
        enableRowSelection
        enableMultiRowSelection
        enableColumnVisibility
        enableExport
        enableGlobalFilter
        enableSorting
        enablePagination
        selectMode="page"
        initialState={{
          columnPinning: {
            left: [DEFAULT_SELECTION_COLUMN_NAME],
          },
          pagination: {
            pageIndex: 0,
            pageSize: 10,
          },
        }}
        slotProps={{
          pagination: {
            rowsPerPageOptions: [10, 25, 50, 100],
          },
        }}
        loading={loading}
        idKey="id"
      />
    </Box>
  );
}
