import { LineWeightOutlined } from '@mui/icons-material';
import { MenuItem, ListItemIcon, ListItemText, Tooltip, IconButton } from '@mui/material';

import { MenuDropdown } from '../droupdown/menu-dropdown';
import { useDataTableContext } from '../../contexts/data-table-context';
import { ViewComfortableIcon, ViewCompactIcon } from '../../icons';
import { getSlotComponent } from '../../utils/slot-helpers';


export function TableSizeControl() {
    const { tableSize, onTableSizeChange, slotProps, slots } = useDataTableContext();
    const TableSizeIconSlot = getSlotComponent(slots, 'tableSizeIcon', LineWeightOutlined);
    const TableSizeSmallIconSlot = getSlotComponent(slots, 'tableSizeSmallIcon', ViewCompactIcon);
    const TableSizeMediumIconSlot = getSlotComponent(slots, 'tableSizeMediumIcon', ViewComfortableIcon);

    const SIZE_OPTIONS = [
        {
            value: 'small' as const,
            label: 'Compact',
            description: 'Small padding, compact rows',
            icon: <TableSizeSmallIconSlot {...slotProps?.tableSizeSmallIcon} />,
        },
        {
            value: 'medium' as const,
            label: 'Standard',
            description: 'Default padding and spacing',
            icon: <TableSizeMediumIconSlot {...slotProps?.tableSizeMediumIcon} />,
        },
    ];

    return (
        <MenuDropdown
            anchor={(
                <Tooltip title="Table size">
                    <IconButton
                        size="small"
                        sx={{
                            flexShrink: 0,
                        }}
                    >
                        <TableSizeIconSlot {...slotProps?.tableSizeIcon} />
                    </IconButton>
                </Tooltip>
            )}
        >
            {({ handleClose }: { handleClose: () => void }) => (
                <>
                    {SIZE_OPTIONS.map((option) => (
                        <MenuItem
                            key={option.value}
                            selected={tableSize === option.value}
                            onClick={() => {
                                onTableSizeChange?.(option.value);
                                handleClose();
                            }}
                        >
                            <ListItemIcon>
                                {option.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={option.label}
                                secondary={option.description}
                            />
                        </MenuItem>
                    ))}
                </>
            )}
        </MenuDropdown>
    );
}
