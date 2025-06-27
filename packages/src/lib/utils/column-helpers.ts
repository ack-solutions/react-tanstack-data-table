/**
 * Column utilities for DataTable components
 */
import { DataTableColumn } from '../types';
import { Column } from "@tanstack/react-table";


export type ColumnType = 'text' | 'number' | 'date' | 'boolean' | 'select' | 'actions';

/**
 * Get the type of a column from its metadata
 */
export function getColumnType(column: Column<any, unknown>): ColumnType {

    console.log('🔍 Column:', column);

    // Check if column has explicit type in columnDef
    if (column?.columnDef?.type) {
        return column.columnDef.type;
    }

    return 'text'; // Default to text
}

export function getCustomFilterComponent(column: Column<any, unknown>): any {
    // Check if column has custom filter component in meta
    return (column?.columnDef?.meta as any)?.filterComponent;
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


/**
 * Determine if a column should be filterable
 */
export function isColumnFilterable(column: DataTableColumn<any, unknown>): boolean {
    // Check if column is explicitly marked as filterable
    if (column?.filterable !== undefined) {
        return column?.filterable;
    }

    // Default to filterable for data columns
    return true;
}
