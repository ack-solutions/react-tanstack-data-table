/**
 * Example 8: All Column Features Combined
 * 
 * Demonstrates:
 * - All advanced column features working together
 * - Sorting, filtering, alignment, custom rendering
 * - Footer aggregation
 * - Column visibility control
 */

import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { Typography, Chip } from '@mui/material';
import { Employee, sampleEmployees, departmentOptions, statusOptions } from './shared-data';

const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 200,
    enableSorting: true,
    enableGlobalFilter: true,
    enablePinning: true,
    filterable: true,
    type: 'text',
    cell: ({ getValue }) => (
      <Typography sx={{ fontWeight: 600 }}>
        {getValue<string>()}
      </Typography>
    ),
  },
  {
    accessorKey: 'department',
    header: 'Department',
    size: 150,
    align: 'left',
    filterable: true,
    type: 'select',
    options: departmentOptions,
    enableSorting: true,
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    size: 150,
    align: 'right',
    filterable: true,
    type: 'number',
    hideInExport: false,
    enableSorting: true,
    cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
    footer: ({ table }) => {
      const total = table.getFilteredRowModel().rows
        .reduce((sum, row) => sum + (row.original.salary || 0), 0);
      return (
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Total: ${total.toLocaleString()}
        </Typography>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 120,
    align: 'center',
    filterable: true,
    type: 'select',
    options: statusOptions,
    enableSorting: true,
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
    accessorKey: 'isActive',
    header: 'Active',
    size: 100,
    align: 'center',
    filterable: true,
    type: 'boolean',
    enableSorting: true,
    cell: ({ getValue }) => (
      <Chip 
        label={getValue<boolean>() ? 'Yes' : 'No'} 
        color={getValue<boolean>() ? 'success' : 'default'}
        size="small"
      />
    ),
  },
];

export function AdvancedColumnsExample() {
  return (
    <DataTable
      columns={columns}
      data={sampleEmployees}
      enableColumnFilter={true}
      enableSorting={true}
      enableGlobalFilter={true}
      enableColumnVisibility={true}
      enablePagination={false}
    />
  );
}
