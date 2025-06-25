/**
 * MUI TanStack DataTable
 *
 * A comprehensive, highly customizable data table component built with:
 * - Material-UI (MUI) for styling
 * - TanStack Table for table logic
 * - TypeScript for type safety
 *
 * Features:
 * - Column sorting, filtering, resizing, reordering, and pinning
 * - Row selection, expansion, and virtualization
 * - Pagination with customizable page sizes
 * - Global and column-specific search/filtering
 * - Export functionality (CSV, XLSX, JSON)
 * - Responsive design with mobile support
 * - Accessibility features
 * - Customizable toolbar and actions
 * - Loading states and empty data handling
 */

// Main components
export * from './lib/components';

// Individual toolbar components for custom toolbars
export {
    ColumnVisibilityControl,
    ColumnPinningControl,
    ColumnResetControl,
    TableExportControl,
    TableSizeControl,
    BulkActionsToolbar,
} from './lib/components/toolbar';

// Export bulk action types
export type { BulkActionsToolbarProps } from './lib/components/toolbar';

// Utilities and helpers
export * from './lib/utils/styling-helpers';
export * from './lib/utils/column-helpers';
export * from './lib/utils/table-helpers';

// Custom hooks
export * from './lib/hooks';
export * from './lib/types';

// Re-export commonly used types from TanStack Table
export type {
    Column,
    ColumnDef,
    Row,
    Table,
    Header,
    Cell,
    SortingState,
    ColumnFiltersState,
    VisibilityState,
    ColumnOrderState,
    ColumnPinningState,
    PaginationState,
} from '@tanstack/react-table';
