/**
 * Simple Server Selection Example
 * Demonstrates the clean, straightforward approach to server-side selection using selectMode
 */
import { useState, useMemo, useRef } from 'react';
import { Box, Typography, Card, CardContent, Button, Alert, Chip, Stack } from '@mui/material';
import { DataTable } from '../components/table/data-table';
import { DataTableColumn } from '../types/column.types';
import { TableState } from '../types';

// Sample data interface
interface Employee {
    id: number;
    name: string;
    email: string;
    department: string;
    role: string;
    salary: number;
    isActive: boolean;
}

// Generate sample data
const generateEmployees = (count: number): Employee[] => {
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
    const roles = ['Manager', 'Senior', 'Junior', 'Lead', 'Director'];
    const names = ['John Smith', 'Jane Doe', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'];

    return Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        name: names[Math.floor(Math.random() * names.length)] + ` ${index + 1}`,
        email: `employee${index + 1}@company.com`,
        department: departments[Math.floor(Math.random() * departments.length)],
        role: roles[Math.floor(Math.random() * roles.length)],
        salary: Math.floor(Math.random() * 80000) + 40000,
        isActive: Math.random() > 0.2,
    }));
};

export function SimpleServerSelectionExample() {
    // Sample data (in real app, this would come from server)
    const employees = useMemo(() => generateEmployees(500), []);
    const totalFilteredCount = employees.length; // In real app, this comes from server
    
    // Selection mode state
    const [selectMode, setSelectMode] = useState<'page' | 'all'>('page');
    
    // API ref for debugging
    const apiRef = useRef<any>(null);

    const handleFetchData = (filters: Partial<TableState>) => {
        if (filters?.pagination?.pageSize) {
            const data = employees.slice(filters.pagination.pageIndex * filters.pagination.pageSize, (filters.pagination.pageIndex + 1) * filters.pagination.pageSize);
            console.log('data', data?.length);
            return Promise.resolve({
                data,
                total: employees.length,
            });
        }
        
        return Promise.resolve({
            data: employees,
            total: employees.length,
        });
    };

    // Define columns
    const columns: DataTableColumn<Employee>[] = [
        {
            id: 'name',
            accessorKey: 'name',
            header: 'Name',
            size: 200,
        },
        {
            id: 'email',
            accessorKey: 'email',
            header: 'Email',
            size: 250,
        },
        {
            id: 'department',
            accessorKey: 'department',
            header: 'Department',
            size: 150,
        },
        {
            id: 'role',
            accessorKey: 'role',
            header: 'Role',
            size: 120,
        },
        {
            id: 'salary',
            accessorKey: 'salary',
            header: 'Salary',
            size: 120,
            cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
        },
        {
            id: 'isActive',
            accessorKey: 'isActive',
            header: 'Status',
            size: 100,
            cell: ({ getValue }) => getValue<boolean>() ? 'Active' : 'Inactive',
        },
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Simple Server Selection Example
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                Clean implementation of server-side selection with page-level and "select all matching" features.
            </Typography>

            {/* Selection Mode Controls */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Selection Mode
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                            variant={selectMode === 'page' ? 'contained' : 'outlined'}
                            onClick={() => setSelectMode('page')}
                            size="small"
                        >
                            Page Selection
                        </Button>
                        <Button
                            variant={selectMode === 'all' ? 'contained' : 'outlined'}
                            onClick={() => setSelectMode('all')}
                            size="small"
                        >
                            All Pages Selection
                        </Button>
                        <Chip 
                            label={selectMode === 'page' ? 'Select rows on current page only' : 'Select all matching rows across pages'}
                            size="small"
                            color="info"
                        />
                    </Stack>
                </CardContent>
            </Card>

            {/* Instructions */}
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    <strong>How to use:</strong>
                    <br />
                    • <strong>Page Selection:</strong> Header checkbox selects/deselects all rows on current page
                    <br />
                    • <strong>All Pages Selection:</strong> Header checkbox toggles "select all matching" mode
                    <br />
                    • When "select all matching" is active, individual checkboxes exclude/include specific rows
                    <br />
                    • Bulk actions receive different payload based on selection mode
                </Typography>
            </Alert>

            {/* Data Table with New Selection Logic */}
            <DataTable
                ref={(api) => {
                    apiRef.current = api;
                    // You can access the selection API here
                    if (api) {
                        // Example: api.selection.getSelectionState()
                        // Example: api.selection.selectAll()
                        // Example: api.selection.setSelectionMode('all')
                    }
                }}
                initilaLoadData
                columns={columns}
                onFetchData={handleFetchData}
                dataMode="server" // Server mode to demonstrate server selection
                selectMode={selectMode} // Use our selection mode
                enableRowSelection={true}
                enableMultiRowSelection={true}
                enableBulkActions={true}
                enablePagination={true}
                bulkActions={(selectedRows) => (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                            // The bulk action payload is automatically logged in console
                            // You can also access it via the API ref
                            console.log('Bulk action triggered with selection mode:', selectMode);
                            console.log('Selected rows:', selectedRows);
                        }}
                    >
                        Delete Selected ({selectedRows.length})
                    </Button>
                )}
            />

            {/* Debug Controls */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Debug Controls
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                if (apiRef.current) {
                                    console.log('Manual selectAll trigger');
                                    apiRef.current.selection.selectAll();
                                }
                            }}
                        >
                            Manual Select All
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                if (apiRef.current) {
                                    console.log('Manual toggleSelectAll trigger');
                                    apiRef.current.selection.toggleSelectAll();
                                }
                            }}
                        >
                            Manual Toggle Select All
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                if (apiRef.current) {
                                    const payload = apiRef.current.selection.getSelectionState();
                                    console.log('Current Selection Payload:', payload);
                                    console.log('Selected Count:', apiRef.current.selection.getSelectedCount());
                                    console.log('Is All Selected:', apiRef.current.selection.isAllSelected());
                                    console.log('Is Some Selected:', apiRef.current.selection.isSomeSelected());
                                }
                            }}
                        >
                            Debug Selection State
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* Code Example */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Key Implementation Details:
                    </Typography>
                    <Typography variant="body2" component="pre" sx={{ 
                        bgcolor: 'grey.100', 
                        p: 2, 
                        borderRadius: 1,
                        overflow: 'auto',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace'
                    }}>
{`// User's exact state structure
type ServerSelectionState = {
  selectAllMatching: boolean; // true = all filtered rows across pages selected
  selectedRowIds: string[];   // specific rows selected if selectAllMatching=false
  excludedRowIds: string[];   // specific rows excluded if selectAllMatching=true
};

// Handler: Select All Matching Rows Across Pages
const handleSelectAllMatching = () => {
  setServerSelection({
    selectAllMatching: true,
    selectedRowIds: [],
    excludedRowIds: [],
  });
};

// Handler: Toggle Individual Row Selection
const handleRowToggle = (rowId: string, isSelected: boolean) => {
  setServerSelection(prev => {
    if (prev.selectAllMatching) {
      // If selecting all: manage exclusions
      return {
        ...prev,
        excludedRowIds: isSelected
          ? prev.excludedRowIds.filter(id => id !== rowId) // re-select row
          : [...prev.excludedRowIds, rowId],              // deselect row
      };
    } else {
      // If not selecting all: manage individual selection
      return {
        ...prev,
        selectedRowIds: isSelected
          ? [...prev.selectedRowIds, rowId]
          : prev.selectedRowIds.filter(id => id !== rowId),
      };
    }
  });
};

// Payload for Bulk Actions
const getBulkActionPayload = () => ({
  filters: table.getState().columnFilters,
  selectAllMatching: serverSelection.selectAllMatching,
  selectedRowIds: serverSelection.selectedRowIds,
  excludedRowIds: serverSelection.excludedRowIds,
});`}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

// Separate component to demonstrate the server selection integration
function ServerSelectionDataTable({ 
    columns, 
    data, 
    totalFilteredCount 
}: {
    columns: DataTableColumn<Employee>[];
    data: Employee[];
    totalFilteredCount: number;
}) {
    // This would be your DataTable component with server selection integrated
    // For now, we'll create a simplified version to show the concept
    
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    DataTable with Server Selection
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    This is where your DataTable component would be integrated with the server selection hook.
                    The actual implementation would connect the useServerSelection hook with your DataTable component.
                </Typography>
                
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        <strong>Total Employees:</strong> {totalFilteredCount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Columns:</strong> {columns.map(col => col.header).join(', ')}
                    </Typography>
                </Stack>
                
                <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        <strong>Next Step:</strong> Integrate the useServerSelection hook with your DataTable component
                        to enable the server selection functionality shown in the code example above.
                    </Typography>
                </Alert>
            </CardContent>
        </Card>
    );
} 