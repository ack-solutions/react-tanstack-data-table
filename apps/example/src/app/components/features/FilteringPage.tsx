import { Box, Typography, Paper, Alert, Divider, Table, TableBody, TableCell, TableHead, TableRow, Stack, Chip, TextField, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { useState, useCallback } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  rating: number;
  releaseDate: string;
  status: 'active' | 'discontinued' | 'pending';
}

const sampleProducts: Product[] = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299, inStock: true, rating: 4.5, releaseDate: '2024-01-15', status: 'active' },
  { id: 2, name: 'Wireless Mouse', category: 'Electronics', price: 29, inStock: true, rating: 4.2, releaseDate: '2024-02-20', status: 'active' },
  { id: 3, name: 'Office Chair', category: 'Furniture', price: 299, inStock: false, rating: 4.8, releaseDate: '2023-11-10', status: 'discontinued' },
  { id: 4, name: 'Desk Lamp', category: 'Furniture', price: 45, inStock: true, rating: 4.0, releaseDate: '2024-03-05', status: 'active' },
  { id: 5, name: 'Notebook Set', category: 'Stationery', price: 15, inStock: true, rating: 4.3, releaseDate: '2024-01-25', status: 'pending' },
  { id: 6, name: 'Pen Pack', category: 'Stationery', price: 8, inStock: false, rating: 3.9, releaseDate: '2023-12-15', status: 'active' },
];

// Custom filter component example
const PriceRangeFilter = ({ value, onChange }: any) => {
  return (
    <TextField
      fullWidth
      size="small"
      type="number"
      label="Price"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{ startAdornment: '$' }}
    />
  );
};

