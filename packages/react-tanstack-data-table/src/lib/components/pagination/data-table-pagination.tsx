// data-table-pagination.tsx
import { TablePagination, Box, TablePaginationProps, SxProps } from '@mui/material';
import { memo, ReactNode } from 'react';

import { useDataTableContext } from '../../contexts/data-table-context';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';

export interface DataTablePaginationProps extends Omit<TablePaginationProps, 'count' | 'rowsPerPage' | 'page' | 'onPageChange' | 'onRowsPerPageChange'> {
    totalRow: number;
    footerFilter?: ReactNode | null;
    pagination: {
        pageIndex: number;
        pageSize: number;
    };
    // Enhanced customization props
    containerSx?: SxProps;
    paginationProps?: TablePaginationProps;
    footerSx?: SxProps;
    slots?: Record<string, any>;
    slotProps?: Record<string, any>;
    [key: string]: any;
}

export const DataTablePagination = memo((props: DataTablePaginationProps) => {
    const {
        footerFilter = null,
        pagination,
        totalRow,
        containerSx,
        paginationProps,
        footerSx,
        slots,
        slotProps,
        ...otherProps
    } = props;

    const { table, tableSize } = useDataTableContext();

    // Extract slot-specific props with enhanced merging
    // const paginationSlotProps = extractSlotProps(slotProps, 'pagination');

    // Merge all props for maximum flexibility
    const mergedContainerProps = mergeSlotProps(
        {
            sx: {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                justifyContent: 'space-between',
                px: 2,
                ...containerSx,
            },
        }
    );

  

    const mergedPaginationProps:any = mergeSlotProps(
        {
            component: 'div',
            size: tableSize === 'small' ? 'small' : 'medium',
            count: totalRow,
            rowsPerPage: pagination?.pageSize,
            page: pagination?.pageIndex,
            onPageChange: (_, page: number) => {
                // Use TanStack Table's native pagination methods
                table.setPageIndex(page);
            },
            onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const newPageSize = Number(e.target.value);
                // Use TanStack Table's native pagination methods
                table.setPageIndex(0);
                table.setPageSize(newPageSize);
            },
            showFirstButton: true,
            showLastButton: true,
            labelRowsPerPage: 'Rows per page:',
            labelDisplayedRows: ({ from, to, count }: { from: number; to: number; count: number }) => 
                `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`,
        },
        { ...paginationProps, ...otherProps }
    );

    return (
        <Box
            {...mergedContainerProps}
        >
            {footerFilter && (
                <Box sx={footerSx}>
                    {footerFilter as any}
                </Box>
            )}

            <TablePagination
                {...mergedPaginationProps}
            />
        </Box>
    );
});
