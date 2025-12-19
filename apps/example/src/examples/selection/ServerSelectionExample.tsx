/**
 * Server-Side Selection Example
 * 
 * Demonstrates selection with server-side data mode.
 */

import { useState, useCallback, useMemo } from 'react';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { Box, Button, Chip } from '@mui/material';
import type { SelectionState } from '@ackplus/react-tanstack-data-table';
import { CodeBlock } from '../../docs/features/common';

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

export function ServerSelectionExample() {
  const sampleData = useMemo(() => generateEmployees(50), []);
  const [serverSelectionState, setServerSelectionState] = useState<any>(null);

  // Server-side fetch handler
  const handleFetchData = useCallback(async (filters: any) => {
    console.log('Fetching data with filters:', filters);
    setServerSelectionState(filters);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { pageIndex = 0, pageSize = 10 } = filters.pagination || {};
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    
    return {
      data: sampleData.slice(start, end),
      total: sampleData.length,
    };
  }, [sampleData]);

  const handleSelectionChange = useCallback((newSelectionState: SelectionState) => {
    console.log('Selection changed:', newSelectionState);
  }, []);

  return (
    <>
      {serverSelectionState && (
        <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1, mb: 2 }}>
          <CodeBlock
            language="json"
            code={JSON.stringify(serverSelectionState, null, 2)}
          />
        </Box>
      )}

      <DataTable
        columns={columns}
        dataMode="server"
        totalRow={sampleData.length}
        onFetchData={handleFetchData}
        enableRowSelection={true}
        selectMode="all"
        onSelectionChange={handleSelectionChange}
        enablePagination={true}
        initialState={{
          pagination: { pageIndex: 0, pageSize: 10 },
        }}
        enableBulkActions={true}
        bulkActions={(selection) => (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip 
              label={`Selection: ${selection.type}`} 
              size="small" 
              color="primary"
            />
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                const count = selection.type === 'include' 
                  ? selection.ids.length 
                  : sampleData.length - selection.ids.length;
                alert(`Server export ${count} rows with selection:\n${JSON.stringify(selection, null, 2)}`);
              }}
            >
              Export Selected
            </Button>
          </Box>
        )}
      />
    </>
  );
}
