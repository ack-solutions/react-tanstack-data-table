import {
    Box,
    Toolbar,
    Typography,
    Chip,
    Fade,
    alpha,
    Theme,
} from '@mui/material';
import { ReactNode, useMemo } from 'react';

import { useDataTableContext } from '../../contexts/data-table-context';
import { getSlotComponent } from '../../utils/slot-helpers';
import { SelectionState } from '../../features';


export interface BulkActionsToolbarProps<T = any> {
    selectionState: SelectionState;
    selectedRowCount: number;
    bulkActions?: (selectionState: SelectionState) => ReactNode;
    sx?: any;
}

export function BulkActionsToolbar<T = any>({
    selectionState,
    selectedRowCount,
    bulkActions,
    sx,
}: BulkActionsToolbarProps<T>) {
    const { slots, slotProps } = useDataTableContext();
    const ToolbarSlot = getSlotComponent(slots, 'toolbar', Toolbar);

    // Memoize the bulk actions rendering to prevent infinite re-renders
    const renderedBulkActions = useMemo(() => {
        if (!bulkActions) return null;
        return bulkActions(selectionState) as any;
    }, [bulkActions, selectionState]);

    return (
        <Fade in={selectedRowCount > 0}>
            <ToolbarSlot
                sx={{
                    pl: { sm: 2 },
                    pr: {
                        xs: 1,
                        sm: 1,
                    },
                    bgcolor: (theme:Theme) => alpha(theme.palette.primary.main, 0.05),
                    mb: 1,
                    position: 'relative',
                    zIndex: 1,
                    ...sx,
                }}
                {...slotProps?.bulkActionsToolbar}
            >
                {/* Left section - Selection info */}
                <Box sx={{ flex: '1 1 100%' }}>
                    <Typography
                        color="inherit"
                        variant="subtitle1"
                        component="div"
                    >
                        <Chip
                            label={`${selectedRowCount} selected`}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    </Typography>
                </Box>

                {/* Right section - Actions */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    {renderedBulkActions}
                </Box>
            </ToolbarSlot>
        </Fade>
    );
}
