import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import type { FeatureMetadataItem } from '../data/data-table-metadata';

interface FeatureMetadataTableProps {
  items: FeatureMetadataItem[];
  includePossibleValues?: boolean;
  size?: 'small' | 'medium';
  minWidth?: number;
}

export function FeatureMetadataTable({
  items,
  includePossibleValues,
  size = 'small',
  minWidth = 600,
}: FeatureMetadataTableProps) {
  const shouldShowPossibleValues =
    includePossibleValues ?? items.some((item) => item.possibleValues.length > 0);

  return (
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
  );
}
