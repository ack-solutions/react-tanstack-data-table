import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlined from '@mui/icons-material/KeyboardArrowUpOutlined';
import { Checkbox, IconButton } from '@mui/material';
import { createElement, type ComponentType } from 'react';

import { DEFAULT_SELECTION_COLUMN_ID, DEFAULT_EXPAND_COLUMN_ID } from '../types/column.types';
import type { DataTableColumn } from '../types/column.types';

export interface SelectionColumnConfig {
    multiSelect?: boolean;
}

export interface ExpandingColumnConfig {
    /** Icon for a collapsed row (defaults to KeyboardArrowDownOutlined). */
    expandIcon?: ComponentType<any>;
    /** Icon for an expanded row (defaults to KeyboardArrowUpOutlined). */
    collapseIcon?: ComponentType<any>;
}

/** Auto-generated checkbox selection column, driven by the SelectionFeature. */
export const createSelectionColumn = <T>(
    config: Partial<DataTableColumn<T>> & SelectionColumnConfig,
): DataTableColumn<T, any> => ({
    id: DEFAULT_SELECTION_COLUMN_ID,
    maxSize: 60,
    minSize: 60,
    align: 'center',
    filterable: false,
    enableResizing: false,
    enableSorting: false,
    enableHiding: false,
    enablePinning: true,
    hideInExport: true,
    header: ({ table }) => {
        if (!config.multiSelect) return null;
        const allSelected = table.getIsAllRowsSelected?.() || false;
        const someSelected = table.getIsSomeRowsSelected?.() || false;
        return createElement(Checkbox, {
            checked: allSelected,
            indeterminate: someSelected && !allSelected,
            onChange: () => table.toggleAllRowsSelected?.(),
            size: 'small',
            sx: { p: 0 },
            'aria-checked': allSelected ? 'true' : someSelected ? 'mixed' : 'false',
        });
    },
    cell: ({ row, table }) => {
        const rowId = row.id;
        const checked = table.getIsRowSelected?.(rowId) || false;
        const canSelect = table.canSelectRow?.(rowId) ?? true;
        return createElement(Checkbox, {
            checked,
            disabled: !canSelect,
            onChange: () => {
                if (canSelect) table.toggleRowSelected?.(rowId);
            },
            size: 'small',
            sx: { p: 0, opacity: canSelect ? 1 : 0.5 },
            'aria-checked': checked ? 'true' : 'false',
        });
    },
    ...config,
});

/** Auto-generated expand/collapse column for row detail panels. */
export const createExpandingColumn = <T>(
    config: Partial<DataTableColumn<T>> & ExpandingColumnConfig,
): DataTableColumn<T> => {
    const { expandIcon, collapseIcon, ...columnConfig } = config;
    const ExpandIcon = expandIcon ?? KeyboardArrowDownOutlined;
    const CollapseIcon = collapseIcon ?? KeyboardArrowUpOutlined;
    return {
        id: DEFAULT_EXPAND_COLUMN_ID,
        maxSize: 60,
        minSize: 60,
        align: 'center',
        filterable: false,
        enableResizing: false,
        enableSorting: false,
        enableHiding: false,
        enablePinning: false,
        hideInExport: true,
        header: '',
        cell: ({ row }) =>
            createElement(
                IconButton,
                {
                    onClick: row.getToggleExpandedHandler(),
                    size: 'small',
                    sx: { p: 0 },
                    'aria-label': row.getIsExpanded() ? 'Collapse row' : 'Expand row',
                    'aria-expanded': row.getIsExpanded(),
                },
                row.getIsExpanded() ? createElement(CollapseIcon) : createElement(ExpandIcon),
            ),
        ...columnConfig,
    };
};
