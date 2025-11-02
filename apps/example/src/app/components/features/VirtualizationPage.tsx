import { Box, Typography, Paper, Alert, Divider, Stack, Button, ButtonGroup, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataTable, DataTableColumn } from '@ackplus/react-tanstack-data-table';
import { useState, useMemo } from 'react';
import { FeatureLayout, CodeBlock, FeatureMetadataTable } from './common';
import { virtualizationTableGroups, getVirtualizationTableGroup } from './data/virtualization-metadata';

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

export function VirtualizationPage() {
  const [datasetSize, setDatasetSize] = useState(1000);
  const [enableVirtualization, setEnableVirtualization] = useState(true);
  const virtualizationTableGroup = getVirtualizationTableGroup('virtualization-table-props');

  // Generate data based on selected size
  const data = useMemo(() => generateSampleData(datasetSize), [datasetSize]);

  // Define columns
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
    { size: 10000, label: '10K rows' },
  ];

  return (
    <FeatureLayout
      title="Virtualization"
      description="Virtualization improves performance when working with large datasets by only rendering visible rows in the viewport. This dramatically reduces DOM nodes and improves scrolling performance."
    >
      <Divider sx={{ my: 4 }} />

      {/* What is Virtualization */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        What is Virtualization?
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Row Virtualization
        </Typography>
        <Typography variant="body2">
          Instead of rendering all rows at once, virtualization only renders the rows visible in the viewport 
          plus a small buffer. As you scroll, rows are dynamically added and removed from the DOM.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          When to Use Virtualization
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'success.main' }}>
              Tip: Use Virtualization When:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>You have 1,000+ rows of data</li>
              <li>Scrolling performance is slow</li>
              <li>You want to display all data without pagination</li>
              <li>Memory usage needs to be optimized</li>
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'error.main' }}>
              Don't Use Virtualization When:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>You have less than 500 rows</li>
              <li>You're using pagination (not compatible)</li>
              <li>Rows have dynamic or varying heights</li>
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Basic Usage */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Basic Usage
      </Typography>
      
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Enable Virtualization
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Simply set <code>enableVirtualization</code> to true and disable pagination.
        </Typography>
        <CodeBlock
          language="tsx"
          code={`<DataTable
  columns={columns}
  data={largeDataset}
  enableVirtualization={true}     // Enable virtualization
  estimateRowHeight={52}          // Estimate row height in pixels
  enablePagination={false}        // Must disable pagination
  maxHeight="500px"               // Set container height
  enableStickyHeaderOrFooter      // Keep header visible
/>`}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Interactive Demo */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Interactive Performance Demo
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Performance Test
        </Typography>
        <Typography variant="body2">
          Try toggling virtualization on/off with different dataset sizes to see the performance difference. 
          With 5K+ rows, virtualization makes a dramatic difference in scrolling smoothness.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
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
              Warning: Large dataset without virtualization may cause performance issues
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
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Configuration Options */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Virtualization Props Reference
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            DataTable Virtualization Props
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable
              items={virtualizationTableGroup?.items ?? []}
              includePossibleValues
            />
          </Box>

          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Example
            </Typography>
            <CodeBlock
              language="tsx"
              code={`<DataTable
  columns={columns}
  data={largeDataset}
  enableVirtualization={true}          // Enable virtualization
  estimateRowHeight={52}                // Estimated row height in pixels
  maxHeight="500px"                     // Fixed container height
  enableStickyHeaderOrFooter={true}     // Keep header visible
  enablePagination={false}               // Must disable pagination
/>`}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 4 }} />

      {/* Best Practices */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Best Practices
      </Typography>
      
      <Paper elevation={1} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Set Accurate Row Height
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Provide an accurate <code>estimateRowHeight</code> value. If your rows have custom heights, 
              use the average height for best results.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Use Fixed Container Height
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Always set a fixed <code>maxHeight</code> on the table container. Virtualization requires 
              a fixed viewport to calculate which rows to render.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Disable Pagination
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Virtualization and pagination are mutually exclusive. Set <code>enablePagination=false</code> 
              when using virtualization.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Enable Sticky Headers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use <code>enableStickyHeaderOrFooter</code> to keep column headers visible while scrolling 
              through large datasets.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Warning: Avoid Dynamic Row Heights
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Virtualization works best with consistent row heights. Avoid expandable content or 
              multi-line cells that cause varying row heights.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </FeatureLayout>
  );
}
