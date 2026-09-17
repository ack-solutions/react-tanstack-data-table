import type {
    SortingState,
    ColumnPinningState,
    ColumnOrderState,
    RowPinningState,
    VisibilityState,
} from '@tanstack/react-table';

import type { DataTableDensity } from '../theme/tokens';
import type { ExportScope } from './export.types';
import type { ColumnFilterState } from './filter.types';
import type { SelectionState } from './selection.types';

export interface PaginationModel {
    pageIndex: number;
    pageSize: number;
}

/** Full controllable table-state snapshot. */
export interface TableState {
    sorting?: SortingState;
    pagination?: PaginationModel;
    globalFilter?: string;
    columnFilter?: ColumnFilterState;
    columnVisibility?: VisibilityState;
    columnSizing?: Record<string, number>;
    columnOrder?: ColumnOrderState;
    columnPinning?: ColumnPinningState;
    /** Pinned rows by id — `{ top: [...], bottom: [...] }`. Client data mode only. */
    rowPinning?: RowPinningState;
    selectionState?: SelectionState;
    /** TanStack ExpandedState — `true` means "expand all". */
    expanded?: boolean | Record<string, boolean>;
    density?: DataTableDensity;
}

/** Normalised filter/state passed to the server fetch handler. */
export interface TableFilters {
    globalFilter?: string;
    pagination?: PaginationModel;
    columnFilter?: ColumnFilterState;
    sorting?: SortingState;
}

export type DataRefreshReason = 'initial' | 'state-change' | 'refresh' | 'reload' | 'reset' | (string & {});

/** Context on an export page fetch (`meta.reason === 'export'`): which rows the file covers. */
export interface DataFetchExportMeta {
    scope: ExportScope;
    /** The grid's selection when `scope === 'selected'`. Filter by it server-side if you can. */
    selection?: SelectionState;
}

export interface DataFetchMeta {
    reason?: DataRefreshReason;
    delay?: number;
    force?: boolean;
    /** Present only on export page fetches (`reason: 'export'`). */
    export?: DataFetchExportMeta;
}

export interface DataRefreshOptions extends Omit<DataFetchMeta, 'export'> {
    resetPagination?: boolean;
}

export interface DataRefreshContext {
    filters: Partial<TableFilters>;
    state: Partial<TableState>;
    options: { resetPagination: boolean; force: boolean; reason: string };
}
