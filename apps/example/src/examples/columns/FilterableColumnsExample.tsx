/**
 * Example 6: Filterable Columns with Select Options
 * 
 * Demonstrates:
 * - Column filtering with dropdown select
 * - Filter type configuration
 * - Options array for select filters
 * - Multiple filterable columns
 */

import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { Chip } from '@mui/material';
import { Employee, sampleEmployees, departmentOptions, statusOptions } from './shared-data';

const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 200,
    filterable: true,
    type: 'text',
  },
  {
    accessorKey: 'department',
    header: 'Department',
    size: 150,
    filterable: true, // Enable column filter
    type: 'select', // Use select filter
    options: departmentOptions, // Filter dropdown options
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    size: 150,
    align: 'right',
    filterable: true,
    type: 'number',
    cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    align: 'center',
    filterable: true,
    type: 'select',
    options: statusOptions,
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
];

export function FilterableColumnsExample() {
  return (
    <DataTable
      columns={columns}
      data={sampleEmployees}
      enableColumnFilter={true} // Enable column filter UI
      enablePagination={false}
    />
  );
}
