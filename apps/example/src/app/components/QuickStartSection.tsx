import { Box, Typography, Paper, Alert } from '@mui/material';
import { CodeBlock } from './features/common';

export function QuickStartSection() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Quick Start
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Get up and running with the DataTable component in just a few steps.
      </Typography>

      <Alert severity="success" sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Basic Usage
        </Typography>
        <Typography variant="body2">
          Here's a simple example to get you started with the DataTable component.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          1. Import the Component
        </Typography>
        <CodeBlock
          language="ts"
          code={`import { DataTable } from '@ackplus/react-tanstack-data-table';
import { createColumnHelper } from '@tanstack/react-table';`}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          2. Define Your Data Type
        </Typography>
        <CodeBlock
          language="ts"
          code={`interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  role: string;
}`}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          3. Create Column Definitions
        </Typography>
        <CodeBlock
          language="tsx"
          code={`const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    size: 150,
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    size: 200,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => (
      <Chip 
        label={getValue()} 
        color={getValue() === 'active' ? 'success' : 'default'} 
      />
    ),
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    size: 120,
  }),
];`}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          4. Use the Component
        </Typography>
        <CodeBlock
          language="tsx"
          code={`const data: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', role: 'User' },
  // ... more data
];

function MyDataTable() {
  return (
    <DataTable
      columns={columns}
      data={data}
      enableSorting
      enableGlobalFilter
      enablePagination
      enableRowSelection
      enableColumnVisibility
      enableExport
    />
  );
}`}
        />
      </Paper>

      <Alert severity="info">
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Next Steps
        </Typography>
        <Typography variant="body2">
          Check out the Examples section to see more advanced usage patterns and the Props section 
          to explore all available configuration options.
        </Typography>
      </Alert>
    </Box>
  );
}
