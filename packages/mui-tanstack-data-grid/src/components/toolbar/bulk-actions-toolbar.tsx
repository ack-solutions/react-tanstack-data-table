/**
 * BulkActionsToolbar — appears above the grid when rows are selected (and
 * `enableBulkActions` is on). Shows the selected count, a Clear action, and any
 * custom actions returned by the `renderBulkActions(selectionState)` prop.
 */
import { Box, Button, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import type { SelectionState } from '../../types/selection.types';

export interface BulkActionsToolbarProps {
    selectedCount: number;
    selectionState: SelectionState;
    onClear: () => void;
    renderBulkActions?: (selectionState: SelectionState) => ReactNode;
}

export function BulkActionsToolbar({ selectedCount, selectionState, onClear, renderBulkActions }: BulkActionsToolbarProps): ReactNode {
    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
                m: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
            }}
        >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {selectedCount} selected
            </Typography>
            <Button size="small" variant="text" onClick={onClear} sx={{ color: 'inherit', textTransform: 'none' }}>
                Clear
            </Button>
            <Box sx={{ flex: 1 }} />
            {renderBulkActions?.(selectionState)}
        </Stack>
    );
}
