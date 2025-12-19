/**
 * Conditional Selection Example
 * 
 * Demonstrates selective row selection based on custom criteria.
 */

import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { Chip } from '@mui/material';
import { useCallback, useMemo } from 'react';

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

export function ConditionalSelectionExample() {
  const sampleData = useMemo(() => generateEmployees(15), []);

  // Row selectability - only active employees with salary < 100k can be selected
  const isRowSelectable = useCallback(({ row }: { row: Employee; id: string }) => {
    return row.status === 'active' && row.salary < 100000;
  }, []);

  return (
    <DataTable
      columns={columns}
      data={sampleData}
      enableRowSelection={true}
      enablePagination={false}
      isRowSelectable={isRowSelectable}
    />
  );
}
