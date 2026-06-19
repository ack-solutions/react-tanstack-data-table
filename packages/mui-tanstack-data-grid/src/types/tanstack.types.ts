/**
 * Re-export of the TanStack Table types that surface in this package's public API
 * — `TableState`, the `DataTableProps` `onXChange` callbacks, and `DataTableApi`.
 * Consumers can then type state slices + callback params from the package root
 * instead of deep-importing `@tanstack/react-table` (which TS2305'd before).
 */
export type {
    SortingState,
    ColumnPinningState,
    ColumnOrderState,
    VisibilityState,
    ColumnSizingState,
    PaginationState,
    ExpandedState,
    RowSelectionState,
    Updater,
    Row,
    ColumnDef,
} from '@tanstack/react-table';
