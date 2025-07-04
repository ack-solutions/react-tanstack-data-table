import { TableCell, TableRow } from '@mui/material';

import { getSlotComponent } from '../../utils/slot-helpers';


export function EmptyDataRow({ colSpan, message, slots, slotProps }: { colSpan: number; message: string, slots: Record<string, any>, slotProps: Record<string, any> }) {
    const EmptyRowSlot = getSlotComponent(slots, 'emptyRow', TableRow);
    const EmptyCellSlot = getSlotComponent(slots, 'cell', TableCell);

    return (
        <EmptyRowSlot>
            <EmptyCellSlot
                colSpan={colSpan}
                align="center"
                sx={{ py: 4 }}
                {...slotProps?.emptyCell}
            >
                {message}
            </EmptyCellSlot>
        </EmptyRowSlot>
    );
}
