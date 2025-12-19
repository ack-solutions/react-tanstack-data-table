/**
 * Columns Feature Documentation Page
 * 
 * This page documents column configuration and features for the DataTable component.
 * All examples are separated into individual files for better organization and reusability.
 */

import { Box, Typography, Paper, Alert, Divider, Stack, Chip } from '@mui/material';
import { FeatureLayout, FeatureSection, FeatureMetadataTable, ExampleViewer } from './common';
import { getColumnGroup } from './data/columns-metadata';
import {
  BasicColumnHelperExample,
  BasicArrayColumnsExample,
  CustomCellRenderingExample,
  ColumnAlignmentExample,
  TextWrappingExample,
  FilterableColumnsExample,
  ColumnFooterExample,
  AdvancedColumnsExample,
} from '../../examples/columns';

// Import code as raw strings for display
import basicColumnHelperCode from '../../examples/columns/BasicColumnHelperExample.tsx?raw';
import basicArrayCode from '../../examples/columns/BasicArrayColumnsExample.tsx?raw';
import customCellCode from '../../examples/columns/CustomCellRenderingExample.tsx?raw';
import alignmentCode from '../../examples/columns/ColumnAlignmentExample.tsx?raw';
import textWrappingCode from '../../examples/columns/TextWrappingExample.tsx?raw';
import filterableCode from '../../examples/columns/FilterableColumnsExample.tsx?raw';
import footerCode from '../../examples/columns/ColumnFooterExample.tsx?raw';
import advancedCode from '../../examples/columns/AdvancedColumnsExample.tsx?raw';

