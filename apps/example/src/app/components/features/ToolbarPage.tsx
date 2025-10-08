import { Box, Typography, Paper, Alert, Divider, Table, TableBody, TableCell, TableHead, TableRow, Stack, Button, FormControl, InputLabel, Select, MenuItem, Chip, TextField } from '@mui/material';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { useState, useCallback, useMemo } from 'react';
import { Add as AddIcon } from '@mui/icons-material';

interface Task {
  id: number;
  title: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
}

const sampleTasks: Task[] = [
  { id: 1, title: 'Design Homepage', assignee: 'Alice', priority: 'high', status: 'in-progress', dueDate: '2024-03-15' },
  { id: 2, title: 'API Integration', assignee: 'Bob', priority: 'high', status: 'pending', dueDate: '2024-03-20' },
  { id: 3, title: 'Write Tests', assignee: 'Charlie', priority: 'medium', status: 'completed', dueDate: '2024-03-10' },
  { id: 4, title: 'Update Docs', assignee: 'Diana', priority: 'low', status: 'pending', dueDate: '2024-03-25' },
  { id: 5, title: 'Fix Bugs', assignee: 'Eve', priority: 'high', status: 'in-progress', dueDate: '2024-03-18' },
];

export function ToolbarPage() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [showToolbar, setShowToolbar] = useState(true);

  const columns: DataTableColumn<Task>[] = [
    {
      accessorKey: 'title',
      header: 'Task Title',
      size: 200,
    },
    {
      accessorKey: 'assignee',
      header: 'Assignee',
      size: 150,
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      size: 120,
      cell: ({ getValue }) => {
        const priority = getValue<string>();
        const color = priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'default';
        return <Chip label={priority} color={color} size="small" />;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 130,
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const color = status === 'completed' ? 'success' : status === 'in-progress' ? 'primary' : 'default';
        return <Chip label={status} color={color} size="small" />;
      },
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      size: 120,
    },
  ];

  // Custom extra filter component
  const extraFilter = useMemo(() => (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel>Status Filter</InputLabel>
      <Select
        value={statusFilter}
        label="Status Filter"
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
        <MenuItem value="in-progress">In Progress</MenuItem>
        <MenuItem value="completed">Completed</MenuItem>
      </Select>
    </FormControl>
  ), [statusFilter]);

  // Filter data based on status
  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return sampleTasks;
    return sampleTasks.filter(task => task.status === statusFilter);
  }, [statusFilter]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Toolbar Customization
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Customize the toolbar with built-in controls, extra filters, custom components, 
        and complete slot overrides. Control visibility and styling of all toolbar elements.
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Flexible Toolbar
        </Typography>
        <Typography variant="body2">
          The toolbar includes built-in controls (search, filters, export, etc.) and supports 
          custom components via <code>extraFilter</code> prop and slot overrides.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Built-in Toolbar Controls */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Built-in Toolbar Controls
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Available Controls
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The toolbar includes these built-in controls that you can enable/disable:
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Control</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Prop to Enable</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Global Search</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                enableGlobalFilter
              </TableCell>
              <TableCell>Search input that filters across all columns</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Column Filters</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                enableColumnFilter
              </TableCell>
              <TableCell>Advanced column filtering with operators</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Column Visibility</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                enableColumnVisibility
              </TableCell>
              <TableCell>Show/hide columns dropdown</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Column Pinning</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                enableColumnPinning
              </TableCell>
              <TableCell>Pin columns to left/right</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Table Size</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                enableTableSizeControl
              </TableCell>
              <TableCell>Adjust row density (compact, medium, comfortable)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Export</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                enableExport
              </TableCell>
              <TableCell>Export data to CSV/Excel</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Reset</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                enableReset
              </TableCell>
              <TableCell>Reset all table settings to defaults</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Show/Hide Controls */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Show/Hide Toolbar Controls
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Customize Visible Controls
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Control which toolbar elements are visible:
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
  
  // Show/hide toolbar controls
  enableGlobalFilter={true}          // Show search input
  enableColumnFilter={true}          // Show column filter button
  enableColumnVisibility={true}      // Show column visibility dropdown
  enableColumnPinning={true}         // Show column pinning control
  enableTableSizeControl={true}      // Show table size control
  enableExport={true}                // Show export button
  enableReset={true}                 // Show reset button
