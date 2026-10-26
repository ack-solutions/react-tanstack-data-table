/**
 * Output serialization. CSV is produced **line by line** (never one monolithic
 * `join`), so it pairs with a streaming sink for bounded memory. XLSX is lazily
 * loaded and guarded against Excel's hard worksheet row limit.
 */
import type { ExcelWriter } from '../../types/export.types';
import { sanitizeCSVCellValue } from './format';
import { loadXlsx } from './load-xlsx';

/** Excel's hard ceiling is 1,048,576 rows per sheet (minus 1 for the header). */
export const MAX_XLSX_ROWS = 1_048_575;

const DEFAULT_DELIMITER = ',';

function escapeCsvCell(raw: any, delimiter: string, sanitize: boolean): string {
    const normalized = sanitize ? sanitizeCSVCellValue(raw) : raw;
    const value = normalized === null || normalized === undefined ? '' : String(normalized);
    if (value.includes(delimiter) || value.includes('"') || value.includes('\n') || value.includes('\r')) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}

export interface CsvLineOptions {
    delimiter?: string;
    sanitizeCSV?: boolean;
}

/** A CSV line for the header row. */
export function csvHeaderLine(headers: string[], options: CsvLineOptions = {}): string {
    const { delimiter = DEFAULT_DELIMITER, sanitizeCSV = true } = options;
    return headers.map((h) => escapeCsvCell(h, delimiter, sanitizeCSV)).join(delimiter);
}

/** A CSV line for one `{ header: value }` record, in `headers` order. */
export function csvRowLine(record: Record<string, any>, headers: string[], options: CsvLineOptions = {}): string {
    const { delimiter = DEFAULT_DELIMITER, sanitizeCSV = true } = options;
    return headers.map((h) => escapeCsvCell(record[h] ?? '', delimiter, sanitizeCSV)).join(delimiter);
}

/** Legacy whole-array CSV builder (kept for the in-memory client fallback). */
export function recordsToCSV(records: Record<string, any>[], options: CsvLineOptions = {}): string {
    if (records.length === 0) return '';
    const headers = Object.keys(records[0]);
    const lines = [csvHeaderLine(headers, options)];
    for (const record of records) lines.push(csvRowLine(record, headers, options));
    return lines.join('\n');
}

export interface XlsxBuildResult {
    blob: Blob;
    rows: number;
    truncated: boolean;
}

/**
 * Build an XLSX blob from records. Throws if the row count exceeds Excel's limit
 * unless `truncate` is set, in which case it caps and reports `truncated: true`.
 * `xlsx` is dynamically imported so it stays out of the initial bundle; with a `writer`
 * it is never loaded.
 */
export async function buildXlsxBlob(
    records: Record<string, any>[],
    options: { sheetName?: string; truncate?: boolean; writer?: ExcelWriter } = {},
): Promise<XlsxBuildResult> {
    const { sheetName = 'Data', truncate = false, writer } = options;
    let rows = records;
    let truncated = false;
    if (records.length > MAX_XLSX_ROWS) {
        if (!truncate) {
            throw new Error(
                `Excel supports at most ${MAX_XLSX_ROWS.toLocaleString()} rows per sheet, ` +
                    `but the export has ${records.length.toLocaleString()}. Use CSV for large exports.`,
            );
        }
        rows = records.slice(0, MAX_XLSX_ROWS);
        truncated = true;
    }
    const blob = await writeXlsxBytes(rows, sheetName, writer);
    return { blob, rows: rows.length, truncated };
}

/** Workbook bytes as an XLSX blob, from the app's `writer` if given, else the `xlsx` peer. */
export async function writeXlsxBytes(rows: Record<string, any>[], sheetName: string, writer?: ExcelWriter): Promise<Blob> {
    let bytes: Blob | ArrayBuffer | Uint8Array;
    if (writer) {
        bytes = await writer(rows, { sheetName });
    } else {
        const XLSX = await loadXlsx();
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        bytes = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    }
    return bytes instanceof Blob ? bytes : new Blob([bytes as BlobPart], { type: XLSX_MIME });
}

export const CSV_MIME = 'text/csv;charset=utf-8';
export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