export function FilteringPage() {
  const [serverFilters, setServerFilters] = useState<any>(null);

  // Columns with different filter types
  const filterableColumns: DataTableColumn<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product Name',
      size: 200,
      filterable: true,
      type: 'text',              // Text filter with contains/starts/ends operators
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      size: 150,
      filterable: true,
      type: 'select',            // Select filter with dropdown
      options: [
        { value: 'Electronics', label: 'Electronics' },
        { value: 'Furniture', label: 'Furniture' },
        { value: 'Stationery', label: 'Stationery' },
      ],
    },
    {
      accessorKey: 'price',
      header: 'Price',
      size: 120,
      filterable: true,
      type: 'number',            // Number filter with comparison operators
      cell: ({ getValue }) => `$${getValue<number>()}`,
    },
    {
      accessorKey: 'inStock',
      header: 'In Stock',
      size: 100,
      filterable: true,
      type: 'boolean',           // Boolean filter
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
      filterable: true,
      type: 'number',
      cell: ({ getValue }) => `⭐ ${getValue<number>().toFixed(1)}`,
    },
    {
      accessorKey: 'releaseDate',
      header: 'Release Date',
      size: 130,
      filterable: true,
      type: 'date',              // Date filter
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 130,
      filterable: true,
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'discontinued', label: 'Discontinued' },
        { value: 'pending', label: 'Pending' },
      ],
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const color = status === 'active' ? 'success' : status === 'discontinued' ? 'error' : 'warning';
        return <Chip label={status} color={color} size="small" />;
      },
    },
  ];

  // Columns with custom filter component
  const customFilterColumns: DataTableColumn<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product Name',
      size: 200,
      filterable: true,
      type: 'text',
    },
    {
      accessorKey: 'price',
      header: 'Price',
      size: 120,
      filterable: true,
      filterComponent: PriceRangeFilter,  // Custom filter component
      cell: ({ getValue }) => `$${getValue<number>()}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 130,
      filterable: true,
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'discontinued', label: 'Discontinued' },
        { value: 'pending', label: 'Pending' },
      ],
    },
  ];

  // Server-side fetch handler
  const handleFetchData = useCallback(async (filters: any) => {
    console.log('Fetching with filters:', filters);
    setServerFilters(filters);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredData = [...sampleProducts];
    
    // Apply column filters
    if (filters.columnFilter?.filters?.length) {
      filteredData = filteredData.filter(product => {
        return filters.columnFilter.filters.every((filter: any) => {
          const value = product[filter.columnId as keyof Product];
          const filterValue = filter.value;

          switch (filter.operator) {
            case 'equals':
              return value === filterValue;
            case 'contains':
              return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
            case 'greaterThan':
              return Number(value) > Number(filterValue);
            case 'lessThan':
              return Number(value) < Number(filterValue);
            default:
              return true;
          }
        });
      });
    }
    
    return { data: filteredData, total: filteredData.length };
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Filtering
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        The DataTable component provides powerful filtering capabilities including global search 
        and advanced column-specific filters with various operators and data types.
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Two Types of Filtering
        </Typography>
        <Typography variant="body2">
          <strong>1. Global Filter:</strong> Search across all columns simultaneously<br />
          <strong>2. Column Filters:</strong> Filter individual columns with type-specific operators
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Global Filter */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Global Filter (Search)
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Enable Global Search
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The global filter searches across all columns that have <code>enableGlobalFilter: true</code>.
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
  enableGlobalFilter={true}           // Enable global search
  onGlobalFilterChange={(filter) => {
    console.log('Search term:', filter);
  }}
/>`}
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Column Filters */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Column Filters
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Advanced Column Filtering
        </Typography>
        <Typography variant="body2">
          Enable <code>enableColumnFilter</code> on the table and set <code>filterable: true</code> on 
          individual columns to enable advanced filtering with operators and type-specific inputs.
        </Typography>
      </Alert>

      {/* Enable Column Filters */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        1. Enable Column Filters
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Basic Setup
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enable column filtering on the table component:
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
  enableColumnFilter={true}      // Enable column filter UI
  filterMode="client"            // 'client' or 'server'
  onColumnFiltersChange={(filters) => {
    console.log('Column filters changed:', filters);
  }}
/>`}
        </Box>
      </Paper>

      {/* Filter Types */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        2. Filter Types & Operators
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            All Filter Types
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={3}>
            {/* Text Filter */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Text Filter
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                For text columns. Use <code>type: 'text'</code>
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  borderRadius: 1,
                  p: 2,
                  fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
                  fontSize: 13,
                  overflowX: 'auto',
                  mb: 2,
                }}
              >
{`{
  accessorKey: 'name',
  header: 'Name',
  filterable: true,
  type: 'text',              // Text filter type
}`}
              </Box>
              <Typography variant="caption" color="text.secondary">
                <strong>Operators:</strong> Contains, Starts with, Ends with, Equals, Not equals, Is empty, Is not empty
              </Typography>
            </Box>

            {/* Select Filter */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Select Filter (Dropdown)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                For columns with predefined options. Use <code>type: 'select'</code> with <code>options</code>.
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  borderRadius: 1,
                  p: 2,
                  fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
                  fontSize: 13,
                  overflowX: 'auto',
                  mb: 2,
                }}
              >
{`{
  accessorKey: 'category',
  header: 'Category',
  filterable: true,
  type: 'select',            // Select filter type
  options: [                 // Dropdown options
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Furniture', label: 'Furniture' },
    { value: 'Stationery', label: 'Stationery' },
  ],
}`}
              </Box>
              <Typography variant="caption" color="text.secondary">
                <strong>Operators:</strong> Equals, Not equals, In (multi-select), Not in, Is empty, Is not empty
              </Typography>
            </Box>

            {/* Number Filter */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Number Filter
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                For numeric columns. Use <code>type: 'number'</code>
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  borderRadius: 1,
                  p: 2,
                  fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
                  fontSize: 13,
                  overflowX: 'auto',
                  mb: 2,
                }}
              >
{`{
  accessorKey: 'price',
  header: 'Price',
  filterable: true,
  type: 'number',            // Number filter type
  cell: ({ getValue }) => \`$\${getValue<number>()}\`,
}`}
              </Box>
              <Typography variant="caption" color="text.secondary">
                <strong>Operators:</strong> Equals, Not equals, Greater than, Less than, Greater than or equal, Less than or equal, Is empty, Is not empty
              </Typography>
            </Box>

            {/* Boolean Filter */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Boolean Filter
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                For true/false columns. Use <code>type: 'boolean'</code>
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  borderRadius: 1,
                  p: 2,
                  fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
                  fontSize: 13,
                  overflowX: 'auto',
                  mb: 2,
                }}
              >
{`{
  accessorKey: 'inStock',
  header: 'In Stock',
  filterable: true,
  type: 'boolean',           // Boolean filter type
  cell: ({ getValue }) => (
    <Chip 
      label={getValue<boolean>() ? 'Yes' : 'No'} 
      color={getValue<boolean>() ? 'success' : 'error'}
      size="small"
    />
  ),
}`}
              </Box>
              <Typography variant="caption" color="text.secondary">
                <strong>Operators:</strong> Is (with True/False/Any options)
              </Typography>
            </Box>

            {/* Date Filter */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Date Filter
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                For date columns. Use <code>type: 'date'</code>
              </Typography>
              <Box
                component="pre"
                sx={{
                  backgroundColor: '#f5f5f5',
                  color: '#333',
                  borderRadius: 1,
                  p: 2,
                  fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
                  fontSize: 13,
                  overflowX: 'auto',
                  mb: 2,
                }}
              >
{`{
  accessorKey: 'releaseDate',
  header: 'Release Date',
  filterable: true,
  type: 'date',              // Date filter type
}`}
              </Box>
              <Typography variant="caption" color="text.secondary">
                <strong>Operators:</strong> Equals, Not equals, After, Before, Is empty, Is not empty
              </Typography>
            </Box>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 4 }} />

      {/* Live Demo */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        3. Interactive Demo - All Filter Types
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Try It Out!
        </Typography>
        <Typography variant="body2">
          Click the filter icon (🔽) in the toolbar to open the column filter panel. 
          Try different filter types, operators, and combinations with AND/OR logic.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Client-Side Filtering
        </Typography>
        <DataTable
          columns={filterableColumns}
          data={sampleProducts}
          enableColumnFilter={true}
          enableGlobalFilter={true}
          enableSorting={true}
          filterMode="client"
          onColumnFiltersChange={(filters) => {
            console.log('Column filters changed:', filters);
          }}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Custom Filter Component */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Custom Filter Components
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Override Filter Input
        </Typography>
        <Typography variant="body2">
          Use <code>filterComponent</code> or <code>editComponent</code> on a column to provide 
          a completely custom filter input component.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Custom Filter Component
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create a custom filter component with your own UI and logic:
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
const PriceRangeFilter = ({ value, onChange, filter, column }) => {
  return (
    <TextField
      fullWidth
      size="small"
      type="number"
      label="Price"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{ startAdornment: '$' }}
    />
  );
};

