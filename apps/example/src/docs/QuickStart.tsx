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
          Here is a simple example to get you started with the DataTable component.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          1. Import the Component and Types
        </Typography>
        <CodeBlock
          language="ts"
          code={`import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';`}
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
          code={`const columns: DataTableColumn<User>[] = [
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
    accessorKey: 'status',
    header: 'Status',
    enableSorting: true,
    cell: ({ getValue }) => {
      const status = getValue<string>();
      return (
        <Chip 
          label={status} 
          color={status === 'active' ? 'success' : 'default'}
          size="small"
        />
      );
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    enableSorting: true,
  },
];`}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          4. Prepare Your Data
        </Typography>
        <CodeBlock
          language="tsx"
          code={`const data: User[] = [
  { 
    id: 1, 
    name: 'John Doe', 
    email: 'john@example.com', 
    status: 'active', 
    role: 'Admin' 
  },
  { 
    id: 2, 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    status: 'inactive', 
    role: 'User' 
  },
  // ... more data
];`}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          5. Use the DataTable Component
        </Typography>
        <CodeBlock
          language="tsx"
          code={`function MyDataTable() {
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
      idKey="id"
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
          Check out the Examples section to see more advanced usage patterns including server-side data fetching, 
          column filtering, bulk actions, and the Props section to explore all available configuration options.
        </Typography>
      </Alert>
    </Box>
  );
}
