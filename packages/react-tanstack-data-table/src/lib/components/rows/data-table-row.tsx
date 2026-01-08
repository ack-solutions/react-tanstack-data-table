/**
 * DataTableRow Component
 *
 * Renders individual table rows with support for:
 * - Column pinning
 * - Row expansion
 * - Hover effects
 * - Striped styling
 */
import { TableRow, TableCell, Collapse, TableRowProps, TableCellProps, SxProps, tableRowClasses } from '@mui/material';
import { flexRender, Row } from '@tanstack/react-table';
import { ReactNode, ReactElement } from 'react';

import { getPinnedColumnStyle, getColumnAlignment } from '../../utils';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';
import { useDataTableContext } from '../../contexts/data-table-context';

export interface DataTableRowProps<T> extends TableRowProps {
    row: Row<T>;
    enableHover?: boolean;
    enableStripes?: boolean;
    isOdd?: boolean;
    renderSubComponent?: (row: Row<T>) => ReactNode;
    disableStickyHeader?: boolean;
    // Row click props
    onRowClick?: (event: React.MouseEvent<HTMLTableRowElement>, row: Row<T>) => void;
    selectOnRowClick?: boolean; // If true, row click will toggle selection (default: false)
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
export function DataTableRow<T>(props: DataTableRowProps<T>): ReactElement {
    const {
        row,
        enableHover = true,
        enableStripes = false,
        isOdd = false,
        renderSubComponent,
        disableStickyHeader = false,
        onRowClick,
        selectOnRowClick = false,
        cellProps,
        expandedRowProps,
        expandedCellProps,
        containerSx,
        expandedContainerSx,
        slots,
        slotProps,
        ...otherProps
    } = props;
    const { table } = useDataTableContext();

    // Extract slot-specific props with enhanced merging
    const cellSlotProps = extractSlotProps(slotProps, 'cell');
    const expandedRowSlotProps = extractSlotProps(slotProps, 'expandedRow');
    const rowSlotProps = extractSlotProps(slotProps, 'row');

    const CellSlot = getSlotComponent(slots, 'cell', TableCell);
    const ExpandedRowSlot = getSlotComponent(slots, 'expandedRow', TableRow);
    const TableRowSlot = getSlotComponent(slots, 'row', TableRow);

    // Handle row click
    const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
        // Check if click target is a checkbox, button, or interactive element
        const target = event.target as HTMLElement;
        
        // Check for various interactive elements
        const isCheckboxClick = target.closest('input[type="checkbox"]') !== null;
        const isButtonClick = target.closest('button') !== null;
        const isLinkClick = target.closest('a') !== null;
        // Check for elements with interactive roles (button, checkbox, switch, etc.)
        const isInteractiveRole = target.closest('[role="button"]') !== null || 
                                  target.closest('[role="checkbox"]') !== null ||
                                  target.closest('[role="switch"]') !== null ||
                                  target.closest('[role="menuitem"]') !== null;
        
        // Determine if this is an interactive element click
        const isInteractiveClick = isCheckboxClick || isButtonClick || isLinkClick || isInteractiveRole;

        // If selectOnRowClick is enabled and it's not an interactive element click, toggle selection
        if (selectOnRowClick && !isInteractiveClick && table?.toggleRowSelected) {
            table.toggleRowSelected(row.id);
        }

        // Only call onRowClick if it's not an interactive element click
        if (onRowClick && !isInteractiveClick) {
            onRowClick(event, row);
        }
    };

    // Merge all props for maximum flexibility
    const mergedRowProps = mergeSlotProps(
        {
            hover: enableHover,
            selected: !!table?.getIsRowSelected?.(row.id),
            onClick: (onRowClick || selectOnRowClick) ? handleRowClick : undefined,
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
                    '--row-bg': theme.palette.action.selected,
                    backgroundColor: 'var(--row-bg)',
                },
                // Add cursor pointer if row is clickable
                ...((onRowClick || selectOnRowClick) && {
                    cursor: 'pointer',
                }),
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
                    const wrapText = cell.column.columnDef.wrapText ?? false;

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
                                    wrapText,
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
                        colSpan={row.getVisibleCells().length}
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
