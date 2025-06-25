import { SelectAll, Deselect } from '@mui/icons-material';
import {
    Box,
    Toolbar,
    Typography,
    Chip,
    Fade,
    alpha,
    IconButton,
    Tooltip,
    Theme,
} from '@mui/material';
import { ReactNode } from 'react';

import { useDataTableContext } from '../../contexts/data-table-context';
import { getSlotComponent } from '../../utils/slot-helpers';


export interface BulkActionsToolbarProps<T = any> {
    selectedRows: T[];
    selectedRowCount: number;
    bulkActions?: (selectedRows: T[]) => ReactNode;
    enableSelectAll?: boolean;
    onSelectAll?: () => void;
    onDeselectAll?: () => void;
    sx?: any;
}

export function BulkActionsToolbar<T = any>({
    selectedRowCount,
    bulkActions,
    enableSelectAll = true,
    onSelectAll,
    onDeselectAll,
    selectedRows,
    sx,
}: BulkActionsToolbarProps<T>) {
    const { slots, slotProps } = useDataTableContext();
    const ToolbarSlot = getSlotComponent(slots, 'toolbar', Toolbar);
    const SelectAllIconSlot = getSlotComponent(slots, 'selectAllIcon', SelectAll);
    const DeselectIconSlot = getSlotComponent(slots, 'deselectIcon', Deselect);


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
                    {/* Select/Deselect All icons */}
                    {enableSelectAll ? (
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 0.5,
                            }}
                        >
                            {onSelectAll ? (
                                <Tooltip title="Select All">
                                    <IconButton
                                        onClick={onSelectAll}
                                        size="small"
                                        color="primary"
                                    >
                                        <SelectAllIconSlot {...slotProps?.selectAllIcon} />
                                    </IconButton>
                                </Tooltip>
                            ) : null}
                            {onDeselectAll ? (
                                <Tooltip title="Deselect All">
                                    <IconButton
                                        onClick={onDeselectAll}
                                        size="small"
                                    >
                                        <DeselectIconSlot {...slotProps?.deselectIcon} />
                                    </IconButton>
                                </Tooltip>
                            ) : null}
                        </Box>
                    ) : null}

                    {/* Custom bulk actions */}
                    {bulkActions ? (bulkActions(selectedRows) as any) : null}
                </Box>
            </ToolbarSlot>
        </Fade>
    );
}