/>`}
        </Box>

        <DataTable
          columns={columns}
          data={filteredData}
          enableGlobalFilter={true}
          enableColumnFilter={true}
          enableColumnVisibility={true}
          enableTableSizeControl={true}
          enableExport={true}
          enableReset={true}
          enablePagination={false}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Extra Filter */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Extra Filter (Custom Components)
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Add Custom Filters
        </Typography>
        <Typography variant="body2">
          Use the <code>extraFilter</code> prop to add custom filter components (dropdowns, 
          date pickers, etc.) to the toolbar's right section.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Extra Filter Component
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
{`import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useState, useMemo } from 'react';

function MyComponent() {
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Create custom filter component
  const extraFilter = useMemo(() => (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel>Status Filter</InputLabel>
      <Select
        value={statusFilter}
        label="Status Filter"
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="active">Active</MenuItem>
        <MenuItem value="inactive">Inactive</MenuItem>
      </Select>
    </FormControl>
  ), [statusFilter]);
  
  // Filter data based on status
  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return data;
    return data.filter(item => item.status === statusFilter);
  }, [statusFilter]);
  
  return (
    <DataTable
      columns={columns}
      data={filteredData}
      extraFilter={extraFilter}      // Add custom filter
      enableGlobalFilter={true}
    />
  );
}`}
        </Box>

        <DataTable
          columns={columns}
          data={filteredData}
          extraFilter={extraFilter}
          enableGlobalFilter={true}
          enablePagination={false}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Multiple Extra Filters */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Multiple Custom Filters
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Multiple Filters
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Combine multiple custom filter components:
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
{`const extraFilter = useMemo(() => (
  <Stack direction="row" spacing={1}>
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Status</InputLabel>
      <Select value={status} onChange={handleStatusChange}>
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="active">Active</MenuItem>
      </Select>
    </FormControl>
    
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Priority</InputLabel>
      <Select value={priority} onChange={handlePriorityChange}>
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="high">High</MenuItem>
        <MenuItem value="medium">Medium</MenuItem>
      </Select>
    </FormControl>
    
    <TextField
      size="small"
      type="date"
      label="Due Date"
      value={dueDate}
      onChange={handleDateChange}
      InputLabelProps={{ shrink: true }}
    />
    
    <Button 
      variant="outlined" 
      size="small"
      startIcon={<AddIcon />}
      onClick={handleAdd}
    >
      Add Task
    </Button>
  </Stack>
), [status, priority, dueDate]);

<DataTable
  columns={columns}
  data={filteredData}
  extraFilter={extraFilter}
/>`}
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Toolbar Props */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Toolbar Props Reference
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          DataTable Toolbar Props
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, width: '25%' }}>Prop</TableCell>
              <TableCell sx={{ fontWeight: 700, width: '20%' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700, width: '15%' }}>Default</TableCell>
              <TableCell sx={{ fontWeight: 700, width: '40%' }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableGlobalFilter</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>true</TableCell>
              <TableCell>Show global search input in toolbar</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableColumnFilter</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>false</TableCell>
              <TableCell>Show column filter button</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableColumnVisibility</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>true</TableCell>
              <TableCell>Show column visibility dropdown</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableColumnPinning</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>false</TableCell>
              <TableCell>Show column pinning control</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableTableSizeControl</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>true</TableCell>
              <TableCell>Show table size/density control</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableExport</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>true</TableCell>
              <TableCell>Show export button (CSV/Excel)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableReset</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>true</TableCell>
              <TableCell>Show reset button to clear all settings</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>extraFilter</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                ReactNode
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>null</TableCell>
              <TableCell>Custom component(s) to add to toolbar right section</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Customize Toolbar via SlotProps */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Customize Toolbar Components
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          SlotProps for Customization
        </Typography>
        <Typography variant="body2">
          Use <code>slotProps</code> to customize individual toolbar components without replacing them.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Available SlotProps
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>SlotProp</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>toolbar</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                ToolbarProps
              </TableCell>
              <TableCell>Props for the main toolbar container</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>searchInput</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                object
              </TableCell>
              <TableCell>Props for search input (placeholder, autoFocus, etc.)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>exportButton</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                object
              </TableCell>
              <TableCell>Props for export button</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>columnVisibilityControl</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                object
              </TableCell>
              <TableCell>Props for column visibility dropdown</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>tableSizeControl</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                object
              </TableCell>
              <TableCell>Props for table size control</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>resetButton</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                object
              </TableCell>
              <TableCell>Props for reset button</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            💡 Example: Customize Search Input
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
{`<DataTable
  columns={columns}
  data={data}
  enableGlobalFilter={true}
  slotProps={{
    searchInput: {
      placeholder: 'Search tasks...',
      autoFocus: true,
      inputProps: {
        sx: { 
          minWidth: 300,
          backgroundColor: 'grey.50',
        },
      },
    },
    toolbar: {
      sx: {
        backgroundColor: 'primary.light',
        p: 2,
      },
    },
  }}
