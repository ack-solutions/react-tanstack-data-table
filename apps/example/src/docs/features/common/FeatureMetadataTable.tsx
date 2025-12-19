import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  Typography,
  Stack,
} from '@mui/material';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import type { FeatureMetadataItem } from '../data/data-table-metadata';

interface FeatureMetadataTableProps {
  items: FeatureMetadataItem[];
  includePossibleValues?: boolean;
  size?: 'small' | 'medium';
  minWidth?: number;
}

type ViewMode = 'table' | 'card';

const STORAGE_KEY = 'feature-metadata-view-mode';

export function FeatureMetadataTable({
  items,
  includePossibleValues,
  size = 'small',
  minWidth = 600,
}: FeatureMetadataTableProps) {
  const shouldShowPossibleValues =
    includePossibleValues ?? items.some((item) => item.possibleValues.length > 0);

  // Load view mode from localStorage or default to 'table'
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved as ViewMode) || 'table';
    }
    return 'table';
  });

  // Save view mode to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, viewMode);
    }
  }, [viewMode]);

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: ViewMode | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  return (
    <Box width="100%">
      {/* View Toggle Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, width: '100%' }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          aria-label="view mode"
        >
          <ToggleButton value="table" aria-label="table view">
            <TableRowsIcon sx={{ mr: 0.5 }} fontSize="small" />
            Table
          </ToggleButton>
          <ToggleButton value="card" aria-label="card view">
            <ViewModuleIcon sx={{ mr: 0.5 }} fontSize="small" />
            Card
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Table View */}
      {viewMode === 'table' && (
        <Table size={size} sx={{ minWidth }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Default</TableCell>
              {shouldShowPossibleValues ? (
                <TableCell sx={{ fontWeight: 700 }}>Possible Values</TableCell>
              ) : null}
              <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.name} hover>
                <TableCell sx={{ fontWeight: 600, fontFamily: 'monospace' }}>{item.name}</TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13, color: 'primary.main' }}>
                  {item.type}
                </TableCell>
                <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                  {item.defaultValue}
                </TableCell>
                {shouldShowPossibleValues ? (
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                    {item.possibleValues.length > 0 ? item.possibleValues.join(', ') : '—'}
                  </TableCell>
                ) : null}
                <TableCell>{item.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Card View */}
      {viewMode === 'card' && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 2,
            width: '100%',
          }}
        >
          {items.map((item) => (
            <Card
              key={item.name}
              variant="outlined"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                borderColor: 'divider',
                '&:hover': {
                  borderColor: 'text.secondary',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Stack spacing={1.5}>
                  {/* Property Name */}
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      lineHeight: 1.2,
                      color: 'text.primary',
                    }}
                  >
                    {item.name}
                  </Typography>

                  {/* Metadata Row */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700 }}>
                        Type
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.8rem' }}>
                        {item.type}
                      </Typography>
                    </Box>

                    {item.defaultValue && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700 }}>
                          Default
                        </Typography>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.8rem' }}>
                          {item.defaultValue}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Possible Values */}
                  {shouldShowPossibleValues && item.possibleValues.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700, mb: 0.5 }}>
                        Values
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', color: 'text.secondary', fontSize: '0.75rem', lineHeight: 1.4 }}>
                        {item.possibleValues.join(' | ')}
                      </Typography>
                    </Box>
                  )}

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: '0.85rem',
                      color: 'text.secondary',
                      lineHeight: 1.5,
                      borderTop: '1px solid',
                      borderColor: 'action.disabledBackground',
                      pt: 1,
                      mt: 'auto',
                    }}
                  >
                    {item.description}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
