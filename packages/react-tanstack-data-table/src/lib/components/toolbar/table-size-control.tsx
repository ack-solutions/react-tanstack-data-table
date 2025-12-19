import { LineWeightOutlined } from '@mui/icons-material';
import { MenuItem, ListItemIcon, ListItemText, Tooltip, IconButton, IconButtonProps, SxProps } from '@mui/material';

import { MenuDropdown } from '../droupdown/menu-dropdown';
import { useDataTableContext } from '../../contexts/data-table-context';
import { ViewComfortableIcon, ViewCompactIcon } from '../../icons';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';

export interface TableSizeControlProps {
    // Allow full customization of any prop
    iconButtonProps?: IconButtonProps;
    menuProps?: any;
    tooltipProps?: any;
    containerSx?: SxProps;
    [key: string]: any;
}

export function TableSizeControl(props: TableSizeControlProps = {}) {
    const { tableSize, onTableSizeChange, slotProps, slots } = useDataTableContext();
    
    // Extract slot-specific props with enhanced merging
    const tableSizeIconSlotProps = extractSlotProps(slotProps, 'tableSizeIcon');
    const tableSizeSmallIconSlotProps = extractSlotProps(slotProps, 'tableSizeSmallIcon');
    const tableSizeMediumIconSlotProps = extractSlotProps(slotProps, 'tableSizeMediumIcon');
    
    const TableSizeIconSlot = getSlotComponent(slots, 'tableSizeIcon', LineWeightOutlined);
    const TableSizeSmallIconSlot = getSlotComponent(slots, 'tableSizeSmallIcon', ViewCompactIcon);
    const TableSizeMediumIconSlot = getSlotComponent(slots, 'tableSizeMediumIcon', ViewComfortableIcon);

    const SIZE_OPTIONS = [
        {
            value: 'small' as const,
            label: 'Compact',
            description: 'Small padding, compact rows',
            icon: <TableSizeSmallIconSlot {...tableSizeSmallIconSlotProps} />,
        },
        {
            value: 'medium' as const,
            label: 'Standard',
            description: 'Default padding and spacing',
            icon: <TableSizeMediumIconSlot {...tableSizeMediumIconSlotProps} />,
        },
    ];

    // Merge all props for maximum flexibility
    const mergedIconButtonProps = mergeSlotProps(
        {
            size: 'small',
            sx: { flexShrink: 0 },
        },
        tableSizeIconSlotProps,
        props.iconButtonProps || {}
    );

    return (
        <MenuDropdown
            anchor={(
                <Tooltip 
                    title="Table size"
                    {...props.tooltipProps}
                >
                    <IconButton
                        {...mergedIconButtonProps}
                    >
                        <TableSizeIconSlot {...tableSizeIconSlotProps} />
                    </IconButton>
                </Tooltip>
            )}
        >
            {SIZE_OPTIONS.map((option) => (
                <MenuItem
                    key={option.value}
                    selected={tableSize === option.value}
                    onClick={() => onTableSizeChange(option.value)}
                    sx={{
                        minWidth: 200,
                        ...props.containerSx,
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                        {option.icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={option.label}
                        secondary={option.description}
                        slotProps={{
                            primary: {
                                variant: 'body2',
                                fontWeight: tableSize === option.value ? 600 : 400,
                            },
                            secondary: {
                                variant: 'caption',
                                color: 'text.secondary',
                            },
                        }}
                    />
                </MenuItem>
            ))}
        </MenuDropdown>
    );
}
