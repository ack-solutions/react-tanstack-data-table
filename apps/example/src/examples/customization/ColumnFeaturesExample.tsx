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
      size: 150,
    },
    {
      accessorKey: 'email',
      header: 'Email',
      size: 200,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      size: 150,
    },
    {
      accessorKey: 'position',
      header: 'Position',
      size: 180,
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      size: 120,
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return `$${value.toLocaleString()}`;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 100,
    },
    {
      accessorKey: 'location',
      header: 'Location',
      size: 150,
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

