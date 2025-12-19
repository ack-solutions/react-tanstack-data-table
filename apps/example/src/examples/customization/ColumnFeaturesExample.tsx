import React from 'react';
import { DataTable, ColumnDef } from '@ackplus/react-tanstack-data-table';
import { employees, Employee } from '../data';

/**
 * Column Features Example
 * 
 * Demonstrates advanced column features:
 * - Column resizing
 * - Column reordering (dragging)
 * - Column pinning
 * - Column visibility
 */
export function ColumnFeaturesExample() {
  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      size: 300,
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'department',
      header: 'Department',
    },
    {
      accessorKey: 'position',
      header: 'Position',
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return `$${value.toLocaleString()}`;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      maxSize: 100,
    },
    {
      accessorKey: 'location',
      header: 'Location',
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={employees}
      enableColumnResizing
      enableColumnDragging
      enableColumnPinning
      enableColumnVisibility
      enableSorting
      enableGlobalFilter
      enablePagination
      idKey="id"
    />
  );
}

