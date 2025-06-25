/**
 * Common value processing utilities for both cell display and export
 * This ensures zero duplication and 100% consistency between display and export
 */

// Import types from centralized location
import type { ValueProcessorParams } from '../types';


/**
 * Common function to get and format values for both cell display and export
 * This is the single source of truth for value processing
 */
export function getFormattedValue(params: ValueProcessorParams): any {
    const { row, getValue, column } = params;
    const colDef = column.columnDef || column;
    const rowData = row.original || row;

    let rawValue: any;

    // Step 1: Get the raw value
    if (colDef?.valueGetter) {
        // Use valueGetter if available (MUI DataGrid style)
        rawValue = colDef.valueGetter({
            row: rowData,
            data: rowData,
        });
    } else if (getValue) {
        // Use TanStack Table's getValue for cell display
        rawValue = getValue();
    } else if (colDef?.accessorKey) {
        // Fallback to direct property access for export
        rawValue = rowData[colDef.accessorKey];
    } else if (colDef?.accessorFn) {
        // Use accessor function
        rawValue = colDef.accessorFn(rowData);
    } else {
        rawValue = undefined;
    }

    // Step 2: Format the value
    if (colDef?.valueFormatter) {
        // Use valueFormatter if available (MUI DataGrid style)
        return colDef.valueFormatter({
            value: rawValue,
            row: rowData,
        });
    }

    // Return raw value if no formatter
    return rawValue;
}

/**
 * Enhanced cell renderer that uses the common value processor
 * This replaces the need for custom cell functions in most cases
 */
export function createEnhancedCell() {
    return ({ row, getValue, column }: any) => {
        return getFormattedValue({
            row,
            getValue,
            column,
        });
    };
}


/**
 * Utility to create a column definition with automatic cell generation
 * This is the recommended way to define columns for zero duplication
 */
export function createColumn(config: {
    id: string;
    header: string;
    accessorKey?: string;
    valueGetter?: (params: { row: any; data: any }) => any;
    valueFormatter?: (params: { value: any; row: any }) => any;
    enableExport?: boolean;
    [key: string]: any;
}) {
    const { valueGetter, valueFormatter, ...rest } = config;

    return {
        ...rest,
        valueGetter,
        valueFormatter,
        // Auto-generate cell function if valueGetter or valueFormatter is provided
        cell: (valueGetter || valueFormatter) ? createEnhancedCell() : undefined,
    };
}
