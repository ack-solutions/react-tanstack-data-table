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
// declare module '@tanstack/table-core' {
//     interface ColumnMeta<TData extends RowData, TValue> {
//         valueGetter?: (params: { row: any; data: any }) => any;
//         valueFormatter?: (params: { value: any; row: any }) => string;
//         enableExport?: boolean;
//     }
// }
export type DataTableColumn<TData extends RowData, TValue = unknown> = ColumnDef<TData, TValue> & {
    valueGetter?: (params: { row: any; data: any }) => any;
    valueFormatter?: (params: { value: any; row: any }) => string;
    align?: 'left' | 'center' | 'right';
    type?: 'boolean' | 'number' | 'date' | 'select' | 'text';
    filterable?: boolean;
    hideInExport?: boolean;
    options?: {
        label: string;
        value: string;
    }[];
}

/**
 * Custom column meta properties that extend TanStack Table's capabilities
 * These can be used in the meta property of column definitions
 */

/**
 * Column configuration interface
 */
// export interface ColumnConfig<T> {
//     id: string;
//     header: string;
//     accessorKey?: keyof T;
//     enableSorting?: boolean;
//     enableFiltering?: boolean;
//     enableResizing?: boolean;
//     enablePinning?: boolean;
//     enableHiding?: boolean;
//     width?: number;
//     minWidth?: number;
//     maxWidth?: number;
//     meta?: CustomColumnMeta & Record<string, any>;
// }

/**
 * Value processing parameters for common functions
 */
export interface ValueProcessorParams {
    row: any;
    getValue?: () => any;
    column: any;
}
