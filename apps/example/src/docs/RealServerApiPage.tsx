import { Box, Typography, Paper, Stack } from '@mui/material';
import { RealServerApiExample, RealServerApiCrudExample } from '../examples/debug';

/**
 * Standalone page for the Real Server-Side API example.
 * Not listed in main Demos; use nav "Real API (Debug)" or ?section=real-api-debug to open.
 * Use this page to debug server-side DataTable behavior against a real third-party API.
 */
export function RealServerApiPage() {
  return (
    <Box>
      {/* <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Real API – Server-Side Debug
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        This page runs the DataTable in server mode against the public DummyJSON API. It is separate from the
        main Interactive Demos so you can debug and test server-side behavior (pagination, sorting, search, refresh)
        without other examples in the way.
      </Typography> */}

      {/*       <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" component="span">
          Use the <strong>Data source</strong> dropdown to switch:
        </Typography>
        <Typography variant="body2" component="span" display="block" sx={{ mt: 1 }}>
          • <strong>openFDA</strong> — https://api.fda.gov/drug/event.json — ~20M+ adverse event reports. Pagination
          (<code>limit</code>, <code>skip</code>), sort by receive date, search on reaction. Max 1000 per page, skip ≤ 25k.
        </Typography>
        <Typography variant="body2" component="span" display="block" sx={{ mt: 0.5 }}>
          • <strong>DummyJSON</strong> — https://dummyjson.com/users — 208 users. Pagination, search, and sort supported.
        </Typography>
      </Alert> */}

      <Stack spacing={4}>
        {/* <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            DataTable + onFetchData (direct)
          </Typography>
          <RealServerApiExample />
        </Paper> */}
        <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
            CrudDataGrid + TanStack Query
          </Typography>
          <RealServerApiCrudExample />
        </Paper>
      </Stack>
    </Box>
  );
}
