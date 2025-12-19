/**
 * Example 5: Text Wrapping
 * 
 * Demonstrates:
 * - Default text truncation with ellipsis
 * - Enabling text wrapping for long content
 * - Best practices for different column types
 */

import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { Employee, sampleEmployees } from './shared-data';

const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 150,
    wrapText: false, // Default: truncate with ellipsis
  },
  {
    accessorKey: 'description',
    header: 'Description',
    size: 300,
    wrapText: true, // Enable text wrapping for long content
  },
  {
    accessorKey: 'email',
    header: 'Email',
    size: 200,
    wrapText: false, // Keep email truncated
  },
];

export function TextWrappingExample() {
  return (
    <DataTable
      columns={columns}
      data={sampleEmployees}
      enablePagination={false}
      enableGlobalFilter={false}
    />
  );
}
