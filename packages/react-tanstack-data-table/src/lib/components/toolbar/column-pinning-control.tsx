import { ArrowLeftOutlined, ArrowRightOutlined, PushPinOutlined } from '@mui/icons-material';
import {
    Box,
    Typography,
    Divider,
    IconButton,
    Tooltip,
    List,
    ListItem,
    ListItemText,
    IconButtonProps,
    SxProps,
} from '@mui/material';
import { ColumnPinningState, Column } from '@tanstack/react-table';
import React, { useCallback, useMemo } from 'react';

import { MenuDropdown } from '../droupdown/menu-dropdown';
import { useDataTableContext } from '../../contexts/data-table-context';
import {
    UnpinIcon,
} from '../../icons';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';

export interface ColumnPinningControlProps {
    // Allow full customization of any prop
    title?: string;
    titleSx?: SxProps;
    menuSx?: SxProps;
    iconButtonProps?: IconButtonProps;
    tooltipProps?: any;
    badgeProps?: any;
    clearButtonProps?: any;
    [key: string]: any;
}

export function ColumnPinningControl(props: ColumnPinningControlProps = {}) {
    // Use context if no props provided (MUI DataGrid style)
    const { table, slots, slotProps } = useDataTableContext();
    
    // Extract slot-specific props with enhanced merging
    const pinIconSlotProps = extractSlotProps(slotProps, 'pinIcon');
    const unpinIconSlotProps = extractSlotProps(slotProps, 'unpinIcon');
    const leftIconSlotProps = extractSlotProps(slotProps, 'leftIcon');
    const rightIconSlotProps = extractSlotProps(slotProps, 'rightIcon');
    
    const PinIconSlot = getSlotComponent(slots, 'pinIcon', PushPinOutlined);
    const UnpinIconSlot = getSlotComponent(slots, 'unpinIcon', UnpinIcon);
    const LeftIconSlot = getSlotComponent(slots, 'leftIcon', ArrowLeftOutlined);
    const RightIconSlot = getSlotComponent(slots, 'rightIcon', ArrowRightOutlined);

    const columnPinning = table?.getState().columnPinning || {};

    const allColumns: Column<any, unknown>[] = useMemo(() => {
        if (slotProps?.columnsPanel?.getPinnableColumns) {
            return slotProps?.columnsPanel?.getPinnableColumns(table?.getAllLeafColumns() || []);
        }
        return table?.getAllLeafColumns()?.filter(column => column.getCanPin()) || [];
    }, [slotProps?.columnsPanel, table]);

    const handlePinColumn = (columnId: string, position: 'left' | 'right' | 'none') => {
        const currentPinning = table?.getState().columnPinning || {};
        const newPinning: ColumnPinningState = { ...currentPinning };

        // Remove from current position
        newPinning.left = (newPinning.left || []).filter(id => id !== columnId);
        newPinning.right = (newPinning.right || []).filter(id => id !== columnId);

        // Add to new position
        if (position === 'left') {
            newPinning.left = [...(newPinning.left || []), columnId];
        } else if (position === 'right') {
            newPinning.right = [...(newPinning.right || []), columnId];
        }

        table?.setColumnPinning(newPinning);
    };

    const getColumnPinStatus = (columnId: string): 'left' | 'right' | 'none' => {
        if (columnPinning.left?.includes(columnId)) return 'left';
        if (columnPinning.right?.includes(columnId)) return 'right';
        return 'none';
    };

    const getColumnDisplayName = (column: any) => {
        if (typeof column.columnDef.header === 'string') {
            return column.columnDef.header;
        }
        return column.id;
    };

    const handleUnpinAll = useCallback(() => {
        table?.setColumnPinning(table?.initialState?.columnPinning || {});
    }, [table]);

    // Count only user-pinned columns (exclude system columns like select and action)
    const userPinnedLeft = (columnPinning.left?.filter((id) => allColumns.some((column: any) => column.id === id)) || []);
    const userPinnedRight = (columnPinning.right?.filter((id) => allColumns.some((column: any) => column.id === id)) || []);
    const totalPinned = userPinnedLeft.length + userPinnedRight.length;

    // Merge all props for maximum flexibility
    const mergedIconButtonProps = mergeSlotProps(
        {
            size: 'small',
            sx: { flexShrink: 0 },
        },
        pinIconSlotProps,
        props.iconButtonProps || {}
    );

    return (
        <MenuDropdown
            anchor={(
                <Tooltip 
                    title="Pin columns"
                    {...props.tooltipProps}
                >
                    <IconButton
                        {...mergedIconButtonProps}
                    >
                        <PinIconSlot {...pinIconSlotProps} />
                        {totalPinned > 0 && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: -2,
                                    right: -2,
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: 16,
                                    height: 16,
                                    fontSize: 10,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    ...props.badgeProps?.sx,
                                }}
                                {...props.badgeProps}
                            >
                                {totalPinned}
                            </Box>
                        )}
                    </IconButton>
                </Tooltip>
            )}
        >
            {({ handleClose }: { handleClose: () => void }) => (
                <Box
                    sx={{
                        p: 2,
                        minWidth: 300,
                        maxWidth: 400,
                        ...props.menuSx,
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{
                            mb: 1,
                            ...props.titleSx,
                        }}
                    >
                        {props.title || 'Pin Columns'}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {totalPinned > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <IconButton
                                size="small"
                                onClick={handleUnpinAll}
                                color="warning"
                                {...props.clearButtonProps}
                            >
                                <UnpinIconSlot {...unpinIconSlotProps} />
                            </IconButton>
                            <Typography variant="caption" sx={{ ml: 1 }}>
                                Unpin all columns
                            </Typography>
                        </Box>
                    )}

                    <List
                        dense
                        sx={{ py: 0 }}
                    >
                        {allColumns.map((column: any) => {
                            const pinStatus = getColumnPinStatus(column.id);
                            const displayName = getColumnDisplayName(column);

                            return (
                                <ListItem
                                    key={column.id}
                                    sx={{ py: 0.5 }}
                                    secondaryAction={(
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                gap: 0.5,
                                            }}
                                        >
                                            {/* Pin Left */}
                                            <Tooltip title="Pin left">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handlePinColumn(column.id, pinStatus === 'left' ? 'none' : 'left')}
                                                    color={pinStatus === 'left' ? 'primary' : 'default'}
                                                >
                                                    <LeftIconSlot
                                                        fontSize="small"
                                                        {...leftIconSlotProps}
                                                    />
                                                </IconButton>
                                            </Tooltip>

                                            {/* Pin Right */}
                                            <Tooltip title="Pin right">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handlePinColumn(column.id, pinStatus === 'right' ? 'none' : 'right')}
                                                    color={pinStatus === 'right' ? 'secondary' : 'default'}
                                                >
                                                    <RightIconSlot
                                                        fontSize="small"
                                                        {...rightIconSlotProps}
                                                    />
                                                </IconButton>
                                            </Tooltip>

                                            {/* Unpin */}
                                            {pinStatus !== 'none' && (
                                                <Tooltip title="Unpin">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handlePinColumn(column.id, 'none')}
                                                    >
                                                        <UnpinIconSlot
                                                            fontSize="small"
                                                            {...unpinIconSlotProps}
                                                        />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    )}
                                >
                                    <ListItemText
                                        primary={displayName}
                                        secondary={
                                            pinStatus === 'left' ? 'Pinned left' :
                                            pinStatus === 'right' ? 'Pinned right' :
                                            'Not pinned'
                                        }
                                        slotProps={{
                                            primary: {
                                                variant: 'body2',
                                                fontWeight: pinStatus !== 'none' ? 600 : 400,
                                            },
                                            secondary: {
                                                variant: 'caption',
                                                color: pinStatus !== 'none' ? 'primary.main' : 'text.secondary',
                                            },
                                        }}
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>
            )}
        </MenuDropdown>
    );
}
