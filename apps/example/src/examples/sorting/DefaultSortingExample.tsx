/**
 * Default Sorting Example
 * 
 * Demonstrates setting initial sort order using initialState.
 */

import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  sales: number;
  releaseDate: string;
}

const sampleProducts: Product[] = [
  { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299, rating: 4.5, sales: 150, releaseDate: '2024-01-15' },
  { id: 2, name: 'Wireless Mouse', category: 'Electronics', price: 29, rating: 4.2, sales: 420, releaseDate: '2024-02-20' },
  { id: 3, name: 'Office Chair', category: 'Furniture', price: 299, rating: 4.8, sales: 89, releaseDate: '2023-11-10' },
  { id: 4, name: 'Desk Lamp', category: 'Furniture', price: 45, rating: 4.0, sales: 230, releaseDate: '2024-03-05' },
  { id: 5, name: 'Notebook Set', category: 'Stationery', price: 15, rating: 4.3, sales: 550, releaseDate: '2024-01-25' },
  { id: 6, name: 'Pen Pack', category: 'Stationery', price: 8, rating: 3.9, sales: 780, releaseDate: '2023-12-15' },
];

const columns: DataTableColumn<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Product Name',
    size: 200,
    enableSorting: true,
  },
  {
    accessorKey: 'category',
    header: 'Category',
    size: 150,
    enableSorting: true,
  },
  {
    accessorKey: 'price',
    header: 'Price',
    size: 120,
    enableSorting: true,
    cell: ({ getValue }) => `$${getValue<number>()}`,
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    size: 100,
    enableSorting: true,
    sortDescFirst: true,
    cell: ({ getValue }) => `${getValue<number>().toFixed(1)}★`,
  },
  {
    accessorKey: 'sales',
    header: 'Sales',
    size: 100,
    enableSorting: true,
    sortDescFirst: true,
  },
  {
    accessorKey: 'releaseDate',
    header: 'Release Date',
    size: 130,
    enableSorting: true,
  },
];

export function DefaultSortingExample() {
  return (
    <DataTable
      columns={columns}
      data={sampleProducts}
      enableSorting={true}
      sortingMode="client"
      initialState={{
        sorting: [
          { id: 'rating', desc: true },
        ],
      }}
      enablePagination={false}
    />
  );
}