// Use in column definition
const columns: DataTableColumn<Product>[] = [
  {
    accessorKey: 'price',
    header: 'Price',
    filterable: true,
    filterComponent: PriceRangeFilter,  // Custom filter UI
    cell: ({ getValue }) => \`$\${getValue<number>()}\`,
  },
];`}
        </Box>
        <DataTable
          columns={customFilterColumns}
          data={sampleProducts}
          enableColumnFilter={true}
          filterMode="client"
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Server-Side Filtering */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Server-Side Filtering
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Server-Side Mode
        </Typography>
        <Typography variant="body2">
          Set <code>filterMode="server"</code> or <code>dataMode="server"</code> to delegate 
          filtering to your backend. The <code>onFetchData</code> callback receives filter state.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Server-Side Filtering
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
  // Filter structure received:
  // {
  //   columnFilter: {
  //     filters: [
  //       { id, columnId, operator, value },
  //       ...
  //     ],
  //     logic: 'AND' | 'OR'
  //   },
  //   globalFilter: 'search term',
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
  enableColumnFilter={true}
  filterMode="server"            // Server-side filtering
/>`}
        </Box>

        {serverFilters && (
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Current Server Filters:
            </Typography>
            <Box
              component="pre"
              sx={{
                fontSize: 12,
                fontFamily: 'monospace',
                overflow: 'auto',
              }}
            >
              {JSON.stringify(serverFilters, null, 2)}
            </Box>
          </Box>
        )}

        <DataTable
          columns={filterableColumns}
          dataMode="server"
          onFetchData={handleFetchData}
          enableColumnFilter={true}
          enableGlobalFilter={true}
          filterMode="server"
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Filter Operators Reference */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Filter Operators Reference
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Available Operators by Type
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Filter Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Available Operators</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>text</TableCell>
              <TableCell>
                Contains, Starts with, Ends with, Equals, Not equals, Is empty, Is not empty
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>select</TableCell>
              <TableCell>
                Equals, Not equals, In (multi-select), Not in, Is empty, Is not empty
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>number</TableCell>
              <TableCell>
                Equals, Not equals, Greater than, Less than, Greater than or equal, Less than or equal, Is empty, Is not empty
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>boolean</TableCell>
              <TableCell>
                Is (True/False/Any)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>date</TableCell>
              <TableCell>
                Equals, Not equals, After, Before, Is empty, Is not empty
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* API Reference */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        API Reference
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Filtering API Methods
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Control filters programmatically using the table API ref:
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

// Global filter methods
tableRef.current?.filtering.setGlobalFilter('search term');
tableRef.current?.filtering.clearGlobalFilter();

// Column filter methods
tableRef.current?.filtering.addColumnFilter('price', 'greaterThan', 100);
tableRef.current?.filtering.removeColumnFilter('filter_id');
tableRef.current?.filtering.clearAllFilters();

// Get current filter state
const filters = tableRef.current?.state.getCurrentFilters();

<DataTable
  ref={tableRef}
  columns={columns}
  data={data}
  enableColumnFilter={true}
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
              ✅ Set Appropriate Filter Types
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Always set the correct <code>type</code> for each column to get the appropriate filter UI and operators.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Provide Options for Select Filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When using <code>type: 'select'</code>, always provide the <code>options</code> array with all possible values.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Use Server-Side for Large Datasets
            </Typography>
            <Typography variant="body2" color="text.secondary">
              For datasets with 10,000+ rows, use <code>filterMode="server"</code> to improve performance.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Enable Global Filter for Common Searches
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set <code>enableGlobalFilter: true</code> on columns that should be searchable via the global search bar.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ⚠️ Test Filter Logic (AND/OR)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When using multiple filters, test both AND and OR logic to ensure expected behavior.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
