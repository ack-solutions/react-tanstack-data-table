import { Box, Typography, Paper, Alert, Divider, Table, TableBody, TableCell, TableHead, TableRow, Stack, Button, Chip, Grid } from '@mui/material';
import { DataTable, DataTableColumn, DEFAULT_EXPANDING_COLUMN_NAME } from '@ackplus/react-tanstack-data-table';
import { useState, useCallback, useRef, useMemo } from 'react';

interface Order {
  id: number;
  orderNumber: string;
  customer: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
  items: {
    id: number;
    product: string;
    quantity: number;
    price: number;
  }[];
  notes: string;
  shippingAddress: string;
}

const sampleOrders: Order[] = [
  {
    id: 1,
    orderNumber: 'ORD-001',
    customer: 'John Doe',
    total: 1299,
    status: 'completed',
    date: '2024-03-15',
    items: [
      { id: 1, product: 'Laptop Pro', quantity: 1, price: 1299 },
    ],
    notes: 'Deliver to reception',
    shippingAddress: '123 Main St, New York, NY 10001',
  },
  {
    id: 2,
    orderNumber: 'ORD-002',
    customer: 'Jane Smith',
    total: 549,
    status: 'processing',
    date: '2024-03-16',
    items: [
      { id: 1, product: 'Wireless Mouse', quantity: 2, price: 29 },
      { id: 2, product: 'Keyboard', quantity: 1, price: 79 },
      { id: 3, product: 'Monitor', quantity: 1, price: 412 },
    ],
    notes: 'Gift wrap requested',
    shippingAddress: '456 Oak Ave, Los Angeles, CA 90001',
  },
  {
    id: 3,
    orderNumber: 'ORD-003',
    customer: 'Bob Johnson',
    total: 299,
    status: 'pending',
    date: '2024-03-17',
    items: [
      { id: 1, product: 'Office Chair', quantity: 1, price: 299 },
    ],
    notes: 'Call before delivery',
    shippingAddress: '789 Pine Rd, Chicago, IL 60601',
  },
];

