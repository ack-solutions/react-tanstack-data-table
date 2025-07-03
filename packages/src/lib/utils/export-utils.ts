import { Table } from '@tanstack/react-table';
import * as XLSX from 'xlsx';
import { SelectionState } from '../features/custom-selection.feature';

// Local types for the utility functions (keep simpler for actual implementation)
export interface ExportOptions {
    format: 'csv' | 'excel';
    filename: string;
    onProgress?: (progress: { processedRows: number; totalRows: number; percentage: number }) => void;
    onComplete?: (result: { success: boolean; filename: string; totalRows: number }) => void;
    onError?: (error: { message: string; code: string }) => void;
}


export interface ServerExportOptions extends ExportOptions {
    fetchData: (filters?: any, selection?: SelectionState) => Promise<{ data: any[]; total: number }>;
    currentFilters?: any;
    selection?: SelectionState;
}

/**
 * Export data for client-side tables
 * - If rows are selected, export only selected rows
 * - Otherwise export all filtered/visible rows
 * - Only export visible columns
 */
export async function exportClientData<TData>(
    table: Table<TData>,
    options: ExportOptions,
): Promise<void> {
    const { format, filename, onProgress, onComplete, onError } = options;

    try {
        // Get selected rows if any are selected
        // const selectedRowIds = Object.keys(table.getState().rowSelection).filter(
        //     key => table.getState().rowSelection[key]
        // );
        
        // const hasSelectedRows = selectedRowIds.length > 0;
        
        // // Get the rows to export
        // const rowsToExport = hasSelectedRows ? table.getSelectedRowModel().rows : table.getFilteredRowModel().rows;

        const selectedRows = table.getSelectedRows ? table.getSelectedRows() : [];
        const hasSelectedRows = selectedRows.length > 0;
        const rowsToExport = hasSelectedRows ? selectedRows : table.getFilteredRowModel().rows;
        // Prepare data for export - just get all visible columns and their values
        const exportData = rowsToExport.map((row, index) => {
            onProgress?.({
                processedRows: index + 1,
                totalRows: rowsToExport.length,
                percentage: Math.round(((index + 1) / rowsToExport.length) * 100),
            });

            const rowData: Record<string, any> = {};
            
            // Get all visible cells for this row
            row.getVisibleCells().forEach(cell => {
                const header = typeof cell.column.columnDef.header === 'string' 
                    ? cell.column.columnDef.header 
                    : cell.column.id;
                
                // Use getValue() - it already handles all formatting
                rowData[header] = cell.getValue() || '';
            });
            
            return rowData;
        });

        // Export the data
        await exportToFile(exportData, format, filename);

        onComplete?.({
            success: true,
            filename: `${filename}.${format === 'excel' ? 'xlsx' : 'csv'}`,
            totalRows: exportData.length,
        });

    } catch (error) {
        console.error('Client export failed:', error);
        onError?.({
            message: error instanceof Error ? error.message : 'Export failed',
            code: 'CLIENT_EXPORT_ERROR',
        });
    }
}

/**
 * Export data for server-side tables
 * - Fetch data using provided fetchData function
 * - Pass selection information to server for filtering
 * - Export all returned data (server handles selection/filtering)
 */
export async function exportServerData<TData>(
    table: Table<TData>,
    options: ServerExportOptions,
): Promise<void> {
    const { format, filename, fetchData, currentFilters, selection, onProgress, onComplete, onError } = options;

    try {
        onProgress?.({
            processedRows: 0,
            totalRows: 0,
            percentage: 0,
        });

        // Fetch data from server with selection information
        const { data } = await fetchData(currentFilters, selection);

        if (!data || !Array.isArray(data)) {
            throw new Error('Invalid data received from server');
        }

        // Get visible columns for proper headers and data processing
        const visibleColumns = table.getVisibleLeafColumns().filter(col => col.getIsVisible());

        // Prepare data for export with proper column processing
        const exportData = data.map((rowData, index) => {
            onProgress?.({
                processedRows: index + 1,
                totalRows: data.length,
                percentage: Math.round(((index + 1) / data.length) * 100),
            });

            const exportRow: Record<string, any> = {};
            
            visibleColumns.forEach(column => {
                const columnId = column.id;
                const header = typeof column.columnDef.header === 'string' 
                    ? column.columnDef.header 
                    : columnId;
                
                // Get value from raw data
                let value = rowData[columnId];
                
                // Apply accessorFn if defined
                const columnDef = column.columnDef as any;
                if (columnDef.accessorFn && typeof columnDef.accessorFn === 'function') {
                    value = columnDef.accessorFn(rowData);
                }
                
                // Convert to string for export
                if (value === null || value === undefined) {
                    value = '';
                } else if (typeof value === 'object') {
                    value = JSON.stringify(value);
                } else {
                    value = String(value);
                }
                
                exportRow[header] = value;
            });
            
            return exportRow;
        });

        // Export the data
        await exportToFile(exportData, format, filename);

        onComplete?.({
            success: true,
            filename: `${filename}.${format === 'excel' ? 'xlsx' : 'csv'}`,
            totalRows: exportData.length,
        });

    } catch (error) {
        console.error('Server export failed:', error);
        onError?.({
            message: error instanceof Error ? error.message : 'Export failed',
            code: 'SERVER_EXPORT_ERROR',
        });
    }
}

/**
 * Export data to file (CSV or Excel)
 */
async function exportToFile(
    data: Record<string, any>[],
    format: 'csv' | 'excel',
    filename: string,
): Promise<void> {
    if (data.length === 0) {
        throw new Error('No data to export');
    }

    if (format === 'csv') {
        const csv = convertToCSV(data);
        downloadFile(csv, `${filename}.csv`, 'text/csv');
    } else {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        downloadFile(blob, `${filename}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
}

/**
 * Convert data to CSV format
 */
function convertToCSV(data: Record<string, any>[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma or quote
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

/**
 * Download file to user's device
 */
function downloadFile(content: string | Blob, filename: string, mimeType: string): void {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}
