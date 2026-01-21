import React, { useState } from 'react';
import { DataTable, ColumnDef, MenuDropdown } from '@ackplus/react-tanstack-data-table';
import { employees, Employee } from '../data';
import { Button, Menu, MenuItem } from '@mui/material';
import { MoreVertOutlined } from '@mui/icons-material';

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
    {
      accessorKey: 'actions',
      header: 'Action',
      enableSorting: false,
      maxSize: 100,
      cell: ({ getValue }) => {
        return (
          <MenuDropdown
            anchor={() => (
              <Button>
                <MoreVertOutlined />
              </Button>
            )}
          >
            <MenuItem onClick={() => console.log('Edit')}>Edit</MenuItem>
            <MenuItem onClick={() => console.log('Delete')}>Delete</MenuItem>
          </MenuDropdown>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={employees}
      enableSorting
      fitToScreen
      enableColumnResizing
      enableColumnDragging
      enableGlobalFilter
      enablePagination
      enableColumnPinning
      enableRowSelection
      idKey="id"
    />
  );
}

