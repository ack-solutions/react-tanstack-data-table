/**
 * Example 7: Column Footer with Aggregation
 * 
 * Demonstrates:
 * - Adding footer content to columns
 * - Calculating aggregations (sum, average, etc.)
 * - Accessing filtered row data
 * - Displaying summary information
 */

import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { Typography, Chip } from '@mui/material';
import { Employee, sampleEmployees } from './shared-data';

const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 200,
    footer: () => (
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        Total Employees
      </Typography>
    ),
  },
  {
    accessorKey: 'department',
    header: 'Department',
    size: 150,
    footer: ({ table }) => {
      const count = table.getFilteredRowModel().rows.length;
      return (
        <Chip 
          label={`${count} employees`} 
          size="small" 
          color="info"
          variant="outlined"
        />
      );
    },
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    size: 150,
    align: 'right',
    cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
    footer: ({ table }) => {
      const total = table.getFilteredRowModel().rows
        .reduce((sum, row) => sum + (row.original.salary || 0), 0);
      const avg = total / table.getFilteredRowModel().rows.length;
      return (
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Total: ${total.toLocaleString()} | Avg: ${Math.round(avg).toLocaleString()}
        </Typography>
      );
    },
  },
];

export function ColumnFooterExample() {
  return (
    <DataTable
      columns={columns}
      data={sampleEmployees}
      enablePagination={false}
      enableGlobalFilter={true}
    />
  );
}
