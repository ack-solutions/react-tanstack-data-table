import {
    Stack,
    Toolbar,
    Typography,
    Box,
    ToolbarProps,
    SxProps,
} from '@mui/material';
import React, { ReactNode, ReactElement } from 'react';

import { ColumnFilterControl } from './column-filter-control';
import { ColumnPinningControl } from './column-pinning-control';
import { ColumnResetControl } from './column-reset-control';
import { ColumnVisibilityControl } from './column-visibility-control';
import { TableExportControl } from './table-export-control';
import { TableSearchControl } from './table-search-control';
import { TableSizeControl } from './table-size-control';
import { useDataTableContext } from '../../contexts/data-table-context';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';

export interface DataTableToolbarProps extends ToolbarProps {
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
    // Enhanced styling props
    titleSx?: SxProps;
    subtitleSx?: SxProps;
    containerSx?: SxProps;
    leftSectionSx?: SxProps;
    rightSectionSx?: SxProps;
    // Allow full customization of any prop
    [key: string]: any;
}

export function DataTableToolbar(props: DataTableToolbarProps = {}): ReactElement {
    const {
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
        titleSx,
        subtitleSx,
        containerSx,
        leftSectionSx,
        rightSectionSx,
        ...otherProps
    } = props;

    const { table, slots, slotProps = {} } = useDataTableContext();
    
    // Extract slot-specific props with enhanced merging
    const toolbarSlotProps = extractSlotProps(slotProps, 'toolbar');
    const searchInputSlotProps = extractSlotProps(slotProps, 'searchInput');
    const tableSizeControlSlotProps = extractSlotProps(slotProps, 'tableSizeControl');
    const columnCustomFilterControlSlotProps = extractSlotProps(slotProps, 'columnCustomFilterControl');
    const columnPinningControlSlotProps = extractSlotProps(slotProps, 'columnPinningControl');
    const columnVisibilityControlSlotProps = extractSlotProps(slotProps, 'columnVisibilityControl');
    const resetButtonSlotProps = extractSlotProps(slotProps, 'resetButton');
    const exportButtonSlotProps = extractSlotProps(slotProps, 'exportButton');
    
    const ToolbarSlot = getSlotComponent(slots, 'toolbar', Toolbar);
    const TableSearchControlSlot = getSlotComponent(slots, 'searchInput', TableSearchControl);
    const TableSizeControlSlot = getSlotComponent(slots, 'tableSizeControl', TableSizeControl);
    const ColumnCustomFilterControlSlot = getSlotComponent(slots, 'columnCustomFilterControl', ColumnFilterControl);
    const ColumnPinningControlSlot = getSlotComponent(slots, 'columnPinningControl', ColumnPinningControl);
    const ColumnVisibilityControlSlot = getSlotComponent(slots, 'columnVisibilityControl', ColumnVisibilityControl);
    const ColumnResetControlSlot = getSlotComponent(slots, 'resetButton', ColumnResetControl);
    const TableExportControlSlot = getSlotComponent(slots, 'exportButton', TableExportControl);

    // Merge all props for maximum flexibility
    const mergedToolbarProps = mergeSlotProps(
        {
            // Default toolbar props
            table,
            ...otherProps,
        },
        toolbarSlotProps
    );

    return (
        <ToolbarSlot
            {...mergedToolbarProps}
        >
            <Box 
                sx={{ 
                    width: '100%',
                    ...containerSx,
                }}
            >
                {(title || subtitle) ? (
                    <Box sx={{ mb: 2 }}>
                        {title ? (
                            <Typography
                                variant="h6"
                                component="div"
                                sx={titleSx}
                            >
                                {title}
                            </Typography>
                        ) : null}
                        {subtitle ? (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={subtitleSx}
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
                        sx={{ 
                            flex: 1,
                            ...leftSectionSx,
                        }}
                    >
                        {/* Table Actions and Filters */}
                        {enableTableSizeControl ? (
                            <TableSizeControlSlot 
                                {...mergeSlotProps(
                                    {},
                                    tableSizeControlSlotProps,
                                    props.tableSizeControlProps || {}
                                )}
                            />
                        ) : null}

                        {enableColumnFilter ? (
                            <ColumnCustomFilterControlSlot 
                                {...mergeSlotProps(
                                    {},
                                    columnCustomFilterControlSlotProps,
                                    props.columnFilterProps || {}
                                )}
                            />
                        ) : null}

                        {enableColumnPinning ? (
                            <ColumnPinningControlSlot 
                                {...mergeSlotProps(
                                    {},
                                    columnPinningControlSlotProps,
                                    props.columnPinningProps || {}
                                )}
                            />
                        ) : null}

                        {enableColumnVisibility ? (
                            <ColumnVisibilityControlSlot 
                                {...mergeSlotProps(
                                    {},
                                    columnVisibilityControlSlotProps,
                                    props.columnVisibilityProps || {}
                                )}
                            />
                        ) : null}

                        {enableReset ? (
                            <ColumnResetControlSlot 
                                {...mergeSlotProps(
                                    {},
                                    resetButtonSlotProps,
                                    props.resetButtonProps || {}
                                )}
                            />
                        ) : null}

                        {enableExport ? (
                            <TableExportControlSlot 
                                {...mergeSlotProps(
                                    {},
                                    exportButtonSlotProps,
                                    props.exportButtonProps || {}
                                )}
                            />
                        ) : null}

                        {/* Search */}
                        {enableGlobalFilter ? (
                            <TableSearchControlSlot 
                                {...mergeSlotProps(
                                    {},
                                    searchInputSlotProps,
                                    props.searchInputProps || {}
                                )}
                            />
                        ) : null}
                    </Stack>

                    {/* Right Section - Extra Filter and More Menu */}
                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={rightSectionSx}
                    >
                        {/* Extra Filter */}
                        {extraFilter as any}
                    </Stack>
                </Stack>
            </Box>
        </ToolbarSlot>
    );
}
