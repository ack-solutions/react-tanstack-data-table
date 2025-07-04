import { ColumnDef, RowData, Column } from '@tanstack/react-table';
import { ColumnFilterRule } from '../features';


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
        editComponent?: React.ComponentType<{
            value: any;
            onChange: (value: any) => void;
            filter: ColumnFilterRule;
            column: Column<TData, TValue>;
        }>;
        filterComponent?: React.ComponentType<{
            value: any;
            onChange: (value: any) => void;
            filter: ColumnFilterRule;
            column: Column<TData, TValue>;
        }>;
    }
}
export type DataTableColumn<TData extends RowData, TValue = unknown> = ColumnDef<TData, TValue> & {
// All custom properties are now defined in the module augmentation above
}