/**
 * BulkActionsToolbar — a contextual action bar that OVERLAYS the toolbar when rows
 * are selected (Material "contextual app bar" pattern). GridView positions it
 * absolutely at the top, so it takes no layout space and the grid height never
 * changes on selection. It fits edge-to-edge and matches the toolbar's height.
 * Shows the selected count, a Clear action, and any custom actions from
 * `renderBulkActions(selectionState)`.
 *
 * The bar's surface is the themeable `bulkActionsToolbar` slot (GridBulkActionsToolbar),
 * whose background/foreground read the `--dt-bulkbar-bg` / `--dt-bulkbar-fg` tokens
 * (default: the primary palette). Retint it three ways — the tokens, theme
 * `styleOverrides.bulkActionsToolbar`, or per-instance `slotProps.bulkActionsToolbar`
 * (its `sx` / `className` / `style` / rest are forwarded onto the bar here).
 */
import { Box, Button, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type { CSSProperties, ReactNode } from 'react';

import type { SelectionState } from '../../types/selection.types';
import { useLocaleText } from '../../locale/locale-context';
import { GridBulkActionsToolbar } from '../grid/styled';

export interface BulkActionsToolbarProps {
    selectedCount: number;
    selectionState: SelectionState;
    onClear: () => void;
    onCopy?: () => void;
    renderBulkActions?: (selectionState: SelectionState) => ReactNode;
    /** Injected by GridView; unused by the default bar (custom slots may use it). */
    engine?: unknown;
    /** Forwarded from `slotProps.bulkActionsToolbar` onto the bar root. */
    sx?: SxProps<Theme>;
    className?: string;
    style?: CSSProperties;
}

export function BulkActionsToolbar({
    selectedCount,
    selectionState,
    onClear,
    onCopy,
    renderBulkActions,
    engine: _engine,
    sx,
    className,
    style,
    ...rest
}: BulkActionsToolbarProps): ReactNode {
    const locale = useLocaleText();
    return (
        <GridBulkActionsToolbar {...rest} className={className} style={style} sx={sx}>
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
        </GridBulkActionsToolbar>
    );
}
