import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';

// Import from our published package - start with just the main component
import {
  ServerSideTest,
  SimpleLocalExample,
  type ColumnDef
} from '@ackplus/react-tanstack-data-table';


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
        <ServerSideTest />
        <SimpleLocalExample />
      </Container>
    </ThemeProvider>
  );
}

export default App;


