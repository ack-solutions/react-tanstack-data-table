import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, Box } from '@mui/material';

// Import from our published package - start with just the main component
import { 
  DataTable,
  type ColumnDef 
} from '@ackplus/react-tanstack-data-table';

import { CustomColumnFilterExample } from '../components/CustomColumnFilterExample';
import { SimpleExample } from '../components/SimpleExample';

const theme = createTheme();

// Sample data for testing
const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, role: 'Developer' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, role: 'Designer' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, role: 'Manager' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 28, role: 'Developer' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', age: 32, role: 'Analyst' },
];

// Define columns for testing
const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enableSorting: true,
  },
  {
    accessorKey: 'email', 
    header: 'Email',
    enableSorting: true,
  },
  {
    accessorKey: 'age',
    header: 'Age',
    enableSorting: true,
  },
  {
    accessorKey: 'role',
    header: 'Role',
    enableSorting: true,
  },
];

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom align="center">
          DataTable Package Test ✅
        </Typography>
        
        <Typography variant="h6" gutterBottom align="center" color="text.secondary">
          Testing @ackplus/react-tanstack-data-table v1.0.4
        </Typography>

        {/* Test Simple DataTable */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            🎯 Basic DataTable Test
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This tests the main DataTable component imported from our published package.
          </Typography>
          <DataTable
            data={sampleData}
            columns={columns}
            enableRowSelection={true}
            enablePagination={true}
            enableGlobalFilter={true}
            enableSorting={true}
            enableColumnFilter={true}
            enableExport={true}
          />
        </Box>

        {/* Previous examples for comparison */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            📄 Custom Column Filter Example (Local Component)
          </Typography>
          <CustomColumnFilterExample />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            ℹ️ Simple Info Example
          </Typography>
          <SimpleExample />
        </Box>

        {/* Success Message */}
        <Box sx={{ 
          mt: 4, 
          p: 3, 
          bgcolor: 'success.light', 
          borderRadius: 2,
          border: '2px solid',
          borderColor: 'success.main'
        }}>
          <Typography variant="h5" gutterBottom>
            🎉 Package Test Successful!
          </Typography>
          <Typography variant="body1">
            If you can see the DataTable above, then the package is working correctly and can be imported in external projects.
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;


