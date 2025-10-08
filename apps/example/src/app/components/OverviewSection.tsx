import { Box, Typography, Stack, Chip, Paper, Alert } from '@mui/material';

export function OverviewSection() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Overview
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        A powerful, feature-rich data table component built with Material-UI and TanStack Table
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
        <Chip label="Server-side" color="primary" variant="outlined" />
        <Chip label="Virtualized" color="primary" variant="outlined" />
        <Chip label="Export Ready" color="primary" variant="outlined" />
        <Chip label="TypeScript" color="primary" variant="outlined" />
        <Chip label="Customizable" color="primary" variant="outlined" />
        <Chip label="Responsive" color="primary" variant="outlined" />
      </Stack>

      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          Key Features
        </Typography>
        <Typography variant="body2">
          The DataTable component provides a complete solution for data display with advanced features like 
          server-side pagination, filtering, sorting, row selection, export capabilities, and extensive customization options.
        </Typography>
      </Alert>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Why Choose This Component?
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              🚀 High Performance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Built on TanStack Table for excellent performance with large datasets and virtualization support.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              🎨 Material Design
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Beautiful UI components using MUI with consistent design system and theming support.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              🔧 Highly Customizable
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Extensive customization through slots, props, and the ability to replace any component.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              📝 TypeScript Ready
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Full TypeScript support with comprehensive type definitions and excellent IDE support.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Installation
        </Typography>
        <Box
          component="pre"
          sx={{
            backgroundColor: '#f5f5f5',
            color: '#333',
            borderRadius: 1,
            p: 2,
            fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
            fontSize: 14,
            overflowX: 'auto',
            mb: 2,
          }}
        >
{`npm install @ackplus/react-tanstack-data-table

# Peer dependencies
npm install @emotion/react @emotion/styled @mui/icons-material @mui/material @tanstack/react-table @tanstack/react-virtual react react-dom`}
        </Box>
        <Typography variant="body2" color="text.secondary">
          Make sure to install the required peer dependencies for the component to work properly.
        </Typography>
      </Paper>
    </Box>
  );
}
