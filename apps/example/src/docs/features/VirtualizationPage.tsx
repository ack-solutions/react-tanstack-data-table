import { Box, Typography, Paper, Alert, Divider, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FeatureLayout, CodeBlock, FeatureMetadataTable, ExampleViewer } from './common';
import { getVirtualizationTableGroup } from './data/virtualization-metadata';
import { VirtualizationPerformanceDemo } from '../../examples/virtualization';

// Import code as raw string
import virtualizationDemoCode from '../../examples/virtualization/VirtualizationPerformanceDemo.tsx?raw';

export function VirtualizationPage() {
  const virtualizationTableGroup = getVirtualizationTableGroup('virtualization-table-props');

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
              Don&apos;t Use Virtualization When:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>You have less than 500 rows</li>
              <li>You&apos;re using pagination (not compatible)</li>
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

      <ExampleViewer
        exampleId="virtualization-performance"
        code={virtualizationDemoCode}
        component={<VirtualizationPerformanceDemo />}
      />

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
