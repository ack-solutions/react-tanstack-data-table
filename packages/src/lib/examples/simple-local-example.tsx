import React, { useCallback } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { DataTable } from '../components';

// Simple data interface
interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    inStock: boolean;
    rating: number;
}

// Simple static data
const products: Product[] = [
    { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299, inStock: true, rating: 4.5 },
    { id: 2, name: 'Wireless Mouse', category: 'Electronics', price: 29, inStock: true, rating: 4.2 },
    { id: 3, name: 'Coffee Mug', category: 'Kitchen', price: 12, inStock: false, rating: 4.8 },
    { id: 4, name: 'Desk Chair', category: 'Furniture', price: 189, inStock: true, rating: 4.0 },
    { id: 5, name: 'Notebook Set', category: 'Office', price: 15, inStock: true, rating: 4.3 },
    { id: 6, name: 'Water Bottle', category: 'Kitchen', price: 22, inStock: true, rating: 4.7 },
    { id: 7, name: 'Monitor Stand', category: 'Electronics', price: 45, inStock: false, rating: 4.1 },
    { id: 8, name: 'Pen Set', category: 'Office', price: 8, inStock: true, rating: 3.9 },
    { id: 9, name: 'Table Lamp', category: 'Furniture', price: 67, inStock: true, rating: 4.4 },
    { id: 10, name: 'Phone Case', category: 'Electronics', price: 25, inStock: true, rating: 4.6 },
];

// Simple column definitions
const columns = [
    {
        accessorKey: 'name',
        header: 'Product Name',
        size: 180,
    },
    {
        accessorKey: 'category',
        header: 'Category',
        size: 120,
        cell: ({ getValue }: { getValue: () => any }) => (
            <Chip 
                label={getValue() as string} 
                size="small" 
                variant="outlined"
                color="primary"
            />
        ),
    },
    {
        accessorKey: 'price',
        header: 'Price',
        size: 100,
        cell: ({ getValue }: { getValue: () => any }) => 
            `$${(getValue() as number).toFixed(2)}`,
    },
    {
        accessorKey: 'inStock',
        header: 'In Stock',
        size: 100,
        cell: ({ getValue }: { getValue: () => any }) => (
            <Chip
                label={getValue() ? 'Yes' : 'No'}
                color={getValue() ? 'success' : 'error'}
                size="small"
            />
        ),
    },
    {
        accessorKey: 'rating',
        header: 'Rating',
        size: 100,
        cell: ({ getValue }: { getValue: () => any }) => 
            `⭐ ${(getValue() as number).toFixed(1)}`,
    },
];

export function SimpleLocalExample() {
    // Memoize bulkActions function to prevent infinite re-renders
    const bulkActions = useCallback((selectionState: any) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
            <button 
                onClick={() => {
                    const count = selectionState.type === 'include' 
                        ? selectionState.ids.length 
                        : products.length - selectionState.ids.length;
                    alert(`Selected ${count} products (${selectionState.type} mode)`);
                }}
                style={{ 
                    padding: '8px 16px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc',
                    background: '#f5f5f5',
                    cursor: 'pointer'
                }}
            >
                📊 Show Count
            </button>
            <button 
                onClick={() => {
                    let selectedProducts: Product[];
                    if (selectionState.type === 'include') {
                        selectedProducts = products.filter(p => selectionState.ids.includes(p.id.toString()));
                    } else {
                        selectedProducts = products.filter(p => !selectionState.ids.includes(p.id.toString()));
                    }
                    const total = selectedProducts.reduce((sum, product) => sum + product.price, 0);
                    alert(`Total value: $${total.toFixed(2)}`);
                }}
                style={{ 
                    padding: '8px 16px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc',
                    background: '#f5f5f5',
                    cursor: 'pointer'
                }}
            >
                💰 Calculate Total
            </button>
        </Box>
    ), []);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Simple Local Data Example
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                A basic example using static local data with no API calls.
                Demonstrates essential DataTable features with minimal setup.
            </Typography>

            <DataTable
                data={products}
                totalRow={products.length}
                columns={columns}
                //Enable basic features
                enableSorting={true}
                enableGlobalFilter={true}
                enableColumnFilters={true}
                enablePagination={true}
                
                enableRowSelection
                
                // Initial state
                initialState={{
                    pagination: {
                        pageIndex: 0,
                        pageSize: 5,
                    },
                }}
                
                // Simple bulk actions
                enableBulkActions={true}
                bulkActions={bulkActions}
                
                // Fit to screen
                fitToScreen={true}
            />
            
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                    💡 <strong>This example demonstrates:</strong>
                    <br />
                    • Basic table with static local data
                    <br />
                    • Simple column definitions with custom cell renderers
                    <br />
                    • Sorting, filtering, and pagination
                    <br />
                    • Row selection with bulk actions
                    <br />
                    • Minimal setup - perfect for getting started
                </Typography>
            </Box>
        </Box>
    );
} 