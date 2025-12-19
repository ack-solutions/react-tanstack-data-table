/**
 * Basic Filtering Example
 * 
 * Demonstrates basic column filtering functionality.
 */

import { useMemo } from 'react';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
}

const generateProducts = (count: number): Product[] => {
  const categories = ['Electronics', 'Furniture', 'Stationery', 'Clothing'];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    category: categories[i % categories.length],
    price: Math.floor(Math.random() * 1000) + 10,
    inStock: Math.random() > 0.3,
  }));
};

const columns: DataTableColumn<Product>[] = [
  { accessorKey: 'id', header: 'ID', size: 80 },
  { accessorKey: 'name', header: 'Product Name', size: 200, enableColumnFilter: true },
  {
    accessorKey: 'category',
    header: 'Category',
    size: 150,
    enableColumnFilter: true,
    type: 'select',
    options: [
      { label: 'Electronics', value: 'Electronics' },
      { label: 'Furniture', value: 'Furniture' },
      { label: 'Stationery', value: 'Stationery' },
      { label: 'Clothing', value: 'Clothing' },
    ],
  },
  { accessorKey: 'price', header: 'Price', size: 120, enableColumnFilter: true, type: 'number' },
  { accessorKey: 'inStock', header: 'In Stock', size: 100, enableColumnFilter: true, type: 'boolean' },
];

export function BasicFilteringExample() {
  const data = useMemo(() => generateProducts(50), []);

  return (
    <DataTable
      columns={columns}
      data={data}
      enableColumnFilters={true}
      enableGlobalFilter={true}
      initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
    />
  );
}
