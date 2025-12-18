import React from 'react';
import { DataTable, ColumnDef } from '@ackplus/react-tanstack-data-table';
import { Chip } from '@mui/material';
import { products, Product } from '../data';

/**
 * Products Table Example
 * 
 * Example showing:
 * - Custom cell rendering with MUI components
 * - Status badges
 * - Number formatting
 */
export function ProductsExample() {
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product Name',
      enableSorting: true,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      enableSorting: true,
    },
    {
      accessorKey: 'brand',
      header: 'Brand',
      enableSorting: true,
    },
    {
      accessorKey: 'price',
      header: 'Price',
      enableSorting: true,
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return `$${value.toFixed(2)}`;
      },
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      enableSorting: true,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({ getValue }) => {
        const status = getValue<string>();
        const color = status === 'in_stock' ? 'success' : 'error';
        const label = status === 'in_stock' ? 'In Stock' : 'Out of Stock';
        return <Chip label={label} color={color} size="small" />;
      },
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      enableSorting: true,
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return `${value.toFixed(1)} ⭐`;
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      enableSorting
      enableGlobalFilter
      enablePagination
      idKey="id"
    />
  );
}

