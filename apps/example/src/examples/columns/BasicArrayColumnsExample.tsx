/**
 * Example 2: Basic Columns using Normal Array
 * 
 * Demonstrates:
 * - Using plain object arrays with DataTableColumn type
 * - accessorKey for data binding
 * - Simpler syntax without column helper
 */

import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { Employee, sampleEmployees } from './shared-data';

const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 200,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    size: 250,
  },
  {
    accessorKey: 'department',
    header: 'Department',
    size: 150,
  },
];

export function BasicArrayColumnsExample() {
  return (
    <DataTable
      columns={columns}
      data={sampleEmployees}
      enablePagination={false}
      enableGlobalFilter={false}
    />
  );
}