/>`}
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Override Toolbar Components */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Override Toolbar Components (Slots)
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Complete Component Replacement
        </Typography>
        <Typography variant="body2">
          Use the <code>slots</code> prop to completely replace toolbar components with your own custom components.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Available Toolbar Slots
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Slot Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Default Component</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>toolbar</TableCell>
              <TableCell>DataTableToolbar</TableCell>
              <TableCell>The main toolbar container</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>searchInput</TableCell>
              <TableCell>TableSearchControl</TableCell>
              <TableCell>Search input component</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>exportButton</TableCell>
              <TableCell>TableExportControl</TableCell>
              <TableCell>Export button and dropdown</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>columnVisibilityControl</TableCell>
              <TableCell>ColumnVisibilityControl</TableCell>
              <TableCell>Column visibility dropdown</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>tableSizeControl</TableCell>
              <TableCell>TableSizeControl</TableCell>
              <TableCell>Table density control</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>resetButton</TableCell>
              <TableCell>ColumnResetControl</TableCell>
              <TableCell>Reset button</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>columnCustomFilterControl</TableCell>
              <TableCell>ColumnFilterControl</TableCell>
              <TableCell>Column filter button and dialog</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>columnPinningControl</TableCell>
              <TableCell>ColumnPinningControl</TableCell>
              <TableCell>Column pinning control</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>bulkActionsToolbar</TableCell>
              <TableCell>BulkActionsToolbar</TableCell>
              <TableCell>Bulk actions toolbar (shown when rows selected)</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            💡 Example: Replace Toolbar Component
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
{`import { Box, TextField } from '@mui/material';

// Custom search component
const CustomSearch = ({ placeholder, ...props }) => {
  const { table } = useDataTableContext();
  
  return (
    <TextField
      size="small"
      placeholder={placeholder || 'Custom search...'}
      value={table.getState().globalFilter || ''}
      onChange={(e) => table.setGlobalFilter(e.target.value)}
      sx={{ minWidth: 250 }}
      {...props}
    />
  );
};

<DataTable
  columns={columns}
  data={data}
  slots={{
    searchInput: CustomSearch,     // Replace search component
  }}
  slotProps={{
    searchInput: {
      placeholder: 'Type to search...',
      // Any props you want to pass to CustomSearch
    },
  }}
