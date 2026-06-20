/**
 * Builds the {@link ExportRequest} descriptor from live grid state — the single place
 * that decides *which columns* (visible / explicitly chosen, minus `hideInExport` and
 * the selection/expand helper columns), *which rows* (scope + selection), and carries
 * the current filters + sort. Every mode consumes this, so column/selection/format
 * handling is identical whether the file is built on the client or the server.
 */
import type { Table } from '@tanstack/react-table';

import { DEFAULT_SELECTION_COLUMN_ID, DEFAULT_EXPAND_COLUMN_ID, DEFAULT_ACTIONS_COLUMN_ID } from '../../types/column.types';
import type { ExportFormat, ExportRequest, ExportScope } from '../../types/export.types';
import type { SelectionState } from '../../types/selection.types';
import { resolveExportHeader, toExportColumns, type ResolvedExportColumn } from './format';

const SPECIAL_COLUMN_IDS = new Set([DEFAULT_SELECTION_COLUMN_ID, DEFAULT_EXPAND_COLUMN_ID, DEFAULT_ACTIONS_COLUMN_ID]);

export interface BuildExportRequestOptions {
    format: ExportFormat;
    filename: string;
    /** Limit to currently-visible columns (default true). */
    onlyVisibleColumns?: boolean;
    /** Explicit column id whitelist (overrides visibility), in the given order. */
    columns?: string[];
    /** Force a scope; otherwise derived from selection + active filters. */
    scope?: ExportScope;
    onlySelectedRows?: boolean;
    includeHeaders?: boolean;
    sanitizeCSV?: boolean;
    delimiter?: string;
    /** Curated current filters (global + column) to carry to the server. */
    filters?: any;
    /** Current sort state. */
    sorting?: any;
    /** Include/exclude selection (for `scope: 'selected'`). */
    selection?: SelectionState;
}

export interface BuiltExportRequest {
    request: ExportRequest;
    /** Resolved columns with their TanStack column refs, for client-side formatting. */
    columns: ResolvedExportColumn[];
}

function selectionHasRows(selection?: SelectionState): boolean {
    if (!selection) return false;
    if (selection.type === 'exclude') return true; // "all except N"
    return Array.isArray(selection.ids) && selection.ids.length > 0;
}

function filtersActive(filters: any): boolean {
    if (!filters) return false;
    if (typeof filters === 'object') {
        if (filters.globalFilter) return true;
        const cf = filters.columnFilter ?? filters.columnFilters ?? filters.filters;
        if (Array.isArray(cf)) return cf.length > 0;
        if (cf && typeof cf === 'object') return Object.keys(cf).length > 0;
    }
    return false;
}

export function buildExportRequest<T>(table: Table<T>, options: BuildExportRequestOptions): BuiltExportRequest {
    const {
        format,
        filename,
        onlyVisibleColumns = true,
        columns: columnIds,
        scope: scopeOverride,
        onlySelectedRows,
        includeHeaders = true,
        sanitizeCSV = true,
        delimiter,
        filters,
        sorting,
        selection,
    } = options;

    const source = onlyVisibleColumns ? table.getVisibleLeafColumns() : table.getAllLeafColumns();
    let leaf = source.filter(
        (col) => !SPECIAL_COLUMN_IDS.has(col.id) && (col.columnDef as any)?.hideInExport !== true,
    );

    if (columnIds && columnIds.length) {
        const order = new Map(columnIds.map((id, i) => [id, i] as const));
        leaf = leaf.filter((c) => order.has(c.id)).sort((a, b) => (order.get(a.id)! - order.get(b.id)!));
    }

    const resolved: ResolvedExportColumn[] = leaf.map((column) => ({
        id: column.id,
        header: resolveExportHeader(column.columnDef, column.id),
        column,
        columnDef: column.columnDef,
    }));

    const hasSelection = selectionHasRows(selection);
    const scope: ExportScope =
        scopeOverride ?? (onlySelectedRows && hasSelection ? 'selected' : filtersActive(filters) ? 'filtered' : 'all');

    const request: ExportRequest = {
        format,
        filename,
        columns: toExportColumns(resolved),
        scope,
        selection: scope === 'selected' ? selection : undefined,
        filters,
        sorting,
        includeHeaders,
        delimiter,
        sanitizeCSV,
    };

    return { request, columns: resolved };
}
