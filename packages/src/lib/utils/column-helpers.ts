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
    // Check if column has explicit type in meta
    if ((column as any)?.type) {
        return (column as any)?.type;
    }

    return 'text'; // Default to text
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
