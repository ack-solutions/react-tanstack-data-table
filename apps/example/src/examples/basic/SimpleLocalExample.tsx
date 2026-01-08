import React from 'react';
import { DataTable, ColumnDef } from '@ackplus/react-tanstack-data-table';
import { employees, Employee } from '../data';

/**
 * Simple Local Data Example
 * 
 * Basic example demonstrating client-side data table with:
 * - Local data (no server-side fetching)
 * - Sorting, filtering, and pagination
 * - Row selection
 */
export function SimpleLocalExample() {
  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      enableSorting: true,
      enableGlobalFilter: true,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      enableSorting: true,
    },
    {
      accessorKey: 'position',
      header: 'Position',
      enableSorting: true,
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      enableSorting: true,
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return `$${value.toLocaleString()}`;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ getValue }) => {
        const status = getValue<string>();
        return status.charAt(0).toUpperCase() + status.slice(1);
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={employees}
      enableSorting
      enableGlobalFilter
      enablePagination
      enableRowSelection
      idKey="id"
    />
  );
}

