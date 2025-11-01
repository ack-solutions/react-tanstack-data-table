import { Box, Typography, Paper, Alert, Divider, Table, TableBody, TableCell, TableHead, TableRow, Stack, Chip } from '@mui/material';
import { DataTable, DataTableColumn, DEFAULT_SELECTION_COLUMN_NAME, DEFAULT_EXPANDING_COLUMN_NAME } from '@ackplus/react-tanstack-data-table';
import { useRef } from 'react';
import { FeatureLayout } from './common';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  status: 'active' | 'inactive';
  performanceScore: number;
}

const sampleEmployees: Employee[] = [
  { id: 1, name: 'John Doe', email: 'john@company.com', department: 'Engineering', position: 'Senior Developer', salary: 95000, status: 'active', performanceScore: 92 },
  { id: 2, name: 'Jane Smith', email: 'jane@company.com', department: 'Marketing', position: 'Marketing Manager', salary: 85000, status: 'active', performanceScore: 88 },
  { id: 3, name: 'Bob Johnson', email: 'bob@company.com', department: 'Sales', position: 'Sales Rep', salary: 65000, status: 'inactive', performanceScore: 75 },
  { id: 4, name: 'Alice Williams', email: 'alice@company.com', department: 'HR', position: 'HR Specialist', salary: 60000, status: 'active', performanceScore: 85 },
  { id: 5, name: 'Charlie Brown', email: 'charlie@company.com', department: 'Finance', position: 'Financial Analyst', salary: 75000, status: 'active', performanceScore: 90 },
];

