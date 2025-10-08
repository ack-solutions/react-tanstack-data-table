import { Box, Typography, Paper, Alert, Divider, Table, TableBody, TableCell, TableHead, TableRow, Stack, Chip, Button } from '@mui/material';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { useState, useCallback, useRef, useMemo } from 'react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  rating: number;
}

// Generate sample data
const generateProducts = (count: number): Product[] => {
  const categories = ['Electronics', 'Furniture', 'Stationery', 'Clothing', 'Sports'];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    price: Math.floor(Math.random() * 1000) + 10,
    inStock: Math.random() > 0.3,
    rating: Math.floor(Math.random() * 50) / 10,
  }));
};

export function PaginationPage() {
  const tableRef = useRef<any>(null);
  const [serverPaginationState, setServerPaginationState] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  
  const sampleData = useMemo(() => generateProducts(100), []);

  // Columns
  const columns: DataTableColumn<Product>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      size: 80,
    },
    {
      accessorKey: 'name',
      header: 'Product Name',
      size: 200,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      size: 150,
      cell: ({ getValue }) => (
        <Chip label={getValue<string>()} size="small" variant="outlined" />
      ),
    },
    {
      accessorKey: 'price',
      header: 'Price',
      size: 120,
      cell: ({ getValue }) => `$${getValue<number>()}`,
    },
    {
      accessorKey: 'inStock',
      header: 'In Stock',
      size: 100,
      cell: ({ getValue }) => (
        <Chip
          label={getValue<boolean>() ? 'Yes' : 'No'}
          color={getValue<boolean>() ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      size: 100,
      cell: ({ getValue }) => `⭐ ${getValue<number>().toFixed(1)}`,
    },
  ];

  // Server-side fetch handler
  const handleFetchData = useCallback(async (filters: any) => {
    console.log('Fetching with pagination:', filters.pagination);
    setServerPaginationState(filters.pagination);
    setCurrentPage(filters.pagination?.pageIndex || 0);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const pageIndex = filters.pagination?.pageIndex || 0;
    const pageSize = filters.pagination?.pageSize || 10;
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    
    const paginatedData = sampleData.slice(startIndex, endIndex);
    
    return { 
      data: paginatedData, 
      total: sampleData.length 
    };
  }, [sampleData]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Pagination
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Control how data is displayed across multiple pages with flexible pagination options, 
        customizable page sizes, and client or server-side processing.
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Automatic Pagination
        </Typography>
        <Typography variant="body2">
          Pagination is enabled by default. The table automatically divides data into pages 
          with configurable page sizes and navigation controls.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Enable Pagination */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Enable Pagination
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Basic Setup
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Pagination is enabled by default. You can customize the initial state:
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
  enablePagination={true}       // Enabled by default
  paginationMode="client"       // 'client' or 'server'
  initialState={{
    pagination: {
      pageIndex: 0,             // Start at first page (0-indexed)
      pageSize: 25,             // 25 rows per page
    },
  }}
  onPaginationChange={(pagination) => {
    console.log('Page changed:', pagination);
  }}
/>`}
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Default Page Size */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Default Page Size & Initial Page
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Set Initial Pagination State
        </Typography>
        <Typography variant="body2">
          Use <code>initialState.pagination</code> to set the default page size and starting page.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Custom Initial State
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This example has 100 total products with different page sizes to see pagination in action:
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
{`// With 100 total records
const data = [...]; // 100 items

<DataTable
  columns={columns}
  data={data}
  enablePagination={true}
  initialState={{
    pagination: {
      pageIndex: 0,             // Start at page 1 (0-indexed)
      pageSize: 10,             // Show 10 rows per page
    },
  }}
/>

// This will show: "1-10 of 100" with 10 total pages
// Page size dropdown will show: [10, 25, 50, 100]`}
        </Box>

        <Box sx={{ mb: 2, p: 2, backgroundColor: 'info.lighter', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            📊 Current Example: 100 products, 10 per page = 10 total pages
          </Typography>
        </Box>

        <DataTable
          columns={columns}
          data={sampleData}
          totalRow={sampleData.length}
          enablePagination={true}
          initialState={{
            pagination: {
              pageIndex: 0,
              pageSize: 10,
            },
          }}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Custom Page Size Options */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Custom Page Size Options
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Customize Rows Per Page Options
        </Typography>
        <Typography variant="body2">
          Use <code>slotProps.pagination</code> to customize the rows per page dropdown options.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Custom Page Size Options
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
  enablePagination={true}
  slotProps={{
    pagination: {
      rowsPerPageOptions: [10, 25, 50, 100, 200],  // Custom options
      labelRowsPerPage: 'Items per page:',          // Custom label
      labelDisplayedRows: ({ from, to, count }) => 
        \`\${from}-\${to} of \${count}\`,
    },
  }}
/>`}
        </Box>

        <DataTable
          columns={columns}
          data={sampleData}
          enablePagination={true}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 25 },
          }}
          slotProps={{
            pagination: {
              rowsPerPageOptions: [10, 25, 50, 100],
              labelRowsPerPage: 'Items:',
            },
          }}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Server-Side Pagination */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Server-Side Pagination
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Server-Side Mode
        </Typography>
        <Typography variant="body2">
          Set <code>paginationMode="server"</code> or <code>dataMode="server"</code> to delegate 
          pagination to your backend. Use <code>totalRow</code> to specify total records.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Server-Side Pagination
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
  // Pagination structure received:
  // {
  //   pagination: {
  //     pageIndex: 0,      // Current page (0-indexed)
  //     pageSize: 25,      // Rows per page
  //   },
  //   ...
  // }
  
  const { pageIndex, pageSize } = filters.pagination;
  const startIndex = pageIndex * pageSize;
  
  const response = await fetch(\`/api/products?offset=\${startIndex}&limit=\${pageSize}\`);
  const result = await response.json();
  
  return { 
    data: result.products,     // Current page data
    total: result.totalCount   // Total records (for page count)
  };
};

<DataTable
  columns={columns}
  dataMode="server"              // Server mode
  totalRow={totalCount}          // Total records from server
  onFetchData={handleFetchData}
  enablePagination={true}
  paginationMode="server"        // Server-side pagination
  initialState={{
    pagination: { pageIndex: 0, pageSize: 50 },
  }}
/>`}
        </Box>

        {serverPaginationState && (
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Current Server Pagination State:
            </Typography>
            <Box
              component="pre"
              sx={{
                fontSize: 12,
                fontFamily: 'monospace',
                overflow: 'auto',
              }}
            >
              {JSON.stringify(serverPaginationState, null, 2)}
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Current Page: {currentPage + 1}
            </Typography>
          </Box>
        )}

        <DataTable
          columns={columns}
          dataMode="server"
          totalRow={sampleData.length}
          onFetchData={handleFetchData}
          enablePagination={true}
          paginationMode="server"
          initialState={{
            pagination: { pageIndex: 0, pageSize: 10 },
          }}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* API Reference */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Pagination API Reference
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Programmatic Pagination Control
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Control pagination programmatically using the table API ref:
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
{`import { useRef } from 'react';
import { DataTableApi } from '@ackplus/react-tanstack-data-table';

const tableRef = useRef<DataTableApi<Product>>(null);

// Navigate to specific page
tableRef.current?.pagination.goToPage(5);

// Navigate to first page
tableRef.current?.pagination.goToFirstPage();

// Navigate to last page
tableRef.current?.pagination.goToLastPage();

// Go to next page
tableRef.current?.pagination.nextPage();

// Go to previous page
tableRef.current?.pagination.previousPage();

// Change page size
tableRef.current?.pagination.setPageSize(50);

// Get current pagination state
const paginationState = tableRef.current?.state.getCurrentPagination();
// Returns: { pageIndex: number, pageSize: number }

<DataTable
  ref={tableRef}
  columns={columns}
  data={data}
  enablePagination={true}
/>`}
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => tableRef.current?.pagination.goToFirstPage()}
          >
            First Page
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => tableRef.current?.pagination.previousPage()}
          >
            Previous
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => tableRef.current?.pagination.nextPage()}
          >
            Next
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => tableRef.current?.pagination.goToLastPage()}
          >
            Last Page
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => tableRef.current?.pagination.setPageSize(5)}
          >
            5 Per Page
          </Button>
        </Stack>

        <DataTable
          ref={tableRef}
          columns={columns}
          data={sampleData}
          enablePagination={true}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 10 },
          }}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* DataTable Props */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        DataTable Pagination Props
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Core Pagination Props
        </Typography>
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
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enablePagination</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                true
              </TableCell>
              <TableCell>Enable pagination controls. Set false when using virtualization.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>paginationMode</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                'client' | 'server'
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                'client'
              </TableCell>
              <TableCell>
                Pagination mode. 'server' delegates pagination to onFetchData callback.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>totalRow</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                number
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                0
              </TableCell>
              <TableCell>
                Total number of rows (required for server-side pagination to calculate total pages).
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>onPaginationChange</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'(pagination) => void'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                undefined
              </TableCell>
              <TableCell>Callback when pagination state changes</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                initialState.pagination
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'{ pageIndex, pageSize }'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                {'{ pageIndex: 0, pageSize: 10 }'}
              </TableCell>
              <TableCell>
                Initial pagination state (starting page and rows per page)
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Customization via slotProps */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Pagination Customization
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Available SlotProps for Pagination
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
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>rowsPerPageOptions</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                number[]
              </TableCell>
              <TableCell>
                Array of page size options shown in dropdown (e.g., [10, 25, 50, 100])
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>labelRowsPerPage</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                string
              </TableCell>
              <TableCell>
                Label for the rows per page dropdown
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>labelDisplayedRows</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                Function
              </TableCell>
              <TableCell>
                Custom function to format the displayed rows text
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>showFirstButton</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell>
                Show "First Page" button
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>showLastButton</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell>
                Show "Last Page" button
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>sx</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                SxProps
              </TableCell>
              <TableCell>
                Custom styles for the pagination component
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            💡 Example: Full Customization
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
  enablePagination={true}
  slotProps={{
    pagination: {
      rowsPerPageOptions: [5, 10, 25, 50, 100, 200, 500],
      labelRowsPerPage: 'Items per page:',
      labelDisplayedRows: ({ from, to, count }) => 
        \`Showing \${from}-\${to} of \${count} total items\`,
      showFirstButton: true,
      showLastButton: true,
      sx: {
        '& .MuiTablePagination-toolbar': {
          backgroundColor: 'grey.50',
          borderTop: '2px solid',
          borderColor: 'primary.main',
        },
        '& .MuiTablePagination-selectLabel': {
          fontWeight: 600,
        },
      },
    },
  }}
/>`}
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Disable Pagination */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Disable Pagination
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          When to Disable Pagination
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Set <code>enablePagination=false</code> when:
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            • Using <strong>virtualization</strong> (pagination and virtualization are mutually exclusive)
          </Typography>
          <Typography variant="body2">
            • Displaying small datasets (less than 50 rows)
          </Typography>
          <Typography variant="body2">
            • Building custom pagination controls
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
            mt: 2,
          }}
        >
{`<DataTable
  columns={columns}
  data={data}
  enablePagination={false}          // Disable pagination
  enableVirtualization={true}       // Use virtualization instead
  maxHeight="500px"
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
              ✅ Set Appropriate Page Sizes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Choose page sizes based on your data: 10-25 for detailed rows, 50-100 for compact data.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Provide Multiple Page Size Options
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Give users flexibility with options like [10, 25, 50, 100, 200] to suit different use cases.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Use Server-Side for Large Datasets
            </Typography>
            <Typography variant="body2" color="text.secondary">
              For datasets with 1,000+ rows, use <code>paginationMode="server"</code> to improve performance.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Always Provide totalRow for Server Mode
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When using <code>paginationMode="server"</code>, always set <code>totalRow</code> to the 
              total record count from your API for accurate page calculations.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ⚠️ Don't Use with Virtualization
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pagination and virtualization are mutually exclusive. Use one or the other, not both.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              💡 Reset to First Page on Filter
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The table automatically resets to page 1 when filters change to avoid showing empty pages.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
