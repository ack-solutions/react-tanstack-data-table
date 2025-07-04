import { TableCell, TableRow } from '@mui/material';
import { Skeleton } from '@mui/material';

import { useDataTableContext } from '../../contexts/data-table-context';
import { getPinnedColumnStyle } from '../../utils';
import { getSlotComponent } from '../../utils/slot-helpers';


export function LoadingRows({
    rowCount = 5,
    slots,
    slotProps,
}: {
    rowCount?: number;
    slots?: Record<string, any>;
    slotProps?: Record<string, any>;
}) {
    const { table } = useDataTableContext();
    const visibleColumns = table.getVisibleLeafColumns();
    const CellSlot = getSlotComponent(slots, 'cell', TableCell);
    const TableRowSlot = getSlotComponent(slots, 'row', TableRow);

    return (
        <>
            {Array.from({ length: rowCount }, (_, rowIndex) => (
                <TableRowSlot
                    key={`skeleton-row-${rowIndex}`}
                    {...slotProps?.row}
                >
                    {visibleColumns.map((column: any, colIndex: number) => {
                        const isPinned = column.getIsPinned();
                        const pinnedPosition = isPinned ? column.getStart('left') : undefined;
                        const pinnedRightPosition = isPinned === 'right' ? column.getAfter('right') : undefined;


                        // Determine skeleton type based on column meta or content
                        const columnMeta = column.columnDef?.meta;
                        const isDateColumn = columnMeta?.type === 'date';
                        const isBooleanColumn = columnMeta?.type === 'boolean';
                        const isNumberColumn = columnMeta?.type === 'number';
                        const isSelectionColumn = column.id === 'select';

                        return (
                            <CellSlot
                                key={`skeleton-${column.id || colIndex}-${rowIndex}`}
                                sx={getPinnedColumnStyle({
                                    width: column.getSize() || 'auto',
                                    isPinned,
                                    pinnedPosition,
                                    pinnedRightPosition,
                                    zIndex: isPinned ? 9 : 1,
                                    isLastLeftPinnedColumn: isPinned === 'left' && column.getIsLastColumn('left'),
                                    isFirstRightPinnedColumn: isPinned === 'right' && column.getIsFirstColumn('right'),
                                })}
                                {...slotProps?.cell}
                            >
                                {(() => {
                                    if (isSelectionColumn) {
                                        return (
                                            <Skeleton
                                                variant="rectangular"
                                                width={20}
                                                height={20}
                                            />
                                        );
                                    }
                                    if (isBooleanColumn) {
                                        return (
                                            <Skeleton
                                                variant="circular"
                                                width={20}
                                                height={20}
                                            />
                                        );
                                    }
                                    if (isDateColumn) {
                                        return (
                                            <Skeleton
                                                variant="text"
                                                width="80%"
                                                height={20}
                                                animation="wave"
                                            />
                                        );
                                    }
                                    if (isNumberColumn) {
                                        return (
                                            <Skeleton
                                                variant="text"
                                                width="60%"
                                                height={20}
                                                animation="wave"
                                            />
                                        );
                                    }
                                    return (
                                        <Skeleton
                                            variant="text"
                                            width={`${Math.random() * 40 + 60}%`}
                                            height={20}
                                            animation="wave"
                                        />
                                    );
                                })()}
                            </CellSlot>
                        );
                    })}
                </TableRowSlot>
            ))}
        </>
    );
}
