/* eslint-disable react/no-unescaped-entities */
import { Box, Typography, Paper, Alert, Divider, Table, TableBody, TableCell, TableHead, TableRow, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FeatureLayout, CodeBlock, ExampleViewer, FeatureMetadataTable, FeatureMetadataAccordion } from './common';
import { getPinningTableGroup, pinningSlotPropGroups } from './data/pinning-metadata';
import {
  BasicPinningExample,
  InteractivePinningDemo,
  PinningWithSelectionExample,
} from '../../examples/pinning';

// Import code as raw strings
import basicPinningCode from '../../examples/pinning/BasicPinningExample.tsx?raw';
import interactivePinningCode from '../../examples/pinning/InteractivePinningDemo.tsx?raw';
import pinningWithSelectionCode from '../../examples/pinning/PinningWithSelectionExample.tsx?raw';

export function PinningPage() {
  const pinningTableGroup = getPinningTableGroup('pinning-table-props');
  const pinningColumnGroup = getPinningTableGroup('pinning-column-props');
  // const pinningSlotPropGroup = getPinningSlotPropGroup('pinning-slot-props'); // Unused

  return (
    <FeatureLayout
      title="Column Pinning"
      description="Pin columns to the left or right side of the table to keep them visible while scrolling horizontally. Perfect for keeping key columns like names or actions always in view."
    >
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Sticky Columns
        </Typography>
        <Typography variant="body2">
          Pinned columns remain fixed while other columns scroll horizontally. This is essential for 
          wide tables where you need to keep important columns (like names or actions) always visible.
        </Typography>
      </Alert>

      <Divider sx={{ my: 4 }} />

      {/* Enable Column Pinning */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Enable Column Pinning
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Basic Setup
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enable column pinning on the table:
        </Typography>
        <CodeBlock
          language="tsx"
          code={`const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enablePinning: true,        // Allow this column to be pinned
  },
  // ... other columns
];

<DataTable
  columns={columns}
  data={data}
  enableColumnPinning={true}    // Enable pinning feature
  onColumnPinningChange={(pinning) => {
    console.log('Pinning changed:', pinning);
  }}
/>`}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Default Pinning (Initial State) */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Default Pinning (Initial State)
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Set Initial Pinned Columns
        </Typography>
        <Typography variant="body2">
          Use <code>initialState.columnPinning</code> to pin columns by default when the table loads.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Default Pinning
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Pin columns to left or right side:
        </Typography>
        <CodeBlock
          language="tsx"
          code={`<DataTable
  columns={columns}
  data={data}
  enableColumnPinning={true}
  initialState={{
    columnPinning: {
      left: ['id', 'name'],      // Pin ID and Name to left
      right: ['actions'],        // Pin actions to right
    },
  }}
/>`}
        />

        <ExampleViewer
          exampleId="basic-pinning"
          code={basicPinningCode}
          component={<BasicPinningExample />}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Special Column Names */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Special Column Names
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Built-in Column IDs
        </Typography>
        <Typography variant="body2">
          The DataTable automatically creates special columns for selection and expansion. 
          You can pin these using their predefined IDs.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Available Special Column IDs
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Constant</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Value</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
                DEFAULT_SELECTION_COLUMN_NAME
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                &apos;_selection&apos;
              </TableCell>
              <TableCell>
                ID for the checkbox selection column (when enableRowSelection=true)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'primary.main' }}>
                DEFAULT_EXPANDING_COLUMN_NAME
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                &apos;_expanding&apos;
              </TableCell>
              <TableCell>
                ID for the row expansion column (when enableExpanding=true)
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Example: Pin Special Columns
          </Typography>
          <CodeBlock
            language="tsx"
            code={`import { 
  DEFAULT_SELECTION_COLUMN_NAME, 
  DEFAULT_EXPANDING_COLUMN_NAME 
} from '@ackplus/react-tanstack-data-table';

<DataTable
  columns={columns}
  data={data}
  enableRowSelection={true}
  enableExpanding={true}
  enableColumnPinning={true}
  initialState={{
    columnPinning: {
      left: [
        DEFAULT_EXPANDING_COLUMN_NAME,   // Pin expand column
        DEFAULT_SELECTION_COLUMN_NAME,   // Pin selection column
        'name',                          // Pin name column
      ],
      right: ['actions'],                // Pin actions to right
    },
  }}
/>`}
          />
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* API Reference */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Pinning API Reference
      </Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Programmatic Pinning Control
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Control column pinning programmatically using the table API ref:
        </Typography>
        <CodeBlock
          language="tsx"
          code={`import { useRef } from 'react';
import { 
  DataTableApi,
  DEFAULT_SELECTION_COLUMN_NAME,
  DEFAULT_EXPANDING_COLUMN_NAME 
} from '@ackplus/react-tanstack-data-table';

const tableRef = useRef<DataTableApi<Employee>>(null);

// Pin column to left
tableRef.current?.columnPinning.pinColumnLeft('name');

// Pin column to right
tableRef.current?.columnPinning.pinColumnRight('actions');

// Unpin a column
tableRef.current?.columnPinning.unpinColumn('name');

// Set complete pinning state
tableRef.current?.columnPinning.setPinning({
  left: [DEFAULT_SELECTION_COLUMN_NAME, 'name'],
  right: ['actions'],
});

// Reset pinning to initial state
tableRef.current?.columnPinning.resetColumnPinning();

<DataTable
  ref={tableRef}
  columns={columns}
  data={data}
  enableColumnPinning={true}
/>`}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* DataTable Props */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        DataTable Pinning Props
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            DataTable Pinning Props
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable
              items={pinningTableGroup?.items ?? []}
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
  data={data}
  enableColumnPinning={true}
  onColumnPinningChange={(pinning) => {
    console.log('Pinning changed:', pinning);
  }}
  initialState={{
    columnPinning: {
      left: ['id', 'name'],
      right: ['actions'],
    },
  }}
/>`}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 3 }} />

      {/* Column Properties */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Column Pinning Properties
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Column-Level Pinning Props
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable
              items={pinningColumnGroup?.items ?? []}
              includePossibleValues
            />
          </Box>

          <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Example
            </Typography>
            <CodeBlock
              language="tsx"
              code={`const columns: DataTableColumn<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    enablePinning: true,        // Allow this column to be pinned
  },
  {
    accessorKey: 'metadata',
    header: 'Metadata',
    enablePinning: false,      // Prevent pinning for this column
  },
];`}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <Divider sx={{ my: 4 }} />

      {/* Live Interactive Example */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Interactive Demo
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Try Column Pinning
        </Typography>
        <Typography variant="body2">
          Right-click on column headers or use the column menu to pin/unpin columns. 
          Scroll horizontally to see pinned columns stay in place.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Pre-Pinned Columns
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This example has ID and Name pinned to the left, and Performance pinned to the right.
          Try scrolling horizontally to see the effect.
        </Typography>
        
        <ExampleViewer
          exampleId="interactive-pinning"
          code={interactivePinningCode}
          component={<InteractivePinningDemo />}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Pinning with Selection & Expansion */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Pinning with Selection & Expansion
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Common Pattern
        </Typography>
        <Typography variant="body2">
          A common pattern is to pin selection and expansion columns to the left, and action 
          columns to the right. Use the special column name constants for this.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example: Pin Special Columns
        </Typography>
        <CodeBlock
          language="tsx"
          code={`import { 
  DataTable,
  DEFAULT_SELECTION_COLUMN_NAME,    // '_selection'
  DEFAULT_EXPANDING_COLUMN_NAME     // '_expanding'
} from '@ackplus/react-tanstack-data-table';

