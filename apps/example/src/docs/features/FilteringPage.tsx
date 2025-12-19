/* eslint-disable react/no-unescaped-entities */
import { Box, Typography, Paper, Alert, Divider, Stack, Chip, TextField, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { useState, useCallback } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FeatureLayout, FeatureSection, CodeBlock, FeatureMetadataTable, ExampleViewer } from './common';
import { getOperatorGroup } from './data/filtering-metadata';
import { BasicFilteringExample } from '../../examples/filtering';

// Import code as raw strings
import basicFilteringCode from '../../examples/filtering/BasicFilteringExample.tsx?raw';

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
  const operatorGroup = getOperatorGroup('operator-reference');

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
      cell: ({ getValue }) => `${getValue<number>().toFixed(1)}`,
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
    <FeatureLayout
      title="Filtering"
      description="The DataTable component provides powerful filtering capabilities including global search and advanced column-specific filters with various operators and data types."
    >
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
        <CodeBlock
          language="tsx"
          code={`<DataTable
  columns={columns}
  data={data}
  enableGlobalFilter={true}           // Enable global search
  onGlobalFilterChange={(filter) => {
    console.log('Search term:', filter);
  }}
/>`}
        />
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
        <CodeBlock
          language="tsx"
          code={`<DataTable
  columns={columns}
  data={data}
  enableColumnFilter={true}      // Enable column filter UI
  filterMode="client"            // 'client' or 'server'
  onColumnFiltersChange={(filters) => {
    console.log('Column filters changed:', filters);
  }}
/>`}
        />
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
              <CodeBlock
                language="ts"
                code={`{
  accessorKey: 'name',
  header: 'Name',
  filterable: true,
  type: 'text',              // Text filter type
}`}
              />
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
              <CodeBlock
                language="ts"
                code={`{
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
              />
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
              <CodeBlock
                language="ts"
                code={`{
  accessorKey: 'price',
  header: 'Price',
  filterable: true,
  type: 'number',            // Number filter type
  cell: ({ getValue }) => \`$\${getValue<number>()}\`,
}`}
              />
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
              <CodeBlock
                language="ts"
                code={`{
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
              />
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
              <CodeBlock
                language="ts"
                code={`{
  accessorKey: 'releaseDate',
  header: 'Release Date',
  filterable: true,
  type: 'date',              // Date filter type
}`}
              />
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
          Click the filter icon in the toolbar to open the column filter panel. 
          Try different filter types, operators, and combinations with AND/OR logic.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Client-Side Filtering
        </Typography>
        <ExampleViewer
          exampleId="basic-filtering"
          code={basicFilteringCode}
          component={<BasicFilteringExample />}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      <FeatureSection
        title="Custom Filter Components"
        description="Override the default input by supplying filterComponent or editComponent directly on a column."
        spacing={3}
      >
        <Alert severity="warning" sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Override Filter Input
          </Typography>
          <Typography variant="body2">
            The DataTable passes value, onChange, filter metadata, and the column definition so you can wire up any controlled component.
          </Typography>
        </Alert>

        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Example: Custom Filter Component
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Build a bespoke price filter with currency formatting and hook it into the column definition.
          </Typography>
          <CodeBlock
            language="tsx"
            code={`// Custom filter component
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
          />
          <DataTable
            columns={customFilterColumns}
            data={sampleProducts}
            enableColumnFilter={true}
            filterMode="client"
          />
        </Paper>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      <FeatureSection
        title="Server-Side Filtering"
        description="Enable server mode to stream filter state to your backend and hydrate the grid with the filtered response."
        spacing={3}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Server-Side Mode
          </Typography>
          <Typography variant="body2">
            Set <code>filterMode=\"server\"</code> or <code>dataMode=\"server\"</code> to delegate filtering. The <code>onFetchData</code> callback receives the full filter model including AND / OR logic.
          </Typography>
        </Alert>

        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Example: Server-Side Filtering
          </Typography>
          <CodeBlock
            language="ts"
            code={`const handleFetchData = async (filters) => {
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
          />

          {serverFilters && (
            <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Current Server Filters
              </Typography>
              <CodeBlock
                language="json"
                code={JSON.stringify(serverFilters || {}, null, 2)}
              />
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
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      <FeatureSection
        title="Filter Operators Reference"
        description="Every built-in filter type ships with a tailored operator list. Use this matrix to map UI controls to the supported comparisons."
        spacing={3}
      >
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Available Operators by Type
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable items={operatorGroup?.items ?? []} size="small" />
          </Box>
        </Paper>
      </FeatureSection>

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
        <CodeBlock
          language="tsx"
          code={`import { useRef } from 'react';
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
              Tip: Set Appropriate Filter Types
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Always set the correct <code>type</code> for each column to get the appropriate filter UI and operators.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Provide Options for Select Filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When using <code>type: 'select'</code>, always provide the <code>options</code> array with all possible values.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Use Server-Side for Large Datasets
            </Typography>
            <Typography variant="body2" color="text.secondary">
              For datasets with 10,000+ rows, use <code>filterMode="server"</code> to improve performance.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Enable Global Filter for Common Searches
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set <code>enableGlobalFilter: true</code> on columns that should be searchable via the global search bar.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Warning: Test Filter Logic (AND/OR)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When using multiple filters, test both AND and OR logic to ensure expected behavior.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </FeatureLayout>
  );
}
