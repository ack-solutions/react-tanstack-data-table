import { Box, Typography, Paper, Alert, Divider, Stack, Chip, TextField } from '@mui/material';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { createColumnHelper } from '@tanstack/react-table';
import { FeatureLayout, FeatureSection, CodeBlock, FeatureMetadataTable } from './common';
import { getColumnGroup } from './data/columns-metadata';

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

  const dataTableColumnsGroup = getColumnGroup('datatable-column');
  const tanstackColumnsGroup = getColumnGroup('tanstack-column');

  return (
    <FeatureLayout
      title="Columns"
      description="The column definitions control how data is displayed in the table. Each column can be customized with custom renderers, sizing, alignment, and more."
    >
      <Divider sx={{ my: 4 }} />

      <FeatureSection
        title="Two Ways to Define Columns"
        description="Use TanStack's column helper for the strongest type inference or stick with plain objects for a lightweight syntax."
        spacing={3}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Choose Your Approach
          </Typography>
          <Typography variant="body2">
            Both approaches output the same column objects. Mix and match across your table as needed.
          </Typography>
        </Alert>

        <Stack spacing={3} width="100%">
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Approach 1: Using Column Helper (Recommended)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Column helper delivers rich generics so editors can infer cell values and catch typos early.
            </Typography>
            <CodeBlock
              language="tsx"
              code={`import { createColumnHelper } from '@tanstack/react-table';

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
            />
            <DataTable
              columns={basicColumns}
              data={sampleData}
              enablePagination={false}
            />
          </Paper>

          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Approach 2: Using Normal Array
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Plain objects with <code>accessorKey</code> feel familiar and are easier to paste into docs or config files.
            </Typography>
            <CodeBlock
              language="ts"
              code={`import { DataTableColumn } from '@ackplus/react-tanstack-data-table';

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
            />
            <DataTable
              columns={normalArrayColumns}
              data={sampleData}
              enablePagination={false}
            />
          </Paper>
        </Stack>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      <FeatureSection
        title="Custom Cell Rendering"
        description="Return JSX from the column's cell renderer to present chips, typography, or completely custom layouts."
        spacing={3}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Customize Cell Display
          </Typography>
          <Typography variant="body2">
            The <code>cell</code> callback receives helpers like <code>getValue</code>, <code>row</code>, and <code>table</code> so you can build dynamic UIs per row.
          </Typography>
        </Alert>

        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Example: Custom Cell Rendering (Normal Array)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The same pattern works with column helper or plain objects—the renderer signature is identical.
          </Typography>
          <CodeBlock
            language="tsx"
            code={`const columns: DataTableColumn<Employee>[] = [
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
        variant=\"outlined\"
      />
    ),
  },
];`}
          />
          <DataTable
            columns={customColumns}
            data={sampleData}
            enablePagination={false}
          />
        </Paper>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      <FeatureSection
        title="All Column Properties"
        description="Columns support both DataTable-specific helpers and the full TanStack Table API. Use them together for rich behaviour."
        spacing={3}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            DataTable + TanStack Table Properties
          </Typography>
          <Typography variant="body2">
            Start with the DataTable conveniences and drop to the TanStack layer whenever you need a lower-level hook.
          </Typography>
        </Alert>

        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            DataTable Custom Properties
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These helpers unlock built-in filter widgets, export configuration, and alignment controls.
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable
              items={dataTableColumnsGroup?.items ?? []}
              includePossibleValues
            />
          </Box>
        </Paper>

        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            TanStack Table Core Properties
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            All standard column options remain available when using the DataTable wrapper.
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable
              items={tanstackColumnsGroup?.items ?? []}
              includePossibleValues
            />
          </Box>
        </Paper>
      </FeatureSection>

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
        <CodeBlock
          language="tsx"
          code={`const columns: DataTableColumn<Employee>[] = [
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
        />
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
        <CodeBlock
          language="ts"
          code={`const columns: DataTableColumn<Employee>[] = [
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
        />
      </Paper>

      {/* Text Wrapping */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Text Wrapping
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Enable Text Wrapping
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          By default, text in cells is truncated with ellipsis. Use <code>wrapText: true</code> to enable text wrapping for long content.
        </Typography>
        <CodeBlock
          language="ts"
          code={`const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 200,
    wrapText: false,              // Default: truncate with ellipsis
  },
  {
    accessorKey: 'description',
    header: 'Description',
    size: 300,
    wrapText: true,               // Enable text wrapping
  },
  {
    accessorKey: 'email',
    header: 'Email',
    size: 250,
    wrapText: false,              // Keep email truncated
  },
];`}
        />
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Tip:</strong> Use <code>wrapText: true</code> for columns with long text content (descriptions, notes, comments). 
            Keep <code>wrapText: false</code> (default) for compact columns like IDs, emails, or short codes.
          </Typography>
        </Alert>
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
        <CodeBlock
          language="tsx"
          code={`// Custom filter component
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
        />
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
        <CodeBlock
          language="ts"
          code={`const columns: DataTableColumn<Employee>[] = [
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
        />
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
        <CodeBlock
          language="tsx"
          code={`const columns: DataTableColumn<Employee>[] = [
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
        />
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
        <CodeBlock
          language="tsx"
          code={`<DataTable
  columns={columns}
  data={data}
  enableColumnVisibility={true}  // Enable column visibility control
  initialState={{
    columnVisibility: {
      email: false,  // Hide email column by default
    },
  }}
/>`}
        />
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
              Tip: Use Appropriate Column Sizes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set reasonable <code>size</code> values for your columns based on expected content length. 
              Narrow columns for IDs, wider columns for descriptions.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Keep Cell Renderers Simple
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avoid complex logic in cell renderers to maintain good performance. For expensive calculations, 
              use <code>accessorFn</code> to compute values once.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Use Type-Specific Filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set the <code>type</code> property ('text', 'number', 'date', 'select', 'boolean') to automatically 
              get the appropriate filter UI for each column.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Provide Options for Select Filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When using <code>type: 'select'</code>, always provide the <code>options</code> array with 
              label/value pairs for better user experience.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Use Alignment for Numbers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set <code>align: 'right'</code> for numeric columns (salary, quantities) for better readability.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Consider Mobile Display
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use <code>enableColumnVisibility</code> and <code>enableHiding</code> to let users hide 
              less important columns on mobile devices.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </FeatureLayout>
  );
}