/>`}
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Hide Toolbar Completely */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Hide Toolbar Completely
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: No Toolbar
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Disable all toolbar controls to hide the toolbar:
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
  
  // Disable all toolbar controls
  enableGlobalFilter={false}
  enableColumnFilter={false}
  enableColumnVisibility={false}
  enableTableSizeControl={false}
  enableExport={false}
  enableReset={false}
  
  // Toolbar will not render
/>`}
        </Box>

        <DataTable
          columns={columns}
          data={sampleTasks}
          enableGlobalFilter={false}
          enableColumnFilter={false}
          enableColumnVisibility={false}
          enableTableSizeControl={false}
          enableExport={false}
          enableReset={false}
          enablePagination={false}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Bulk Actions Toolbar */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Bulk Actions Toolbar
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Shown When Rows Selected
        </Typography>
        <Typography variant="body2">
          When <code>enableBulkActions=true</code> and rows are selected, a separate bulk 
          actions toolbar appears above the table with custom action buttons.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Bulk Actions Toolbar
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
  enableBulkActions={true}           // Enable bulk actions toolbar
  bulkActions={(selectionState) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button 
        variant="outlined" 
        size="small"
        onClick={() => {
          const count = selectionState.type === 'include' 
            ? selectionState.ids.length 
            : totalCount - selectionState.ids.length;
          console.log(\`Process \${count} items\`);
        }}
      >
        Process Selected
      </Button>
      
      <Button 
        variant="outlined" 
        size="small" 
        color="error"
        onClick={() => handleBulkDelete(selectionState)}
      >
        Delete Selected
      </Button>
    </Box>
  )}
  
  // Customize bulk actions toolbar styling
  slotProps={{
    bulkActionsToolbar: {
      sx: {
        backgroundColor: 'success.lighter',
        borderRadius: 1,
        mb: 2,
      },
      chipProps: {
        color: 'success',
        variant: 'filled',
      },
    },
  }}
/>`}
        </Box>

        <DataTable
          columns={columns}
          data={sampleTasks}
          enableRowSelection={true}
          enableBulkActions={true}
          enablePagination={false}
          bulkActions={(selection) => (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => alert(`Complete ${selection.ids.length} tasks`)}
              >
                ✅ Mark Complete
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={() => alert(`Delete ${selection.ids.length} tasks`)}
              >
                🗑️ Delete
              </Button>
            </Box>
          )}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Complete Customization Example */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Complete Toolbar Customization
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Fully Customized Toolbar
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
          }}
        >
{`const extraFilter = (
  <Stack direction="row" spacing={1}>
    <FormControl size="small">
      <InputLabel>Status</InputLabel>
      <Select value={status} onChange={handleStatusChange}>
        <MenuItem value="all">All</MenuItem>
        <MenuItem value="active">Active</MenuItem>
      </Select>
    </FormControl>
    
    <Button
      variant="contained"
      size="small"
      startIcon={<AddIcon />}
      onClick={handleAddNew}
    >
      Add New
    </Button>
  </Stack>
);

<DataTable
  columns={columns}
  data={data}
  
  // Enable controls
  enableGlobalFilter={true}
  enableColumnFilter={true}
  enableColumnVisibility={true}
  enableExport={true}
  enableReset={true}
  
  // Add custom filter
  extraFilter={extraFilter}
  
  // Customize via slotProps
  slotProps={{
    toolbar: {
      sx: {
        p: 2,
        backgroundColor: 'grey.50',
        borderRadius: 1,
        mb: 2,
      },
    },
    searchInput: {
      placeholder: 'Search all columns...',
      autoFocus: true,
      inputProps: {
        sx: { minWidth: 300 },
      },
    },
    exportButton: {
      tooltipProps: {
        title: 'Download as CSV or Excel',
      },
    },
  }}
/>`}
        </Box>
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
              ✅ Use extraFilter for Custom Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Place custom buttons (Add, Import, etc.) and filters in <code>extraFilter</code> 
              to keep them aligned with built-in controls.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Memoize extraFilter Component
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Wrap <code>extraFilter</code> with <code>useMemo</code> to prevent unnecessary re-renders 
              and maintain performance.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Keep Toolbar Simple
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Don't overcrowd the toolbar. Only show controls that users frequently need. 
              Hide less-used controls to maintain a clean UI.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Use slotProps Before Slots
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try customizing with <code>slotProps</code> first. Only use <code>slots</code> 
              to completely replace components when you need drastically different functionality.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              💡 Bulk Actions Pattern
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Always check <code>selectionState.type</code> in bulk actions to correctly handle 
              both include and exclude selection modes.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
