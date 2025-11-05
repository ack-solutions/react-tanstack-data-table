/**
 * DataTableRow Component
 *
 * Renders individual table rows with support for:
 * - Column pinning
 * - Row expansion
 * - Hover effects
 * - Striped styling
 */
import { TableRow, TableCell, Collapse, TableRowProps, TableCellProps, SxProps, tableRowClasses, alpha } from '@mui/material';
import { flexRender, Row } from '@tanstack/react-table';
import { ReactNode } from 'react';

import { getPinnedColumnStyle, getColumnAlignment } from '../../utils';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';

export interface DataTableRowProps<T> extends TableRowProps {
    row: Row<T>;
    enableHover?: boolean;
    enableStripes?: boolean;
    isOdd?: boolean;
    renderSubComponent?: (row: Row<T>) => ReactNode;
    disableStickyHeader?: boolean;
    // Enhanced customization props
    cellProps?: TableCellProps;
    expandedRowProps?: TableRowProps;
    expandedCellProps?: TableCellProps;
    containerSx?: SxProps;
    expandedContainerSx?: SxProps;
    // Cell slot management
    slots?: Record<string, any>;
    slotProps?: Record<string, any>;
    [key: string]: any;
}

/**
 * Individual table row component with cell rendering and expansion support
 */
export function DataTableRow<T>(props: DataTableRowProps<T>) {
    const {
        row,
        enableHover = true,
        enableStripes = false,
        isOdd = false,
        renderSubComponent,
        disableStickyHeader = false,
        cellProps,
        expandedRowProps,
        expandedCellProps,
        containerSx,
        expandedContainerSx,
        slots,
        slotProps,
        ...otherProps
    } = props;

    // Extract slot-specific props with enhanced merging
    const cellSlotProps = extractSlotProps(slotProps, 'cell');
    const expandedRowSlotProps = extractSlotProps(slotProps, 'expandedRow');
    const rowSlotProps = extractSlotProps(slotProps, 'row');
    
    const CellSlot = getSlotComponent(slots, 'cell', TableCell);
    const ExpandedRowSlot = getSlotComponent(slots, 'expandedRow', TableRow);
    const TableRowSlot = getSlotComponent(slots, 'row', TableRow);

    // Merge all props for maximum flexibility
    const mergedRowProps = mergeSlotProps(
        {
            hover: enableHover,
            sx: (theme) => ({
                // set the row background as a variable
                '--row-bg': enableStripes && isOdd
                    ? theme.palette.action.hover
                    : theme.palette.background.paper,

                backgroundColor: 'var(--row-bg)',

                // keep the variable in sync for hover/selected
                ...(enableHover && {
                    '&:hover': { '--row-bg': theme.palette.action.hover },
                }),
                [`&.${tableRowClasses.selected}`]: {
                    '--row-bg': alpha(theme.palette.primary.dark, 0.08),
                    backgroundColor: 'var(--row-bg)',
                },

                ...containerSx,
            }),
        },
        rowSlotProps,
        otherProps
    );
    const mergedExpandedRowProps = mergeSlotProps(
        {
            sx: expandedContainerSx,
        },
        expandedRowSlotProps,
        expandedRowProps || {}
    );

    return (
        <>
            <TableRowSlot
                {...mergedRowProps}
            >
                {row.getVisibleCells().map(cell => {
                    const isPinned = cell.column.getIsPinned();
                    const pinnedPosition = isPinned ? cell.column.getStart('left') : undefined;
                    const pinnedRightPosition = isPinned === 'right' ? cell.column.getAfter('right') : undefined;
                    const alignment = getColumnAlignment(cell.column.columnDef);

                    // Get minSize and maxSize from column definition
                    const minSize = cell.column.columnDef?.minSize;
                    const maxSize = cell.column.columnDef.maxSize;

                    const mergedCellProps = mergeSlotProps(
                        {
                            align: alignment,
                            sx: {
                                ...getPinnedColumnStyle({
                                    width: cell.column.getSize() || 'auto',
                                    minWidth: minSize !== undefined ? minSize : undefined,
                                    maxWidth: maxSize !== undefined ? maxSize : undefined,
                                    isPinned,
                                    pinnedPosition,
                                    pinnedRightPosition,
                                    zIndex: isPinned ? 9 : 1,
                                    disableStickyHeader,
                                    isLastLeftPinnedColumn: isPinned === 'left' && cell.column.getIsLastColumn('left'),
                                    isFirstRightPinnedColumn: isPinned === 'right' && cell.column.getIsFirstColumn('right'),
                                }),
                            },
                        },
                        cellSlotProps,
                        cellProps || {}
                    );

                    return (
                        <CellSlot
                            key={cell.id}
                            {...mergedCellProps}
                        >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </CellSlot>
                    );
                })}
            </TableRowSlot>

            {row.getIsExpanded() && renderSubComponent ? (
                <ExpandedRowSlot
                    {...mergedExpandedRowProps}
                >
                    <CellSlot
                        colSpan={row.getVisibleCells().length + 1}
                        sx={{ 
                            py: 0,
                            ...expandedCellProps?.sx,
                        }}
                        {...mergeSlotProps(
                            {},
                            cellSlotProps,
                            expandedCellProps || {}
                        )}
                    >
                        <Collapse
                            in={row.getIsExpanded()}
                            timeout="auto"
                            unmountOnExit
                        >
                            {renderSubComponent(row) as any}
                        </Collapse>
                    </CellSlot>
                </ExpandedRowSlot>
            ) : null}
        </>
    );
}
