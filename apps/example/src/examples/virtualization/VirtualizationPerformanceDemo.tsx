/**
 * Virtualization Performance Demo
 * 
 * Interactive example demonstrating virtualization performance with different dataset sizes.
 */

import { useState, useMemo } from 'react';
import { Box, Typography, Button, ButtonGroup, Chip } from '@mui/material';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  salary: number;
  status: 'active' | 'inactive';
}

// Generate sample data
const generateSampleData = (count: number): Employee[] => {
  const departments = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance'];
  const statuses: ('active' | 'inactive')[] = ['active', 'inactive'];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Employee ${i + 1}`,
    email: `employee${i + 1}@company.com`,
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: Math.floor(Math.random() * 100000) + 40000,
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};

const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 80,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    size: 150,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    size: 200,
  },
  {
    accessorKey: 'department',
    header: 'Department',
    size: 120,
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

const datasetOptions = [
  { size: 100, label: '100 rows' },
  { size: 500, label: '500 rows' },
  { size: 1000, label: '1K rows' },
  { size: 5000, label: '5K rows' },
  { size: 10000, label: '10K rows'},
];

export function VirtualizationPerformanceDemo() {
  const [datasetSize, setDatasetSize] = useState(1000);
  const [enableVirtualization, setEnableVirtualization] = useState(true);

  // Generate data based on selected size
  const data = useMemo(() => generateSampleData(datasetSize), [datasetSize]);

  return (
    <>
      {/* Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Dataset Size:
        </Typography>
        <ButtonGroup size="small">
          {datasetOptions.map((option) => (
            <Button
              key={option.size}
              variant={datasetSize === option.size ? 'contained' : 'outlined'}
              onClick={() => setDatasetSize(option.size)}
            >
              {option.label}
            </Button>
          ))}
        </ButtonGroup>

        <Button
          variant={enableVirtualization ? 'contained' : 'outlined'}
          onClick={() => setEnableVirtualization(!enableVirtualization)}
          color={enableVirtualization ? 'primary' : 'secondary'}
          sx={{ ml: 2 }}
        >
          Virtualization: {enableVirtualization ? 'ON' : 'OFF'}
        </Button>
      </Box>

      {/* Performance Info */}
      <Box
        sx={{
          mb: 2,
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          Current Configuration:
        </Typography>
        <Typography variant="body2">
          • Dataset: {datasetSize.toLocaleString()} rows × {columns.length} columns
        </Typography>
        <Typography variant="body2">
          • Virtualization: {enableVirtualization ? 'Enabled' : 'Disabled'}
        </Typography>
        <Typography variant="body2">
          • Pagination: {enableVirtualization ? 'Disabled (not compatible)' : 'Enabled'}
        </Typography>
        {datasetSize >= 1000 && !enableVirtualization && (
          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
            ⚠️ Warning: Large dataset without virtualization may cause performance issues
          </Typography>
        )}
      </Box>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={data}
        enableRowSelection
        enableSorting
        enableGlobalFilter
        enableHover
        enableStripes
        fitToScreen
        maxHeight="500px"
        enableStickyHeaderOrFooter
        enableVirtualization={enableVirtualization}
        estimateRowHeight={52}
        enablePagination={!enableVirtualization}
      />
    </>
  );
}
