/**
 * TableHeader Component
 *
 * Unified header component that combines:
 * - Sortable functionality
 * - Draggable column reordering
 * - Column resizing
 * - Pinning support
 */
import { TableHead, TableRow, TableCell, Box, useTheme, TableHeadProps, TableRowProps, TableCellProps, SxProps } from '@mui/material';
import { Header } from '@tanstack/react-table';

import { DraggableHeader } from './draggable-header';
import { useDataTableContext } from '../../contexts/data-table-context';
import { getPinnedColumnStyle, getColumnAlignment } from '../../utils';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';

export interface TableHeaderProps extends TableHeadProps {
    draggable?: boolean;
    enableColumnResizing?: boolean;
    enableStickyHeader?: boolean;
    fitToScreen?: boolean;
    onColumnReorder?: (draggedColumnId: string, targetColumnId: string) => void;
    // Enhanced customization props
    headerRowProps?: TableRowProps;
    headerCellProps?: TableCellProps;
    containerSx?: SxProps;
    resizeHandleSx?: SxProps;
    slots?: Record<string, any>;
    slotProps?: Record<string, any>;
    [key: string]: any;
}

/**
 * Renders table headers with sorting, dragging, and resizing capabilities
 */
export function TableHeader<T>(props: TableHeaderProps) {
    const {
        draggable = false,
        enableColumnResizing = false,
        enableStickyHeader = false,
        fitToScreen = true,
        onColumnReorder,
        headerRowProps,
        headerCellProps,
        containerSx,
        resizeHandleSx,
        slots,
        slotProps,
        ...otherProps
    } = props;

    const theme = useTheme();
    const { table } = useDataTableContext();

    // Extract slot-specific props with enhanced merging
    const headerCellSlotProps = extractSlotProps(slotProps, 'headerCell');
    const headerRowSlotProps = extractSlotProps(slotProps, 'headerRow');
    const headerSlotProps = extractSlotProps(slotProps, 'header');

    const HeaderCellSlot = getSlotComponent(slots, 'headerCell', TableCell);
    const HeaderRowSlot = getSlotComponent(slots, 'headerRow', TableRow);
    const HeaderSlot = getSlotComponent(slots, 'header', TableHead);

    // Merge all props for maximum flexibility
    const mergedHeaderProps = mergeSlotProps(
        {
            sx: containerSx,
        },
        headerSlotProps,
        otherProps
    );

    const mergedHeaderRowProps = mergeSlotProps(
        {},
        headerRowSlotProps,
        headerRowProps || {}
    );

    const renderHeaderCell = (header: Header<T, unknown>) => {
        const isPinned = header.column.getIsPinned();
        const pinnedPosition = isPinned ? header.column.getStart('left') : undefined;
        const pinnedRightPosition = isPinned === 'right' ? header.column.getAfter('right') : undefined;
        const alignment = getColumnAlignment(header.column.columnDef);
        const enableSorting = header.column.getCanSort();
        const wrapText = header.column.columnDef.wrapText ?? false;
        const canResize = enableColumnResizing && header.column.getCanResize();

        const mergedHeaderCellProps = mergeSlotProps(
            {
                align: alignment,
                sx: {
                    ...getPinnedColumnStyle({
                        width: (fitToScreen && !enableColumnResizing) ? 'auto' : header.getSize(),
                        isPinned,
                        pinnedPosition,
                        isLastLeftPinnedColumn: isPinned === 'left' && header.column.getIsLastColumn('left'),
                        isFirstRightPinnedColumn: isPinned === 'right' && header.column.getIsFirstColumn('right'),
                        pinnedRightPosition,
                        zIndex: isPinned ? 10 : 1,
                        disableStickyHeader: enableStickyHeader,
                        wrapText,
                    }),
                },
            },
            headerCellSlotProps,
            headerCellProps || {}
        );

        const mergedResizeHandleProps = mergeSlotProps(
            {
                onMouseDown: header.getResizeHandler(),
                onTouchStart: header.getResizeHandler(),
                sx: {
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
                    ...resizeHandleSx,
                },
            }
        );

        return (
            <HeaderCellSlot
                key={header.id}
                {...mergedHeaderCellProps}
            >
                <DraggableHeader
                    header={header}
                    enableSorting={enableSorting}
                    draggable={!!(draggable && !isPinned)}
                    onColumnReorder={onColumnReorder}
                    slots={slots}
                    slotProps={slotProps}
                    alignment={alignment}
                />

                {/* Column resizer */}
                {canResize ? (
                    <Box
                        {...mergedResizeHandleProps}
                    />
                ) : null}
            </HeaderCellSlot>
        );
    };

    return (
        <HeaderSlot
            {...mergedHeaderProps}
        >
            {table.getHeaderGroups().map(headerGroup => (
                <HeaderRowSlot
                    key={headerGroup.id}
                    {...mergedHeaderRowProps}
                >
                    {headerGroup.headers.map(renderHeaderCell)}
                </HeaderRowSlot>
            ))}
        </HeaderSlot>
    );
}
