/**
 * Basic Export Example
 * 
 * Demonstrates basic CSV export functionality.
 */

import { useMemo } from 'react';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

const generateProducts = (count: number): Product[] => {
  const categories = ['Electronics', 'Furniture', 'Stationery'];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    category: categories[i % categories.length],
    price: Math.floor(Math.random() * 1000) + 10,
    stock: Math.floor(Math.random() * 100),
  }));
};

const columns: DataTableColumn<Product>[] = [
  { accessorKey: 'id', header: 'ID', size: 80 },
  { accessorKey: 'name', header: 'Product Name', size: 200 },
  { accessorKey: 'category', header: 'Category', size: 150 },
  { accessorKey: 'price', header: 'Price', size: 120, cell: ({ getValue }) => `$${getValue<number>()}` },
  { accessorKey: 'stock', header: 'Stock', size: 100 },
];

export function BasicExportExample() {
  const data = useMemo(() => generateProducts(50), []);

  return (
    <DataTable
      columns={columns}
      data={data}
      enableExport={true}
      enablePagination={true}
      initialState={{ pagination: { pageIndex: 0, pageSize: 10 } }}
    />
  );
}
