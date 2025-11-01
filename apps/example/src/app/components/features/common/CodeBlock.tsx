import { ReactNode, useMemo } from 'react';
import { Box, BoxProps, Typography, IconButton, Paper, Stack, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface CodeBlockProps extends Omit<BoxProps, 'children'> {
  code: string;
  caption?: ReactNode;
  language?: 'ts' | 'tsx' | 'js' | 'jsx' | 'json' | 'bash' | 'sh' | 'css' | 'html' | string;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, caption, language, showLineNumbers = false, sx, ...boxProps }: CodeBlockProps) {
  const preparedCode = useMemo(() => {
    if (!showLineNumbers) return code;
    const lines = code.replace(/\n$/, '').split('\n');
    const width = String(lines.length).length;
    return lines
      .map((line, idx) => `${String(idx + 1).padStart(width, ' ')}  ${line}`)
      .join('\n');
  }, [code, showLineNumbers]);

  return (
    <Stack spacing={1} width="100%">
      {caption ? (
        <Typography variant="body2" color="text.secondary">{caption}</Typography>
      ) : null}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 1,
          overflow: 'hidden',
          ...sx,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 1.5,
            py: 1,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {language ? `${language}` : 'code'}
          </Typography>
          <Tooltip title="Copy code">
            <IconButton
              size="small"
              aria-label="Copy code"
              onClick={() => navigator.clipboard.writeText(code)}
            >
              <ContentCopyIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box
          component="pre"
          sx={{
            m: 0,
            px: 2,
            py: 1.5,
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'grey.50',
            color: 'text.primary',
            fontFamily: 'Menlo, Consolas, Monaco, "Courier New", monospace',
            fontSize: (theme) => theme.typography.body2.fontSize,
            lineHeight: (theme) => theme.typography.body2.lineHeight,
            overflowX: 'auto',
            whiteSpace: 'pre',
          }}
          {...boxProps}
        >
          {preparedCode}
        </Box>
      </Paper>
    </Stack>
  );
}
