import {
    Stack,
    Toolbar,
    Typography,
    Box,
} from '@mui/material';
import { ReactNode } from 'react';

import { ColumnFilterControl } from './column-filter-control';
import { ColumnPinningControl } from './column-pinning-control';
import { ColumnResetControl } from './column-reset-control';
import { ColumnVisibilityControl } from './column-visibility-control';
import { TableExportControl } from './table-export-control';
import { TableSearchControl } from './table-search-control';
import { TableSizeControl } from './table-size-control';
import { useDataTableContext } from '../../contexts/data-table-context';
import { getSlotComponent } from '../../utils/slot-helpers';


export interface DataTableToolbarProps {
    extraFilter?: ReactNode;
    enableGlobalFilter?: boolean;
    title?: string;
    subtitle?: string;
    enableColumnVisibility?: boolean;
    enableExport?: boolean;
    enableReset?: boolean;
    enableColumnFilter?: boolean;
    enableTableSizeControl?: boolean;
    enableColumnPinning?: boolean;
    // Export event callbacks - allow users to handle export UI externally
}

export function DataTableToolbar({
    extraFilter = null,
    enableGlobalFilter = true,
    title,
    subtitle,
    enableColumnVisibility = true,
    enableExport = true,
    enableReset = true,
    enableColumnFilter = true,
    enableTableSizeControl = true,
    enableColumnPinning = true,
}: DataTableToolbarProps) {
    const { table, slots, slotProps = {} } = useDataTableContext();
    const ToolbarSlot = getSlotComponent(slots, 'toolbar', Toolbar);
    const TableSearchControlSlot = getSlotComponent(slots, 'searchInput', TableSearchControl);
    const TableSizeControlSlot = getSlotComponent(slots, 'tableSizeControl', TableSizeControl);
    const ColumnCustomFilterControlSlot = getSlotComponent(slots, 'columnCustomFilterControl', ColumnFilterControl);
    const ColumnPinningControlSlot = getSlotComponent(slots, 'columnPinningControl', ColumnPinningControl);
    const ColumnVisibilityControlSlot = getSlotComponent(slots, 'columnVisibilityControl', ColumnVisibilityControl);
    const ColumnResetControlSlot = getSlotComponent(slots, 'resetButton', ColumnResetControl);
    const TableExportControlSlot = getSlotComponent(slots, 'exportButton', TableExportControl);

    return (
        <ToolbarSlot
            table={table}
            {...slotProps.toolbar}
        >
            <Box sx={{ width: '100%' }}>
                {(title || subtitle) ? (
                    <Box sx={{ mb: 2 }}>
                        {title ? (
                            <Typography
                                variant="h6"
                                component="div"
                            >
                                {title}
                            </Typography>
                        ) : null}
                        {subtitle ? (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {subtitle}
                            </Typography>
                        ) : null}
                    </Box>
                ) : null}

                <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="space-between"
                    alignItems="center"
                >
                    {/* Left Section - Search, Filters, Actions, and Status */}
                    <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{ flex: 1 }}
                    >


                        {/* Table Actions and Filters */}

                        {/* Search */}
                        {enableGlobalFilter ? <TableSearchControlSlot {...slotProps.searchInput} /> : null}

                        {enableTableSizeControl ? <TableSizeControlSlot {...slotProps.tableSizeControl} /> : null}

                        {enableColumnFilter ? <ColumnCustomFilterControlSlot {...slotProps.columnCustomFilterControl} /> : null}

                        {enableColumnPinning ? <ColumnPinningControlSlot {...slotProps.columnPinningControl} /> : null}

                        {enableColumnVisibility ? <ColumnVisibilityControlSlot {...slotProps.columnVisibilityControl} /> : null}

                        {enableReset ? <ColumnResetControlSlot {...slotProps.resetButton} /> : null}

                        {enableExport ? <TableExportControlSlot {...slotProps.exportButton} /> : null}

                    </Stack>

                    {/* Right Section - Extra Filter and More Menu */}
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >
                        {/* Extra Filter */}
                        {extraFilter as any}
                    </Stack>
                </Stack>
            </Box>
        </ToolbarSlot>
    );
}
