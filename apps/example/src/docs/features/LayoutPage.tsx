import { Paper, Stack, Typography, Box } from '@mui/material';
import { FeatureLayout } from './common/FeatureLayout';
import { CodeBlock } from './common/CodeBlock';

export function LayoutPage() {
  return (
    <FeatureLayout
      title="Layout"
      subtitle="Main Features"
      description="Compose the DataTable into any layout—cards, split panes, or dense dashboards—while keeping headers, toolbar, and pagination in sync."
    >
      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Shell-first composition
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Wrap the table with your own chrome. Toolbar, filters, and pagination can live wherever you need them—just wire to the same props.
          </Typography>
          <CodeBlock
            language="tsx"
            code={`<Stack spacing={2}>
  <FiltersBar onChange={setFilters} />
  <Paper variant="outlined">
    <DataTable {...tableProps} />
  </Paper>
  <PaginationFooter {...paginationProps} />
</Stack>`}
          />
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
            Sticky regions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Combine column pinning with virtualized rows to keep key identifiers in view even with wide schemas.
          </Typography>
          <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
            Enable `enableColumnPinning` and set `columnPinning` defaults to lock the first column while users scroll horizontally.
          </Box>
        </Paper>
      </Stack>
    </FeatureLayout>
  );
}
