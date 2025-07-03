import React, { useState, useRef, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Paper,
    Divider,
} from '@mui/material';
import { DataTable } from '../components';
import type { DataTableApi } from '../types/data-table-api';
import type { CustomSelectionState } from '../features';

// Sample data interface
interface User {
    id: number;
    name: string;
    email: string;
    department: string;
    salary: number;
    isActive: boolean;
}

// Generate sample data (25+ users for pagination testing)
const generateSampleData = (): User[] => {
    const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eva', 'Frank', 'Grace', 'Henry'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    
    return Array.from({ length: 25 }, (_, index) => ({
        id: index + 1,
        name: `${firstNames[index % firstNames.length]} ${lastNames[index % lastNames.length]}`,
        email: `user${index + 1}@example.com`,
        department: departments[index % departments.length],
        salary: 50000 + (index * 5000),
        isActive: Math.random() > 0.3, // 70% active
    }));
};

const sampleData = generateSampleData();

// Column definitions
const columns = [
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
        accessorKey: 'department',
        header: 'Department',
        size: 120,
    },
    {
        accessorKey: 'salary',
        header: 'Salary',
        size: 100,
        cell: ({ getValue }: { getValue: () => any }) => 
            `$${(getValue() as number).toLocaleString()}`,
    },
    {
        accessorKey: 'isActive',
        header: 'Status',
        size: 100,
        cell: ({ getValue }: { getValue: () => any }) => (
            <Chip
                label={getValue() ? 'Active' : 'Inactive'}
                color={getValue() ? 'success' : 'default'}
                size="small"
            />
        ),
    },
];

export function SelectionTestExample() {
    const [selectMode, setSelectMode] = useState<'page' | 'all'>('page');
    const [selectionState, setSelectionState] = useState<CustomSelectionState>({
        ids: [],
        type: 'include',
    });
    
    const tableRef = useRef<DataTableApi<User>>(null);

    // Handle selection state changes
    const handleSelectionChange = useCallback((newSelectionState: CustomSelectionState) => {
        setSelectionState(newSelectionState);
    }, []);

    // Test selection operations
    const handleSelectAll = useCallback(() => {
        tableRef.current?.selection.selectAll();
    }, []);

    const handleDeselectAll = useCallback(() => {
        tableRef.current?.selection.deselectAll();
    }, []);

    const handleSelectFirst5 = useCallback(() => {
        // Select first 5 users manually
        const firstFiveIds = sampleData.slice(0, 5).map(user => user.id.toString());
        firstFiveIds.forEach(id => {
            tableRef.current?.selection.selectRow(id);
        });
    }, []);

    const handleToggleRow = useCallback(() => {
        // Toggle selection of user with id 3
        tableRef.current?.selection.toggleRowSelection('3');
    }, []);

    // Row selectability function - disable users with salary > 100000
    // ⚠️ IMPORTANT: This must be memoized to prevent infinite re-renders
    const isRowSelectable = useCallback(({ row }: { row: User; id: string }) => {
        return row.salary <= 100000;
    }, []);

    // Get selection info for display
    const selectedCount = selectionState.ids.length;
    const selectedType = selectionState.type;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Selection Test Example
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Test the custom selection feature with different modes and operations.
                Users with salary &gt; $100,000 are disabled for selection.
            </Typography>

            {/* Controls */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Selection Mode</InputLabel>
                        <Select
                            value={selectMode}
                            label="Selection Mode"
                            onChange={(e) => setSelectMode(e.target.value as 'page' | 'all')}
                        >
                            <MenuItem value="page">Page Mode</MenuItem>
                            <MenuItem value="all">All Mode</MenuItem>
                        </Select>
                    </FormControl>
                    
                    <Button variant="outlined" onClick={handleSelectAll}>
                        Select All
                    </Button>
                    
                    <Button variant="outlined" onClick={handleDeselectAll}>
                        Deselect All
                    </Button>
                    
                    <Button variant="outlined" onClick={handleSelectFirst5}>
                        Select First 5
                    </Button>
                    
                    <Button variant="outlined" onClick={handleToggleRow}>
                        Toggle User #3
                    </Button>
                </Box>
            </Paper>

            {/* Selection State Display */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Current Selection State
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                    <Typography variant="body2">
                        <strong>Mode:</strong> {selectMode}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Type:</strong> {selectedType}
                    </Typography>
                    <Typography variant="body2">
                        <strong>Count:</strong> {selectedCount}
                    </Typography>
                    <Typography variant="body2" sx={{ gridColumn: '1 / -1' }}>
                        <strong>IDs:</strong> {selectionState.ids.join(', ') || 'None'}
                    </Typography>
                </Box>
            </Paper>

            <Divider sx={{ my: 2 }} />

            {/* Data Table */}
            <DataTable
                ref={tableRef}
                data={sampleData}
                totalRow={sampleData.length}
                columns={columns}
                
                // Enable selection
                enableRowSelection={true}
                enableMultiRowSelection={true}
                selectMode={selectMode}
                isRowSelectable={isRowSelectable}
                onSelectionChange={handleSelectionChange}
                
                // Enable pagination to test page vs all modes
                enablePagination={true}
                initialState={{
                    pagination: {
                        pageIndex: 0,
                        pageSize: 10, // Show 10 rows per page
                    },
                }}
                
                // Enable bulk actions to test selection
                enableBulkActions={true}
                bulkActions={(selectionState) => (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                const count = selectionState.type === 'include' 
                                    ? selectionState.ids.length 
                                    : sampleData.length - selectionState.ids.length;
                                alert(`Exporting ${count} selected users (${selectionState.type} mode)`);
                            }}
                        >
                            📤 Export Selected
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => {
                                const count = selectionState.type === 'include' 
                                    ? selectionState.ids.length 
                                    : sampleData.length - selectionState.ids.length;
                                alert(`Would delete ${count} selected users (${selectionState.type} mode)`);
                            }}
                        >
                            🗑️ Delete Selected
                        </Button>
                    </Box>
                )}
                
                // Table settings
                enableSorting={true}
                enableGlobalFilter={true}
                fitToScreen={true}
            />
            
            <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    💡 <strong>Test Instructions:</strong>
                    <br />
                    1. Try selecting rows in "Page" mode, then switch pages - selections should be page-specific
                    <br />
                    2. Try "All" mode and select rows - this works across all pages
                    <br />
                    3. Note that users with salary &gt; $100k are disabled (grayed out checkboxes)
                    <br />
                    4. Use the control buttons to test programmatic selection
                    <br />
                    5. Watch the "Current Selection State" panel to see how the selection data changes
                </Typography>
            </Box>
        </Box>
    );
} 