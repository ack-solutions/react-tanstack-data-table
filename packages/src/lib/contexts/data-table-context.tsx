import { Table } from '@tanstack/react-table';
import { createContext, useContext, ReactNode, useMemo } from 'react';

import { ICustomColumnFilter, TableSize } from '../types';
import { DataTableApi } from '../types/data-table-api';


/**
 * Context value for the DataTable
 */
interface DataTableContextValue<T = any> {
    table: Table<T>;
    apiRef?: React.RefObject<DataTableApi<T>>;
    dataMode?: 'client' | 'server';
    tableSize?: TableSize;
    onTableSizeChange?: (size: TableSize) => void;
    customColumnsFilter?: ICustomColumnFilter;
    onChangeCustomColumnsFilter?: (filter: ICustomColumnFilter) => void;
    slots?: Record<string, any>;
    slotProps?: Record<string, any>;

    // Export state - managed by the DataTable component
    isExporting?: boolean;
    exportController?: AbortController | null;
    onCancelExport?: () => void;

    // Export callbacks - passed from DataTable props
    exportFilename?: string;
    onExportProgress?: (progress: { processedRows: number; totalRows: number; percentage: number }) => void;
    onExportComplete?: (result: { success: boolean; filename: string; totalRows: number }) => void;
    onExportError?: (error: { message: string; code: string }) => void;
    onServerExport?: (filters?: Partial<any>) => Promise<{ data: any[]; total: number }>;
}

const DataTableContext = createContext<DataTableContextValue | null>(null);

interface DataTableProviderProps<T = any> extends DataTableContextValue<T> {
    children: ReactNode;
}

export function DataTableProvider<T = any>({
    children,
    table,
    apiRef,
    dataMode,
    tableSize,
    onTableSizeChange,
    customColumnsFilter,
    onChangeCustomColumnsFilter,
    slots = {},
    slotProps = {},
    isExporting,
    exportController,
    onCancelExport,
    exportFilename,
    onExportProgress,
    onExportComplete,
    onExportError,
    onServerExport,
}: DataTableProviderProps<T>) {
    const value = useMemo(() => ({
        table,
        apiRef,
        dataMode,
        tableSize,
        onTableSizeChange,
        customColumnsFilter,
        onChangeCustomColumnsFilter,
        slots,
        slotProps,
        isExporting,
        exportController,
        onCancelExport,
        exportFilename,
        onExportProgress,
        onExportComplete,
        onExportError,
        onServerExport,
    }), [
        table,
        apiRef,
        dataMode,
        tableSize,
        onTableSizeChange,
        customColumnsFilter,
        onChangeCustomColumnsFilter,
        slots,
        slotProps,
        isExporting,
        exportController,
        onCancelExport,
        exportFilename,
        onExportProgress,
        onExportComplete,
        onExportError,
        onServerExport,
    ]);

    return (
        <DataTableContext.Provider value={value}>
            {children}
        </DataTableContext.Provider>
    );
}

export function useDataTableContext<T = any>(): DataTableContextValue<T> {
    const context = useContext(DataTableContext);
    if (!context) {
        throw new Error('useDataTableContext must be used within a DataTableProvider');
    }
    return context;
}
