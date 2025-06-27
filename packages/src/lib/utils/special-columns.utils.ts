import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined } from '@mui/icons-material';
import { Checkbox, IconButton } from '@mui/material';
import { createElement } from 'react';

import { DataTableColumn, DEFAULT_EXPANDING_COLUMN_NAME, DEFAULT_SELECTION_COLUMN_NAME } from '../types';
import { SelectionHelperConfig, toggleSelectAll, toggleRowSelection, isAllSelected, isSomeSelected, isRowSelected } from './selection-helpers';

/**
 * Creates a default selection column with smart selection logic using selection helpers
 */
export const createSelectionColumn = <T>(config: Partial<DataTableColumn<T>> & { 
    multiSelect?: boolean;
    selectionConfig: SelectionHelperConfig;
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
        
        const selectionConfig = config.selectionConfig;

        
        // Use selection helper functions
        const allSelected = isAllSelected(table, selectionConfig);
        const someSelected = isSomeSelected(table, selectionConfig);

        return createElement(Checkbox, {
            checked: allSelected,
            indeterminate: someSelected,
            onChange: () => {
                toggleSelectAll(table, selectionConfig);
            },
            size: 'small',
            sx: { p: 0 },
        });
    },

    cell: ({ row, table }) => {
        const selectionConfig = config.selectionConfig;
        const rowId = row.id as string;

        // Use selection helper functions
        const checked = isRowSelected(table, rowId, selectionConfig);

        return createElement(Checkbox, {
            checked,
            disabled: !row.getCanSelect(),
            onChange: () => {
                toggleRowSelection(table, rowId, selectionConfig);
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
