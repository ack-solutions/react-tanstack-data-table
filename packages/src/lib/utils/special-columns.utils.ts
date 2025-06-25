import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from '@mui/icons-material';
import { Checkbox, IconButton } from '@mui/material';
import { createElement } from 'react';

import { DataTableColumn, DEFAULT_EXPANDING_COLUMN_NAME, DEFAULT_SELECTION_COLUMN_NAME } from '../types';


/**
 * Creates a default selection column
 */
export const createSelectionColumn = <T>(config: Partial<DataTableColumn<T>> & { multiSelect?: boolean }): DataTableColumn<T> => ({
    id: DEFAULT_SELECTION_COLUMN_NAME,
    size: 60,
    align: 'center',
    filterable: false,
    enableResizing: false,
    enableSorting: false,
    enableHiding: false,
    enablePinning: false,
    hideInExport: true,
    header: ({ table }) => config.multiSelect ? createElement(Checkbox, {
        checked: table.getIsAllRowsSelected(),
        indeterminate: table.getIsSomeRowsSelected(),
        onChange: table.getToggleAllRowsSelectedHandler(),
        size: 'small',
        sx: { p: 0 },
    }) : null,

    cell: ({ row }) => createElement(Checkbox, {
        checked: row.getIsSelected(),
        disabled: !row.getCanSelect(),
        indeterminate: row.getIsSomeSelected(),
        onChange: row.getToggleSelectedHandler(),
        size: 'small',
        sx: { p: 0 },
    }),
    ...config,
});

/**
 * Creates a default expanding column
 */
export const createExpandingColumn = <T>(config: Partial<DataTableColumn<T>>): DataTableColumn<T> => ({
    id: DEFAULT_EXPANDING_COLUMN_NAME,
    size: 60,
    align: 'center',
    filterable: false,
    enableResizing: false,
    enableSorting: false,
    enableHiding: false,
    enablePinning: false,
    hideInExport: true,
    header: '',
    cell: ({ row }) => createElement(IconButton, {
        onClick: row.getToggleExpandedHandler(),
        size: 'small',
        sx: { p: 0 },
    }, row.getIsExpanded() ? createElement(KeyboardArrowUpOutlined) : createElement(KeyboardArrowDownOutlined)),
    ...config,
});
