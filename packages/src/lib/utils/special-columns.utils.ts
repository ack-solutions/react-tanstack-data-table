import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from '@mui/icons-material';
import { Checkbox, IconButton } from '@mui/material';
import { createElement } from 'react';

import { DataTableColumn, DEFAULT_EXPANDING_COLUMN_NAME, DEFAULT_SELECTION_COLUMN_NAME } from '../types';

/**
 * Enhanced configuration for selection column  
 */
export interface SelectionColumnConfig<T> {
    multiSelect?: boolean;
    isRowSelectable?: (params: { row: T; id: string }) => boolean;
}

/**
 * Creates a default selection column using TanStack Table custom feature methods
 */
export const createSelectionColumn = <T>(config: Partial<DataTableColumn<T>> & SelectionColumnConfig<T>): DataTableColumn<T> => ({
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

        // Use TanStack Table custom feature methods (same pattern as TanStack documentation)
        const allSelected = table.getIsAllRowsSelected?.() || false;
        const someSelected = table.getIsSomeRowsSelected?.() || false;

        return createElement(Checkbox, {
            checked: allSelected,
            indeterminate: someSelected && !allSelected,
            disabled: false,
            onChange: () => {
                table.toggleAllRowsSelected?.();
            },
            size: 'small',
            sx: { p: 0 },
        });
    },

    cell: ({ row, table }) => {
        const rowId = row.id as string;

        // Use TanStack Table custom feature methods (same pattern as TanStack documentation)
        const checked = table.getIsRowSelected?.(rowId) || false;
        const canSelect = table.canSelectRow?.(rowId) ?? true;

        return createElement(Checkbox, {
            checked,
            disabled: !canSelect,
            onChange: () => {
                if (canSelect) {
                    table.toggleRowSelected?.(rowId);
                }
            },
            size: 'small',
            sx: { 
                p: 0,
                opacity: canSelect ? 1 : 0.5
            },
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
