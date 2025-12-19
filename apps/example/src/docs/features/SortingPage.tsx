import { Box, Typography, Paper, Alert, Divider, Stack } from '@mui/material';
import { FeatureLayout, FeatureSection, CodeBlock, FeatureMetadataTable, ExampleViewer } from './common';
import { getSortingColumnGroup, getSortingTableGroup } from './data/sorting-metadata';
import {
  BasicSortingExample,
  DefaultSortingExample,
  ServerSortingExample,
} from '../../examples/sorting';

// Import code as raw strings
import basicSortingCode from '../../examples/sorting/BasicSortingExample.tsx?raw';
import defaultSortingCode from '../../examples/sorting/DefaultSortingExample.tsx?raw';
import serverSortingCode from '../../examples/sorting/ServerSortingExample.tsx?raw';

export function SortingPage() {
  const sortingColumnGroup = getSortingColumnGroup('sorting-column-props');
  const sortingTableGroup = getSortingTableGroup('sorting-table-props');

  return (
    <FeatureLayout
      title="Sorting"
      description="Enable multi-column sorting with customizable sort direction and client or server-side processing."
    >
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

      <FeatureSection
        title="Enable Sorting"
        description="Turn on sorting globally and per column. Users can click headers or hold Shift for multi-column sorting."
        spacing={3}
      >
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Basic Setup
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enable sorting on the table and individual columns:
          </Typography>
          <CodeBlock
            language="tsx"
            code={`const columns: DataTableColumn<Product>[] = [
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
          />
          
          <ExampleViewer
            exampleId="basic-sorting"
            code={basicSortingCode}
            component={<BasicSortingExample />}
          />
        </Paper>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      <FeatureSection
        title="Default Sorting (Initial State)"
        description="Seed sensible sort defaults so the table loads in a usable order."
        spacing={3}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Set Initial Sort Order
          </Typography>
          <Typography variant="body2">
            Use <code>initialState.sorting</code> to define default sort order when the table loads.
          </Typography>
        </Alert>

        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Example: Default Sorting
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set initial sorting on one or multiple columns:
          </Typography>
          <CodeBlock
            language="tsx"
            code={`<DataTable
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
          />

          <ExampleViewer
            exampleId="default-sorting"
            code={defaultSortingCode}
            component={<DefaultSortingExample />}
          />
        </Paper>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      <FeatureSection
        title="Column Sorting Properties"
        description="Fine-tune sorting behavior on specific columns."
        spacing={3}
      >
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Sorting Column Props
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable items={sortingColumnGroup?.items ?? []} size="small" includePossibleValues />
          </Box>
        </Paper>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      <FeatureSection
        title="Server-Side Sorting"
        description="Delegate sorting to your backend and hydrate the table with the ordered response."
        spacing={3}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Server-Side Mode
          </Typography>
          <Typography variant="body2">
            Set <code>sortingMode=&quot;server&quot;</code> or <code>dataMode=&quot;server&quot;</code> to delegate sorting. The <code>onFetchData</code> callback receives the current sort state.
          </Typography>
        </Alert>

        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Example: Server-Side Sorting
          </Typography>
          <CodeBlock
            language="tsx"
            code={`const handleFetchData = async (filters) => {
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
          />

          <ExampleViewer
            exampleId="server-sorting"
            code={serverSortingCode}
            component={<ServerSortingExample />}
          />
        </Paper>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      <FeatureSection
        title="Sorting API Reference"
        description="Drive sorting from the imperative table API for custom controls."
        spacing={3}
      >
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Programmatic Sorting Control
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Control sorting programmatically using the table API ref:
          </Typography>
          <CodeBlock
            language="tsx"
            code={`import { useRef } from 'react';
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
          />
        </Paper>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      <FeatureSection
        title="DataTable Sorting Props"
        description="Global props that control sorting behaviour across the table."
        spacing={3}
      >
        <Paper elevation={1} sx={{ p: 3 }}>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable items={sortingTableGroup?.items ?? []} size="small" includePossibleValues />
          </Box>
        </Paper>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      {/* Best Practices */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Best Practices
      </Typography>
      
      <Paper elevation={1} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Use sortDescFirst for Numbers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set <code>sortDescFirst: true</code> on numeric columns (price, rating, count) so clicking 
              the header shows highest values first.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Set Default Sorting
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Always provide a sensible default sort order using <code>initialState.sorting</code> to improve UX.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Use Server-Side for Large Datasets
            </Typography>
            <Typography variant="body2" color="text.secondary">
              For datasets with 10,000+ rows, use <code>sortingMode=&quot;server&quot;</code> to offload sorting to your backend.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Disable Sorting for Action Columns
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set <code>enableSorting: false</code> on action columns or columns with buttons/icons.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Insight: Multi-Column Sorting
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Users can hold Shift and click multiple column headers to sort by multiple fields. 
              The order of clicks determines sort priority.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </FeatureLayout>
  );
}
