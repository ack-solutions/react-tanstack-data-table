import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Link,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Divider,
  Alert,
  Badge,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PreviewIcon from '@mui/icons-material/Visibility';
import { CodeBlock } from './features/common/CodeBlock';
import { exampleDefinitions } from '../examples/examples.data';

type ViewMode = 'preview' | 'code';

interface ExampleViewModes {
  [key: string]: ViewMode;
}

export function ExamplesSection() {
  const examples = exampleDefinitions;
  const [viewModes, setViewModes] = useState<ExampleViewModes>(() => {
    const initialModes: ExampleViewModes = {};
    examples.forEach((example) => {
      initialModes[example.id] = 'preview';
    });
    return initialModes;
  });

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '#';

  const handleViewModeChange = (exampleId: string, mode: ViewMode | null) => {
    if (mode) {
      setViewModes((prev) => ({
        ...prev,
        [exampleId]: mode,
      }));
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Interactive Demos
        </Typography>
        <Chip 
          label={`${examples.length} Examples`} 
          size="small" 
          color="primary" 
          variant="outlined"
        />
      </Stack>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        Explore interactive examples showcasing the full capabilities of the DataTable component. 
        Each demo includes a live preview and source code.
      </Typography>
      
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2">
          💡 <strong>Tip:</strong> Toggle between Preview and Code view to see the implementation details. 
          Click the GitHub icon to view the full source on GitHub.
        </Typography>
      </Alert>

      <Stack spacing={4}>
        {examples.map((example, index) => (
          <Box key={example.id}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 2, 
                overflow: 'hidden', 
                border: '1px solid', 
                borderColor: 'divider',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 2,
                  borderColor: 'primary.main',
                },
              }}
            >
              <Box sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {/* Header Section */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                        <Badge 
                          badgeContent={index + 1} 
                          color="primary"
                          sx={{
                            '& .MuiBadge-badge': {
                              position: 'static',
                              transform: 'none',
                            },
                          }}
                        />
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {example.title}
                        </Typography>
                      </Stack>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {example.description}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {example.features.map((feature) => (
                          <Chip 
                            key={feature} 
                            label={feature} 
                            variant="outlined" 
                            size="small" 
                            color="primary"
                            sx={{
                              transition: 'all 0.2s',
                              '&:hover': {
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                              },
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                    
                    {/* Action Buttons */}
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="View source on GitHub">
                        <IconButton
                          component={Link}
                          href={`https://github.com/ack-solutions/react-tanstack-data-table/blob/main/${example.githubPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          sx={{
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                              color: 'primary.main',
                            },
                          }}
                        >
                          <CodeIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Open in new tab">
                        <IconButton 
                          component={Link} 
                          href={currentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          size="small"
                          sx={{
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                              color: 'primary.main',
                            },
                          }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  {/* View Mode Selector */}
                  <ToggleButtonGroup
                    value={viewModes[example.id]}
                    exclusive
                    onChange={(_, value) => handleViewModeChange(example.id, value)}
                    size="small"
                    sx={{ 
                      alignSelf: 'flex-start',
                      '& .MuiToggleButton-root': {
                        px: 2,
                        py: 0.5,
                      },
                    }}
                  >
                    <ToggleButton value="preview">
                      <PreviewIcon sx={{ fontSize: 18, mr: 0.5 }} />
                      Preview
                    </ToggleButton>
                    <ToggleButton value="code">
                      <CodeIcon sx={{ fontSize: 18, mr: 0.5 }} />
                      Code
                    </ToggleButton>
                  </ToggleButtonGroup>

                  {/* Content Section */}
                  {viewModes[example.id] === 'preview' ? (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider',
                        minHeight: 400,
                      }}
                    >
                      <example.component />
                    </Paper>
                  ) : (
                    <Box>
                      <CodeBlock 
                        language="tsx" 
                        code={example.code ?? '// Source code not available in this build'} 
                        showLineNumbers 
                      />
                    </Box>
                  )}
                </Stack>
              </Box>
            </Paper>
            
            {index < examples.length - 1 && (
              <Divider sx={{ my: 0, opacity: 0 }} />
            )}
          </Box>
        ))}
      </Stack>

      {/* Footer Info */}
      <Alert severity="success" icon={false} sx={{ mt: 4 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          🎉 Ready to Build?
        </Typography>
        <Typography variant="body2">
          These examples are just the beginning. Check the <strong>Features</strong> section for detailed documentation 
          and the <strong>Props Reference</strong> for the complete API.
        </Typography>
      </Alert>
    </Box>
  );
}
