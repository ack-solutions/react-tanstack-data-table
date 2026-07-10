/**
 * BulkActionsToolbar — a contextual action bar that OVERLAYS the toolbar when rows
 * are selected (Material "contextual app bar" pattern). GridView positions it
 * absolutely at the top, so it takes no layout space and the grid height never
 * changes on selection. It fits edge-to-edge and matches the toolbar's height.
 * Shows the selected count, a Clear action, and any custom actions from
 * `renderBulkActions(selectionState)`.
 */
import { Box, Button, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

import type { SelectionState } from '../../types/selection.types';
import { useLocaleText } from '../../locale/locale-context';

export interface BulkActionsToolbarProps {
    selectedCount: number;
    selectionState: SelectionState;
    onClear: () => void;
    onCopy?: () => void;
    renderBulkActions?: (selectionState: SelectionState) => ReactNode;
}

export function BulkActionsToolbar({ selectedCount, selectionState, onClear, onCopy, renderBulkActions }: BulkActionsToolbarProps): ReactNode {
    const locale = useLocaleText();
    return (
        <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
                // Edge-to-edge, same height as the toolbar (52), so it overlays it exactly.
                width: '100%',
                minHeight: 52,
                px: 1.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderBottom: '1px solid var(--dt-border-color)',
            }}
        >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {locale.selectedRows(selectedCount)}
            </Typography>
            <Button size="small" variant="text" onClick={onClear} sx={{ color: 'inherit', textTransform: 'none' }}>
                {locale.clearSelection}
            </Button>
            {onCopy ? (
                <Button size="small" variant="text" onClick={onCopy} sx={{ color: 'inherit', textTransform: 'none' }}>
                    {locale.copy}
                </Button>
            ) : null}
            <Box sx={{ flex: 1 }} />
            {renderBulkActions?.(selectionState)}
        </Stack>
    );
}
