import { ViewColumnOutlined } from '@mui/icons-material';
import { Box, Checkbox, CheckboxProps, Divider, FormControlLabel, SxProps, FormGroup, IconButton, Tooltip, Typography, FormControlLabelProps } from '@mui/material';
import React, { useMemo } from 'react';

import { MenuDropdown } from '../droupdown/menu-dropdown';
import { useDataTableContext } from '../../contexts/data-table-context';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';

export interface ColumnVisibilityControlProps {
    // Allow full customization of any prop
    title?: string;
    titleSx?: SxProps;
    menuSx?: SxProps;
    checkboxProps?: CheckboxProps;
    labelProps?: FormControlLabelProps;     
    [key: string]: any;
}

export function ColumnVisibilityControl(props: ColumnVisibilityControlProps = {}) {
    // Use context if no props provided (MUI DataGrid style)
    const { table, slots, slotProps } = useDataTableContext();
    
    // Extract slot-specific props with enhanced merging
    const iconSlotProps = extractSlotProps(slotProps, 'columnIcon');
    const ColumnIconSlot = getSlotComponent(slots, 'columnIcon', ViewColumnOutlined);

    const columns = useMemo(() => {
        if (slotProps?.columnsPanel?.getTogglableColumns) {
            return slotProps?.columnsPanel?.getTogglableColumns(table?.getAllLeafColumns() || []);
        }
        return table?.getAllLeafColumns()?.filter(column => column.getCanHide()) || [];
    }, [slotProps?.columnsPanel, table]);

    const handleColumnVisibilityChange = ((columnId: string, visible: boolean) => {
        table?.getColumn(columnId)?.toggleVisibility(visible);
    });

    // Merge all props for maximum flexibility
    const mergedProps = mergeSlotProps(
        {
            // Default props
            size: 'small',
            sx: { flexShrink: 0 },
        },
        slotProps?.columnVisibilityControl || {},
        props
    );

    return (
        <MenuDropdown
            anchor={(
                <Tooltip title="Column visibility">
                    <IconButton
                        {...mergedProps}
                    >
                        <ColumnIconSlot
                            {...iconSlotProps}
                        />
                    </IconButton>
                </Tooltip>
            )}
        >
            {({ handleClose }: { handleClose: () => void }) => (
                <Box
                    sx={{
                        p: 2,
                        minWidth: 200,
                        // Allow user to override these styles
                        ...mergedProps.menuSx,
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{ 
                            mb: 1,
                            // Allow user to override title styles
                            ...mergedProps.titleSx,
                        }}
                    >
                        {mergedProps.title || 'Show/Hide Columns'}
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <FormGroup>
                        {columns.map((column: any) => (
                            <FormControlLabel
                                key={column.id}
                                control={(
                                    <Checkbox
                                        disabled={!column.getCanHide()}
                                        checked={column.getIsVisible()}
                                        onChange={(e: any) => handleColumnVisibilityChange(column.id, e.target.checked)}
                                        size="small"
                                        // Allow user to override checkbox props
                                        {...mergedProps.checkboxProps}
                                    />
                                )}
                                label={typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                                // Allow user to override label props
                                {...mergedProps.labelProps}
                            />
                        ))}
                    </FormGroup>
                </Box>
            )}
        </MenuDropdown>
    );
}
