import type { ColumnDef, ColumnDefBase, RowData, Column } from '@tanstack/react-table';
import type { ComponentType } from 'react';

import type { ColumnFilterRule } from './filter.types';

// Values kept identical to v1 (`_selection` / `_expanding`) so persisted v1 layout
// snapshots (columnOrder/visibility/pinning) still resolve after upgrade.
export const DEFAULT_SELECTION_COLUMN_ID = '_selection';
export const DEFAULT_EXPAND_COLUMN_ID = '_expanding';
export const DEFAULT_ACTIONS_COLUMN_ID = '_actions';

interface ColumnExportContext<TData, TValue> {
    value: any;
    row: TData;
    rowIndex: number;
    columnId: string;
    // Kept as ColumnDefBase to match v1's augmentation exactly (both packages
    // augment the same TanStack interface; identical types merge cleanly).
    columnDef: ColumnDefBase<TData, TValue>;
}

interface ColumnInputProps<TData extends RowData, TValue> {
    value: any;
    onChange: (value: any) => void;
    filter: ColumnFilterRule;
    column: Column<TData, TValue>;
}

/**
 * Extra column-definition options, augmented onto every TanStack `ColumnDef`.
 * (TanStack's own `size`, `minSize`, `maxSize`, `enableResizing`, `enableSorting`,
 * `header`, `cell` remain available too.)
 */
declare module '@tanstack/react-table' {
    interface ColumnDefBase<TData extends RowData, TValue> {
        /** Data type — drives default filter operators/inputs. */
        type?: 'boolean' | 'number' | 'date' | 'select' | 'text';
        /** Options for `type: 'select'` columns. */
        options?: { label: string; value: string }[];
        /** Cell + header text alignment. */
        align?: 'left' | 'center' | 'right';
        /**
         * Derive the column's value from the row when there's no plain `accessorKey`
         * (e.g. a computed/combined field). Feeds sorting, filtering, and export — so
         * the whole grid agrees on one value.
         */
        valueGetter?: (params: { row: TData }) => any;
        /**
         * Format the value for **display only** (the cell). Sorting/filtering/export
         * keep using the raw value. Ignored if the column defines its own `cell`.
         */
        valueFormatter?: (params: { value: any; row: TData }) => any;
        /**
         * Footer aggregation for this column (needs `enableAggregation`). A built-in
         * reducer (`'sum' | 'avg' | 'min' | 'max' | 'count'`) over the filtered rows,
         * or a function receiving the filtered row data. Client-mode only.
         */
        aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count' | ((rows: TData[]) => any);
        /** Mark the column as filterable in the column-filter UI. */
        filterable?: boolean;
        /** Hide the per-column header ⋮ menu for just this column (needs `enableColumnMenu`). */
        disableColumnMenu?: boolean;
        /** Wrap cell text instead of truncating with an ellipsis (default: false). */
        wrapText?: boolean;
        /** Allow inline editing of this column's cells (needs a `processRowUpdate` or local data). */
        editable?: boolean | ((row: TData) => boolean);
        /** Conditional class for body cells (DataGrid-style). */
        cellClassName?: string | ((context: { value: any; row: TData }) => string);
        /** Conditional class for the header cell. */
        headerClassName?: string;
        // Export controls
        hideInExport?: boolean;
        exportHeader?: string | ((context: { columnId: string; defaultHeader: string; columnDef: ColumnDefBase<TData, TValue> }) => string);
        exportValue?: (context: ColumnExportContext<TData, TValue>) => any;
        exportFormat?: 'auto' | 'string' | 'number' | 'boolean' | 'json' | 'date' | ((context: ColumnExportContext<TData, TValue>) => any);
        // Custom inputs
        editComponent?: ComponentType<ColumnInputProps<TData, TValue>>;
        filterComponent?: ComponentType<ColumnInputProps<TData, TValue>>;
    }
}

export type DataTableColumn<TData extends RowData, TValue = unknown> = ColumnDef<TData, TValue>;
