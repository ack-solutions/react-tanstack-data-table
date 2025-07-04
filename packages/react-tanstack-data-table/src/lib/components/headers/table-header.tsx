/**
 * TableHeader Component
 *
 * Unified header component that combines:
 * - Sortable functionality
 * - Draggable column reordering
 * - Column resizing
 * - Pinning support
 */
import { TableHead, TableRow, TableCell, Box, useTheme } from '@mui/material';
import { Header } from '@tanstack/react-table';

import { DraggableHeader } from './draggable-header';
import { useDataTableContext } from '../../contexts/data-table-context';
import { getPinnedColumnStyle, getColumnAlignment } from '../../utils';
import { getSlotComponent } from '../../utils/slot-helpers';


export interface TableHeaderProps {
    draggable?: boolean;
    enableColumnResizing?: boolean;
    enableStickyHeader?: boolean;
    fitToScreen?: boolean;
    onColumnReorder?: (draggedColumnId: string, targetColumnId: string) => void;
    slots?: Record<string, any>;
    slotProps?: Record<string, any>;
}

/**
 * Renders table headers with sorting, dragging, and resizing capabilities
 */
export function TableHeader<T>({
    draggable = false,
    enableColumnResizing = false,
    enableStickyHeader = false,
    fitToScreen = true,
    onColumnReorder,
    slots,
    slotProps,
}: TableHeaderProps) {
    const theme = useTheme();
    const { table } = useDataTableContext();

    const HeaderCellSlot = getSlotComponent(slots, 'headerCell', TableCell);
    const HeaderRowSlot = getSlotComponent(slots, 'headerRow', TableRow);
    const HeaderSlot = getSlotComponent(slots, 'header', TableHead);

    const renderHeaderCell = (header: Header<T, unknown>) => {
        const isPinned = header.column.getIsPinned();
        const pinnedPosition = isPinned ? header.column.getStart('left') : undefined;
        const pinnedRightPosition = isPinned === 'right' ? header.column.getAfter('right') : undefined;
        const alignment = getColumnAlignment(header.column.columnDef);
        const enableSorting = header.column.getCanSort();
        return (
            <HeaderCellSlot
                key={header.id}
                align={alignment}
                sx={{
                    ...getPinnedColumnStyle({
                        width: (fitToScreen && !enableColumnResizing) ? 'auto' : header.getSize(),
                        isPinned,
                        pinnedPosition,
                        isLastLeftPinnedColumn: isPinned === 'left' && header.column.getIsLastColumn('left'),
                        isFirstRightPinnedColumn: isPinned === 'right' && header.column.getIsFirstColumn('right'),
                        pinnedRightPosition,
                        zIndex: isPinned ? 10 : 1,
                        disableStickyHeader: enableStickyHeader,
                    }),
                }}
                {...slotProps?.headerCell}
            >

                <DraggableHeader
                    header={header}
                    enableSorting={enableSorting}
                    draggable={!!(draggable && !isPinned)}
                    onColumnReorder={onColumnReorder}
                    slots={slots}
                    slotProps={slotProps}
                />

                {/* Column resizer */}
                {enableColumnResizing && header.column.getCanResize() ? (
                    <Box
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        sx={{
                            position: 'absolute',
                            right: 0,
                            top: '25%',
                            height: '50%',
                            width: '3px',
                            cursor: 'col-resize',
                            userSelect: 'none',
                            touchAction: 'none',
                            borderRadius: '4px',
                            backgroundColor: header.column.getIsResizing() ? 'primary.main' : theme.palette.grey[300],
                            '&:hover': {
                                backgroundColor: theme.palette.primary.main,
                            },
                        }}
                    />
                ) : null}
            </HeaderCellSlot>
        );
    };

    return (
        <HeaderSlot {...slotProps?.header}>
            {table.getHeaderGroups().map(headerGroup => (
                <HeaderRowSlot
                    key={headerGroup.id}
                    {...slotProps?.headerRow}
                >
                    {headerGroup.headers.map(renderHeaderCell)}
                </HeaderRowSlot>
            ))}
        </HeaderSlot>
    );
}
