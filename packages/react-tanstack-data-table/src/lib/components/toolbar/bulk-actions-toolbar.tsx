import {
    Box,
    Toolbar,
    Typography,
    Chip,
    Fade,
    alpha,
    Theme,
    ToolbarProps,
    SxProps,
} from '@mui/material';
import { ReactNode, useMemo, ReactElement } from 'react';

import { useDataTableContext } from '../../contexts/data-table-context';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';
import { SelectionState } from '../../features';

export interface BulkActionsToolbarProps extends ToolbarProps {
    selectionState: SelectionState;
    selectedRowCount: number;
    bulkActions?: (selectionState: SelectionState) => ReactNode;
    // Enhanced customization props
    chipProps?: any;
    containerSx?: SxProps;
    leftSectionSx?: SxProps;
    rightSectionSx?: SxProps;
    fadeProps?: any;
    [key: string]: any;
}

export function BulkActionsToolbar(props: BulkActionsToolbarProps): ReactElement {
    const {
        selectionState,
        selectedRowCount,
        bulkActions,
        chipProps,
        containerSx,
        leftSectionSx,
        rightSectionSx,
        fadeProps,
        sx,
        ...otherProps
    } = props;

    const { slots, slotProps } = useDataTableContext();

    // Extract slot-specific props with enhanced merging
    const toolbarSlotProps = extractSlotProps(slotProps, 'bulkActionsToolbar');
    const ToolbarSlot = getSlotComponent(slots, 'bulkActionsToolbar', Toolbar);

    // Memoize the bulk actions rendering to prevent infinite re-renders
    const renderedBulkActions = useMemo(() => {
        if (!bulkActions) return null;
        return bulkActions(selectionState) as any;
    }, [bulkActions, selectionState]);

    // Merge all props for maximum flexibility
    const mergedToolbarProps = mergeSlotProps(
        {
            sx: {
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.05),
                mb: 1,
                position: 'relative',
                zIndex: 1,
                ...sx,
                ...containerSx,
            },
        },
        toolbarSlotProps,
        otherProps
    );

    const mergedChipProps = mergeSlotProps(
        {
            label: `${selectedRowCount} selected`,
            size: 'small',
            color: 'primary',
            variant: 'outlined',
        },
        chipProps || {}
    );

    return (
        <Fade
            in={selectedRowCount > 0}
            {...fadeProps}
        >
            <ToolbarSlot
                {...mergedToolbarProps}
            >
                {/* Left section - Selection info */}
                <Box
                    sx={{
                        flex: '1 1 100%',
                        ...leftSectionSx,
                    }}
                >
                    <Typography
                        color="inherit"
                        variant="subtitle1"
                        component="div"
                    >
                        <Chip
                            {...mergedChipProps}
                        />
                    </Typography>
                </Box>

                {/* Right section - Actions */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        ...rightSectionSx,
                    }}
                >
                    {renderedBulkActions}
                </Box>
            </ToolbarSlot>
        </Fade>
    );
}
