import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Stack,
  Link,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
} from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { CodeBlock } from './features/common/CodeBlock';
import { exampleDefinitions } from '../examples/examples.data';

type ViewMode = 'preview' | 'code';

export function ExamplesSection() {
  const examples = exampleDefinitions;
  const [activeExample, setActiveExample] = useState(examples[0]?.id ?? '');
  const [viewMode, setViewMode] = useState<ViewMode>('preview');

  const currentExample = examples.find((example) => example.id === activeExample) ?? examples[0];
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '#';

  if (!currentExample) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Demos
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Try the table in common scenarios, then open the matching source code with a single click.
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Tabs
          value={activeExample}
          onChange={(_, value) => setActiveExample(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 2,
          }}
        >
          {examples.map((example) => (
            <Tab key={example.id} label={example.title} value={example.id} sx={{ textTransform: 'none', fontWeight: 600 }} />
          ))}
        </Tabs>

        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {currentExample?.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {currentExample?.description}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                  {currentExample?.features.map((feature) => (
                    <Chip key={feature} label={feature} variant="outlined" size="small" color="primary" />
                  ))}
                </Stack>
              </Box>
              <Stack direction="row" spacing={1}>
                <Tooltip title="View source">
                  <IconButton
                    component={Link}
                    href={`https://github.com/ack-solutions/react-tanstack-data-table/blob/main/${currentExample?.githubPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                  >
                    <CodeIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Open in new tab">
                  <IconButton component={Link} href={currentUrl} target="_blank" rel="noopener noreferrer" size="small">
                    <OpenInNewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
              sx={{ alignSelf: 'flex-start' }}
            >
              <ToggleButton value="preview">Preview</ToggleButton>
              <ToggleButton value="code">Code</ToggleButton>
            </ToggleButtonGroup>

            {viewMode === 'preview' ? (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {currentExample ? <currentExample.component /> : null}
              </Paper>
            ) : (
              <CodeBlock language="tsx" code={currentExample?.code ?? '// Source not available in this build'} showLineNumbers />
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
