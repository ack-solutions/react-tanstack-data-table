import { Box, Typography, Paper, Stack, Chip, Alert, Divider } from '@mui/material';
import { CodeBlock } from './features/common/CodeBlock';

export function Features() {
  const coreFeatures = [
    'Sorting', 
    'Filtering', 
    'Pagination', 
    'Column Pinning', 
    'Column Visibility', 
    'Column Resizing',
    'Column Reordering',
    'Row Selection', 
    'Row Expansion', 
    'Virtualization', 
    'Export (CSV/XLSX/JSON)',
    'Bulk Actions',
    'Global Search',
    'Column Filters',
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Feature Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The DataTable component provides a comprehensive set of production-ready features. Each capability is modular 
        and can be enabled independently, giving you full control over your table&apos;s functionality.
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Core Capabilities
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {coreFeatures.map((item) => (
            <Chip key={item} label={item} variant="outlined" color="primary" size="small" />
          ))}
        </Stack>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, mt: 4, mb: 3 }}>
        Feature Details
      </Typography>

      {/* Data Modes */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Client & Server-Side Data Handling
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Seamlessly switch between client-side and server-side data processing. Use <code>dataMode=&quot;client&quot;</code> for 
          smaller datasets or <code>dataMode=&quot;server&quot;</code> for large datasets with backend pagination, sorting, and filtering.
        </Typography>
        <CodeBlock
          language="tsx"
          code={`// Client-side mode (default)
<DataTable
  columns={columns}
  data={data}
  enablePagination
  enableSorting
/>

// Server-side mode
<DataTable
  columns={columns}
  dataMode="server"
  onFetchData={async (filters) => {
    const response = await fetch(\`/api/data?\${new URLSearchParams(filters)}\`);
    return {
      data: response.data,
      total: response.total,
    };
  }}
  enablePagination
  enableSorting
/>`}
        />
      </Paper>

      {/* Filtering */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Advanced Filtering
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Support for global search and column-specific filters with multiple operators (equals, contains, greater than, etc.). 
          Filters can be combined with AND/OR logic.
        </Typography>
        <CodeBlock
          language="tsx"
          code={`<DataTable
  columns={columns}
  data={data}
  enableGlobalFilter
  enableColumnFilter
  filterMode="client" // or "server"
  initialState={{
    columnFilter: {
      filters: [
        { columnId: 'status', operator: 'equals', value: 'active' },
        { columnId: 'salary', operator: 'greaterThan', value: 50000 },
      ],
      logic: 'AND',
    },
  }}
/>`}
        />
      </Paper>

      {/* Row Selection */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Row Selection & Bulk Actions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Single or multi-row selection with include/exclude modes. Perfect for implementing bulk operations 
          on selected rows across pages.
        </Typography>
        <CodeBlock
          language="tsx"
          code={`<DataTable
  columns={columns}
  data={data}
  enableRowSelection
  enableMultiRowSelection
  selectMode="all" // "page" | "all"
  onSelectionChange={(selection) => {
    console.log('Selected rows:', selection);
    // selection.ids: string[]
    // selection.type: "include" | "exclude"
  }}
  enableBulkActions
  bulkActions={[
    {
      label: 'Delete Selected',
      icon: <DeleteIcon />,
      onClick: (selectedIds) => handleDelete(selectedIds),
    },
    {
      label: 'Export Selected',
      icon: <DownloadIcon />,
      onClick: (selectedIds) => handleExport(selectedIds),
    },
  ]}
/>`}
        />
      </Paper>

      {/* Export */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Data Export
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Built-in export functionality supporting CSV, XLSX, and JSON formats. Export visible data, 
          selected rows, or all data from the server.
        </Typography>
        <CodeBlock
          language="tsx"
          code={`<DataTable
  columns={columns}
  data={data}
  enableExport
  exportFilename="users-export"
  onExportProgress={(progress) => console.log(\`Export: \${progress}%\`)}
  onExportComplete={() => console.log('Export complete!')}
  // For server-side exports
  onServerExport={async (filters, selection) => {
    const response = await fetch('/api/export', {
      method: 'POST',
      body: JSON.stringify({ filters, selection }),
    });
    return response.json();
  }}
/>`}
        />
      </Paper>

      {/* Column Management */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Column Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Full control over columns with sorting, resizing, reordering, pinning (left/right), and visibility toggling. 
          All column states can be controlled or uncontrolled.
        </Typography>
        <CodeBlock
          language="tsx"
          code={`<DataTable
  columns={columns}
  data={data}
  enableSorting
  enableColumnResizing
  enableColumnDragging
  enableColumnPinning
  enableColumnVisibility
  initialState={{
    columnPinning: {
      left: ['_selection', 'name'],
      right: ['actions'],
    },
    columnVisibility: {
      internalId: false, // Hide this column
    },
    sorting: [
      { id: 'createdAt', desc: true },
    ],
  }}
/>`}
        />
      </Paper>

      {/* Virtualization */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Virtualization
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Render thousands of rows efficiently using virtual scrolling. Only visible rows are rendered in the DOM, 
          providing excellent performance for large datasets.
        </Typography>
        <CodeBlock
          language="tsx"
          code={`<DataTable
  columns={columns}
  data={largeDataset} // 10,000+ rows
  enableVirtualization
  estimateRowHeight={52}
  maxHeight="600px"
  enableStickyHeaderOrFooter
/>`}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Customization */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Slots-First Customization
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Replace any component using the slots system. Customize the toolbar, header, rows, cells, pagination, 
          or empty state while preserving built-in functionality.
        </Typography>
        <CodeBlock
          language="tsx"
          code={`<DataTable
  columns={columns}
  data={data}
  slots={{
    toolbar: CustomToolbar,
    header: CustomHeader,
    row: CustomRow,
    cell: CustomCell,
    emptyRow: CustomEmptyState,
    pagination: CustomPagination,
  }}
  slotProps={{
    toolbar: { 
      showExport: true,
      customActions: <MyCustomButton /> 
    },
    pagination: { 
      rowsPerPageOptions: [10, 25, 50, 100] 
    },
  }}
/>`}
        />
      </Paper>

      {/* Imperative API */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Imperative API
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Access the table instance programmatically to control behavior, trigger actions, or integrate with 
          external state management. Perfect for power-user workflows.
        </Typography>
        <CodeBlock
          language="tsx"
          code={`const apiRef = useRef<DataTableApi<User>>(null);

// Programmatic control
const handleReset = () => {
  apiRef.current?.filtering.clearGlobalFilter();
  apiRef.current?.filtering.clearColumnFilters();
  apiRef.current?.sorting.resetSorting();
  apiRef.current?.data.refresh();
};

const handleExport = () => {
  apiRef.current?.export.exportData('xlsx');
};

const handleSelectAll = () => {
  apiRef.current?.selection.selectAll();
};

return (
  <>
    <Stack direction="row" spacing={2} mb={2}>
      <Button onClick={handleReset}>Reset All</Button>
      <Button onClick={handleExport}>Export</Button>
      <Button onClick={handleSelectAll}>Select All</Button>
    </Stack>
    <DataTable 
      ref={apiRef}
      columns={columns} 
      data={data}
    />
  </>
);`}
        />
      </Paper>

      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Explore More
        </Typography>
        <Typography variant="body2">
          Check the Examples section for interactive demos of these features, and the Props Reference for 
          complete API documentation.
        </Typography>
      </Alert>
    </Box>
  );
}
