import { Paper, Stack, Typography, Box, Alert, Chip, Divider } from '@mui/material';
import { FeatureLayout } from './common/FeatureLayout';
import { CodeBlock } from './common/CodeBlock';

export function LayoutPage() {
  return (
    <FeatureLayout
      title="Layout & Container"
      subtitle="Main Features"
      description="Compose the DataTable into any layout—cards, split panes, or dense dashboards—while keeping headers, toolbar, and pagination in sync. Customize the container using slot props for complete control."
    >
      <Stack spacing={4}>
        {/* Default Container */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Default Paper Container
            </Typography>
            <Chip label="Default" size="small" color="primary" variant="outlined" />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            By default, the DataTable uses Material-UI&apos;s <code>TableContainer</code> component 
            with <code>Paper</code> as the component prop. This provides a clean, card-like appearance 
            that integrates seamlessly with Material Design layouts.
          </Typography>
          <CodeBlock
            language="tsx"
            code={`// Default usage - TableContainer with Paper component
<DataTable
  columns={columns}
  data={data}
  enablePagination
  enableSorting
/>

// This renders as:
<TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto' }}>
  <Table>
    {/* Table content */}
  </Table>
</TableContainer>`}
          />
        </Paper>

        {/* Customizing Container with Slot Props */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Customize Container with Slot Props
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The DataTable uses Material-UI&apos;s <code>TableContainer</code> with <code>Paper</code> as its 
            component. You can customize it using <code>slotProps.tableContainer</code> to pass props to the 
            TableContainer (which wraps the Paper).
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> The <code>TableContainer</code> uses <code>component={'{Paper}'}</code> 
              internally. Use <code>slotProps.tableContainer</code> to customize styling, or 
              use <code>slots.tableContainer</code> to replace the entire container component.
            </Typography>
          </Alert>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
            Example 1: Customize TableContainer Styling
          </Typography>
          <CodeBlock
            language="tsx"
            code={`// Customize the TableContainer (which uses Paper as component)
<DataTable
  columns={columns}
  data={data}
  slotProps={{
    tableContainer: {
      elevation: 3,
      sx: {
        borderRadius: 3,
        border: '2px solid',
        borderColor: 'primary.main',
        backgroundColor: 'background.default',
      }
    }
  }}
/>`}
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
            Example 2: Flat, Borderless Design
          </Typography>
          <CodeBlock
            language="tsx"
            code={`// Remove elevation for a flat design
<DataTable
  columns={columns}
  data={data}
  slotProps={{
    tableContainer: {
      elevation: 0,
      sx: {
        backgroundColor: 'transparent',
        borderRadius: 0,
      }
    }
  }}
/>`}
          />

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 3, mb: 1 }}>
            Example 3: Replace with Box Component
          </Typography>
          <CodeBlock
            language="tsx"
            code={`// Replace TableContainer with Box for simpler styling
import { Box } from '@mui/material';

<DataTable
  columns={columns}
  data={data}
  slotProps={{
    tableContainer: {
    component: Box,
      sx: {
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'auto',
      }
    }
  }}
/>`}
          />
        </Paper>

        {/* Layout Examples */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Common Layout Patterns
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Compose the DataTable into various layouts to match your application&apos;s design. Here are 
            some popular patterns:
          </Typography>

          <Stack spacing={3} divider={<Divider />}>
            {/* Pattern 1: Card Layout */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                📋 Card Layout with Header
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Wrap the table in a card with a custom header and actions.
              </Typography>
              <CodeBlock
                language="tsx"
                code={`<Paper elevation={2} sx={{ borderRadius: 2 }}>
  <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="h6">Employee Directory</Typography>
      <Button startIcon={<AddIcon />}>Add Employee</Button>
    </Stack>
  </Box>
  <DataTable
    columns={columns}
    data={data}
    slotProps={{
      tableContainer: {
        elevation: 0,
        sx: { borderRadius: 0 }
      }
    }}
  />
</Paper>`}
              />
            </Box>

            {/* Pattern 2: Split Pane */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                📱 Split Pane with Filters
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Side-by-side layout with persistent filters.
              </Typography>
              <CodeBlock
                language="tsx"
                code={`<Stack direction="row" spacing={2}>
  {/* Sidebar Filters */}
  <Paper sx={{ width: 280, p: 2 }}>
    <Typography variant="h6" gutterBottom>Filters</Typography>
    <Stack spacing={2}>
      <FilterSelect label="Department" options={departments} />
      <FilterSelect label="Status" options={statuses} />
      <FilterRange label="Salary" min={0} max={200000} />
    </Stack>
  </Paper>

  {/* Main Table */}
  <Box sx={{ flex: 1 }}>
    <DataTable
      columns={columns}
      data={data}
      enableSorting
      enablePagination
    />
  </Box>
</Stack>`}
              />
            </Box>

            {/* Pattern 3: Dashboard Grid */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                📊 Dashboard Grid Layout
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Combine tables with charts and KPIs in a dashboard grid.
              </Typography>
              <CodeBlock
                language="tsx"
                code={`<Grid container spacing={3}>
  {/* KPI Cards */}
  <Grid item xs={12} md={3}>
    <StatsCard title="Total Users" value="1,234" />
  </Grid>
  <Grid item xs={12} md={3}>
    <StatsCard title="Active" value="987" />
  </Grid>
  <Grid item xs={12} md={3}>
    <StatsCard title="Inactive" value="247" />
  </Grid>
  <Grid item xs={12} md={3}>
    <StatsCard title="New Today" value="12" />
  </Grid>

  {/* Chart */}
  <Grid item xs={12} md={6}>
    <Paper sx={{ p: 3, height: 400 }}>
      <LineChart data={chartData} />
    </Paper>
  </Grid>

  {/* Table */}
  <Grid item xs={12} md={6}>
    <DataTable
      columns={columns}
      data={data}
      enablePagination
      slotProps={{
        tableContainer: {
          sx: { height: 400 }
        }
      }}
    />
  </Grid>
</Grid>`}
              />
            </Box>

            {/* Pattern 4: Full Page */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                🖥️ Full Page Layout
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Edge-to-edge table for maximum screen real estate.
              </Typography>
              <CodeBlock
                language="tsx"
                code={`<Stack sx={{ height: '100vh' }}>
  {/* App Header */}
  <AppHeader />

  {/* Table takes remaining height */}
  <Box sx={{ flex: 1, overflow: 'hidden' }}>
    <DataTable
      columns={columns}
      data={data}
      enableVirtualization
      maxHeight="100%"
      slotProps={{
        tableContainer: {
          elevation: 0,
          sx: {
            height: '100%',
            borderRadius: 0,
          }
        }
      }}
    />
  </Box>
</Stack>`}
              />
            </Box>
          </Stack>
        </Paper>

        {/* Sticky Regions and Scrolling */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Sticky Headers & Column Pinning
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Combine sticky headers, column pinning, and virtualization to keep key information visible 
            while scrolling through large datasets.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Pro Tip:</strong> Enable <code>enableStickyHeaderOrFooter</code> to keep headers 
              visible during vertical scrolling, and use <code>enableColumnPinning</code> to lock 
              important columns during horizontal scrolling.
            </Typography>
          </Alert>

          <CodeBlock
            language="tsx"
            code={`<DataTable
  columns={columns}
  data={largeDataset}
  enableVirtualization
  enableStickyHeaderOrFooter
  enableColumnPinning
  maxHeight="600px"
  initialState={{
    columnPinning: {
      left: ['_selection', 'name', 'id'],  // Pin selection, name, and ID to left
      right: ['actions'],                   // Pin actions to right
    }
  }}
  slotProps={{
    tableContainer: {
      sx: {
        maxHeight: 600,
        overflow: 'auto',
      }
    }
  }}
/>

// With this setup:
// ✅ Header stays visible when scrolling down
// ✅ First 3 columns stay visible when scrolling right
// ✅ Actions column stays visible when scrolling left
// ✅ Only visible rows are rendered (virtualization)`}
          />
        </Paper>

        {/* Container Height Control */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Container Height Control
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Control the table height to fit your layout requirements using the <code>maxHeight</code> prop 
            or container styling.
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Fixed Height
              </Typography>
              <CodeBlock
                language="tsx"
                code={`<DataTable
  columns={columns}
  data={data}
  maxHeight="400px"
  enableVirtualization
/>`}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Flex Layout (Fill Available Space)
              </Typography>
              <CodeBlock
                language="tsx"
                code={`<Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
  <Header />
  <Box sx={{ flex: 1, minHeight: 0 }}>
    <DataTable
      columns={columns}
      data={data}
      maxHeight="100%"
      enableVirtualization
    />
  </Box>
</Box>`}
              />
            </Box>
          </Stack>
        </Paper>

        {/* Shell-first Composition */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Shell-First Composition
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Build your own custom layout shell and embed the table components. Toolbar, filters, 
            and pagination can live anywhere in your layout.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Note:</strong> The toolbar is shown when <code>enableGlobalFilter</code> is true 
              or when <code>extraFilter</code> is provided. To hide the toolbar completely, set{' '}
              <code>enableGlobalFilter={'{false}'}</code> and don&apos;t provide <code>extraFilter</code>.
            </Typography>
          </Alert>

          <CodeBlock
            language="tsx"
            code={`function CustomTableLayout() {
  const apiRef = useRef<DataTableApi<User>>(null);

  return (
    <Stack spacing={2}>
      {/* Custom Toolbar Outside Table */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <SearchField 
            onChange={(value) => apiRef.current?.filtering.setGlobalFilter(value)} 
          />
          <Button onClick={() => apiRef.current?.export.exportData('xlsx')}>
            Export
          </Button>
        </Stack>
      </Paper>

      {/* Table without built-in toolbar */}
      <DataTable
        ref={apiRef}
        columns={columns}
        data={data}
        enableGlobalFilter={false}  // Disable built-in toolbar
        enablePagination={false}     // Handle pagination separately
      />

      {/* Custom Pagination Outside Table */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <CustomPagination
          page={page}
          total={total}
          onChange={(newPage) => apiRef.current?.pagination.setPageIndex(newPage)}
        />
      </Box>
    </Stack>
  );
}`}
          />
        </Paper>
      </Stack>
    </FeatureLayout>
  );
}
