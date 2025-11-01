import { Box, Typography, Paper, Alert, Divider, Table, TableBody, TableCell, TableHead, TableRow, Stack, Chip, Button } from '@mui/material';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { useState, useCallback, useRef, useMemo } from 'react';
import type { SelectionState } from '@ackplus/react-tanstack-data-table';
import { FeatureLayout } from './common';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive';
}

// Generate sample data
const generateEmployees = (count: number): Employee[] => {
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
  const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length] || `Employee ${i + 1}`,
    email: `employee${i + 1}@company.com`,
    department: departments[i % departments.length],
    salary: 50000 + (i * 5000),
    status: Math.random() > 0.3 ? 'active' : 'inactive',
  }));
};

export function SelectionPage() {
  const tableRef = useRef<any>(null);
  const [selectionMode, setSelectionMode] = useState<'page' | 'all'>('page');
  const [selectionState, setSelectionState] = useState<SelectionState>({
    ids: [],
    type: 'include',
  });
  const [serverSelectionState, setServerSelectionState] = useState<any>(null);
  
  const sampleData = useMemo(() => generateEmployees(50), []);

  // Columns
  const columns: DataTableColumn<Employee>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      size: 180,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      size: 220,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      size: 150,
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      size: 120,
      cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 100,
      cell: ({ getValue }) => (
        <Chip
          label={getValue<string>()}
          color={getValue<string>() === 'active' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
  ];

  // Row selectability - disable inactive employees
  const isRowSelectable = useCallback(({ row }: { row: Employee; id: string }) => {
    return row.status === 'active' && row.salary < 100000;
  }, []);

  // Handle selection change
  const handleSelectionChange = useCallback((newSelectionState: SelectionState) => {
    setSelectionState(newSelectionState);
  }, []);

  // Server-side fetch with selection
  const handleFetchData = useCallback(async (filters: any) => {
    console.log('Fetching data, current selection:', filters);
    setServerSelectionState(filters);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const pageIndex = filters.pagination?.pageIndex || 0;
    const pageSize = filters.pagination?.pageSize || 10;
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    
    return { 
      data: sampleData.slice(startIndex, endIndex), 
      total: sampleData.length 
    };
  }, [sampleData]);

  return (
    <FeatureLayout
      title="Row Selection"
      description="Enable row selection with checkboxes, control selection modes (page vs all), handle bulk actions, and work with both client and server-side data."
    >
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Two Selection Modes
        </Typography>
        <Typography variant="body2">
          <strong>Page Mode:</strong> Select rows only on the current page. Switching pages clears selection.
          <br />
          <strong>All Mode:</strong> Select rows across all pages using include/exclude logic for efficiency.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Enable Selection */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Enable Row Selection
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Basic Setup
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enable row selection with checkboxes:
        </Typography>
        <Box
          component="pre"
          sx={{
            backgroundColor: '#f5f5f5',
            color: '#333',
            borderRadius: 1,
            p: 2,
            fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
            fontSize: 14,
            overflowX: 'auto',
            mb: 2,
          }}
        >
{`<DataTable
  columns={columns}
  data={data}
  enableRowSelection={true}            // Enable selection
  enableMultiRowSelection={true}       // Allow multiple selection
  selectMode="page"                    // 'page' or 'all'
  onSelectionChange={(selection) => {
    console.log('Selection changed:', selection);
  }}
/>`}
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Selection Modes */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Selection Modes: Page vs All
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Understanding Selection Modes
        </Typography>
        <Typography variant="body2">
          Choose the appropriate mode based on your use case. Page mode is simpler and works well 
          for most cases. All mode is powerful for large datasets with server-side data.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Page Mode (Recommended for Most Cases)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Selection applies only to rows on the current page:
        </Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="body2">
            Tip: Simple to understand and use
          </Typography>
          <Typography variant="body2">
            Tip: Perfect for client-side data
          </Typography>
          <Typography variant="body2">
            Tip: Selection clears when changing pages
          </Typography>
          <Typography variant="body2">
            Warning: Can't select across multiple pages
          </Typography>
        </Stack>
        <Box
          component="pre"
          sx={{
            backgroundColor: '#f5f5f5',
            color: '#333',
            borderRadius: 1,
            p: 2,
            fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
            fontSize: 14,
            overflowX: 'auto',
          }}
        >
{`<DataTable
  columns={columns}
  data={data}
  enableRowSelection={true}
  selectMode="page"                    // Page mode
  onSelectionChange={(selection) => {
    // selection = { ids: ['1', '2', '3'], type: 'include' }
    console.log('Selected IDs:', selection.ids);
  }}
/>`}
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          All Mode (For Cross-Page Selection)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Selection works across all pages using efficient include/exclude logic:
        </Typography>
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="body2">
            Tip: Select rows across all pages
          </Typography>
          <Typography variant="body2">
            Tip: Efficient for large datasets (uses exclude logic)
          </Typography>
          <Typography variant="body2">
            Tip: Works with server-side data
          </Typography>
          <Typography variant="body2">
            Warning: Requires understanding include/exclude types
          </Typography>
        </Stack>
        <Box
          component="pre"
          sx={{
            backgroundColor: '#f5f5f5',
            color: '#333',
            borderRadius: 1,
            p: 2,
            fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
            fontSize: 14,
            overflowX: 'auto',
          }}
        >
{`<DataTable
  columns={columns}
  data={data}
  enableRowSelection={true}
  selectMode="all"                     // All mode
  totalRow={totalCount}                // Required for "all" mode
  onSelectionChange={(selection) => {
    // Type 'include': { ids: ['1', '2'], type: 'include' }
    // Type 'exclude': { ids: ['5', '10'], type: 'exclude' }
    
    if (selection.type === 'include') {
      console.log('Selected these IDs:', selection.ids);
    } else {
      console.log('Selected all EXCEPT these IDs:', selection.ids);
    }
  }}
/>`}
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Selection State */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Selection State Structure
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Understanding SelectionState
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The selection state object has two properties:
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>ids</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                string[]
              </TableCell>
              <TableCell>
                Array of row IDs (meaning depends on type)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>type</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                'include' | 'exclude'
              </TableCell>
              <TableCell>
                <strong>include:</strong> ids are selected rows<br />
                <strong>exclude:</strong> ids are NOT selected (all others are selected)
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Insight: Examples:
          </Typography>
          <Box
            component="pre"
            sx={{
              backgroundColor: '#fff',
              color: '#333',
              borderRadius: 1,
              p: 2,
              fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
              fontSize: 13,
              overflowX: 'auto',
            }}
          >
{`// Include mode: These specific rows are selected
{ ids: ['1', '2', '3'], type: 'include' }
// Tip: Rows 1, 2, 3 are selected

// Exclude mode: All rows EXCEPT these are selected
{ ids: ['5', '10'], type: 'exclude' }
// Tip: All rows are selected EXCEPT 5 and 10

// Empty include: Nothing selected
{ ids: [], type: 'include' }

// Empty exclude: Everything selected
{ ids: [], type: 'exclude' }`}
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Conditional Selection */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Conditional Row Selection
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Disable Selection for Specific Rows
        </Typography>
        <Typography variant="body2">
          Use <code>isRowSelectable</code> to control which rows can be selected. 
          Warning: Important: This function MUST be memoized with useCallback!
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Disable Selection
        </Typography>
        <Box
          component="pre"
          sx={{
            backgroundColor: '#f5f5f5',
            color: '#333',
            borderRadius: 1,
            p: 2,
            fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
            fontSize: 14,
            overflowX: 'auto',
            mb: 3,
          }}
        >
{`import { useCallback } from 'react';

// Warning: MUST be memoized to prevent infinite re-renders
const isRowSelectable = useCallback(({ row, id }) => {
  // Disable selection for inactive employees
  return row.status === 'active';
  
  // Or combine multiple conditions:
  // return row.status === 'active' && row.salary < 100000;
}, []);

<DataTable
  columns={columns}
  data={data}
  enableRowSelection={true}
  isRowSelectable={isRowSelectable}    // Pass memoized function
/>`}
        </Box>

        <DataTable
          columns={columns}
          data={sampleData.slice(0, 15)}
          enableRowSelection={true}
          enablePagination={false}
          isRowSelectable={isRowSelectable}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Bulk Actions */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Bulk Actions
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Bulk Actions Toolbar
        </Typography>
        <Typography variant="body2">
          When rows are selected, a bulk actions toolbar appears. Use this to perform actions 
          on multiple rows at once (delete, export, update, etc.).
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Bulk Actions
        </Typography>
        <Box
          component="pre"
          sx={{
            backgroundColor: '#f5f5f5',
            color: '#333',
            borderRadius: 1,
            p: 2,
            fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
            fontSize: 14,
            overflowX: 'auto',
            mb: 3,
          }}
        >
{`<DataTable
  columns={columns}
  data={data}
  enableRowSelection={true}
  enableBulkActions={true}             // Enable bulk actions toolbar
  bulkActions={(selectionState) => {
    // Calculate actual selected count
    const selectedCount = 
      selectionState.type === 'include' 
        ? selectionState.ids.length 
        : totalCount - selectionState.ids.length;
    
    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => {
            // Get selected row IDs
            if (selectionState.type === 'include') {
              const selectedIds = selectionState.ids;
              console.log('Export these:', selectedIds);
            } else {
              console.log('Export all except:', selectionState.ids);
            }
          }}
        >
          📤 Export {selectedCount} Items
        </Button>
        
        <Button 
          variant="outlined" 
          size="small" 
          color="error"
          onClick={() => {
            if (confirm(\`Delete \${selectedCount} items?\`)) {
              // Perform delete
            }
          }}
        >
          🗑️ Delete Selected
        </Button>
      </Box>
    );
  }}
/>`}
        </Box>

        <DataTable
          columns={columns}
          data={sampleData.slice(0, 20)}
          enableRowSelection={true}
          enablePagination={true}
          selectMode="page"
          initialState={{
            pagination: { pageIndex: 0, pageSize: 10 },
          }}
          enableBulkActions={true}
          onSelectionChange={handleSelectionChange}
          bulkActions={(selection) => (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const count = selection.type === 'include' 
                    ? selection.ids.length 
                    : 20 - selection.ids.length;
                  alert(`Would export ${count} employees`);
                }}
              >
                📤 Export Selected
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={() => {
                  const count = selection.type === 'include' 
                    ? selection.ids.length 
                    : 20 - selection.ids.length;
                  alert(`Would delete ${count} employees`);
                }}
              >
                🗑️ Delete Selected
              </Button>
            </Box>
          )}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* API Reference */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Selection API Reference
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Programmatic Selection Control
        </Typography>
        <Box
          component="pre"
          sx={{
            backgroundColor: '#f5f5f5',
            color: '#333',
            borderRadius: 1,
            p: 2,
            fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
            fontSize: 14,
            overflowX: 'auto',
            mb: 2,
          }}
        >
{`import { useRef } from 'react';
import { DataTableApi } from '@ackplus/react-tanstack-data-table';

const tableRef = useRef<DataTableApi<Employee>>(null);

// Select a single row
tableRef.current?.selection.selectRow('3');

// Deselect a row
tableRef.current?.selection.deselectRow('3');

// Toggle row selection
tableRef.current?.selection.toggleRowSelection('3');

// Select all (respects selectMode)
tableRef.current?.selection.selectAll();

// Deselect all
tableRef.current?.selection.deselectAll();

// Get selection state
const selection = tableRef.current?.selection.getSelectionState();
// Returns: { ids: string[], type: 'include' | 'exclude' }

// Get selected count
const count = tableRef.current?.selection.getSelectedCount();

// Get selected rows
const rows = tableRef.current?.selection.getSelectedRows();

// Check if specific row is selected
const isSelected = tableRef.current?.selection.isRowSelected('3');

<DataTable
  ref={tableRef}
  columns={columns}
  data={data}
  enableRowSelection={true}
/>`}
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Server-Side Selection */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Server-Side Selection
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Selection with Server-Side Data
        </Typography>
        <Typography variant="body2">
          Use <code>selectMode="all"</code> with server-side data to efficiently handle 
          selection across large datasets. The selection state is sent to your backend.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Server-Side Selection
        </Typography>
        <Box
          component="pre"
          sx={{
            backgroundColor: '#f5f5f5',
            color: '#333',
            borderRadius: 1,
            p: 2,
            fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
            fontSize: 14,
            overflowX: 'auto',
            mb: 3,
          }}
        >
{`const handleFetchData = async (filters) => {
  // Selection state is NOT included in regular fetch
  // It's available via the onSelectionChange callback
  const response = await fetch('/api/employees', {
    method: 'POST',
    body: JSON.stringify(filters),
  });
  return await response.json();
};

// Handle bulk export with server-side data
const handleServerExport = async (filters, selection) => {
  // selection = { ids: string[], type: 'include' | 'exclude' }
  
  const response = await fetch('/api/employees/export', {
    method: 'POST',
    body: JSON.stringify({
      ...filters,
      selection,  // Send selection state to server
    }),
  });
  
  return await response.json();
};

<DataTable
  columns={columns}
  dataMode="server"
  totalRow={totalCount}                // Required for selection counting
  onFetchData={handleFetchData}
  onServerExport={handleServerExport}  // For bulk export
  
  enableRowSelection={true}
  selectMode="all"                     // Use 'all' mode for server data
  onSelectionChange={(selection) => {
    // Track selection changes if needed
    console.log('Selection:', selection);
  }}
  
  enableBulkActions={true}
  bulkActions={(selection) => (
    <Button onClick={() => {
      // Trigger server export with selection
      tableRef.current?.export.exportCSV();
    }}>
      Export Selected
    </Button>
  )}
/>`}
        </Box>

        {serverSelectionState && (
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Current Server State:
            </Typography>
            <Box
              component="pre"
              sx={{
                fontSize: 12,
                fontFamily: 'monospace',
                overflow: 'auto',
              }}
            >
              {JSON.stringify(serverSelectionState, null, 2)}
            </Box>
          </Box>
        )}

        <DataTable
          columns={columns}
          dataMode="server"
          totalRow={sampleData.length}
          onFetchData={handleFetchData}
          enableRowSelection={true}
          selectMode="all"
          onSelectionChange={handleSelectionChange}
          enablePagination={true}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 10 },
          }}
          enableBulkActions={true}
          bulkActions={(selection) => (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label={`Selection: ${selection.type}`} 
                size="small" 
                color="primary"
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  const count = selection.type === 'include' 
                    ? selection.ids.length 
                    : sampleData.length - selection.ids.length;
                  alert(`Server export ${count} rows with selection:\n${JSON.stringify(selection, null, 2)}`);
                }}
              >
                📤 Export Selected
              </Button>
            </Box>
          )}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* DataTable Props */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Selection Props Reference
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, width: '25%' }}>Prop</TableCell>
              <TableCell sx={{ fontWeight: 700, width: '25%' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700, width: '15%' }}>Default</TableCell>
              <TableCell sx={{ fontWeight: 700, width: '35%' }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableRowSelection</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                false
              </TableCell>
              <TableCell>Enable row selection with checkboxes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableMultiRowSelection</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                true
              </TableCell>
              <TableCell>Allow selecting multiple rows (false = single selection)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>selectMode</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                'page' | 'all'
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                'page'
              </TableCell>
              <TableCell>
                Page: selection per page. All: selection across all pages
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>isRowSelectable</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'(params) => boolean'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                undefined
              </TableCell>
              <TableCell>
                Function to control which rows can be selected. MUST be memoized!
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>onSelectionChange</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'(selection) => void'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                undefined
              </TableCell>
              <TableCell>Callback when selection changes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableBulkActions</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                false
              </TableCell>
              <TableCell>Show bulk actions toolbar when rows are selected</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>bulkActions</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'(selection) => ReactNode'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                undefined
              </TableCell>
              <TableCell>Render function for bulk action buttons</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Best Practices */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Best Practices
      </Typography>
      
      <Paper elevation={1} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Use Page Mode for Most Cases
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <code>selectMode="page"</code> is simpler and sufficient for most use cases. 
              Only use "all" mode when you need cross-page selection.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Always Memoize isRowSelectable
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Wrap <code>isRowSelectable</code> with <code>useCallback</code> to prevent infinite re-renders!
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Provide totalRow for All Mode
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When using <code>selectMode="all"</code> with server-side data, always provide <code>totalRow</code> 
              so the selection count can be calculated correctly.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Handle Both Include and Exclude Types
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In bulk actions, always check <code>selection.type</code> to handle both include and exclude logic correctly.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Insight: Selection State Example
            </Typography>
            <Box
              component="pre"
              sx={{
                backgroundColor: '#f5f5f5',
                p: 2,
                borderRadius: 1,
                fontSize: 13,
                fontFamily: 'monospace',
                mt: 1,
              }}
            >
{`// Handle selection in bulk actions
bulkActions={(selection) => {
  const getSelectedIds = () => {
    if (selection.type === 'include') {
      // These specific IDs are selected
      return selection.ids;
    } else {
      // All IDs EXCEPT these are selected
      // You need to filter from all data
      return allData
        .filter(item => !selection.ids.includes(item.id))
        .map(item => item.id);
    }
  };
  
  const selectedIds = getSelectedIds();
  // Use selectedIds for your operations
}`}
            </Box>
          </Box>
        </Stack>
      </Paper>
    </FeatureLayout>
  );
}
