/**
 * DataTableRow Component
 *
 * Renders individual table rows with support for:
 * - Column pinning
 * - Row expansion
 * - Hover effects
 * - Striped styling
 */
import { TableRow, TableCell, Collapse } from '@mui/material';
import { flexRender, Row } from '@tanstack/react-table';
import { ReactNode } from 'react';

import { getPinnedColumnStyle, getColumnAlignment } from '../../utils';
import { getSlotComponent } from '../../utils/slot-helpers';


export interface DataTableRowProps<T> {
    row: Row<T>;
    enableHover?: boolean;
    enableStripes?: boolean;
    isOdd?: boolean;
    renderSubComponent?: (row: Row<T>) => ReactNode;
    disableStickyHeader?: boolean;
    // Cell slot management
    slots?: Record<string, any>;
    slotProps?: Record<string, any>;
}

/**
 * Individual table row component with cell rendering and expansion support
 */
export function DataTableRow<T>({
    row,
    enableHover = true,
    enableStripes = false,
    isOdd = false,
    renderSubComponent,
    disableStickyHeader = false,
    slots,
    slotProps,
}: DataTableRowProps<T>) {
    const CellSlot = getSlotComponent(slots, 'cell', TableCell);
    const ExpandedRowSlot = getSlotComponent(slots, 'expandedRow', TableRow);
    const TableRowSlot = getSlotComponent(slots, 'row', TableRow);

    return (
        <>
            <TableRowSlot
                hover={enableHover}
                sx={{
                    backgroundColor: enableStripes && isOdd ? 'action.hover' : 'transparent',
                }}
            >
                {row.getVisibleCells().map(cell => {
                    const isPinned = cell.column.getIsPinned();
                    const pinnedPosition = isPinned ? cell.column.getStart('left') : undefined;
                    const pinnedRightPosition = isPinned === 'right' ? cell.column.getAfter('right') : undefined;
                    const alignment = getColumnAlignment(cell.column.columnDef);

                    return (
                        <CellSlot
                            key={cell.id}
                            align={alignment}
                            sx={{
                                ...getPinnedColumnStyle({
                                    width: cell.column.getSize() || 'auto',
                                    isPinned,
                                    pinnedPosition,
                                    pinnedRightPosition,
                                    zIndex: isPinned ? 9 : 1,
                                    disableStickyHeader,
                                    isLastLeftPinnedColumn: isPinned === 'left' && cell.column.getIsLastColumn('left'),
                                    isFirstRightPinnedColumn: isPinned === 'right' && cell.column.getIsFirstColumn('right'),
                                }),
                            }}
                            {...slotProps?.cell}
                        >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </CellSlot>
                    );
                })}
            </TableRowSlot>

            {row.getIsExpanded() && renderSubComponent ? (
                <ExpandedRowSlot>
                    <CellSlot
                        colSpan={row.getVisibleCells().length + 1}
                        sx={{ py: 0 }}
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
