import { Box, Typography, Paper, Tabs, Tab, Fade, Stack, Link, IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CodeIcon from '@mui/icons-material/Code';

import { exampleDefinitions } from './examples';

export function ExamplesSection() {
  const examples = exampleDefinitions;
  const [activeExample, setActiveExample] = useState(examples[0]?.id ?? '');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveExample(newValue);
  };

  const currentExample = examples.find(example => example.id === activeExample) ?? examples[0];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Interactive Examples
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Explore different usage patterns and features through interactive examples. 
        Each example demonstrates specific capabilities of the DataTable component.
      </Typography>

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={activeExample}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            px: 2,
          }}
        >
          {examples.map((example) => (
            <Tab 
              key={example.id} 
              label={example.title} 
              value={example.id}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          {examples.map((example) => (
            <Fade 
              in={activeExample === example.id} 
              timeout={300} 
              unmountOnExit 
              mountOnEnter 
              key={example.id}
            >
              <Box sx={{ display: activeExample === example.id ? 'block' : 'none' }}>
                <Stack spacing={3}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {example.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                          {example.description}
                        </Typography>
                      </Box>
                      <Tooltip title="View source code on GitHub">
                        <IconButton
                          component={Link}
                          href={`https://github.com/ack-solutions/react-tanstack-data-table/blob/main/${example.githubPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          sx={{ ml: 2 }}
                        >
                          <CodeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {example.features.map((feature) => (
                        <Box
                          key={feature}
                          sx={{
                            px: 1.5,
                            py: 0.5,
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText',
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                          }}
                        >
                          {feature}
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Paper 
                    elevation={2} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <example.component />
                  </Paper>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Tip:</strong> This example demonstrates {example.features.join(', ').toLowerCase()}. 
                      Try interacting with the table to see the features in action!
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Fade>
          ))}
        </Box>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          Example Features Overview
        </Typography>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Local Data Example
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Perfect starting point showing basic table functionality with client-side data management.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Server-Side Fetching
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Demonstrates real-world usage with API integration, loading states, and server-side operations.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Improved Server-Side (Fixed Filtering)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enhanced version with proper status filtering, department filtering, and custom filter controls.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Custom Slots & Styling
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Shows how to customize the table appearance and behavior using the powerful slots system.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              API Playground
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Interactive testing environment to explore the imperative API and advanced features.
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