export function ExpansionPage() {
  const tableRef = useRef<any>(null);

  const columns: DataTableColumn<Order>[] = [
    {
      accessorKey: 'orderNumber',
      header: 'Order #',
      size: 120,
    },
    {
      accessorKey: 'customer',
      header: 'Customer',
      size: 180,
    },
    {
      accessorKey: 'date',
      header: 'Date',
      size: 120,
    },
    {
      accessorKey: 'total',
      header: 'Total',
      size: 120,
      cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 130,
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const color = 
          status === 'completed' ? 'success' : 
          status === 'processing' ? 'primary' :
          status === 'pending' ? 'warning' : 'error';
        return <Chip label={status} color={color} size="small" />;
      },
    },
  ];

  // Render expanded row content
  const renderSubComponent = useCallback((row: any) => {
    const order = row.original as Order;
    return (
      <Box sx={{ p: 3, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Order Items
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Qty</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Price</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">${item.price}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      ${item.quantity * item.price}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Order Details
            </Typography>
            <Stack spacing={1}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Shipping Address
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {order.shippingAddress}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Notes
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {order.notes || 'No notes'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Items
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    );
  }, []);

  // Conditional expansion - only allow expanding completed/processing orders
  const getRowCanExpand = useCallback((row: any) => {
    return row.original.status === 'completed' || row.original.status === 'processing';
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Row Expansion
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Expand table rows to show additional details, nested data, or custom content. 
        Control expansion globally, per-row, or programmatically via API.
      </Typography>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Expandable Rows
        </Typography>
        <Typography variant="body2">
          Click the expand icon to reveal additional content for each row. Perfect for showing 
          detailed information, nested tables, or related data without cluttering the main view.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Enable Row Expansion */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Enable Row Expansion
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Basic Setup
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enable row expansion and provide content to display:
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
{`import { useCallback } from 'react';

// Define what to show when row is expanded
const renderSubComponent = useCallback(({ row }) => (
  <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
    <Typography variant="h6">
      Details for {row.name}
    </Typography>
    <Typography variant="body2">
      Email: {row.email}
    </Typography>
    {/* Add any content you want */}
  </Box>
), []);

<DataTable
  columns={columns}
  data={data}
  enableExpanding={true}              // Enable expansion feature
  renderSubComponent={renderSubComponent}  // Content to show
  getRowCanExpand={() => true}        // All rows can expand
/>`}
        </Box>

        <DataTable
          columns={columns}
          data={sampleOrders}
          enableExpanding={true}
          renderSubComponent={renderSubComponent}
          getRowCanExpand={() => true}
          enablePagination={false}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Conditional Expansion */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Conditional Row Expansion
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Control Which Rows Can Expand
        </Typography>
        <Typography variant="body2">
          Use <code>getRowCanExpand</code> to determine which rows should have the expand button. 
          Rows that can't expand won't show the expand icon.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Conditional Expansion
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
{`import { useCallback } from 'react';

// Only allow expanding certain rows
const getRowCanExpand = useCallback((row) => {
  // Only expand orders that are completed or processing
  return row.original.status === 'completed' || 
         row.original.status === 'processing';
  
  // Or check if row has nested data
  // return row.original.items && row.original.items.length > 0;
}, []);

<DataTable
  columns={columns}
  data={data}
  enableExpanding={true}
  renderSubComponent={renderSubComponent}
  getRowCanExpand={getRowCanExpand}    // Conditional expansion
/>`}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Only 'completed' and 'processing' orders can be expanded:
        </Typography>

        <DataTable
          columns={columns}
          data={sampleOrders}
          enableExpanding={true}
          renderSubComponent={renderSubComponent}
          getRowCanExpand={getRowCanExpand}
          enablePagination={false}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Default Expanded Rows */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Default Expanded Rows
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Set Initial Expanded State
        </Typography>
        <Typography variant="body2">
          Use <code>initialState.expanded</code> to have specific rows expanded by default when the table loads.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Default Expanded Rows
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
{`// Note: Expansion state is managed internally
// To expand rows programmatically, use the table API:
const table = tableRef.current?.table.getTable();
table?.getRow('1')?.toggleExpanded(true);

<DataTable
  columns={columns}
  data={data}
  enableExpanding={true}
  renderSubComponent={renderSubComponent}
  getRowCanExpand={() => true}
/>`}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Use the API to expand rows programmatically (see API Reference section below):
        </Typography>

        <DataTable
          columns={columns}
          data={sampleOrders}
          enableExpanding={true}
          renderSubComponent={renderSubComponent}
          getRowCanExpand={() => true}
          enablePagination={false}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Pin Expansion Column */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Pin Expansion Column
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Special Column Name
        </Typography>
        <Typography variant="body2">
          The expansion column has a special ID: <code>DEFAULT_EXPANDING_COLUMN_NAME</code> (value: '_expanding'). 
          Use this to pin the expansion column.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Pin Expansion Column
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
{`import { 
  DEFAULT_EXPANDING_COLUMN_NAME,
  DEFAULT_SELECTION_COLUMN_NAME 
} from '@ackplus/react-tanstack-data-table';

<DataTable
  columns={columns}
  data={data}
  enableExpanding={true}
  enableRowSelection={true}
  enableColumnPinning={true}
  renderSubComponent={renderSubComponent}
  getRowCanExpand={() => true}
  initialState={{
    columnPinning: {
      left: [
        DEFAULT_EXPANDING_COLUMN_NAME,   // Pin expand button
        DEFAULT_SELECTION_COLUMN_NAME,   // Pin selection checkbox
        'orderNumber',                   // Pin order number
      ],
    },
  }}
/>`}
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* API Reference */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Expansion API Reference
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Programmatic Control
        </Typography>
        <Typography variant="body2">
          While there's no dedicated expansion API in the DataTableApi, you can access 
          the TanStack Table instance to control expansion programmatically.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Access Table Instance for Expansion
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

const tableRef = useRef<DataTableApi<Order>>(null);

// Get the TanStack Table instance
const table = tableRef.current?.table.getTable();

// Expand a specific row
const expandRow = (rowId: string) => {
  const row = table?.getRow(rowId);
  row?.toggleExpanded(true);
};

// Collapse a specific row
const collapseRow = (rowId: string) => {
  const row = table?.getRow(rowId);
  row?.toggleExpanded(false);
};

// Toggle row expansion
const toggleRow = (rowId: string) => {
  const row = table?.getRow(rowId);
  row?.toggleExpanded();
};

// Expand all rows
const expandAll = () => {
  table?.toggleAllRowsExpanded(true);
};

// Collapse all rows
const collapseAll = () => {
  table?.toggleAllRowsExpanded(false);
};

// Check if row is expanded
const isExpanded = (rowId: string) => {
  const row = table?.getRow(rowId);
  return row?.getIsExpanded() || false;
};

// Get all expanded rows
const expandedRows = table?.getState().expanded;

<DataTable
  ref={tableRef}
  columns={columns}
  data={data}
  enableExpanding={true}
  renderSubComponent={renderSubComponent}
/>`}
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const table = tableRef.current?.table.getTable();
              table?.toggleAllRowsExpanded(true);
            }}
          >
            Expand All
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const table = tableRef.current?.table.getTable();
              table?.toggleAllRowsExpanded(false);
            }}
          >
            Collapse All
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const table = tableRef.current?.table.getTable();
              const row = table?.getRow('1');
              row?.toggleExpanded();
            }}
          >
            Toggle Order #1
          </Button>
        </Stack>

        <DataTable
          ref={tableRef}
          columns={columns}
          data={sampleOrders}
          enableExpanding={true}
          renderSubComponent={renderSubComponent}
          getRowCanExpand={() => true}
          enablePagination={false}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* renderSubComponent Details */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        renderSubComponent Prop
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Understanding renderSubComponent
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This function receives the row data and returns the content to display when expanded:
        </Typography>
        
        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Parameter</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>row</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                T (your data type)
              </TableCell>
              <TableCell>
                The row's original data object
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            💡 Common Patterns
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
{`// Pattern 1: Show nested data
const renderSubComponent = useCallback(({ row }) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h6">Order Items</Typography>
    {row.items.map(item => (
      <div key={item.id}>{item.name} - {item.quantity}</div>
    ))}
  </Box>
), []);

// Pattern 2: Show detailed information
const renderSubComponent = useCallback(({ row }) => (
  <Grid container spacing={2} sx={{ p: 2 }}>
    <Grid size={{ xs: 6 }}>
      <Typography>Email: {row.email}</Typography>
      <Typography>Phone: {row.phone}</Typography>
    </Grid>
    <Grid size={{ xs: 6 }}>
      <Typography>Address: {row.address}</Typography>
      <Typography>City: {row.city}</Typography>
    </Grid>
  </Grid>
), []);

// Pattern 3: Nested table
const renderSubComponent = useCallback(({ row }) => (
  <Box sx={{ p: 2 }}>
    <DataTable
      columns={nestedColumns}
      data={row.subItems}
      enablePagination={false}
    />
  </Box>
), []);`}
          </Box>
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* DataTable Props */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Expansion Props Reference
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          DataTable Expansion Props
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
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>enableExpanding</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                boolean
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                false
              </TableCell>
              <TableCell>Enable row expansion feature</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>renderSubComponent</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'({ row: T }) => ReactNode'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                undefined
              </TableCell>
              <TableCell>
                Function to render expanded content. MUST be memoized with useCallback!
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>getRowCanExpand</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'(row) => boolean'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                undefined
              </TableCell>
              <TableCell>
                Function to determine if a row can be expanded. Should be memoized.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                initialState.expanded
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                {'Record<string, boolean>'}
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                {'{}'} 
              </TableCell>
              <TableCell>
                Initial expanded state. Keys are row IDs, values are true/false.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Customize Expansion Column */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Customize Expansion Column
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Customize via slotProps
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Use <code>slotProps.expandColumn</code> to customize the expansion column:
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
          }}
        >
{`<DataTable
  columns={columns}
  data={data}
  enableExpanding={true}
  renderSubComponent={renderSubComponent}
  getRowCanExpand={() => true}
  slotProps={{
    expandColumn: {
      size: 80,              // Custom width
      align: 'left',         // Alignment
      enablePinning: true,   // Allow pinning
      // Any column property
    },
  }}
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
              ✅ Always Memoize renderSubComponent
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Wrap <code>renderSubComponent</code> with <code>useCallback</code> to prevent 
              unnecessary re-renders and performance issues.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Use getRowCanExpand for Conditional Expansion
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Only show expand button for rows that have meaningful content to display. 
              Check if nested data exists before allowing expansion.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Keep Expanded Content Simple
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avoid heavy components or large nested tables in expanded content. 
              Keep it focused on essential details to maintain performance.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              ✅ Pin Expansion Column
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pin the expansion column to the left (with selection) so users can always access it 
              when scrolling horizontally.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              💡 Common Use Cases
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Show order items for an order<br />
              • Display detailed contact information<br />
              • Show nested comments or activities<br />
              • Display related records without navigation<br />
              • Show full text for truncated content
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              💡 Access via Table Instance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use <code>tableRef.current?.table.getTable()</code> to access the full TanStack Table 
              instance for advanced expansion control, including row-level methods.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

