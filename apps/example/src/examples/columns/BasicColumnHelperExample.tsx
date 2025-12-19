/**
 * Example 1: Basic Columns using Column Helper
 * 
 * Demonstrates:
 * - Using TanStack's createColumnHelper for type-safe column definitions
 * - Basic column properties (header, size)
 * - Clean, simple table setup
 */

import { DataTable } from '@ackplus/react-tanstack-data-table';
import { createColumnHelper } from '@tanstack/react-table';
import { Employee, sampleEmployees } from './shared-data';

const columnHelper = createColumnHelper<Employee>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    size: 200,
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    size: 250,
  }),
  columnHelper.accessor('department', {
    header: 'Department',
    size: 150,
  }),
];

export function BasicColumnHelperExample() {
  return (
    <DataTable
      columns={columns}
      data={sampleEmployees}
      enablePagination={false}
      enableGlobalFilter={false}
    />
  );
}
