/**
 * Server-Side Sorting Example
 * 
 * Demonstrates server-side sorting with onFetchData callback.
 */

import { useState, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { CodeBlock } from '../../docs/features/common';

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

export function ServerSortingExample() {
  const [serverSortState, setServerSortState] = useState<any>(null);

  const handleFetchData = useCallback(async (filters: any) => {
    console.log('Fetching with sorting:', filters.sorting);
    setServerSortState(filters.sorting);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let sortedData = [...sampleProducts];
    
    // Apply sorting
    if (filters.sorting?.length) {
      sortedData.sort((a, b) => {
        for (const sort of filters.sorting) {
          const aValue = a[sort.id as keyof Product];
          const bValue = b[sort.id as keyof Product];
          
          if (aValue < bValue) return sort.desc ? 1 : -1;
          if (aValue > bValue) return sort.desc ? -1 : 1;
        }
        return 0;
      });
    }
    
    return { data: sortedData, total: sortedData.length };
  }, []);

  return (
    <>
      {serverSortState && (
        <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Current Server Sort State
          </Typography>
          <CodeBlock
            language="json"
            code={JSON.stringify(serverSortState || {}, null, 2)}
          />
        </Box>
      )}

      <DataTable
        columns={columns}
        dataMode="server"
        onFetchData={handleFetchData}
        enableSorting={true}
        sortingMode="server"
        enablePagination={false}
      />
    </>
  );
}
