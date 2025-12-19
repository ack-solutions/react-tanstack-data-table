/**
 * Example 3: Custom Cell Rendering
 * 
 * Demonstrates:
 * - Custom cell renderers with JSX
 * - Typography customization
 * - Chip components for visual styling
 * - Number formatting
 */

import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { Typography, Chip } from '@mui/material';
import { Employee, sampleEmployees } from './shared-data';

const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Employee Name',
    size: 200,
    cell: ({ getValue }) => (
      <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>
        {getValue<string>()}
      </Typography>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email Address',
    size: 250,
    cell: ({ getValue }) => (
      <Typography 
        sx={{ 
          color: 'primary.main', 
          fontSize: '0.875rem',
          fontFamily: 'monospace',
        }}
      >
        {getValue<string>()}
      </Typography>
    ),
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
    size: 150,
    align: 'right',
    cell: ({ getValue }) => (
      <Chip 
        label={`$${getValue<number>().toLocaleString()}`} 
        color="success" 
        size="small" 
        variant="outlined"
      />
    ),
  },
];

export function CustomCellRenderingExample() {
  return (
    <DataTable
      columns={columns}
      data={sampleEmployees}
      enablePagination={false}
      enableGlobalFilter={false}
    />
  );
}
