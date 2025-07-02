// data-table-pagination.tsx
import { TablePagination, Box, TablePaginationProps } from '@mui/material';
import { memo, ReactNode } from 'react';

import { useDataTableContext } from '../../contexts/data-table-context';


export interface DataTablePaginationProps extends Omit<TablePaginationProps, 'count' | 'rowsPerPage' | 'page' | 'onPageChange' | 'onRowsPerPageChange'> {
    totalRow: number;
    footerFilter?: ReactNode | null;
    pagination: {
        pageIndex: number;
        pageSize: number;
    };
}

export const DataTablePagination = memo(({
    footerFilter = null,
    pagination,
    totalRow,
    ...props
}: DataTablePaginationProps) => {
    const { table } = useDataTableContext();

    // console.log('DataTablePagination', pagination);
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                justifyContent: 'space-between',
                px: 2,
            }}
        >
            {footerFilter as any}

            <TablePagination
                component="div"
                count={totalRow}
                rowsPerPage={pagination?.pageSize}
                page={pagination?.pageIndex}
                onPageChange={(_, page) => {
                    // Use TanStack Table's native pagination methods
                    console.log('Pagination: changing to page', page);
                    table.setPageIndex(page);
                }}
                onRowsPerPageChange={e => {
                    const newPageSize = Number(e.target.value);
                    // Use TanStack Table's native pagination methods
                    table.setPageIndex(0);
                    table.setPageSize(newPageSize);
                }}
                showFirstButton
                showLastButton
                labelRowsPerPage="Rows per page:"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`}
                {...props}
            />
        </Box>
    );
})
