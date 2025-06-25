import { ViewColumnOutlined } from '@mui/icons-material';
import { Box, Checkbox, Divider, FormControlLabel, FormGroup, IconButton, Tooltip, Typography } from '@mui/material';
import { useMemo } from 'react';

import { MenuDropdown } from '../../../../menu-dropdown';
import { useDataTableContext } from '../../contexts/data-table-context';
import { getSlotComponent } from '../../utils/slot-helpers';


export function ColumnVisibilityControl() {
    // Use context if no props provided (MUI DataGrid style)
    const { table, slots, slotProps } = useDataTableContext();
    const ColumnIconSlot = getSlotComponent(slots, 'columnIcon', ViewColumnOutlined);


    const columns = useMemo(() => {
        if (slotProps.columnsPanel?.getTogglableColumns) {
            return slotProps.columnsPanel?.getTogglableColumns(table.getAllLeafColumns());
        }
        return table.getAllLeafColumns().filter(column => column.getCanHide());
    }, [slotProps.columnsPanel, table]);


    const handleColumnVisibilityChange = ((columnId: string, visible: boolean) => {
        table.getColumn(columnId)?.toggleVisibility(visible);
    });

    return (
        <MenuDropdown
            anchor={(
                <Tooltip title="Column visibility">
                    <IconButton
                        size="small"
                        sx={{
                            flexShrink: 0,
                        }}
                    >
                        <ColumnIconSlot
                            {...slotProps.columnIcon}
                        />
                    </IconButton>
                </Tooltip>
            )}
        >
            {({ handleClose: _handleClose }) => (
                <Box
                    sx={{
                        p: 2,
                        minWidth: 200,
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{ mb: 1 }}
                    >
                        Show/Hide Columns
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    <FormGroup>
                        {columns.map(column => (
                            <FormControlLabel
                                key={column.id}
                                control={(
                                    <Checkbox
                                        disabled={!column.getCanHide()}
                                        checked={column.getIsVisible()}
                                        onChange={(e) => handleColumnVisibilityChange(column.id, e.target.checked)}
                                        size="small"
                                    />
                                )}
                                label={typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                            />
                        ))}
                    </FormGroup>
                </Box>
            )}
        </MenuDropdown>
    );
}
