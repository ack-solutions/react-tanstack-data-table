/**
 * Custom Page Size Options Example
 * 
 * Demonstrates custom rows per page options.
 */

import { useMemo } from 'react';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { Chip } from '@mui/material';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  rating: number;
}

const generateProducts = (count: number): Product[] => {
  const categories = ['Electronics', 'Furniture', 'Stationery', 'Clothing', 'Sports'];
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Product ${i + 1}`,
    category: categories[Math.floor(Math.random() * categories.length)],
    price: Math.floor(Math.random() * 1000) + 10,
    inStock: Math.random() > 0.3,
    rating: Math.floor(Math.random() * 50) / 10,
  }));
};

const columns: DataTableColumn<Product>[] = [
  { accessorKey: 'id', header: 'ID', size: 80 },
  { accessorKey: 'name', header: 'Product Name', size: 200 },
  {
    accessorKey: 'category',
    header: 'Category',
    size: 150,
    cell: ({ getValue }) => <Chip label={getValue<string>()} size="small" variant="outlined" />,
  },
  { accessorKey: 'price', header: 'Price', size: 120, cell: ({ getValue }) => `$${getValue<number>()}` },
  {
    accessorKey: 'inStock',
    header: 'In Stock',
    size: 100,
    cell: ({ getValue }) => (
      <Chip label={getValue<boolean>() ? 'Yes' : 'No'} color={getValue<boolean>() ? 'success' : 'error'} size="small" />
    ),
  },
  { accessorKey: 'rating', header: 'Rating', size: 100, cell: ({ getValue }) => `${getValue<number>().toFixed(1)}⭐` },
];

export function CustomPageSizeExample() {
  const sampleData = useMemo(() => generateProducts(100), []);

  return (
    <DataTable
      columns={columns}
      data={sampleData}
      enablePagination={true}
      initialState={{
        pagination: { pageIndex: 0, pageSize: 25 },
      }}
      slotProps={{
        pagination: {
          rowsPerPageOptions: [10, 25, 50, 100],
          labelRowsPerPage: 'Items:',
        },
      }}
    />
  );
}
