import { Box, Typography, Paper, Alert, Divider, Table, TableBody, TableCell, TableHead, TableRow, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FeatureLayout, CodeBlock, FeatureMetadataTable, FeatureMetadataAccordion } from './common';
import { dataTableMetadata, findGroup } from './data/data-table-metadata';

export function DataTablePropsPage() {
  const corePropsGroup = findGroup('propGroups', 'core');
  const serverPropsGroup = findGroup('propGroups', 'server');
  const paginationPropsGroup = findGroup('propGroups', 'pagination');
  const filteringPropsGroup = findGroup('propGroups', 'filtering');
  const sortingPropsGroup = findGroup('propGroups', 'sorting');
  const selectionPropsGroup = findGroup('propGroups', 'selection');
  const columnsPropsGroup = findGroup('propGroups', 'columns');
  return (
    <FeatureLayout
      title="DataTable Props Reference"
      description="Complete reference for all DataTable component properties, organized by functionality."
    >
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Comprehensive Configuration
        </Typography>
        <Typography variant="body2">
          The DataTable component offers extensive configuration options for data management, features, 
          styling, and customization. Each prop is documented with its type, default value, and usage examples.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Core Data Props */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Core Data & Structure
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Essential Data Props
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable
              items={corePropsGroup?.items ?? []}
              includePossibleValues
            />
          </Box>

          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Insight: Example
            </Typography>
            <CodeBlock
              language="tsx"
              code={`<DataTable
  columns={columns}
  data={employees}
  idKey="employeeId"     // Use employeeId as unique key
  totalRow={1000}        // Total rows on server
/>`}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 3 }} />

      {/* Data Management */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Data Management & Server Integration
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Server-Side Data Management
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable
              items={serverPropsGroup?.items ?? []}
              includePossibleValues
            />
          </Box>

          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Insight: Example: Server-Side Data
            </Typography>
            <CodeBlock
              language="tsx"
              code={`const handleFetchData = async (filters) => {
  const response = await fetch('/api/employees', {
    method: 'POST',
    body: JSON.stringify(filters),
  });
  const result = await response.json();
  return { data: result.employees, total: result.total };
};

<DataTable
  columns={columns}
  dataMode="server"              // Enable server mode
  onFetchData={handleFetchData}  // Provide fetch callback
  initialLoadData={true}         // Load on mount
  onDataStateChange={(state) => {
    console.log('Table state changed:', state);
  }}
  initialState={{
    pagination: { pageIndex: 0, pageSize: 25 },
    sorting: [{ id: 'name', desc: false }],
  }}
/>`}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 3 }} />

      {/* Feature Props */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Feature Control Props
      </Typography>

      {/* Pagination */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Pagination Props
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable
              items={paginationPropsGroup?.items ?? []}
              includePossibleValues
            />
          </Box>

          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Insight: Example
            </Typography>
            <CodeBlock
              language="tsx"
              code={`<DataTable
  columns={columns}
  data={data}
  enablePagination={true}
  paginationMode="server"         // Server-side pagination
  onPaginationChange={(pagination) => {
    console.log('Page changed:', pagination);
  }}
  initialState={{
    pagination: { 
      pageIndex: 0, 
      pageSize: 50    // Start with 50 rows per page
    },
  }}
/>`}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Filtering */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtering Props
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable
              items={filteringPropsGroup?.items ?? []}
              includePossibleValues
            />
          </Box>

          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Insight: Example
            </Typography>
            <CodeBlock
              language="tsx"
              code={`<DataTable
  columns={columns}
  data={data}
  enableGlobalFilter={true}       // Enable search
  enableColumnFilter={true}       // Enable column filters
  filterMode="server"             // Server-side filtering
  onGlobalFilterChange={(filter) => {
    console.log('Search term:', filter);
  }}
  onColumnFiltersChange={(filters) => {
    console.log('Column filters:', filters);
  }}
/>`}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Sorting */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Sorting Props
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable
              items={sortingPropsGroup?.items ?? []}
              includePossibleValues
            />
          </Box>

          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Insight: Example
            </Typography>
            <CodeBlock
              language="tsx"
              code={`<DataTable
  columns={columns}
  data={data}
  enableSorting={true}
  sortingMode="server"
  onSortingChange={(sorting) => {
    console.log('Sort changed:', sorting);
  }}
  initialState={{
    sorting: [{ id: 'name', desc: false }],  // Sort by name ascending
  }}
/>`}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Selection Props */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Selection & Bulk Actions Props
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable
              items={selectionPropsGroup?.items ?? []}
              includePossibleValues
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Column Features Props */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Column Features Props
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable
              items={columnsPropsGroup?.items ?? []}
              includePossibleValues
            />
          </Box>

          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Insight: Example: Column Visibility Control
            </Typography>
            <CodeBlock
              language="tsx"
              code={`<DataTable
  columns={columns}
  data={data}
  enableColumnVisibility={true}
  onColumnVisibilityChange={(visibility) => {
    console.log('Column visibility changed:', visibility);
    // visibility is a Record<string, boolean>
    // e.g., { email: false, phone: true, name: true }
  }}
  initialState={{
    columnVisibility: {
      email: false,      // Hide email column by default
      phone: false,      // Hide phone column by default
    },
  }}
/>`}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 3 }} />

      {/* Initial State */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Initial State Configuration
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Set Default Table State
        </Typography>
        <Typography variant="body2">
          Use <code>initialState</code> to configure the default state for pagination, sorting, 
          filters, column visibility, pinning, and more when the table first loads.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          initialState Properties
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, width: '30%' }}>Property</TableCell>
              <TableCell sx={{ fontWeight: 700, width: '30%' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700, width: '40%' }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>pagination</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'{ pageIndex: number, pageSize: number }'}
              </TableCell>
              <TableCell>Initial page and page size</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>sorting</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'Array<{ id: string, desc: boolean }>'}
              </TableCell>
              <TableCell>Initial sort order</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>globalFilter</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                string
              </TableCell>
              <TableCell>Initial global search term</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>columnFilter</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                ColumnFilterState
              </TableCell>
              <TableCell>Initial column filters</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>columnVisibility</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'Record<string, boolean>'}
              </TableCell>
              <TableCell>Initial column visibility state</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>columnPinning</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'{ left: string[], right: string[] }'}
              </TableCell>
              <TableCell>Initial pinned columns</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>columnOrder</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                string[]
              </TableCell>
              <TableCell>Initial column order</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>columnSizing</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'Record<string, number>'}
              </TableCell>
              <TableCell>Initial column widths</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>selectionState</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'{ ids: string[], type: "include" | "exclude" }'}
              </TableCell>
              <TableCell>Initial selection state</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>expanded</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'Record<string, boolean>'}
              </TableCell>
              <TableCell>Initial expanded rows state</TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Insight: Complete initialState Example
          </Typography>
          <CodeBlock
            language="tsx"
            code={`import { DEFAULT_SELECTION_COLUMN_NAME } from '@ackplus/react-tanstack-data-table';

<DataTable
  columns={columns}
  data={data}
  initialState={{
    // Pagination
    pagination: {
      pageIndex: 0,              // Start at first page
      pageSize: 25,              // 25 rows per page
    },
    
    // Sorting
    sorting: [
      { id: 'name', desc: false },      // Sort by name ascending
      { id: 'date', desc: true },       // Then by date descending
    ],
    
    // Global search
    globalFilter: 'initial search',
    
    // Column visibility
    columnVisibility: {
      email: false,              // Hide email column
      phone: false,              // Hide phone column
    },
    
    // Column pinning
    columnPinning: {
      left: [DEFAULT_SELECTION_COLUMN_NAME, 'name'],  // Pin to left
      right: ['actions'],                              // Pin to right
    },
    
    // Column order
    columnOrder: ['name', 'email', 'department', 'salary'],
    
    // Column sizing
    columnSizing: {
      name: 200,
      email: 250,
    },
    
    // Selection
    selectionState: {
      ids: ['1', '2', '3'],      // Pre-select rows
      type: 'include',
    },
    
    // Expanded rows
    expanded: {
      '1': true,                 // Expand row with id '1'
      '5': true,
    },
  }}
/>`}
          />
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Slots System */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Slots System (Component Overrides)
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Advanced Customization
        </Typography>
        <Typography variant="body2">
          Slots allow you to completely replace any component in the DataTable with your own custom components. 
          This follows the same pattern as MUI DataGrid for consistency.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Available Slots
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These components can be replaced with custom implementations:
        </Typography>
        
        <FeatureMetadataAccordion
          groups={dataTableMetadata.slotGroups}
          defaultExpandedCount={2}
          includePossibleValues
        />

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Insight: Example: Replace Components with Slots
          </Typography>
          <CodeBlock
            language="tsx"
            code={`import { Box, TextField } from '@mui/material';
import { useDataTableContext } from '@ackplus/react-tanstack-data-table';

// Custom search component
const CustomSearch = (props) => {
  const { table } = useDataTableContext();
  
  return (
    <TextField
      size="small"
      placeholder="Search everything..."
      value={table.getState().globalFilter || ''}
      onChange={(e) => table.setGlobalFilter(e.target.value)}
      sx={{ minWidth: 300 }}
      {...props}
    />
  );
};

// Custom loading component
const CustomLoading = ({ colSpan }) => (
  <TableRow>
    <TableCell colSpan={colSpan} align="center">
      <Box sx={{ p: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading awesome data...</Typography>
      </Box>
    </TableCell>
  </TableRow>
);

<DataTable
  columns={columns}
  data={data}
  slots={{
    searchInput: CustomSearch,        // Replace search
    loadingRow: CustomLoading,        // Replace loading
    // ... replace any other component
  }}
  slotProps={{
    searchInput: {
      // Props passed to CustomSearch
      autoFocus: true,
    },
  }}
/>`}
          />
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* SlotProps System */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        SlotProps System (Customize Without Replacing)
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Customize Default Components
        </Typography>
        <Typography variant="body2">
          Use <code>slotProps</code> to pass custom props to default components without replacing them entirely. 
          This is useful for styling, adding callbacks, or modifying behavior.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Common SlotProps Usage
        </Typography>
        
        <CodeBlock
          language="tsx"
          code={`<DataTable
  columns={columns}
  data={data}
  slotProps={{
    // Customize toolbar styling
    toolbar: {
      sx: {
        backgroundColor: 'grey.50',
        borderRadius: 2,
        p: 2,
        mb: 2,
      },
      title: 'Employee List',
      subtitle: 'Manage your team',
    },
    
    // Customize search input
    searchInput: {
      placeholder: 'Search employees...',
      autoFocus: true,
      inputProps: {
        sx: { 
          minWidth: 350,
          backgroundColor: 'white',
        },
      },
    },
    
    // Customize pagination
    pagination: {
      rowsPerPageOptions: [10, 25, 50, 100, 200],
      labelRowsPerPage: 'Employees per page:',
      showFirstButton: true,
      showLastButton: true,
      sx: {
        '& .MuiTablePagination-toolbar': {
          backgroundColor: 'grey.50',
        },
      },
    },
    
    // Customize table container
    tableContainer: {
      sx: {
        maxHeight: 600,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      },
    },
    
    // Customize table
    table: {
      sx: {
        '& .MuiTableCell-root': {
          borderColor: 'divider',
        },
      },
    },
    
    // Customize bulk actions toolbar
    bulkActionsToolbar: {
      sx: {
        backgroundColor: 'success.lighter',
        borderRadius: 1,
      },
      chipProps: {
        color: 'success',
        variant: 'filled',
      },
    },
    
    // Customize export button
    exportButton: {
      tooltipProps: {
        title: 'Download your data',
      },
    },
    
    // Customize special columns
    selectionColumn: {
      size: 50,              // Custom width
      enablePinning: true,   // Allow pinning
    },
    
    expandColumn: {
      size: 50,
      align: 'center',
    },
  }}
/>`}
        />

        <Box sx={{ mt: 3 }}>
          <FeatureMetadataAccordion
            groups={dataTableMetadata.slotPropGroups}
            defaultExpandedCount={1}
            includePossibleValues
          />
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Slots vs SlotProps */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        When to Use Slots vs SlotProps
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
              Tip: Use SlotProps When:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                • You want to customize styling (colors, spacing, borders)
              </Typography>
              <Typography variant="body2">
                • You want to add additional props (tooltips, labels, placeholders)
              </Typography>
              <Typography variant="body2">
                • You want to modify behavior slightly (autoFocus, disabled states)
              </Typography>
              <Typography variant="body2">
                • The default component is mostly what you need
              </Typography>
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'error.main' }}>
              Use Slots When:
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                • You need completely different functionality
              </Typography>
              <Typography variant="body2">
                • You want to use a different component library
              </Typography>
              <Typography variant="body2">
                • The default component doesn't fit your use case
              </Typography>
              <Typography variant="body2">
                • You need full control over the component structure
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Insight: Example Comparison
          </Typography>
          <CodeBlock
            language="tsx"
            code={`// Tip: SlotProps: Just customize the search placeholder
<DataTable
  columns={columns}
  data={data}
  slotProps={{
    searchInput: {
      placeholder: 'Custom placeholder',  // Simple customization
    },
  }}
/>

// Slots: Completely replace search component
const MyCustomSearch = () => {
  const { table } = useDataTableContext();
  return (
    <MyAwesomeSearchComponent
      value={table.getState().globalFilter}
      onChange={(val) => table.setGlobalFilter(val)}
      // ... your custom component
    />
  );
};

<DataTable
  columns={columns}
  data={data}
  slots={{
    searchInput: MyCustomSearch,     // Complete replacement
  }}
/>`}
          />
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Styling Props */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Styling & Appearance Props
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Visual Customization Props
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
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
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableHover</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  boolean
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  true
                </TableCell>
                <TableCell>Enable row hover effect.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableStripes</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  boolean
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  false
                </TableCell>
                <TableCell>Enable striped rows (alternating background).</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>fitToScreen</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  boolean
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  true
                </TableCell>
                <TableCell>Fit table to container width. Set false to allow horizontal scrolling.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>tableSize</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  'small' | 'medium'
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  'medium'
                </TableCell>
                <TableCell>Initial table density/size.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>tableContainerProps</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  TableContainerProps
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  {'{}'} 
                </TableCell>
                <TableCell>Props passed to TableContainer component.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>tableProps</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  TableProps
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  {'{}'} 
                </TableCell>
                <TableCell>Props passed to Table component.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableStickyHeaderOrFooter</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  boolean
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  false
                </TableCell>
                <TableCell>Enable sticky header and footer during scroll.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>maxHeight</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  string | number
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  '400px'
                </TableCell>
                <TableCell>Max height for sticky header or virtualization.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 3 }} />

      {/* Advanced Features */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Advanced Features Props
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Column Features
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
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
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableColumnResizing</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  boolean
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  false
                </TableCell>
                <TableCell>Enable column resizing by dragging column borders.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>columnResizeMode</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  'onChange' | 'onEnd'
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  'onChange'
                </TableCell>
                <TableCell>When to apply resize: during drag or after release.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableColumnDragging</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  boolean
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  false
                </TableCell>
                <TableCell>Enable column reordering by drag and drop.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>onColumnDragEnd</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  {'(order) => void'}
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  undefined
                </TableCell>
                <TableCell>Callback when column order changes.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableColumnPinning</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  boolean
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  false
                </TableCell>
                <TableCell>Enable column pinning to left/right.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>onColumnPinningChange</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  {'(pinning) => void'}
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  undefined
                </TableCell>
                <TableCell>Callback when column pinning changes.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableColumnVisibility</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  boolean
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  true
                </TableCell>
                <TableCell>Enable column visibility toggle control in toolbar.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>onColumnVisibilityChange</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  {'(visibility: Record<string, boolean>) => void'}
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  undefined
                </TableCell>
                <TableCell>Callback when column visibility changes. Receives a record mapping column IDs to visibility state.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>

      {/* Row Expansion */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Row Expansion Props
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
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
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableExpanding</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  boolean
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  false
                </TableCell>
                <TableCell>Enable row expansion feature.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>getRowCanExpand</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  {'(row) => boolean'}
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  undefined
                </TableCell>
                <TableCell>Function to determine if row can be expanded.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>renderSubComponent</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  {'(row) => ReactNode'}
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  undefined
                </TableCell>
                <TableCell>Render function for expanded row content.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>

      {/* Virtualization */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Virtualization Props
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
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
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableVirtualization</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  boolean
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  false
                </TableCell>
                <TableCell>Enable virtualization for large datasets. Incompatible with pagination.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>estimateRowHeight</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  number
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  52
                </TableCell>
                <TableCell>Estimated height per row for virtualization calculations.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>

      {/* Loading & Empty States */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Loading & Empty State Props
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
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
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>loading</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  boolean
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  false
                </TableCell>
                <TableCell>Show loading skeleton.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>emptyMessage</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  string
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  'No data available'
                </TableCell>
                <TableCell>Message shown when table is empty.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>skeletonRows</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  number
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  5
                </TableCell>
                <TableCell>Number of skeleton rows to show when loading.</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Diagnostics & Logging
      </Typography>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Debugging Utilities
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
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
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>logging</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  {'boolean | DataTableLoggingOptions'}
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  inherit global
                </TableCell>
                <TableCell>
                  Enable DataTable debug output. Pass <code>true</code> to mirror global logging config or provide a custom configuration object.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Usage
            </Typography>
            <CodeBlock
              language="tsx"
              code={`configureDataTableLogging({
  enabled: true,
  level: 'debug',
  includeTimestamp: true,
});

<DataTable
  columns={columns}
  data={rows}
  logging={{
    enabled: true,
    level: 'info',
    prefix: 'OrdersTable',
  }}
/>`}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          More Documentation
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            • For column-specific properties, see the <strong>Columns</strong> page
          </Typography>
          <Typography variant="body2">
            • For selection features, see the <strong>Selection</strong> page
          </Typography>
          <Typography variant="body2">
            • For export features, see the <strong>Export</strong> page
          </Typography>
          <Typography variant="body2">
            • For API methods, see the <strong>API Reference</strong> page
          </Typography>
        </Stack>
      </Paper>
    </FeatureLayout>
  );
}
