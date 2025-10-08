import { Box, Typography, Paper, Alert, Divider, Table, TableBody, TableCell, TableHead, TableRow, Stack } from '@mui/material';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { useState, useCallback, useRef } from 'react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  sales: number;
  releaseDate: string;
}

const sampleProducts: Product[] = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299, rating: 4.5, sales: 150, releaseDate: '2024-01-15' },
  { id: 2, name: 'Wireless Mouse', category: 'Electronics', price: 29, rating: 4.2, sales: 420, releaseDate: '2024-02-20' },
  { id: 3, name: 'Office Chair', category: 'Furniture', price: 299, rating: 4.8, sales: 89, releaseDate: '2023-11-10' },
  { id: 4, name: 'Desk Lamp', category: 'Furniture', price: 45, rating: 4.0, sales: 230, releaseDate: '2024-03-05' },
  { id: 5, name: 'Notebook Set', category: 'Stationery', price: 15, rating: 4.3, sales: 550, releaseDate: '2024-01-25' },
  { id: 6, name: 'Pen Pack', category: 'Stationery', price: 8, rating: 3.9, sales: 780, releaseDate: '2023-12-15' },
];

export function SortingPage() {
  const [serverSortState, setServerSortState] = useState<any>(null);
  const tableRef = useRef<any>(null);

  // Columns with sorting enabled
  const sortableColumns: DataTableColumn<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product Name',
      size: 200,
      enableSorting: true,          // Enable sorting for this column
    },
    {
      accessorKey: 'category',
      header: 'Category',
      size: 150,
      enableSorting: true,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      size: 120,
      enableSorting: true,
      cell: ({ getValue }) => `$${getValue<number>()}`,
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      size: 100,
      enableSorting: true,
      sortDescFirst: true,          // Sort descending first
      cell: ({ getValue }) => `⭐ ${getValue<number>().toFixed(1)}`,
    },
    {
      accessorKey: 'sales',
      header: 'Sales',
      size: 100,
      enableSorting: true,
      sortDescFirst: true,
    },
    {
      accessorKey: 'releaseDate',
      header: 'Release Date',
      size: 130,
      enableSorting: true,
    },
  ];

  // Server-side fetch handler
  const handleFetchData = useCallback(async (filters: any) => {
    console.log('Fetching with sorting:', filters.sorting);
    setServerSortState(filters.sorting);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let sortedData = [...sampleProducts];
    
    // Apply sorting
    if (filters.sorting?.length) {
      sortedData.sort((a, b) => {
        for (const sort of filters.sorting) {
          const aValue = a[sort.id as keyof Product];
          const bValue = b[sort.id as keyof Product];
          
          if (aValue < bValue) return sort.desc ? 1 : -1;
          if (aValue > bValue) return sort.desc ? -1 : 1;
        }
        return 0;
      });
    }
    
    return { data: sortedData, total: sortedData.length };
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Sorting
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Enable multi-column sorting with customizable sort direction and client or server-side processing.
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Multi-Column Sorting
        </Typography>
        <Typography variant="body2">
          Click column headers to sort. Hold Shift and click multiple columns to sort by multiple fields.
          Click three times to clear sorting.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Enable Sorting */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Enable Sorting
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Basic Setup
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enable sorting on the table and individual columns:
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
{`const columns: DataTableColumn<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Product Name',
    enableSorting: true,        // Enable sorting for this column
  },
  {
    accessorKey: 'price',
    header: 'Price',
    enableSorting: true,
    sortDescFirst: true,        // Sort descending first (for numbers)
  },
];

<DataTable
  columns={columns}
  data={data}
  enableSorting={true}          // Enable sorting globally
  sortingMode="client"          // 'client' or 'server'
  onSortingChange={(sorting) => {
    console.log('Sort changed:', sorting);
  }}
/>`}
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Default Sorting */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Default Sorting (Initial State)
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Set Initial Sort Order
        </Typography>
        <Typography variant="body2">
          Use <code>initialState.sorting</code> to set the default sort order when the table loads.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Default Sorting
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Set initial sorting on one or multiple columns:
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
  enableSorting={true}
  initialState={{
    sorting: [
      { id: 'price', desc: true },      // Sort by price descending
      { id: 'name', desc: false },      // Then by name ascending
    ],
  }}
/>`}
        </Box>

        <DataTable
          columns={sortableColumns}
          data={sampleProducts}
          enableSorting={true}
          sortingMode="client"
          initialState={{
            sorting: [
              { id: 'rating', desc: true },
            ],
          }}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Column Properties */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Column Sorting Properties
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Sorting Column Props
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
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableSorting</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                true
              </TableCell>
              <TableCell>Enable sorting for this specific column</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>sortDescFirst</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                false
              </TableCell>
              <TableCell>
                Sort descending first when clicking column header (useful for numbers/ratings)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>sortingFn</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                Function | string
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                auto
              </TableCell>
              <TableCell>
                Custom sorting function (e.g., 'alphanumeric', 'datetime', or custom function)
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Server-Side Sorting */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Server-Side Sorting
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Server-Side Mode
        </Typography>
        <Typography variant="body2">
          Set <code>sortingMode="server"</code> or <code>dataMode="server"</code> to delegate 
          sorting to your backend. The <code>onFetchData</code> callback receives sort state.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Server-Side Sorting
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
  // Sorting structure received:
  // {
  //   sorting: [
  //     { id: 'price', desc: true },
  //     { id: 'name', desc: false },
  //   ],
  //   ...
  // }
  
  const response = await fetch('/api/products', {
    method: 'POST',
    body: JSON.stringify(filters),
  });
  
  return await response.json();
};

<DataTable
  columns={columns}
  dataMode="server"              // Server mode
  onFetchData={handleFetchData}
  enableSorting={true}
  sortingMode="server"           // Server-side sorting
  initialState={{
    sorting: [{ id: 'price', desc: true }],  // Default sort
  }}
/>`}
        </Box>

        {serverSortState && (
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Current Server Sort State:
            </Typography>
            <Box
              component="pre"
              sx={{
                fontSize: 12,
                fontFamily: 'monospace',
                overflow: 'auto',
              }}
            >
              {JSON.stringify(serverSortState, null, 2)}
            </Box>
          </Box>
        )}

        <DataTable
          columns={sortableColumns}
          dataMode="server"
          onFetchData={handleFetchData}
          enableSorting={true}
          sortingMode="server"
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* API Reference */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Sorting API Reference
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Programmatic Sorting Control
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Control sorting programmatically using the table API ref:
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

const tableRef = useRef<DataTableApi<Product>>(null);

// Sort a single column
tableRef.current?.sorting.sortColumn('price', 'desc');

// Set multi-column sorting
tableRef.current?.sorting.setSorting([
  { id: 'category', desc: false },
  { id: 'price', desc: true },
]);

// Clear all sorting
tableRef.current?.sorting.clearSorting();

// Reset to initial state
tableRef.current?.sorting.resetSorting();

// Get current sort state
const currentSorting = tableRef.current?.state.getCurrentSorting();

<DataTable
  ref={tableRef}
  columns={columns}
  data={data}
  enableSorting={true}
/>`}
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* DataTable Props */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        DataTable Sorting Props
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
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableSorting</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                true
              </TableCell>
              <TableCell>Enable sorting functionality globally</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>sortingMode</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                'client' | 'server'
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                'client'
              </TableCell>
              <TableCell>
                Sorting mode. 'server' delegates sorting to onFetchData callback
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>onSortingChange</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'(sorting: SortingState) => void'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                undefined
              </TableCell>
              <TableCell>Callback when sorting state changes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>initialState.sorting</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'SortingState'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                []
              </TableCell>
              <TableCell>
                Initial sort order: <code>[{'{ id: "columnId", desc: boolean }'}]</code>
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
              ✅ Use sortDescFirst for Numbers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set <code>sortDescFirst: true</code> on numeric columns (price, rating, count) so clicking 
              the header shows highest values first.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Set Default Sorting
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Always provide a sensible default sort order using <code>initialState.sorting</code> to improve UX.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Use Server-Side for Large Datasets
            </Typography>
            <Typography variant="body2" color="text.secondary">
              For datasets with 10,000+ rows, use <code>sortingMode="server"</code> to offload sorting to your backend.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Disable Sorting for Action Columns
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set <code>enableSorting: false</code> on action columns or columns with buttons/icons.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              💡 Multi-Column Sorting
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Users can hold Shift and click multiple column headers to sort by multiple fields. 
              The order of clicks determines sort priority.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
