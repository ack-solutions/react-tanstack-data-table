import { Box, Typography, Paper, Stack } from '@mui/material';

import { FeatureMetadataAccordion } from './features/common';
import { dataTableMetadata } from './features/data/data-table-metadata';

export function PropsSection() {
  const { propGroups } = dataTableMetadata;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Props & Configuration
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Comprehensive reference for all available props, organized by functionality.
      </Typography>

      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="body1">
          The DataTable component accepts a wide range of props to customize its behavior and appearance. 
          Props are organized into logical groups based on their functionality.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click on the accordion sections below to explore different prop categories. Each prop includes 
          its TypeScript type, default value, and a description of its purpose.
        </Typography>
      </Stack>

      <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <FeatureMetadataAccordion groups={propGroups} defaultExpandedCount={2} includePossibleValues />
      </Paper>
    </Box>
  );
}
