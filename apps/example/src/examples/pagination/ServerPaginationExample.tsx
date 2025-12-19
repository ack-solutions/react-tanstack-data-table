/**
 * Server-Side Pagination Example
 * 
 * Demonstrates server-side pagination with onFetchData callback.
 */

import { useState, useCallback, useMemo } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';

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

export function ServerPaginationExample() {
  const sampleData = useMemo(() => generateProducts(100), []);
  const [serverPaginationState, setServerPaginationState] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const handleFetchData = useCallback(async (filters: any) => {
    setServerPaginationState(filters.pagination);
    setCurrentPage(filters.pagination?.pageIndex || 0);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const pageIndex = filters.pagination?.pageIndex || 0;
    const pageSize = filters.pagination?.pageSize || 10;
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    
    return { 
      data: sampleData.slice(startIndex, endIndex), 
      total: sampleData.length 
    };
  }, [sampleData]);

  return (
    <>
      {serverPaginationState && (
        <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1, mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Current Server Pagination State
          </Typography>
          <Typography component="pre" variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
            {JSON.stringify(serverPaginationState || {}, null, 2)}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Current Page: {currentPage + 1}
          </Typography>
        </Box>
      )}

      <DataTable
        columns={columns}
        dataMode="server"
        onFetchData={handleFetchData}
        enablePagination={true}
        paginationMode="server"
        totalRow={sampleData.length}
      />
    </>
  );
}
