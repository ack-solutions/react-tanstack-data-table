// data-table-pagination.tsx
import { TablePagination, Box, TablePaginationProps } from '@mui/material';
import { ReactNode, useCallback } from 'react';

import { useDataTableContext } from '../../contexts/data-table-context';


export interface DataTablePaginationProps extends Omit<TablePaginationProps, 'count' | 'rowsPerPage' | 'page' | 'onPageChange' | 'onRowsPerPageChange'> {
    totalRow: number;
    footerFilter?: ReactNode | null;
    pagination: {
        pageIndex: number;
        pageSize: number;
    };
}

export function DataTablePagination({
    footerFilter = null,
    pagination,
    totalRow,
    ...props
}: DataTablePaginationProps) {
    const { table } = useDataTableContext();
    const handlePaginationChange = useCallback((pageIndex: number, pageSize: number) => {
        table.setPagination({
            pageIndex,
            pageSize,
        });
    }, [table]);
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
                rowsPerPage={pagination.pageSize}
                page={pagination.pageIndex}
                onPageChange={(_, page) => {
                    handlePaginationChange?.(page, pagination.pageSize);
                }}
                onRowsPerPageChange={e => {
                    const newPageSize = Number(e.target.value);
                    handlePaginationChange?.(0, newPageSize);
                }}
                showFirstButton
                showLastButton
                labelRowsPerPage="Rows per page:"
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`}
                {...props}
            />
        </Box>
    );
}
