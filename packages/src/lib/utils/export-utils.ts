import { Table } from '@tanstack/react-table';
import * as XLSX from 'xlsx';

import { SimpleExportOptions, ServerExportOptions, ExportCallbacks } from '../types/export.types';


/**
 * Format a value for export (converts objects, dates, etc. to strings)
 */
function formatValueForExport(value: any): string {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (typeof value === 'object') {
        // Try to extract meaningful string representation
        if (value.toString && value.toString !== Object.prototype.toString) {
            return value.toString();
        }
        return JSON.stringify(value);
    }
    return String(value);
}

/**
 * Get columns to export (only visible columns)
 */
function getExportColumns<T>(table: Table<T>, onlyVisibleColumns = true): any[] {
    return onlyVisibleColumns
        ? table.getVisibleLeafColumns().filter(col => col.getIsVisible() && !(col.columnDef as any).hideInExport)
        : table.getAllLeafColumns();
}

/**
 * Get export headers from column definitions
 */
function getExportHeaders(columns: any[]): string[] {
    return columns.map(col => {
        const colDef = col.columnDef as any;
        // Priority: exportHeader > header > id
        if (colDef.exportHeader) return String(colDef.exportHeader);
        if (typeof colDef.header === 'string') return colDef.header;
        if (typeof colDef.header === 'function') return col.id; // Can't execute function here
        return col.id;
    });
}

/**
 * Process a column value using valueGetter and valueFormatter
 */
function processColumnValue(column: any, rowData: any, rawValue: any): string {
    const colDef = column.columnDef as any;
    let value = rawValue;

    // Apply valueGetter if exists (same as table logic)
    if (colDef.valueGetter) {
        try {
            value = colDef.valueGetter({
                row: rowData,
                getValue: () => rawValue,
            });
        } catch (error) {
            console.warn(`Export valueGetter error for column ${column.id}:`, error);
            value = rawValue;
        }
    }

    // Apply valueFormatter if exists (same as table logic)
    if (colDef.valueFormatter) {
        try {
            value = colDef.valueFormatter({
                row: rowData,
                getValue: () => value,
                value: value,
            });
        } catch (error) {
            console.warn(`Export valueFormatter error for column ${column.id}:`, error);
            // Keep the value as is if formatter fails
        }
    }

    // Convert to export-friendly string
    return formatValueForExport(value);
}


/**
 * Simple export function for client-side data
 * Uses proper column logic with valueFormatter, valueGetter, and cell rendering
 */
export async function exportClientData<T>(
    table: Table<T>,
    options: SimpleExportOptions & ExportCallbacks,
): Promise<void> {
    const {
        filename = 'export',
        format,
        includeHeaders = true,
        onlyVisibleColumns = true,
        onlySelectedRows = false,
        onProgress,
        onComplete,
        onError,
    } = options;

    const startTime = Date.now();

    try {
        // Get columns to export - only visible columns
        const columnsToExport = getExportColumns(table, onlyVisibleColumns);

        console.log('columnsToExport', columnsToExport);

        // Get rows to export - check selection first
        const hasSelectedRows = Object.keys(table.getState().rowSelection).some(
            key => table.getState().rowSelection[key],
        );

        const rowsToExport = (onlySelectedRows || hasSelectedRows) && table.getSelectedRowModel().rows.length > 0
            ? table.getSelectedRowModel().rows
            : table.getFilteredRowModel().rows;

        console.log('rowsToExport', rowsToExport);

        if (rowsToExport.length === 0) {
            throw new Error('No data to export');
        }

        // Prepare headers using column definitions
        const headers = getExportHeaders(columnsToExport);

        // Prepare data using proper column value extraction
        const data = rowsToExport.map((row, index) => {
            // Report progress for large datasets
            if (onProgress && rowsToExport.length > 1000 && index % 500 === 0) {
                onProgress({
                    processedRows: index,
                    totalRows: rowsToExport.length,
                    percentage: Math.round((index / rowsToExport.length) * 100),
                    currentChunk: Math.floor(index / 500) + 1,
                    totalChunks: Math.ceil(rowsToExport.length / 500),
                });
            }

            return columnsToExport.map(col => {
                // Get the cell for this column
                const cell = row.getVisibleCells().find(c => c.column.id === col.id);
                if (!cell) return '';

                // Get raw value and process it using common function
                const rawValue = cell.getValue();
                return processColumnValue(col, row.original, rawValue);
            });
        });

        // Export based on format
        if (format === 'csv') {
            await exportToCSV(headers, data, filename, includeHeaders);
        } else if (format === 'excel') {
            await exportToExcel(headers, data, filename, includeHeaders);
        }

        // Report completion
        if (onComplete) {
            onComplete({
                success: true,
                filename: `${filename}.${format === 'csv' ? 'csv' : 'xlsx'}`,
                totalRows: data.length,
                totalColumns: headers.length,
                processingTime: Date.now() - startTime,
            });
        }
    } catch (error) {
        if (onError) {
            onError({
                message: error instanceof Error ? error.message : 'Export failed',
                code: 'PROCESSING_ERROR',
                details: error,
            });
        }
        throw error;
    }
}

