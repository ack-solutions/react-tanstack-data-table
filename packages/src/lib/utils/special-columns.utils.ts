import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from '@mui/icons-material';
import { Checkbox, IconButton } from '@mui/material';
import { createElement } from 'react';

import { DataTableColumn, DEFAULT_EXPANDING_COLUMN_NAME, DEFAULT_SELECTION_COLUMN_NAME } from '../types';


/**
 * Creates a default selection column with smart selection logic using API
 */
export const createSelectionColumn = <T>(config: Partial<DataTableColumn<T>> & { 
    multiSelect?: boolean;
    apiRef?: React.RefObject<any>; // DataTableApi ref
}): DataTableColumn<T> => ({
    id: DEFAULT_SELECTION_COLUMN_NAME,
    size: 60,
    align: 'center',
    filterable: false,
    enableResizing: false,
    enableSorting: false,
    enableHiding: false,
    enablePinning: false,
    hideInExport: true,
    header: ({ table }) => {
        if (!config.multiSelect) return null;
        
        const api = config.apiRef?.current;
        if (!api) {
            // Fallback to basic TanStack Table behavior
            return createElement(Checkbox, {
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
                size: 'small',
                sx: { p: 0 },
            });
        }
        
        // Use API for smart selection logic
        const isAllSelected = api.selection.isAllSelected();
        const isIndeterminate = api.selection.isSomeSelected();

        return createElement(Checkbox, {
            checked: isAllSelected,
            indeterminate: isIndeterminate,
            onChange: () => {
                api.selection.toggleSelectAll();
            },
            size: 'small',
            sx: { p: 0 },
        });
    },

    cell: ({ row }) => {
        const api = config.apiRef?.current;
        const rowId = row.id as string;

        if (!api) {
            // Fallback to basic TanStack Table behavior
            return createElement(Checkbox, {
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                onChange: row.getToggleSelectedHandler(),
                size: 'small',
                sx: { p: 0 },
            });
        }

        // Use API for smart selection logic
        const checked = api.selection.isRowSelected(rowId);

        return createElement(Checkbox, {
            checked,
            disabled: !row.getCanSelect(),
            onChange: () => {
                api.selection.toggleRowSelection(rowId);
            },
            size: 'small',
            sx: { p: 0 },
        });
    },
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
