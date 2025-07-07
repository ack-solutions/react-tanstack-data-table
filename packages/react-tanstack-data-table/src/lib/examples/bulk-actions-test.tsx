import React, { useState, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { DataTable } from '../components';
import type { SelectionState } from '../features';

// Simple test data
interface TestItem {
    id: number;
    name: string;
    value: number;
}

const testData: TestItem[] = [
    { id: 1, name: 'Item 1', value: 100 },
    { id: 2, name: 'Item 2', value: 200 },
    { id: 3, name: 'Item 3', value: 300 },
    { id: 4, name: 'Item 4', value: 400 },
    { id: 5, name: 'Item 5', value: 500 },
];

const columns = [
    {
        accessorKey: 'name',
        header: 'Name',
        size: 150,
    },
    {
        accessorKey: 'value',
        header: 'Value',
        size: 100,
    },
];

export function BulkActionsTest() {
    const [selectionInfo, setSelectionInfo] = useState<string>('No selection');

    const handleSelectionChange = (selection: SelectionState) => {
        const count = selection.type === 'include' 
            ? selection.ids.length 
            : testData.length - selection.ids.length;
        
        setSelectionInfo(`Selected: ${count} items (${selection.type} mode) - IDs: [${selection.ids.join(', ')}]`);
    };

    const bulkActions = useCallback((selectionState: SelectionState) => {
        const selectedCount = selectionState.type === 'include' 
            ? selectionState.ids.length 
            : testData.length - selectionState.ids.length;

        return (
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                        alert(`Action on ${selectedCount} items. Selection state: ${JSON.stringify(selectionState, null, 2)}`);
                    }}
                >
                    Test Action ({selectedCount})
                </Button>
            </Box>
        );
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Bulk Actions Test
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                This example tests that bulk actions work without infinite loops.
            </Typography>

            <Typography variant="body2" sx={{ mb: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                <strong>Current Selection:</strong> {selectionInfo}
            </Typography>

            <DataTable
                data={testData}
                totalRow={testData.length}
                columns={columns}
                
                // Enable selection and bulk actions
                enableRowSelection={true}
                enableMultiRowSelection={true}
                enableBulkActions={true}
                bulkActions={bulkActions}
                onSelectionChange={handleSelectionChange}
                
                // Basic features
                enablePagination={false}
                enableSorting={true}
                enableGlobalFilter={false}
                
                // Fit to screen
                fitToScreen={true}
            />
            
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'success.light', borderRadius: 1 }}>
                <Typography variant="body2" color="success.dark">
                    ✅ If you can see this and select rows without the page freezing, the infinite loop issue is fixed!
                </Typography>
            </Box>
        </Box>
    );
} 