export function ColumnsPage() {
  const dataTableColumnsGroup = getColumnGroup('datatable-column');
  const tanstackColumnsGroup = getColumnGroup('tanstack-column');

  return (
    <FeatureLayout
      title="Columns"
      description="Column definitions control how data is displayed in the table. Each column can be customized with custom renderers, sizing, alignment, filtering, and more. Choose between TanStack&apos;s column helper for type safety or plain objects for simplicity."
    >
      <Divider sx={{ my: 4 }} />

      {/* Two Ways to Define Columns */}
      <FeatureSection
        title="Two Ways to Define Columns"
        description="Use TanStack&apos;s column helper for the strongest type inference or stick with plain objects for a lightweight syntax."
        spacing={3}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Choose Your Approach
          </Typography>
          <Typography variant="body2">
            Both approaches output the same column objects. The column helper provides better TypeScript
            inference, while plain objects are simpler and easier to serialize. Mix and match across your
            table as needed.
          </Typography>
        </Alert>

        <Stack spacing={3} width="100%">
          {/* Approach 1: Normal Array (Recommended) */}
          <Paper elevation={1} sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Approach 1: Using Normal Array
              </Typography>
              <Chip label="Recommended" color="primary" size="small" />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Plain objects with <code>accessorKey</code> feel familiar and are easier to paste into docs
              or config files. Great for most projects and doesn&apos;t require TanStack Table dependencies.
            </Typography>
            <ExampleViewer
              exampleId="basic-array-columns"
              code={basicArrayCode}
              component={<BasicArrayColumnsExample />}
            />
          </Paper>

          {/* Approach 2: Column Helper */}
          <Paper elevation={1} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Approach 2: Using Column Helper
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Column helper delivers rich generics so editors can infer cell values and catch typos early.
              Perfect for TypeScript projects where type safety is a priority.
            </Typography>
            <ExampleViewer
              exampleId="basic-column-helper"
              code={basicColumnHelperCode}
              component={<BasicColumnHelperExample />}
            />
          </Paper>
        </Stack>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      {/* Custom Cell Rendering */}
      <FeatureSection
        title="Custom Cell Rendering"
        description="Return JSX from the column&apos;s cell renderer to present chips, typography, or completely custom layouts."
        spacing={3}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Customize Cell Display
          </Typography>
          <Typography variant="body2">
            The <code>cell</code> callback receives helpers like <code>getValue</code>, <code>row</code>,
            and <code>table</code> so you can build dynamic UIs per row. Both column helper and plain
            arrays use the same cell renderer signature.
          </Typography>
        </Alert>

        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Example: Custom Cell Rendering
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enhance your table with custom typography, chips, and formatted values.
          </Typography>
          <ExampleViewer
            exampleId="custom-cell-rendering"
            code={customCellCode}
            component={<CustomCellRenderingExample />}
          />
        </Paper>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      {/* Column Alignment */}
      <FeatureSection
        title="Column Alignment"
        description="Control text alignment in cells using the align property. Proper alignment improves readability for different data types."
        spacing={3}
      >
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Example: Text Alignment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Use <code>align</code> to set left (default), center, or right alignment. Best practice:
            right-align numbers, center-align status indicators, left-align text.
          </Typography>
          <ExampleViewer
            exampleId="column-alignment"
            code={alignmentCode}
            component={<ColumnAlignmentExample />}
          />
        </Paper>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      {/* Text Wrapping */}
      <FeatureSection
        title="Text Wrapping"
        description="Control how long text is displayed in cells - wrap it or truncate with ellipsis."
        spacing={3}
      >
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Example: Text Wrapping
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            By default, text is truncated with ellipsis. Set <code>wrapText: true</code> to enable
            wrapping for columns with long content like descriptions or comments.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Tip:</strong> Use <code>wrapText: true</code> for description columns.
              Keep <code>wrapText: false</code> (default) for IDs, emails, and short codes.
            </Typography>
          </Alert>
          <ExampleViewer
            exampleId="text-wrapping"
            code={textWrappingCode}
            component={<TextWrappingExample />}
          />
        </Paper>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      {/* Filterable Columns */}
      <FeatureSection
        title="Filterable Columns with Options"
        description="Enable column-level filtering with type-specific filter inputs. Perfect for allowing users to narrow down data by specific criteria."
        spacing={3}
      >
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Example: Filterable Columns
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set <code>filterable: true</code>, choose a <code>type</code> (&apos;text&apos;, &apos;number&apos;, &apos;date&apos;,
            &apos;select&apos;, &apos;boolean&apos;), and provide <code>options</code> for select filters. Don&apos;t forget
            to enable <code>enableColumnFilter</code> on the DataTable component.
          </Typography>
          <ExampleViewer
            exampleId="filterable-columns"
            code={filterableCode}
            component={<FilterableColumnsExample />}
          />
        </Paper>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      {/* Column Footer */}
      <FeatureSection
        title="Column Footer with Aggregation"
        description="Add footer content to display summaries, totals, averages, or other aggregations."
        spacing={3}
      >
        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Example: Footer Aggregation
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            The <code>footer</code> callback receives the <code>table</code> instance, allowing you
            to access filtered rows and calculate aggregations like sum, average, count, etc.
          </Typography>
          <ExampleViewer
            exampleId="column-footer"
            code={footerCode}
            component={<ColumnFooterExample />}
          />
        </Paper>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      {/* All Column Properties */}
      <FeatureSection
        title="All Column Properties"
        description="Columns support both DataTable-specific helpers and the full TanStack Table API. Use them together for rich behavior."
        spacing={3}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            DataTable + TanStack Table Properties
          </Typography>
          <Typography variant="body2">
            Start with the DataTable conveniences and drop to the TanStack layer whenever you need
            a lower-level hook. All TanStack Table column properties work seamlessly.
          </Typography>
        </Alert>

        <Paper elevation={1} sx={{ p: 3, width: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            DataTable Custom Properties
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These helpers unlock built-in filter widgets, export configuration, and alignment controls.
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable
              items={dataTableColumnsGroup?.items ?? []}
              includePossibleValues
            />
          </Box>
        </Paper>

        <Paper elevation={1} sx={{ p: 3, width: 1, }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            TanStack Table Core Properties
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            All standard column options remain available when using the DataTable wrapper.
            See the{' '}
            <a
              href="https://tanstack.com/table/v8/docs/api/core/column-def"
              target="_blank"
              rel="noopener noreferrer"
            >
              TanStack Table documentation
            </a>{' '}
            for complete details.
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <FeatureMetadataTable
              items={tanstackColumnsGroup?.items ?? []}
              includePossibleValues
            />
          </Box>
        </Paper>
      </FeatureSection>

      <Divider sx={{ my: 4 }} />

      {/* Live Interactive Example */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Complete Example: All Features Combined
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          All Features Working Together
        </Typography>
        <Typography variant="body2">
          This interactive demo combines filterable columns, sorting, custom rendering, footer
          aggregation, column visibility, and all advanced features. Try the column filters,
          sorting arrows, and toolbar controls!
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Advanced Columns Demo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Explore sorting, filtering, column visibility, and custom cell rendering all in action.
        </Typography>
        <ExampleViewer
          exampleId="advanced-columns"
          code={advancedCode}
          component={<AdvancedColumnsExample />}
        />
      </Paper>

      <Divider sx={{ my: 4 }} />

      {/* Best Practices */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
        Best Practices
      </Typography>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
              Use Column Helper for Type Safety
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Prefer <code>createColumnHelper</code> in TypeScript projects for autocomplete and type checking.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
              Set Appropriate Column Sizes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use reasonable <code>size</code> values based on expected content: narrow for IDs (80-100px),
              medium for names (200-250px), wider for descriptions (300-400px).
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
              Align Numbers to the Right
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set <code>align: &apos;right&apos;</code> for numeric columns (salary, quantities, prices) for better readability.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
              Use Type-Specific Filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set the <code>type</code> property to automatically get appropriate filter UIs: &apos;number&apos; for
              range filters, &apos;select&apos; for dropdowns, &apos;boolean&apos; for checkboxes.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
              Provide Options for Select Filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When using <code>type: &apos;select&apos;</code>, always provide the <code>options</code> array with
              label/value pairs for better UX.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
              Keep Cell Renderers Simple
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avoid complex logic in cell renderers. For expensive calculations, use <code>accessorFn</code>
              to compute values once during data processing.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
              Enable Column Visibility for Mobile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use <code>enableColumnVisibility</code> to let users hide less important columns on smaller screens.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center' }}>
              Use wrapText Wisely
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enable <code>wrapText: true</code> only for columns with long content (descriptions, comments).
              Keep it false for compact data like emails and IDs.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </FeatureLayout>
  );
}
