import React, { ReactElement } from 'react';
import { TableCell, TableRow, Skeleton, TableRowProps, TableCellProps, SxProps } from '@mui/material';

import { useDataTableContext } from '../../contexts/data-table-context';
import { getPinnedColumnStyle } from '../../utils';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';

export interface LoadingRowsProps {
    rowCount?: number;
    // Enhanced customization props
    rowProps?: TableRowProps;
    cellProps?: TableCellProps;
    skeletonProps?: any;
    containerSx?: SxProps;
    slots?: Record<string, any>;
    slotProps?: Record<string, any>;
    [key: string]: any;
}

export function LoadingRows(props: LoadingRowsProps): ReactElement {
    const {
        rowCount = 5,
        rowProps,
        cellProps,
        skeletonProps,
        containerSx,
        slots,
        slotProps,
    } = props;

    const { table } = useDataTableContext();
    const visibleColumns = table.getVisibleLeafColumns();
    
    // Extract slot-specific props with enhanced merging
    const cellSlotProps = extractSlotProps(slotProps, 'cell');
    const rowSlotProps = extractSlotProps(slotProps, 'row');
    
    const CellSlot = getSlotComponent(slots, 'cell', TableCell);
    const TableRowSlot = getSlotComponent(slots, 'row', TableRow);

    // Merge all props for maximum flexibility
    const mergedRowProps = mergeSlotProps(
        {
            sx: containerSx,
        },
        rowSlotProps,
        rowProps || {}
    );

    return (
        <>
            {Array.from({ length: rowCount }, (_, rowIndex) => (
                <TableRowSlot
                    key={`skeleton-row-${rowIndex}`}
                    {...mergedRowProps}
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

                        const mergedCellProps = mergeSlotProps(
                            {
                                sx: {
                                    ...getPinnedColumnStyle({
                                        width: column.getSize() || 'auto',
                                        isPinned,
                                        pinnedPosition,
                                        pinnedRightPosition,
                                        zIndex: isPinned ? 9 : 1,
                                        isLastLeftPinnedColumn: isPinned === 'left' && column.getIsLastColumn('left'),
                                        isFirstRightPinnedColumn: isPinned === 'right' && column.getIsFirstColumn('right'),
                                    }),
                                },
                            },
                            cellSlotProps,
                            cellProps || {}
                        );

                        const getSkeletonContent = () => {
                            if (isSelectionColumn) {
                                return (
                                    <Skeleton
                                        variant="rectangular"
                                        width={20}
                                        height={20}
                                        animation="wave"
                                        {...skeletonProps}
                                    />
                                );
                            }

                            if (isBooleanColumn) {
                                return (
                                    <Skeleton
                                        variant="circular"
                                        width={16}
                                        height={16}
                                        animation="wave"
                                        {...skeletonProps}
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
                                        {...skeletonProps}
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
                                        {...skeletonProps}
                                    />
                                );
                            }

                            return (
                                <Skeleton
                                    variant="text"
                                    width={`${Math.random() * 40 + 60}%`}
                                    height={20}
                                    animation="wave"
                                    {...skeletonProps}
                                />
                            );
                        };

                        return (
                            <CellSlot
                                key={`skeleton-${column.id || colIndex}-${rowIndex}`}
                                {...mergedCellProps}
                            >
                                {getSkeletonContent()}
                            </CellSlot>
                        );
                    })}
                </TableRowSlot>
            ))}
        </>
    );
}
