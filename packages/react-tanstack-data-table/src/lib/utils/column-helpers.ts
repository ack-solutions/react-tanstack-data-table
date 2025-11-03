/**
 * Column utilities for DataTable components
 */
import { DataTableColumn } from '../types';
import { Column, ColumnDef } from "@tanstack/react-table";


export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'actions';

/**
 * Get the type of a column from its metadata
 */
export function getColumnType(column: Column<any, unknown>): ColumnType {
    // Check if column has explicit type in columnDef
    if (column?.columnDef?.type) {
        return column.columnDef.type;
    }
    return 'text'; // Default to text
}

export function getCustomFilterComponent(column: Column<any, unknown>): any {
    // Check if column has custom filter component in meta
    return column?.columnDef?.filterComponent || column?.columnDef?.editComponent;
}


export function getColumnOptions(column: Column<any, unknown>): any[] {
    // Check if column has explicit options in meta
    if (column?.columnDef?.options) {
        return column?.columnDef.options || [];
    }

    // Default options for boolean type
    const columnType = getColumnType(column);
    if (columnType === 'boolean') {
        return [
            {
                value: true,
                label: 'Yes',
            },
            {
                value: false,
                label: 'No',
            },
        ];
    }

    return [];
}

export function withIdsDeep<T>(cols: ColumnDef<T, any>[]): ColumnDef<T, any>[] {
    return cols.map((c, i) => ({
        ...c,
        id: c.id ?? (c as any).accessorKey ?? `col_${i}`,
        ...(Array.isArray((c as any).columns) && {
            columns: withIdsDeep((c as any).columns)
        }),
    }));
}


/**
 * Determine if a column should be filterable
 */
export function isColumnFilterable(column: Column<any, unknown>): boolean {
    // Check if column is explicitly marked as filterable
    if (column?.columnDef?.filterable !== undefined) {
        return column?.columnDef?.filterable;
    }

    // Default to filterable for data columns
    return true;
}