<DataTable
  columns={columns}
  data={data}
  enableRowSelection={true}
  enableExpanding={true}
  enableColumnPinning={true}
  initialState={{
    columnPinning: {
      left: [
        DEFAULT_EXPANDING_COLUMN_NAME,   // Pin expand button
        DEFAULT_SELECTION_COLUMN_NAME,   // Pin selection checkbox
        'name',                          // Pin name column
      ],
      right: [
        'actions',                       // Pin action buttons to right
      ],
    },
  }}
/>`}
        />

        <ExampleViewer
          exampleId="pinning-with-selection"
          code={pinningWithSelectionCode}
          component={<PinningWithSelectionExample />}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* SlotProps Customization */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Pinning Control Customization
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Customize Pinning Control
        </Typography>
        <Typography variant="body2">
          Use <code>slotProps.columnPinningControl</code> to customize the pinning control component 
          without replacing it entirely.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <FeatureMetadataAccordion
          groups={pinningSlotPropGroups}
          defaultExpandedCount={1}
          includePossibleValues
        />

        <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Example: Customize Pinning Control
          </Typography>
          <CodeBlock
            language="tsx"
            code={`<DataTable
  columns={columns}
  data={data}
  enableColumnPinning={true}
  slotProps={{
    columnPinningControl: {
      title: 'Pin Columns',
      titleSx: { fontWeight: 700 },
      menuSx: { minWidth: 350 },
      iconButtonProps: {
        sx: { color: 'primary.main' },
      },
      tooltipProps: {
        title: 'Pin/unpin columns',
      },
      badgeProps: {
        sx: { backgroundColor: 'primary.main' },
      },
      clearButtonProps: {
        color: 'warning',
      },
    },
  }}
/>`}
          />
        </Box>
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Best Practices */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Best Practices
      </Typography>
      
      <Paper elevation={1} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Pin Important Columns
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pin essential columns like ID, name, or primary identifiers to the left. Pin action columns to the right.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Use Special Column Constants
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Always use <code>DEFAULT_SELECTION_COLUMN_NAME</code> and <code>DEFAULT_EXPANDING_COLUMN_NAME</code> 
              instead of hardcoding '_selection' or '_expanding'.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Limit Pinned Columns
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t pin too many columns as it reduces scrollable space. Typically 2-3 columns on each side is optimal.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Tip: Combine with Column Visibility
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Let users hide unpinned columns to focus on pinned content using <code>enableColumnVisibility</code>.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Common Pattern
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pin selection/expanding columns and primary identifier to left. Pin action buttons to right. 
              This creates a familiar, user-friendly layout.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </FeatureLayout>
  );
}
