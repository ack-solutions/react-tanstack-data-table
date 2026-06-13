/**
 * Shared value formatting for export — column-def transforms (`exportHeader`,
 * `exportValue`, `exportFormat`), value normalization, and CSV-cell sanitization.
 * Used by every export mode so the output is identical regardless of where the
 * file is built.
 */
import type { Column } from '@tanstack/react-table';

import type { ExportColumn } from '../../types/export.types';

export interface ResolvedExportColumn {
    id: string;
    header: string;
    /** The TanStack column (present for client/server-data; absent for pure descriptors). */
    column?: Column<any, any>;
    columnDef?: any;
}

export function resolveExportHeader(columnDef: any, columnId: string): string {
    const defaultHeader = typeof columnDef?.header === 'string' ? columnDef.header : columnId;
    if (columnDef?.exportHeader === undefined || columnDef?.exportHeader === null) return defaultHeader;
    if (typeof columnDef.exportHeader === 'function') {
        return String(columnDef.exportHeader({ columnId, defaultHeader, columnDef }) ?? defaultHeader);
    }
    return String(columnDef.exportHeader);
}

export function applyExportValueTransform(columnDef: any, value: any, row: any, rowIndex: number, columnId: string) {
    if (typeof columnDef?.exportValue === 'function') {
        return columnDef.exportValue({ value, row, rowIndex, columnId, columnDef });
    }
    return value;
}

export function applyExportFormatTransform(columnDef: any, value: any, row: any, rowIndex: number, columnId: string) {
    const format = columnDef?.exportFormat;
    if (!format || format === 'auto') return value;
    if (typeof format === 'function') return format({ value, row, rowIndex, columnId, columnDef });
    if (value === null || value === undefined) return '';
    switch (format) {
        case 'string': return String(value);
        case 'number': return Number(value);
        case 'boolean': return Boolean(value);
        case 'json': return JSON.stringify(value);
        case 'date': return value instanceof Date ? value.toISOString() : String(value);
        default: return value;
    }
}

export function normalizeExportValue(value: any): any {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
}

/**
 * Neutralize CSV/Excel formula-injection. A leading `=`, `+`, `-`, `@`, TAB, or CR
 * makes a spreadsheet treat the cell as a formula — prefix with `'` to defuse.
 * (The TAB/CR cases are the gap the original implementation missed.)
 */
export function sanitizeCSVCellValue(value: any): any {
    if (typeof value !== 'string' || value.length === 0) return value;
    const first = value[0];
    if (first === '=' || first === '+' || first === '-' || first === '@' || first === '\t' || first === '\r') {
        return `'${value}`;
    }
    return value;
}

/**
 * Build a plain `{ header: value }` record for a row, applying column-def transforms.
 * `getRaw` extracts the pre-transform value for a column (differs for table-row vs raw-object sources).
 */
export function formatRowRecord(
    row: any,
    rowIndex: number,
    columns: ResolvedExportColumn[],
    getRaw: (col: ResolvedExportColumn, row: any, rowIndex: number) => any,
): Record<string, any> {
    const record: Record<string, any> = {};
    for (const col of columns) {
        const columnDef = col.columnDef ?? col.column?.columnDef;
        const base = getRaw(col, row, rowIndex);
        const value = applyExportFormatTransform(
            columnDef,
            applyExportValueTransform(columnDef, base, rowOriginal(row), rowIndex, col.id),
            rowOriginal(row),
            rowIndex,
            col.id,
        );
        record[col.header] = normalizeExportValue(value);
    }
    return record;
}

function rowOriginal(row: any): any {
    return row && typeof row === 'object' && 'original' in row ? row.original : row;
}

/** Map resolved columns down to the serializable {@link ExportColumn} descriptor. */
export function toExportColumns(columns: ResolvedExportColumn[]): ExportColumn[] {
    return columns.map((c) => {
        const fmt = c.columnDef?.exportFormat;
        return {
            id: c.id,
            header: c.header,
            format: typeof fmt === 'string' ? (fmt as any) : undefined,
        };
    });
}
