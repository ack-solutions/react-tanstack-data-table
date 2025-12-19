/**
 * Example 4: Column Alignment
 * 
 * Demonstrates:
 * - Left, center, and right text alignment
 * - Proper alignment for different data types
 * - Best practices for number alignment
 */

import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { Chip } from '@mui/material';
import { Employee, sampleEmployees } from './shared-data';

const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 200,
    align: 'left', // Left aligned (default)
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    size: 150,
    align: 'right', // Right aligned for numbers
    cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    align: 'center', // Center aligned
    cell: ({ getValue }) => {
      const status = getValue<string>();
      const color = status === 'active' ? 'success' : status === 'inactive' ? 'error' : 'warning';
      return (
        <Chip 
          label={status.charAt(0).toUpperCase() + status.slice(1)} 
          color={color}
          size="small"
        />
      );
    },
  },
  {
    accessorKey: 'id',
    header: 'ID',
    size: 80,
    align: 'center', // Center aligned for IDs
  },
];

export function ColumnAlignmentExample() {
  return (
    <DataTable
      columns={columns}
      data={sampleEmployees}
      enablePagination={false}
      enableGlobalFilter={false}
    />
  );
}
