/**
 * Clipboard copy — serializes selected rows to delimited text (TSV by default, so it
 * pastes into spreadsheets) by reusing the export column resolution + serializer, then
 * writes to the clipboard. SSR-safe; falls back to `execCommand('copy')` outside a
 * secure context.
 */
import type { Table, Row } from '@tanstack/react-table';

import { buildExportRequest } from './export/request';
import { formatRowRecord } from './export/format';
import { csvHeaderLine, csvRowLine } from './export/serialize';

export interface CopyRowsOptions {
    includeHeaders?: boolean;
    /** Cell delimiter (default tab — pastes into Sheets/Excel as columns). */
    delimiter?: string;
}

/** Build delimited text for the given rows, using the visible, exportable columns. */
export function rowsToDelimitedText<T>(table: Table<T>, rows: Row<T>[], options: CopyRowsOptions = {}): string {
    const { includeHeaders = true, delimiter = '\t' } = options;
    // Resolve the same columns export uses (visible, minus special/`hideInExport`).
    const { columns } = buildExportRequest(table, { format: 'csv', filename: 'clipboard', onlyVisibleColumns: true, sanitizeCSV: false });
    const headers = columns.map((c) => c.header);
    const getRaw = (col: any, row: any) => (typeof row?.getValue === 'function' ? row.getValue(col.id) : row?.[col.id]);
    const lineOpts = { delimiter, sanitizeCSV: false };
    const lines: string[] = [];
    if (includeHeaders) lines.push(csvHeaderLine(headers, lineOpts));
    rows.forEach((row, i) => lines.push(csvRowLine(formatRowRecord(row, i, columns, getRaw), headers, lineOpts)));
    return lines.join('\n');
}

/** Write text to the clipboard. Async secure-context API with an execCommand fallback. */
export async function writeToClipboard(text: string): Promise<boolean> {
    if (typeof navigator === 'undefined' || typeof document === 'undefined') return false;
    try {
        if (navigator.clipboard && (window as any).isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        /* fall through to the legacy path */
    }
    // selecting the textarea steals focus — capture it so we can restore the caller's
    // focused element (e.g. the grid's roving-tabindex cell) afterwards.
    const prevFocus = document.activeElement as HTMLElement | null;
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
    } catch {
        return false;
    } finally {
        prevFocus?.focus?.();
    }
}
