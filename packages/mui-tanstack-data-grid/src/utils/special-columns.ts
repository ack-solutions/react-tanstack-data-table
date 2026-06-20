import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import KeyboardArrowUpOutlined from '@mui/icons-material/KeyboardArrowUpOutlined';
import { Checkbox, IconButton } from '@mui/material';
import { createElement, type ComponentType } from 'react';

import { DEFAULT_SELECTION_COLUMN_ID, DEFAULT_EXPAND_COLUMN_ID, DEFAULT_ACTIONS_COLUMN_ID } from '../types/column.types';
import type { DataTableColumn } from '../types/column.types';
import type { DataTableRowAction } from '../types/data-table.types';
import { ActionsCell } from '../components/grid/actions-cell';

export interface SelectionColumnConfig {
    multiSelect?: boolean;
}

export interface ExpandingColumnConfig {
    /** Icon for a collapsed row (defaults to KeyboardArrowDownOutlined). */
    expandIcon?: ComponentType<any>;
    /** Icon for an expanded row (defaults to KeyboardArrowUpOutlined). */
    collapseIcon?: ComponentType<any>;
    /** Localized aria-labels. */
    expandLabel?: string;
    collapseLabel?: string;
}

export interface ActionsColumnConfig {
    getRowActions: (row: any) => DataTableRowAction<any>[];
    display?: 'icons' | 'menu' | 'auto';
    moreIcon?: ComponentType<any>;
}

/** Auto-generated, right-pinned row-actions column (rendered by {@link ActionsCell}). */
export const createActionsColumn = <T>(
    config: Partial<DataTableColumn<T>> & ActionsColumnConfig,
): DataTableColumn<T, any> => {
    const { getRowActions, display, moreIcon, ...columnConfig } = config;
    return {
        id: DEFAULT_ACTIONS_COLUMN_ID,
        header: '',
        size: 88,
        minSize: 64,
        maxSize: 200,
        align: 'center',
        filterable: false,
        enableResizing: false,
        enableSorting: false,
        enableHiding: false,
        enablePinning: true,
        hideInExport: true,
        cell: ({ row }) => createElement(ActionsCell, { row, getRowActions, display, moreIcon }),
        ...columnConfig,
    };
};

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
            tabIndex: -1, // roving tabindex lives on the cell; Enter activates this
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
            tabIndex: -1,
            'aria-checked': checked ? 'true' : 'false',
        });
    },
    ...config,
});

/** Auto-generated expand/collapse column for row detail panels. */
export const createExpandingColumn = <T>(
    config: Partial<DataTableColumn<T>> & ExpandingColumnConfig,
): DataTableColumn<T> => {
    const { expandIcon, collapseIcon, expandLabel = 'Expand row', collapseLabel = 'Collapse row', ...columnConfig } = config;
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
        cell: ({ row }) => {
            // Tree rows expose getCanExpand() = has children; detail-panel rows default true.
            if (row.getCanExpand && !row.getCanExpand()) return null;
            const expanded = row.getIsExpanded();
            return createElement(
                IconButton,
                {
                    onClick: row.getToggleExpandedHandler(),
                    size: 'small',
                    sx: { p: 0 },
                    tabIndex: -1,
                    'aria-label': expanded ? collapseLabel : expandLabel,
                    'aria-expanded': expanded,
                },
                expanded ? createElement(CollapseIcon) : createElement(ExpandIcon),
            );
        },
        ...columnConfig,
    };
};
