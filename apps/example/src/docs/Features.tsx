import { Box, Typography, Paper, Stack, Chip } from '@mui/material';
import { CodeBlock } from './features/common/CodeBlock';

export function Features() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Feature Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        The DataTable ships with a focused set of production-ready capabilities. Each feature is modular, so you can enable just what you need while keeping the API surface predictable.
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Core capabilities
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {['Sorting', 'Filtering', 'Pagination', 'Column pinning', 'Column visibility', 'Row selection', 'Row expansion', 'Virtualization', 'Export'].map((item) => (
            <Chip key={item} label={item} variant="outlined" color="primary" />
          ))}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Slots-first customization
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Swap header, toolbar, rows, cells, and empty states without losing built-in behaviors. You can start with the provided defaults and override progressively as requirements grow.
        </Typography>
        <CodeBlock
          language="tsx"
          code={`<DataTable
  columns={columns}
  data={rows}
  slots={{
    toolbar: CustomToolbar,
    empty: EmptyState,
    row: FancyRow,
  }}
/>`}
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Imperative API
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Control the grid programmatically for power-user workflows—trigger exports, reset filters, or sync to URL state with a typed API.
        </Typography>
        <CodeBlock
          language="tsx"
          code={`const apiRef = useRef<DataTableApi<User>>(null);

useEffect(() => {
  apiRef.current?.setFilters({ status: 'active' });
}, []);

return <DataTable ref={apiRef} columns={columns} data={data} />;`}
        />
      </Paper>
    </Box>
  );
}
