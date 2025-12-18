import React, { useState, useRef } from 'react';
import { DataTable, ColumnDef, DataTableApi, SelectionState } from '@ackplus/react-tanstack-data-table';
import { Box, Typography, Chip, Button, Stack } from '@mui/material';
import { employees, Employee } from '../data';

/**
 * Row Selection Example
 * 
 * Demonstrates:
 * - Row selection (single and multi)
 * - Selection state management
 * - Bulk actions
 * - Selection mode (page vs all)
 */
export function SelectionExample() {
  const apiRef = useRef<DataTableApi<Employee>>(null);
  const [selection, setSelection] = useState<SelectionState>({ ids: [], type: 'include' });

  const handleSelectionChange = (newSelection: SelectionState) => {
    setSelection(newSelection);
  };

  const handleBulkDelete = () => {
    const selectedIds = selection.ids;
    if (selectedIds.length === 0) return;
    
    // In a real app, you would call an API here
    console.log('Deleting rows:', selectedIds);
    alert(`Would delete ${selectedIds.length} row(s)`);
  };

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'department',
      header: 'Department',
    },
    {
      accessorKey: 'position',
      header: 'Position',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue<string>();
        return (
          <Chip 
            label={status} 
            color={status === 'active' ? 'success' : 'default'} 
            size="small" 
          />
        );
      },
    },
  ];

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Selected: {selection.ids.length} row(s)
        </Typography>
        {selection.ids.length > 0 && (
          <Button 
            variant="contained" 
            color="error" 
            size="small"
            onClick={handleBulkDelete}
          >
            Delete Selected
          </Button>
        )}
      </Stack>
      
      <DataTable
        ref={apiRef}
        columns={columns}
        data={employees}
        enableRowSelection
        enableMultiRowSelection
        selectMode="page"
        onSelectionChange={handleSelectionChange}
        enableBulkActions
        bulkActions={(selectionState) => (
          <Box sx={{ p: 1 }}>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => console.log('Bulk action:', selectionState)}
            >
              Custom Action ({selectionState.ids.length})
            </Button>
          </Box>
        )}
        idKey="id"
      />
    </Box>
  );
}

