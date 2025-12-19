/**
 * Basic Expansion Example
 * 
 * Demonstrates basic row expansion functionality.
 */

import { Box, Typography } from '@mui/material';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';

interface Order {
  id: number;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  items: string[];
}

const sampleOrders: Order[] = [
  { id: 1, orderNumber: 'ORD-001', customer: 'John Doe', total: 299.99, status: 'Shipped', items: ['Laptop', 'Mouse'] },
  { id: 2, orderNumber: 'ORD-002', customer: 'Jane Smith', total: 149.99, status: 'Processing', items: ['Keyboard', 'Cable'] },
  { id: 3, orderNumber: 'ORD-003', customer: 'Bob Johnson', total: 599.99, status: 'Delivered', items: ['Monitor', 'Stand'] },
];

const columns: DataTableColumn<Order>[] = [
  { accessorKey: 'orderNumber', header: 'Order #', size: 120 },
  { accessorKey: 'customer', header: 'Customer', size: 180 },
  { accessorKey: 'total', header: 'Total', size: 120, cell: ({ getValue }) => `$${getValue<number>()}` },
  { accessorKey: 'status', header: 'Status', size: 120 },
];

export function BasicExpansionExample() {
  return (
    <DataTable
      columns={columns}
      data={sampleOrders}
      enableExpanding={true}
      enablePagination={false}
      renderSubComponent={({ row }) => (
        <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Order Items:
          </Typography>
          <ul>
            {row.original.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </Box>
      )}
    />
  );
}
