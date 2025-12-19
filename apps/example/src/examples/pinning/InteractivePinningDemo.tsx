/**
 * Interactive Pinning Demo
 * 
 * Demonstrates column pinning with horizontal scrolling enabled.
 */

import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { Chip } from '@mui/material';
import { useRef } from 'react';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  status: 'active' | 'inactive';
  performanceScore: number;
}

const sampleEmployees: Employee[] = [
  { id: 1, name: 'John Doe', email: 'john@company.com', department: 'Engineering', position: 'Senior Developer', salary: 95000, status: 'active', performanceScore: 92 },
  { id: 2, name: 'Jane Smith', email: 'jane@company.com', department: 'Marketing', position: 'Marketing Manager', salary: 85000, status: 'active', performanceScore: 88 },
  { id: 3, name: 'Bob Johnson', email: 'bob@company.com', department: 'Sales', position: 'Sales Rep', salary: 65000, status: 'inactive', performanceScore: 75 },
  { id: 4, name: 'Alice Williams', email: 'alice@company.com', department: 'HR', position: 'HR Specialist', salary: 60000, status: 'active', performanceScore: 85 },
  { id: 5, name: 'Charlie Brown', email: 'charlie@company.com', department: 'Finance', position: 'Financial Analyst', salary: 75000, status: 'active', performanceScore: 90 },
];

const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 80,
    enablePinning: true,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    size: 180,
    enablePinning: true,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    size: 220,
    enablePinning: true,
  },
  {
    accessorKey: 'department',
    header: 'Department',
    size: 150,
    enablePinning: true,
  },
  {
    accessorKey: 'position',
    header: 'Position',
    size: 180,
    enablePinning: true,
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    size: 120,
    enablePinning: true,
    cell: ({ getValue }) => `$${getValue<number>().toLocaleString()}`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 100,
    enablePinning: true,
    cell: ({ getValue }) => (
      <Chip
        label={getValue<string>()}
        color={getValue<string>() === 'active' ? 'success' : 'default'}
        size="small"
      />
    ),
  },
  {
    accessorKey: 'performanceScore',
    header: 'Performance',
    size: 130,
    enablePinning: true,
    cell: ({ getValue }) => `${getValue<number>()}%`,
  },
];

export function InteractivePinningDemo() {
  const tableRef = useRef<any>(null);

  return (
    <DataTable
      ref={tableRef}
      columns={columns}
      data={sampleEmployees}
      enableColumnPinning={true}
      enablePagination={false}
      initialState={{
        columnPinning: {
          left: ['id', 'name'],
          right: ['performanceScore'],
        },
      }}
      fitToScreen={false}  // Allow horizontal scrolling
    />
  );
}
