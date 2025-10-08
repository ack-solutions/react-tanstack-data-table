import { Box, Typography, Paper, Alert, Divider, Table, TableBody, TableCell, TableHead, TableRow, Stack, Chip, TextField } from '@mui/material';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { createColumnHelper } from '@tanstack/react-table';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive' | 'pending';
  isActive: boolean;
}

const columnHelper = createColumnHelper<Employee>();

const sampleData: Employee[] = [
  { id: 1, name: 'John Doe', email: 'john@company.com', department: 'Engineering', salary: 75000, status: 'active', isActive: true },
  { id: 2, name: 'Jane Smith', email: 'jane@company.com', department: 'Marketing', salary: 65000, status: 'active', isActive: true },
  { id: 3, name: 'Bob Johnson', email: 'bob@company.com', department: 'Sales', salary: 60000, status: 'inactive', isActive: false },
  { id: 4, name: 'Alice Williams', email: 'alice@company.com', department: 'HR', salary: 55000, status: 'pending', isActive: true },
  { id: 5, name: 'Charlie Brown', email: 'charlie@company.com', department: 'Finance', salary: 80000, status: 'active', isActive: true },
];

export function ColumnsPage() {
  // Basic columns with columnHelper
  const basicColumns = [
    columnHelper.accessor('name', {
      header: 'Name',
      size: 200,
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      size: 250,
    }),
    columnHelper.accessor('department', {
      header: 'Department',
      size: 150,
    }),
  ];

  // Basic columns as normal array (alternative approach)
  const normalArrayColumns: DataTableColumn<Employee>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      size: 200,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      size: 250,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      size: 150,
    },
  ];

  // Columns with custom rendering using normal array
  const customColumns: DataTableColumn<Employee>[] = [
    {
      accessorKey: 'name',
      header: 'Employee Name',
      size: 200,
      cell: ({ getValue }) => (
        <Typography sx={{ fontWeight: 600 }}>{getValue<string>()}</Typography>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email Address',
      size: 250,
      cell: ({ getValue }) => (
        <Typography sx={{ color: 'primary.main', fontSize: '0.875rem' }}>
          {getValue<string>()}
        </Typography>
      ),
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      size: 150,
      cell: ({ getValue }) => (
        <Chip 
          label={`$${(getValue<number>()).toLocaleString()}`} 
          color="success" 
          size="small" 
          variant="outlined"
        />
      ),
    },
  ];

  // Advanced columns with all features
  const advancedColumns: DataTableColumn<Employee>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      size: 200,
      enableSorting: true,
      enableGlobalFilter: true,
      enablePinning: true,
      filterable: true,
      type: 'text',
    },
    {
      accessorKey: 'department',
      header: 'Department',
      size: 150,
      align: 'left',
      filterable: true,
      type: 'select',
      options: [
        { value: 'Engineering', label: 'Engineering' },
        { value: 'Marketing', label: 'Marketing' },
        { value: 'Sales', label: 'Sales' },
        { value: 'HR', label: 'HR' },
        { value: 'Finance', label: 'Finance' },
      ],
      enableSorting: true,
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      size: 150,
      align: 'right',
      filterable: true,
      type: 'number',
      hideInExport: false,
      cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
      footer: ({ table }) => {
        const total = table.getFilteredRowModel().rows
          .reduce((sum, row) => sum + (row.original.salary || 0), 0);
        return (
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Total: ${total.toLocaleString()}
          </Typography>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      align: 'center',
      filterable: true,
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
      ],
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
    },
    {
      accessorKey: 'isActive',
      header: 'Active',
      size: 100,
      align: 'center',
      filterable: true,
      type: 'boolean',
      cell: ({ getValue }) => (
        <Chip 
          label={getValue<boolean>() ? 'Yes' : 'No'} 
          color={getValue<boolean>() ? 'success' : 'default'}
          size="small"
        />
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Columns
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        The column definitions control how data is displayed in the table. Each column can be customized 
        with custom renderers, sizing, alignment, and more.
      </Typography>

      <Divider sx={{ my: 4 }} />

      {/* Two Approaches */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Two Ways to Define Columns
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Choose Your Approach
        </Typography>
        <Typography variant="body2">
          You can define columns in two ways: using <code>createColumnHelper</code> for better TypeScript 
          inference, or using a normal array with <code>accessorKey</code> for simpler syntax.
        </Typography>
      </Alert>

      {/* Approach 1: Column Helper */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Approach 1: Using Column Helper (Recommended)
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Column Helper
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Better TypeScript support and type inference for column definitions.
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
{`import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<Employee>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    size: 200,
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    size: 250,
  }),
  columnHelper.accessor('department', {
    header: 'Department',
    size: 150,
  }),
];`}
        </Box>
        <DataTable
          columns={basicColumns}
          data={sampleData}
          enablePagination={false}
        />
      </Paper>

      {/* Approach 2: Normal Array */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Approach 2: Using Normal Array
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Normal Array
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Simpler syntax using plain objects with <code>accessorKey</code> property.
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
{`import { DataTableColumn } from '@ackplus/react-tanstack-data-table';

const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 200,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    size: 250,
  },
  {
    accessorKey: 'department',
    header: 'Department',
    size: 150,
  },
];`}
        </Box>
        <DataTable
          columns={normalArrayColumns}
          data={sampleData}
          enablePagination={false}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Custom Cell Rendering */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Custom Cell Rendering
      </Typography>
      
      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Customize Cell Display
        </Typography>
        <Typography variant="body2">
          Use the <code>cell</code> property to customize how data is rendered in each cell. 
          You can return any React component or JSX element.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Custom Cell Rendering (Normal Array)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You can use custom cell renderers with both approaches. Here's the normal array approach:
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
{`const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Employee Name',
    size: 200,
    cell: ({ getValue }) => (
      <Typography sx={{ fontWeight: 600 }}>
        {getValue<string>()}
      </Typography>
    ),
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    size: 150,
    cell: ({ getValue }) => (
      <Chip 
        label={\`\$\${getValue<number>().toLocaleString()}\`} 
        color="success" 
        size="small" 
        variant="outlined"
      />
    ),
  },
];`}
        </Box>
        <DataTable
          columns={customColumns}
          data={sampleData}
          enablePagination={false}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* All Column Properties */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        All Column Properties
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          DataTable + TanStack Table Properties
        </Typography>
        <Typography variant="body2">
          Columns support both custom DataTable properties and all standard TanStack Table column properties.
        </Typography>
      </Alert>

      {/* DataTable Custom Properties */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          DataTable Custom Properties
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These are custom properties specific to the DataTable component for enhanced functionality.
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
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
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>type</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  'boolean' | 'number' | 'date' | 'select' | 'text'
                </TableCell>
                <TableCell>Column data type for automatic filter component selection</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>options</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  {'{ label: string; value: string }[]'}
                </TableCell>
                <TableCell>Options for select-type filters (used when type='select')</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>align</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  'left' | 'center' | 'right'
                </TableCell>
                <TableCell>Text alignment for column cells</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>filterable</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>boolean</TableCell>
                <TableCell>Enable column-specific filtering UI</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>hideInExport</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>boolean</TableCell>
                <TableCell>Exclude this column from CSV/Excel exports</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>filterComponent</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  React.ComponentType
                </TableCell>
                <TableCell>Custom component for column filter input</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>editComponent</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  React.ComponentType
                </TableCell>
                <TableCell>Custom component for inline editing (alternative to filterComponent)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* TanStack Table Core Properties */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          TanStack Table Core Properties
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          All standard TanStack Table column properties are supported. Here are the most commonly used ones.
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
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
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>accessorKey</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>string</TableCell>
                <TableCell>The key from your data object to display in this column</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>accessorFn</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  {'(row) => any'}
                </TableCell>
                <TableCell>Function to derive cell value from row data</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>header</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  string | ReactNode | Function
                </TableCell>
                <TableCell>The header text or component to display</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>footer</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  ReactNode | Function
                </TableCell>
                <TableCell>Footer content for the column</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>cell</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  {'(props) => ReactNode'}
                </TableCell>
                <TableCell>Custom cell renderer function</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>id</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>string</TableCell>
                <TableCell>Unique identifier for the column</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>size</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>number</TableCell>
                <TableCell>Initial width of the column in pixels</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>minSize</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>number</TableCell>
                <TableCell>Minimum width when column resizing is enabled</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>maxSize</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>number</TableCell>
                <TableCell>Maximum width when column resizing is enabled</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableSorting</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>boolean</TableCell>
                <TableCell>Enable or disable sorting for this column</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableResizing</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>boolean</TableCell>
                <TableCell>Enable or disable resizing for this column</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enablePinning</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>boolean</TableCell>
                <TableCell>Enable or disable pinning for this column</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableHiding</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>boolean</TableCell>
                <TableCell>Enable or disable hiding for this column</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableGlobalFilter</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>boolean</TableCell>
                <TableCell>Include this column in global search</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableColumnFilter</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>boolean</TableCell>
                <TableCell>Enable column-specific filtering</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>sortingFn</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  Function | string
                </TableCell>
                <TableCell>Custom sorting function for this column</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>sortDescFirst</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>boolean</TableCell>
                <TableCell>Sort descending first when clicking sort</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>meta</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  ColumnMeta
                </TableCell>
                <TableCell>Additional metadata for the column</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Advanced Column Features */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Advanced Column Features
      </Typography>

      {/* Filterable Columns with Options */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2, mt: 3 }}>
        Filterable Columns with Options
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Select Filter with Options
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Use <code>filterable: true</code>, <code>type: 'select'</code>, and <code>options</code> to create dropdown filters.
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
{`const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'department',
    header: 'Department',
    size: 150,
    filterable: true,           // Enable column filter
    type: 'select',             // Use select filter
    options: [                  // Filter dropdown options
      { value: 'Engineering', label: 'Engineering' },
      { value: 'Marketing', label: 'Marketing' },
      { value: 'Sales', label: 'Sales' },
      { value: 'HR', label: 'HR' },
      { value: 'Finance', label: 'Finance' },
    ],
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    filterable: true,
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
    ],
    cell: ({ getValue }) => (
      <Chip 
        label={getValue<string>()} 
        color={getValue<string>() === 'active' ? 'success' : 'default'}
        size="small"
      />
    ),
  },
];

// Enable column filtering on the table
<DataTable
  columns={columns}
  data={data}
  enableColumnFilter={true}     // Enable column filter UI
/>`}
        </Box>
      </Paper>

      {/* Column Alignment */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Column Alignment
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Text Alignment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Use the <code>align</code> property to control text alignment in cells.
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
{`const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 200,
    align: 'left',              // Left aligned (default)
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    size: 150,
    align: 'right',             // Right aligned for numbers
    cell: ({ getValue }) => \`$\${getValue<number>().toLocaleString()}\`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    align: 'center',            // Center aligned
  },
];`}
        </Box>
      </Paper>

      {/* Custom Filter Component */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Custom Filter Component
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Custom Filter Component
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Use <code>filterComponent</code> to create completely custom filter inputs.
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
{`// Custom filter component
const SalaryRangeFilter = ({ value, onChange, filter, column }) => {
  return (
    <TextField
      fullWidth
      size="small"
      type="number"
      label="Min Salary"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{ startAdornment: '$' }}
    />
  );
};

const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'salary',
    header: 'Salary',
    size: 150,
    filterable: true,
    filterComponent: SalaryRangeFilter,  // Use custom filter
    cell: ({ getValue }) => \`$\${getValue<number>().toLocaleString()}\`,
  },
];`}
        </Box>
      </Paper>

      {/* Column Meta */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Column Meta (Additional Data)
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Using Column Meta
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Store additional metadata in the <code>meta</code> property for custom behaviors.
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
{`const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'salary',
    header: 'Salary',
    size: 150,
    meta: {
      filterVariant: 'range',     // Custom metadata
      displayFormat: 'currency',
      editable: true,
      validationRules: {
        min: 0,
        max: 200000,
      },
    },
  },
];

// Access meta in cell renderer
cell: ({ getValue, column }) => {
  const meta = column.columnDef.meta;
  // Use meta data for custom rendering logic
}`}
        </Box>
      </Paper>

      {/* Footer */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Column Footer
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Footer with Aggregation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Add footer content to display summaries or aggregations.
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
{`const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'salary',
    header: 'Salary',
    size: 150,
    cell: ({ getValue }) => \`$\${getValue<number>().toLocaleString()}\`,
    footer: ({ table }) => {
      const total = table.getFilteredRowModel().rows
        .reduce((sum, row) => sum + row.original.salary, 0);
      return (
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Total: $\{total.toLocaleString()}
        </Typography>
      );
    },
  },
];`}
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Column Visibility */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Column Visibility & Control
      </Typography>
      
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Control Column Visibility
        </Typography>
        <Typography variant="body2">
          Enable <code>enableColumnVisibility</code> prop on the DataTable component to allow users 
          to show/hide columns using the column visibility control in the toolbar.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Column Visibility
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
  enableColumnVisibility={true}  // Enable column visibility control
  initialState={{
    columnVisibility: {
      email: false,  // Hide email column by default
    },
  }}
/>`}
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Live Interactive Example */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Live Interactive Example
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          All Features Combined
        </Typography>
        <Typography variant="body2">
          This example demonstrates filterable columns with options, alignment, custom cell rendering, 
          footer aggregation, and all advanced column features working together.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Advanced Columns Demo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Try using the column filters, sorting, and column visibility controls to explore all features.
        </Typography>
        <DataTable
          columns={advancedColumns}
          data={sampleData}
          enableColumnFilter={true}
          enableSorting={true}
          enableGlobalFilter={true}
          enableColumnVisibility={true}
          enablePagination={false}
        />
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
              ✅ Use Appropriate Column Sizes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set reasonable <code>size</code> values for your columns based on expected content length. 
              Narrow columns for IDs, wider columns for descriptions.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Keep Cell Renderers Simple
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avoid complex logic in cell renderers to maintain good performance. For expensive calculations, 
              use <code>accessorFn</code> to compute values once.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Use Type-Specific Filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set the <code>type</code> property ('text', 'number', 'date', 'select', 'boolean') to automatically 
              get the appropriate filter UI for each column.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Provide Options for Select Filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When using <code>type: 'select'</code>, always provide the <code>options</code> array with 
              label/value pairs for better user experience.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Use Alignment for Numbers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set <code>align: 'right'</code> for numeric columns (salary, quantities) for better readability.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Consider Mobile Display
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use <code>enableColumnVisibility</code> and <code>enableHiding</code> to let users hide 
              less important columns on mobile devices.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