export function PinningPage() {
  const tableRef = useRef<any>(null);

  // Columns for pinning demo
  const pinnableColumns: DataTableColumn<Employee>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 80,
      enablePinning: true,          // Enable pinning for this column
    },
    {
      accessorKey: 'name',
      header: 'Name',
      size: 180,
      enablePinning: true,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      size: 220,
      enablePinning: true,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      size: 150,
      enablePinning: true,
    },
    {
      accessorKey: 'position',
      header: 'Position',
      size: 180,
      enablePinning: true,
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      size: 120,
      enablePinning: true,
      cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 100,
      enablePinning: true,
      cell: ({ getValue }) => (
        <Chip
          label={getValue<string>()}
          color={getValue<string>() === 'active' ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      accessorKey: 'performanceScore',
      header: 'Performance',
      size: 130,
      enablePinning: true,
      cell: ({ getValue }) => `${getValue<number>()}%`,
    },
  ];

  return (
    <FeatureLayout
      title="Column Pinning"
      description="Pin columns to the left or right side of the table to keep them visible while scrolling horizontally. Perfect for keeping key columns like names or actions always in view."
    >
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Sticky Columns
        </Typography>
        <Typography variant="body2">
          Pinned columns remain fixed while other columns scroll horizontally. This is essential for 
          wide tables where you need to keep important columns (like names or actions) always visible.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Enable Column Pinning */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Enable Column Pinning
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Basic Setup
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enable column pinning on the table:
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
{`const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enablePinning: true,        // Allow this column to be pinned
  },
  // ... other columns
];

<DataTable
  columns={columns}
  data={data}
  enableColumnPinning={true}    // Enable pinning feature
  onColumnPinningChange={(pinning) => {
    console.log('Pinning changed:', pinning);
  }}
/>`}
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Default Pinning (Initial State) */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Default Pinning (Initial State)
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Set Initial Pinned Columns
        </Typography>
        <Typography variant="body2">
          Use <code>initialState.columnPinning</code> to pin columns by default when the table loads.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Default Pinning
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Pin columns to left or right side:
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
  enableColumnPinning={true}
  initialState={{
    columnPinning: {
      left: ['id', 'name'],      // Pin ID and Name to left
      right: ['actions'],        // Pin actions to right
    },
  }}
/>`}
        </Box>

        <DataTable
          columns={pinnableColumns}
          data={sampleEmployees}
          enableColumnPinning={true}
          enablePagination={false}
          initialState={{
            columnPinning: {
              left: ['id', 'name'],
              right: ['performanceScore'],
            },
          }}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Special Column Names */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Special Column Names
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Built-in Column IDs
        </Typography>
        <Typography variant="body2">
          The DataTable automatically creates special columns for selection and expansion. 
          You can pin these using their predefined IDs.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Available Special Column IDs
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Constant</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
                DEFAULT_SELECTION_COLUMN_NAME
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                '_selection'
              </TableCell>
              <TableCell>
                ID for the checkbox selection column (when enableRowSelection=true)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
                DEFAULT_EXPANDING_COLUMN_NAME
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                '_expanding'
              </TableCell>
              <TableCell>
                ID for the row expansion column (when enableExpanding=true)
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Insight: Example: Pin Special Columns
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
{`import { 
  DEFAULT_SELECTION_COLUMN_NAME, 
  DEFAULT_EXPANDING_COLUMN_NAME 
} from '@ackplus/react-tanstack-data-table';

<DataTable
  columns={columns}
  data={data}
  enableRowSelection={true}
  enableExpanding={true}
  enableColumnPinning={true}
  initialState={{
    columnPinning: {
      left: [
        DEFAULT_EXPANDING_COLUMN_NAME,   // Pin expand column
        DEFAULT_SELECTION_COLUMN_NAME,   // Pin selection column
        'name',                          // Pin name column
      ],
      right: ['actions'],                // Pin actions to right
    },
  }}
/>`}
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* API Reference */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Pinning API Reference
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Programmatic Pinning Control
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Control column pinning programmatically using the table API ref:
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
import { 
  DataTableApi,
  DEFAULT_SELECTION_COLUMN_NAME,
  DEFAULT_EXPANDING_COLUMN_NAME 
} from '@ackplus/react-tanstack-data-table';

const tableRef = useRef<DataTableApi<Employee>>(null);

// Pin column to left
tableRef.current?.columnPinning.pinColumnLeft('name');

// Pin column to right
tableRef.current?.columnPinning.pinColumnRight('actions');

// Unpin a column
tableRef.current?.columnPinning.unpinColumn('name');

// Set complete pinning state
tableRef.current?.columnPinning.setPinning({
  left: [DEFAULT_SELECTION_COLUMN_NAME, 'name'],
  right: ['actions'],
});

// Reset pinning to initial state
tableRef.current?.columnPinning.resetColumnPinning();

<DataTable
  ref={tableRef}
  columns={columns}
  data={data}
  enableColumnPinning={true}
/>`}
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* DataTable Props */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        DataTable Pinning Props
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
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableColumnPinning</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                false
              </TableCell>
              <TableCell>Enable column pinning functionality</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>onColumnPinningChange</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'(pinning) => void'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                undefined
              </TableCell>
              <TableCell>Callback when column pinning state changes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>initialState.columnPinning</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'{ left: string[], right: string[] }'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                {'{ left: [], right: [] }'}
              </TableCell>
              <TableCell>
                Initial pinning configuration with column IDs for left and right pinning
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Live Interactive Example */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Interactive Demo
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Try Column Pinning
        </Typography>
        <Typography variant="body2">
          Right-click on column headers or use the column menu to pin/unpin columns. 
          Scroll horizontally to see pinned columns stay in place.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Pre-Pinned Columns
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This example has ID and Name pinned to the left, and Performance pinned to the right.
          Try scrolling horizontally to see the effect.
        </Typography>
        
        <DataTable
          ref={tableRef}
          columns={pinnableColumns}
          data={sampleEmployees}
          enableColumnPinning={true}
          enablePagination={false}
          initialState={{
            columnPinning: {
              left: ['id', 'name'],
              right: ['performanceScore'],
            },
          }}
          fitToScreen={false}      // Allow horizontal scrolling
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Pinning with Selection & Expansion */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Pinning with Selection & Expansion
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Common Pattern
        </Typography>
        <Typography variant="body2">
          A common pattern is to pin selection and expansion columns to the left, and action 
          columns to the right. Use the special column name constants for this.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Pin Special Columns
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
{`import { 
  DataTable,
  DEFAULT_SELECTION_COLUMN_NAME,    // '_selection'
  DEFAULT_EXPANDING_COLUMN_NAME     // '_expanding'
} from '@ackplus/react-tanstack-data-table';

<DataTable
  columns={columns}
  data={data}
  enableRowSelection={true}
  enableExpanding={true}
  enableColumnPinning={true}
  initialState={{
    columnPinning: {
      left: [
        DEFAULT_EXPANDING_COLUMN_NAME,   // Pin expand button
        DEFAULT_SELECTION_COLUMN_NAME,   // Pin selection checkbox
        'name',                          // Pin name column
      ],
      right: [
        'actions',                       // Pin action buttons to right
      ],
    },
  }}
/>`}
        </Box>

        <DataTable
          columns={pinnableColumns}
          data={sampleEmployees}
          enableRowSelection={true}
          enableColumnPinning={true}
          enablePagination={false}
          initialState={{
            columnPinning: {
              left: [DEFAULT_SELECTION_COLUMN_NAME, 'name'],
              right: ['status'],
            },
          }}
          fitToScreen={false}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Column Properties */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Column Pinning Properties
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Column-Level Props
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Default</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enablePinning</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                true
              </TableCell>
              <TableCell>
                Enable or disable pinning for this specific column
              </TableCell>
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
              Tip: Pin Important Columns
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pin essential columns like ID, name, or primary identifiers to the left. Pin action columns to the right.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Use Special Column Constants
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Always use <code>DEFAULT_SELECTION_COLUMN_NAME</code> and <code>DEFAULT_EXPANDING_COLUMN_NAME</code> 
              instead of hardcoding '_selection' or '_expanding'.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Limit Pinned Columns
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Don't pin too many columns as it reduces scrollable space. Typically 2-3 columns on each side is optimal.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Combine with Column Visibility
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Let users hide unpinned columns to focus on pinned content using <code>enableColumnVisibility</code>.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Insight: Common Pattern
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pin selection/expanding columns and primary identifier to left. Pin action buttons to right. 
              This creates a familiar, user-friendly layout.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </FeatureLayout>
  );
}
