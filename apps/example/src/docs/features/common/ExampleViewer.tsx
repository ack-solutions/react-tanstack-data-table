import { useState } from 'react';
import { Box, ToggleButtonGroup, ToggleButton, Paper } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import PreviewIcon from '@mui/icons-material/Visibility';
import { CodeBlock } from './CodeBlock';

interface ExampleViewerProps {
  code: string;
  component: React.ReactNode;
  exampleId: string;
  language?: string;
  showLineNumbers?: boolean;
}

type ViewMode = 'preview' | 'code';

const STORAGE_KEY_PREFIX = 'example-view-mode-';

export function ExampleViewer({
  code,
  component,
  exampleId,
  language = 'tsx',
  showLineNumbers = true,
}: ExampleViewerProps) {
  // Load view mode from localStorage or default to 'preview'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${exampleId}`);
      return (saved as ViewMode) || 'preview';
    }
    return 'preview';
  });

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${exampleId}`, newMode);
      }
    }
  };

  return (
    <Box>
      {/* View Mode Selector */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0.5,
            },
          }}
        >
          <ToggleButton value="preview" aria-label="preview view">
            <PreviewIcon sx={{ fontSize: 18, mr: 0.5 }} />
            Preview
          </ToggleButton>
          <ToggleButton value="code" aria-label="code view">
            <CodeIcon sx={{ fontSize: 18, mr: 0.5 }} />
            Code
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Content Section */}
      {viewMode === 'preview' ? (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: 'background.default',
            border: '1px solid',
            borderColor: 'divider',
            minHeight: 300,
          }}
        >
          {component}
        </Paper>
      ) : (
        <CodeBlock language={language} code={code} showLineNumbers={showLineNumbers} />
      )}
    </Box>
  );
}