/**
 * Simple export function for server-side data
 * Uses proper column logic with valueFormatter, valueGetter, and visibility
 */
export async function exportServerData<T>(
    table: Table<T>,
    options: ServerExportOptions & ExportCallbacks,
): Promise<void> {
    const {
        fetchData,
        currentFilters,
        filename = 'export',
        format,
        includeHeaders = true,
        pageSize = 1000,
        onProgress,
        onComplete,
        onError,
    } = options;

    const startTime = Date.now();

    try {
        // Get columns to export - only visible columns
        const columnsToExport = getExportColumns(table, true);

        console.log('server columnsToExport', columnsToExport);

        if (columnsToExport.length === 0) {
            throw new Error('No visible columns to export');
        }

        // Prepare headers using column definitions
        const headers = getExportHeaders(columnsToExport);

        // Get first batch to determine total count
        const firstBatch = await fetchData({
            ...currentFilters,
            pagination: {
                pageIndex: 0,
                pageSize,
            },
        });
        const totalRows = firstBatch.total;
        const totalPages = Math.ceil(totalRows / pageSize);

        if (totalRows === 0) {
            throw new Error('No data to export');
        }

        // Collect all data
        const allData: any[][] = [];

        for (let page = 0; page < totalPages; page++) {
            // Get data for this page
            const response = page === 0 ? firstBatch : await fetchData({
                ...currentFilters,
                pagination: {
                    pageIndex: page,
                    pageSize,
                },
            });

            // Convert rows to array format using proper column logic
            const pageData = response.data.map(rowData => {
                return columnsToExport.map(col => {
                    const colDef = col.columnDef as any;

                    // Get raw value using accessorKey or id
                    let rawValue;
                    if (colDef.accessorKey) {
                        rawValue = rowData[colDef.accessorKey];
                    } else if (col.id) {
                        rawValue = rowData[col.id];
                    } else {
                        rawValue = undefined;
                    }

                    // Process value using common function
                    return processColumnValue(col, rowData, rawValue);
                });
            });

            allData.push(...pageData);

            // Report progress
            if (onProgress) {
                const processedRows = (page + 1) * pageSize;
                onProgress({
                    processedRows: Math.min(processedRows, totalRows),
                    totalRows,
                    percentage: Math.round((Math.min(processedRows, totalRows) / totalRows) * 100),
                    currentChunk: page + 1,
                    totalChunks: totalPages,
                });
            }

            // Small delay to prevent overwhelming the server
            if (page < totalPages - 1) {
                await new Promise<void>(resolve => {
                    setTimeout(() => resolve(), 100);
                });
            }
        }

        // Export the data
        if (format === 'csv') {
            await exportToCSV(headers, allData, filename, includeHeaders);
        } else if (format === 'excel') {
            await exportToExcel(headers, allData, filename, includeHeaders);
        }

        // Report completion
        if (onComplete) {
            onComplete({
                success: true,
                filename: `${filename}.${format === 'csv' ? 'csv' : 'xlsx'}`,
                totalRows: totalRows,
                totalColumns: headers.length,
                processingTime: Date.now() - startTime,
            });
        }
    } catch (error) {
        if (onError) {
            onError({
                message: error instanceof Error ? error.message : 'Export failed',
                code: 'PROCESSING_ERROR',
                details: error,
            });
        }
        throw error;
    }
}

/**
 * Export to CSV
 */
async function exportToCSV(headers: string[], data: any[][], filename: string, includeHeaders: boolean): Promise<void> {
    const csvContent: string[] = [];

    if (includeHeaders) {
        csvContent.push(headers.map(header => `"${header.replace(/"/g, '""')}"`).join(','));
    }

    const csvRows = data.map(row => row.map(cell => {
        const cellStr = String(cell || '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
    }).join(','));

    csvContent.push(...csvRows);

    const blob = new Blob([csvContent.join('\n')], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export to Excel
 */
async function exportToExcel(headers: string[], data: any[][], filename: string, includeHeaders: boolean): Promise<void> {
    const wsData = [];

    if (includeHeaders) {
        wsData.push(headers);
    }

    wsData.push(...data);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Auto-size columns
    const colWidths = headers.map((header, index) => {
        const headerLength = header.length;
        const maxDataLength = Math.max(
            ...data.slice(0, 100).map(row => String(row[index] || '').length),
        );
        return { wch: Math.min(Math.max(headerLength, maxDataLength, 10), 50) };
    });
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Export');
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
