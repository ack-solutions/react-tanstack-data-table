import { Box, Typography, Stack, Chip, Paper, Alert } from '@mui/material';
import { 
  CheckCircleOutline, 
  CloudUpload, 
  FilterList, 
  GridView, 
  GetApp,
  Search,
} from '@mui/icons-material';
import { CodeBlock } from './features/common';

export function OverviewSection() {
  const features = [
    { icon: <GridView />, title: 'Client & Server-Side', description: 'Support for both client and server-side data handling with seamless switching' },
    { icon: <FilterList />, title: 'Advanced Filtering', description: 'Global search, column filters, and custom filter operators' },
    { icon: <CheckCircleOutline />, title: 'Row Selection', description: 'Single and multi-row selection with include/exclude modes' },
    { icon: <GetApp />, title: 'Data Export', description: 'Export to CSV, XLSX, and JSON with customizable options' },
    { icon: <CloudUpload />, title: 'Virtualization', description: 'Handle thousands of rows efficiently with virtual scrolling' },
    { icon: <Search />, title: 'Column Management', description: 'Sorting, resizing, reordering, pinning, and visibility control' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Overview
      </Typography>
      
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
        A powerful, feature-rich data table component built with Material-UI and TanStack Table
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 4 }}>
        <Chip label="TypeScript" color="primary" variant="outlined" />
        <Chip label="Server-side Ready" color="primary" variant="outlined" />
        <Chip label="Virtualized" color="primary" variant="outlined" />
        <Chip label="Export Ready" color="primary" variant="outlined" />
        <Chip label="Customizable" color="primary" variant="outlined" />
        <Chip label="Responsive" color="primary" variant="outlined" />
      </Stack>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Key Features
        </Typography>
        <Stack spacing={2}>
          {features.map((feature, index) => (
            <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
              <Box sx={{ color: 'primary.main', mt: 0.5 }}>
                {feature.icon}
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Why Choose This Component?
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              High Performance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Built on TanStack Table v8 for excellent performance with large datasets. Includes virtual scrolling 
              support to handle thousands of rows efficiently.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Material Design
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Beautiful UI components using MUI v5+ with consistent design system, theming support, and full 
              dark mode compatibility.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Highly Customizable
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Extensive customization through slots, props, and component replacement. Every visual element 
              can be customized or replaced with your own implementation.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              TypeScript First
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Full TypeScript support with comprehensive type definitions, generics, and excellent IDE 
              autocomplete support.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Installation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Install the package using npm or yarn:
        </Typography>
        <CodeBlock
          language="bash"
          code={`npm install @ackplus/react-tanstack-data-table`}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Peer Dependencies
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This package requires the following peer dependencies:
        </Typography>
        <CodeBlock
          language="bash"
          code={`npm install react@">=18.0.0" react-dom@">=18.0.0"
npm install @mui/material@">=5.0.0" @mui/icons-material@">=5.0.0"
npm install @emotion/react@">=11.0.0" @emotion/styled@">=11.0.0"
npm install @mui/x-date-pickers@">=5.0.0"`}
        />
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> TanStack Table and React Virtual are bundled as regular dependencies, 
            so you do not need to install them separately.
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
}
