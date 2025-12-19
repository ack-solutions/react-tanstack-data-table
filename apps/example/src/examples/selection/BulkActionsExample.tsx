/**
 * Bulk Actions Example
 * 
 * Demonstrates row selection with custom bulk actions toolbar.
 */

import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { Box, Button, Chip } from '@mui/material';
import { useCallback, useMemo } from 'react';
import type { SelectionState } from '@ackplus/react-tanstack-data-table';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive';
}

// Generate sample data
const generateEmployees = (count: number): Employee[] => {
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
  const names = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: names[i % names.length] || `Employee ${i + 1}`,
    email: `employee${i + 1}@company.com`,
    department: departments[i % departments.length],
    salary: 50000 + (i * 5000),
    status: Math.random() > 0.3 ? 'active' : 'inactive',
  }));
};

const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    size: 180,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    size: 220,
  },
  {
    accessorKey: 'department',
    header: 'Department',
    size: 150,
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    size: 120,
    cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 100,
    cell: ({ getValue }) => (
      <Chip
        label={getValue<string>()}
        color={getValue<string>() === 'active' ? 'success' : 'default'}
        size="small"
      />
    ),
  },
];

export function BulkActionsExample() {
  const sampleData = useMemo(() => generateEmployees(20), []);

 const handleSelectionChange = useCallback((newSelectionState: SelectionState) => {
    console.log('Selection changed:', newSelectionState);
  }, []);

  return (
    <DataTable
      columns={columns}
      data={sampleData}
      enableRowSelection={true}
      enablePagination={true}
      selectMode="page"
      initialState={{
        pagination: { pageIndex: 0, pageSize: 10 },
      }}
      enableBulkActions={true}
      onSelectionChange={handleSelectionChange}
      selectOnRowClick   
      bulkActions={(selection) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              const count = selection.type === 'include' 
                ? selection.ids.length 
                : 20 - selection.ids.length;
              alert(`Would export ${count} employees`);
            }}
          >
            Export Selected
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            onClick={() => {
              const count = selection.type === 'include' 
                ? selection.ids.length 
                : 20 - selection.ids.length;
              alert(`Would delete ${count} employees`);
            }}
          >
            Delete Selected
          </Button>
        </Box>
      )}
    />
  );
}
