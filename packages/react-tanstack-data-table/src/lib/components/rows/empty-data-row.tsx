import { TableCell, TableRow, TableRowProps, TableCellProps, SxProps } from '@mui/material';
import { ReactNode } from 'react';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';

export interface EmptyDataRowProps {
    colSpan: number;
    message: string | ReactNode;
    // Enhanced customization props
    rowProps?: TableRowProps;
    cellProps?: TableCellProps;
    containerSx?: SxProps;
    messageSx?: SxProps;
    slots?: Record<string, any>;
    slotProps?: Record<string, any>;
    [key: string]: any;
}

export function EmptyDataRow(props: EmptyDataRowProps) {
    const {
        colSpan,
        message,
        rowProps,
        cellProps,
        containerSx,
        messageSx,
        slots,
        slotProps,
        ...otherProps
    } = props;

    // Extract slot-specific props with enhanced merging
    const emptyRowSlotProps = extractSlotProps(slotProps, 'emptyRow');
    const cellSlotProps = extractSlotProps(slotProps, 'cell');
    
    const EmptyRowSlot = getSlotComponent(slots, 'emptyRow', TableRow);
    const EmptyCellSlot = getSlotComponent(slots, 'cell', TableCell);

    // Merge all props for maximum flexibility
    const mergedRowProps = mergeSlotProps(
        {
            sx: containerSx,
        },
        emptyRowSlotProps,
        rowProps || {}
    );

    const mergedCellProps = mergeSlotProps(
        {
            colSpan,
            align: 'center',
            sx: {
                py: 4,
                ...messageSx,
            },
        },
        cellSlotProps,
        cellProps || {}
    );

    return (
        <EmptyRowSlot
            {...mergedRowProps}
        >
            <EmptyCellSlot
                {...mergedCellProps}
            >
                {message}
            </EmptyCellSlot>
        </EmptyRowSlot>
    );
}
