/**
 * Custom TanStack Table Features
 * 
 * This module exports custom features that extend TanStack Table functionality
 * following the official custom features pattern introduced in v8.14.0
 */

export {
    ColumnFilterFeature,
    matchesCustomColumnFilters,
    type ColumnFilterRule,
    type ColumnFilterOptions,
    type ColumnFilterTableState,
    type ColumnFilterInstance,
} from './column-filter.feature';

// Export custom selection feature
export {
    SelectionFeature,
    type SelectionState,
    type SelectMode,
    type SelectionOptions,
    type SelectionTableState,
    type SelectionInstance,
} from './selection.feature'; 