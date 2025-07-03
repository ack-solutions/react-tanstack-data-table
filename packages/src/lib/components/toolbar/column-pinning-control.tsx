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
} from '@mui/material';
import { ColumnPinningState, Column } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';

import { MenuDropdown } from '../droupdown/menu-dropdown';
import { useDataTableContext } from '../../contexts/data-table-context';
import {
    UnpinIcon,
} from '../../icons';
import { getSlotComponent } from '../../utils/slot-helpers';


export function ColumnPinningControl() {
    // Use context if no props provided (MUI DataGrid style)
    const { table, slots, slotProps } = useDataTableContext();
    const PinIconSlot = getSlotComponent(slots, 'pinIcon', PushPinOutlined);
    const UnpinIconSlot = getSlotComponent(slots, 'unpinIcon', UnpinIcon);
    const LeftIconSlot = getSlotComponent(slots, 'leftIcon', ArrowLeftOutlined);
    const RightIconSlot = getSlotComponent(slots, 'rightIcon', ArrowRightOutlined);

    const columnPinning = table.getState().columnPinning;

    const allColumns: Column<any, unknown>[] = useMemo(() => {
        if (slotProps?.columnsPanel?.getPinnableColumns) {
            return slotProps?.columnsPanel?.getPinnableColumns(table.getAllLeafColumns());
        }
        return table.getAllLeafColumns().filter(column => column.getCanPin());
    }, [slotProps?.columnsPanel, table]);

    const handlePinColumn = (columnId: string, position: 'left' | 'right' | 'none') => {
        const currentPinning = table.getState().columnPinning;
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

        table.setColumnPinning(newPinning);
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
        table.setColumnPinning(table.initialState.columnPinning || {});
    }, [table]);

    // Count only user-pinned columns (exclude system columns like select and action)
    const userPinnedLeft = (columnPinning.left?.filter((id) => allColumns.some((column: any) => column.id === id)) || []);
    const userPinnedRight = (columnPinning.right?.filter((id) => allColumns.some((column: any) => column.id === id)) || []);
    const totalPinned = userPinnedLeft.length + userPinnedRight.length;

    return (
        <MenuDropdown
            anchor={(
                <Tooltip title="Pin columns">
                    <IconButton
                        size="small"
                        sx={{
                            flexShrink: 0,
                        }}
                    >
                        <PinIconSlot {...slotProps?.pinIcon} />
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
                                }}
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
                        minWidth: 300,
                        maxHeight: 400,
                        overflow: 'auto',
                    }}
                >
                    <Box
                        sx={{
                            p: 2,
                            pb: 1,
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{ mb: 1 }}
                        >
                            Pin Columns
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Pin columns to keep them visible while scrolling
                        </Typography>
                    </Box>
                    <Divider />

                    {/* Column List */}
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
                                                        {...slotProps?.leftIcon}
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
                                                        {...slotProps?.rightIcon}
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
                                                            {...slotProps?.unpinIcon}
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
                                            pinStatus !== 'none' ? (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.5,
                                                        mt: 0.5,
                                                    }}
                                                >
                                                    {pinStatus === 'left' ? (
                                                        <LeftIconSlot
                                                            fontSize="small"
                                                            {...slotProps?.leftIcon}
                                                        />
                                                    ) : (
                                                        <RightIconSlot
                                                            fontSize="small"
                                                            {...slotProps?.rightIcon}
                                                        />
                                                    )}
                                                    <Typography
                                                        variant="caption"
                                                        color={pinStatus === 'left' ? 'primary' : 'secondary'}
                                                    >
                                                        Pinned
                                                        {' '}
                                                        {pinStatus}
                                                    </Typography>
                                                </Box>
                                            ) : null
                                        }
                                    />
                                </ListItem>
                            );
                        })}
                    </List>

                    {/* Quick Actions */}
                    <Divider />
                    <Box
                        sx={{
                            p: 2,
                            pt: 1,
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 1,
                                justifyContent: 'space-between',
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Quick actions:
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    gap: 1,
                                }}
                            >
                                <Tooltip title="Unpin all user columns">
                                    <IconButton
                                        size="small"
                                        onClick={handleUnpinAll}
                                        disabled={totalPinned === 0}
                                    >
                                        <UnpinIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            )}
        </MenuDropdown>
    );
}
