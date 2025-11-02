import { Box, Typography, Paper, Alert, Divider, Table, TableBody, TableCell, TableHead, TableRow, Stack, Button, Chip, LinearProgress } from '@mui/material';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { useState, useCallback, useRef, useMemo } from 'react';
import { FeatureLayout, CodeBlock } from './common';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  rating: number;
  releaseDate: string;
}

const generateProducts = (count: number): Product[] => {
  const categories = ['Electronics', 'Furniture', 'Stationery', 'Clothing', 'Sports'];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    price: Math.floor(Math.random() * 1000) + 10,
    inStock: Math.random() > 0.3,
    rating: Math.floor(Math.random() * 50) / 10,
    releaseDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), 1).toISOString().split('T')[0],
  }));
};

export function ExportPage() {
  const tableRef = useRef<any>(null);
  const [exportStatus, setExportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const sampleData = useMemo(() => generateProducts(100), []);

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
      accessorFn: (row) => `$${row.price}`,  // Export formatted value
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
      accessorFn: (row) => row.inStock ? 'Yes' : 'No',  // Export as text
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      size: 100,
      cell: ({ getValue }) => `${getValue<number>().toFixed(1)}`,
    },
    {
      accessorKey: 'releaseDate',
      header: 'Release Date',
      size: 130,
    },
  ];

  // Export callbacks
  const handleExportProgress = useCallback((progress: any) => {
    setExportProgress(progress.percentage || 0);
    setIsExporting(true);
  }, []);

  const handleExportComplete = useCallback((result: any) => {
    setExportStatus({ type: 'success', message: `Export completed! ${result.totalRows} rows exported to ${result.filename}` });
    setIsExporting(false);
    setExportProgress(0);
  }, []);

  const handleExportError = useCallback((error: any) => {
    setExportStatus({ type: 'error', message: `Export failed: ${error.message}` });
    setIsExporting(false);
    setExportProgress(0);
  }, []);

  // Server-side export handler
  const handleServerExport = useCallback(async (filters: any, selection: any) => {
    console.log('Server export with filters:', filters);
    console.log('Server export with selection:', selection);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In real app, send to backend:
    // const response = await fetch('/api/products/export', {
    //   method: 'POST',
    //   body: JSON.stringify({ filters, selection }),
    // });
    // return await response.json();

    // For demo, return filtered data
    return {
      data: sampleData,
      total: sampleData.length
    };
  }, [sampleData]);

  return (
    <FeatureLayout
      title="Data Export"
      description="Export table data to CSV or Excel formats with support for client-side and server-side exports, custom formatting, progress tracking, and selected row exports."
    >
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Export Features
        </Typography>
        <Typography variant="body2">
          Export to CSV or Excel formats<br />
          Export all data or only selected rows<br />
          Export only visible columns<br />
          Custom export headers and formatting<br />
          Progress tracking for large datasets
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Enable Export */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Enable Export
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Basic Setup
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Export is enabled by default via the toolbar export button:
        </Typography>
        <CodeBlock
          language="tsx"
          code={`<DataTable
  columns={columns}
  data={data}
  enableExport={true}               // Enable export button in toolbar
  exportFilename="my-export"        // Default filename (without extension)
  onExportComplete={(result) => {
    console.log('Export completed:', result);
  }}
  onExportError={(error) => {
    console.error('Export failed:', error);
  }}
/>`}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Export Data Format */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        What Data Gets Exported
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Smart Export Logic
        </Typography>
        <Typography variant="body2">
          The export automatically uses the best data source based on your column definition.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Export Priority Order
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The table uses this priority to determine what data to export for each column:
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              1. accessorFn (Recommended for Export)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Use <code>accessorFn</code> to format data specifically for export:
            </Typography>
            <CodeBlock
              language="ts"
              code={`{
  accessorKey: 'price',
  header: 'Price',
  accessorFn: (row) => \`$\${row.price}\`,  // Exports: "$1299"
  cell: ({ getValue }) => (
    <Chip label={getValue()} />  // Display: Chip component
  ),
}`}
            />
          </Box>

          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              2. accessorKey (Raw Value)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              If no <code>accessorFn</code>, uses raw data value:
            </Typography>
            <CodeBlock
              language="ts"
              code={`{
  accessorKey: 'status',
  header: 'Status',
  // Exports: "active" (raw value from data)
  cell: ({ getValue }) => (
    <Chip label={getValue()} />  // Display: Chip
  ),
}`}
            />
          </Box>

          <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              3. header (Column Header)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              The column header is used for both display and export:
            </Typography>
            <CodeBlock
              language="ts"
              code={`{
  accessorKey: 'salary',
  header: 'Annual Salary (USD)',  // Used for display AND export
  cell: ({ getValue }) => \`$\${getValue()}\`,
}`}
            />
          </Box>
        </Stack>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Export Progress Tracking */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Export Progress Tracking
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Track Export Progress
        </Typography>
        <Typography variant="body2">
          Use callbacks to track export progress, completion, and errors.
          Useful for large datasets or server-side exports.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Export Progress
        </Typography>
        <CodeBlock
          language="tsx"
          code={`import { useState } from 'react';

function MyComponent() {
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  
  return (
    <DataTable
      columns={columns}
      data={data}
      enableExport={true}
      exportFilename="products-export"
      
      // Progress callback
      onExportProgress={(progress) => {
        // progress = {
        //   processedRows: 50,
        //   totalRows: 100,
        //   percentage: 50
        // }
        setExportProgress(progress.percentage || 0);
        setIsExporting(true);
      }}
      
      // Completion callback
      onExportComplete={(result) => {
        // result = {
        //   success: true,
        //   filename: 'products-export.csv',
        //   totalRows: 100
        // }
        console.log('Export completed:', result);
        setIsExporting(false);
        setExportProgress(0);
      }}
      
      // Error callback
      onExportError={(error) => {
        // error = {
        //   message: 'Export failed',
        //   code: 'EXPORT_ERROR'
        // }
        console.error('Export error:', error);
        setIsExporting(false);
        setExportProgress(0);
      }}
    />
  );
}`}
        />

        {isExporting && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Exporting... {exportProgress.toFixed(0)}%
            </Typography>
            <LinearProgress variant="determinate" value={exportProgress} />
          </Box>
        )}

        {exportStatus && (
          <Alert severity={exportStatus.type} sx={{ mb: 2 }}>
            {exportStatus.message}
          </Alert>
        )}

        <DataTable
          columns={columns}
          data={sampleData}
          enableExport={true}
          exportFilename="products-demo"
          onExportProgress={handleExportProgress}
          onExportComplete={handleExportComplete}
          onExportError={handleExportError}
          enablePagination={true}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 10 },
          }}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Export via API Reference */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Export via API Reference
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Programmatic Export
        </Typography>
        <Typography variant="body2">
          Use the table ref API to trigger exports programmatically from your own buttons or actions.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Programmatic Export
        </Typography>
        <CodeBlock
          language="tsx"
          code={`import { useRef } from 'react';
import { DataTableApi } from '@ackplus/react-tanstack-data-table';

const tableRef = useRef<DataTableApi<Product>>(null);

// Export to CSV
const handleExportCSV = async () => {
  await tableRef.current?.export.exportCSV({
    filename: 'custom-export',      // Optional
  });
};

// Export to Excel
const handleExportExcel = async () => {
  await tableRef.current?.export.exportExcel({
    filename: 'custom-export',      // Optional
  });
};

// Check if currently exporting
const isExporting = tableRef.current?.export.isExporting();

// Cancel ongoing export
const cancelExport = () => {
  tableRef.current?.export.cancelExport();
};

<>
  <Button onClick={handleExportCSV}>
    Export CSV
  </Button>
  <Button onClick={handleExportExcel}>
    Export Excel
  </Button>
  
  <DataTable
    ref={tableRef}
    columns={columns}
    data={data}
    enableExport={true}
  />
</>`}
        />

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={async () => {
              await tableRef.current?.export.exportCSV({ filename: 'api-export' });
            }}
          >
            Export CSV (API)
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={async () => {
              await tableRef.current?.export.exportExcel({ filename: 'api-export' });
            }}
          >
            Export Excel (API)
          </Button>
        </Stack>

        <DataTable
          ref={tableRef}
          columns={columns}
          data={sampleData}
          enableExport={false}          // Hide toolbar export button
          exportFilename="api-controlled-export"
          onExportProgress={handleExportProgress}
          onExportComplete={handleExportComplete}
          onExportError={handleExportError}
          enablePagination={false}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Server-Side Export */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Server-Side Export
      </Typography>

      <Alert severity="error" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Server-Side Mode
        </Typography>
        <Typography variant="body2">
          For large datasets, use <code>dataMode="server"</code> and <code>onServerExport</code>
          to delegate export to your backend. This sends filters and selection state to your API.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Server-Side Export
        </Typography>
        <CodeBlock
          language="ts"
          code={`const handleServerExport = async (filters, selection) => {
  // Receives current filters and selection state
  // {
  //   globalFilter: 'search term',
  //   columnFilter: { filters: [...], logic: 'AND' },
  //   sorting: [{ id: 'price', desc: true }],
  //   pagination: { pageIndex: 0, pageSize: 50 },
  //   selection: { ids: ['1', '2'], type: 'include' }
  // }
  
  // Send to backend
  const response = await fetch('/api/products/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filters,
      selection,     // Include selection for export
      format: 'csv', // or 'excel'
    }),
  });
  
  const result = await response.json();
  return {
    data: result.products,
    total: result.totalCount,
  };
};

<DataTable
  columns={columns}
  dataMode="server"                  // Server mode
  totalRow={totalCount}
  onFetchData={handleFetchData}
  onServerExport={handleServerExport}  // Server export handler
  
  enableExport={true}
  exportFilename="server-export"
  onExportProgress={(progress) => {
    console.log(\`Exporting: \${progress.percentage}%\`);
  }}
/>`}
        />

        <DataTable
          columns={columns}
          dataMode="client"
          data={sampleData}
          totalRow={sampleData.length}
          enableExport={true}
          exportFilename="server-demo"
          onExportProgress={handleExportProgress}
          onExportComplete={handleExportComplete}
          onExportError={handleExportError}
          enableRowSelection={true}
          enablePagination={true}
          initialState={{
            pagination: { pageIndex: 0, pageSize: 15 },
          }}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Export Props */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Export Props Reference
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          DataTable Export Props
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
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableExport</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>true</TableCell>
              <TableCell>Show export button in toolbar</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>exportFilename</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                string
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>'export'</TableCell>
              <TableCell>Default filename (extension added automatically)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>onServerExport</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'(filters, selection) => Promise'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>undefined</TableCell>
              <TableCell>Server-side export handler (receives filters and selection)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>onExportProgress</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'(progress) => void'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>undefined</TableCell>
              <TableCell>Called during export with progress updates</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>onExportComplete</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'(result) => void'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>undefined</TableCell>
              <TableCell>Called when export completes successfully</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>onExportError</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'(error) => void'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>undefined</TableCell>
              <TableCell>Called when export fails</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>onExportCancel</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'() => void'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>undefined</TableCell>
              <TableCell>Called when export is cancelled</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Column Export Properties */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Column Export Properties
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Column-Level Export Control
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Property</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>hideInExport</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell>
                Set <code>true</code> to exclude this column from exports (e.g., action columns)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>header</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                string
              </TableCell>
              <TableCell>
                Column header text used for both display and export
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>accessorFn</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'(row) => any'}
              </TableCell>
              <TableCell>
                Function to format data for export (takes priority over accessorKey)
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Insight: Example: Export-Friendly Columns
          </Typography>
          <CodeBlock
            language="ts"
            code={`const columns: DataTableColumn<Product>[] = [
  {
    accessorKey: 'price',
    header: 'Unit Price (USD)',           // Used for display AND export
    accessorFn: (row) => \`$\${row.price}\`,  // Export as "$1299"
    cell: ({ getValue }) => (
      <Chip label={getValue()} />         // Display as Chip
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    hideInExport: true,                   // Don't export this column
    cell: ({ row }) => (
      <Button>Edit</Button>
    ),
  },
  {
    accessorKey: 'inStock',
    header: 'Stock Status',               // Clear header for export
    accessorFn: (row) => row.inStock ? 'In Stock' : 'Out of Stock',
    cell: ({ getValue }) => (
      <Chip 
        label={getValue()} 
        color={getValue() === 'In Stock' ? 'success' : 'error'} 
      />
    ),
  },
];`}
          />
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Export with Selection */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Export Selected Rows
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Automatic Selection Detection
        </Typography>
        <Typography variant="body2">
          When rows are selected, the export automatically includes only selected rows.
          If no rows are selected, it exports all filtered rows.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Export with Selection
        </Typography>
        <CodeBlock
          language="tsx"
          code={`<DataTable
  columns={columns}
  data={data}
  enableRowSelection={true}         // Enable selection
  enableExport={true}               // Enable export
  
  // Export behavior:
  // - If rows selected: exports only selected rows
  // - If no rows selected: exports all filtered/visible rows
  
  onExportComplete={(result) => {
    console.log(\`Exported \${result.totalRows} rows\`);
  }}
/>`}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Try selecting some rows and then exporting:
        </Typography>

        <DataTable
          columns={columns}
          data={sampleData.slice(0, 20)}
          enableRowSelection={true}
          enableExport={true}
          exportFilename="selected-export"
          onExportProgress={handleExportProgress}
          onExportComplete={handleExportComplete}
          onExportError={handleExportError}
          enablePagination={false}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Export API Methods */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Export API Methods
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Available Export Methods
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Parameters</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
                exportCSV()
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                {'{ filename? }'}
              </TableCell>
              <TableCell>Export data to CSV format</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
                exportExcel()
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                {'{ filename? }'}
              </TableCell>
              <TableCell>Export data to Excel format</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
                isExporting()
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                none
              </TableCell>
              <TableCell>Returns true if export is in progress</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
                cancelExport()
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                none
              </TableCell>
              <TableCell>Cancel ongoing export operation</TableCell>
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
              Tip: Use accessorFn for Export Formatting
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use <code>accessorFn</code> to format data for export (currency, dates, etc.).
              Use <code>cell</code> only for visual display components.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Hide Action Columns
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set <code>hideInExport: true</code> on columns with buttons, icons, or actions
              that don't make sense in exports.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Use Descriptive Headers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use clear, descriptive <code>header</code> text that works well for both display and exports
              (e.g., "Annual Salary (USD)" instead of just "Salary").
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Use Server Export for Large Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              For datasets with 10,000+ rows, use <code>onServerExport</code> to let your
              backend handle the export generation.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Insight: Export Respects Current State
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Exports automatically respect current filters, sorting, column visibility, and selection.
              This gives users exactly what they see (or have selected).
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Insight: Progress Tracking
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use <code>onExportProgress</code> to show loading indicators for better UX,
              especially with large exports.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </FeatureLayout>
  );
}
