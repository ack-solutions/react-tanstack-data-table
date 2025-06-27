import { ColumnDef, RowData } from '@tanstack/react-table';


export const DEFAULT_SELECTION_COLUMN_NAME = '_selection';
export const DEFAULT_EXPANDING_COLUMN_NAME = '_expanding';

/**
 * Column Definition Types
 * Consolidated column-related interfaces from various files
 */

/**
 * Module augmentation to extend TanStack Table's ColumnMeta interface
 * This automatically extends all ColumnDef types since they use ColumnMeta in their meta property
 */
declare module '@tanstack/table-core' {
    interface ColumnDefBase<TData extends RowData, TValue> {
        type?: 'boolean' | 'number' | 'date' | 'select' | 'text';
        options?: {
            label: string;
            value: string;
        }[];
        align?: 'left' | 'center' | 'right';
        filterable?: boolean;
        hideInExport?: boolean;
    }
}
export type DataTableColumn<TData extends RowData, TValue = unknown> = ColumnDef<TData, TValue> & {
// All custom properties are now defined in the module augmentation above
}