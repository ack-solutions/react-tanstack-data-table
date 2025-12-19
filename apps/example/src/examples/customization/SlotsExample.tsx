import React from 'react';
import { DataTable, ColumnDef } from '@ackplus/react-tanstack-data-table';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { employees, Employee } from '../data';

/**
 * Custom Slots Example
 * 
 * Demonstrates extensive customization using the slots system:
 * - Custom toolbar
 * - Custom row rendering
 * - Custom cell rendering
 * - Custom empty state
 */
export function SlotsExample() {
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
      cell: ({ getValue }) => {
        const dept = getValue<string>();
        return <Chip label={dept} size="small" color="primary" />;
      },
    },
    {
      accessorKey: 'position',
      header: 'Position',
    },
    {
      accessorKey: 'salary',
      header: 'Salary',
      cell: ({ getValue }) => {
        const value = getValue<number>();
        return (
          <Typography variant="body2" fontWeight="bold" color="success.main">
            ${value.toLocaleString()}
          </Typography>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={employees}
      enableSorting
      enableGlobalFilter
      enablePagination
      idKey="id"
      slots={{
        toolbar: ({ children, ...props }) => (
          <Paper 
            elevation={2} 
            sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}
            {...props}
          >
            <Typography variant="h6" gutterBottom>
              Custom Toolbar
            </Typography>
            {children}
          </Paper>
        ),
        emptyRow: ({ colSpan, message }) => (
          <tr>
            <td colSpan={colSpan}>
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  {message || 'No data available'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your filters
                </Typography>
              </Box>
            </td>
          </tr>
        ),
      }}
    />
  );
}

