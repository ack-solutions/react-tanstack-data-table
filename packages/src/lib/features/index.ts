/**
 * Custom TanStack Table Features
 * 
 * This module exports custom features that extend TanStack Table functionality
 * following the official custom features pattern introduced in v8.14.0
 */

export {
    CustomColumnFilterFeature,
    matchesCustomColumnFilters,
    type ColumnFilterRule,
    type CustomColumnFilterOptions,
    type CustomColumnFilterTableState,
    type CustomColumnFilterInstance,
} from './custom-column-filter.feature';

// Export custom selection feature
export {
    CustomSelectionFeature,
    type SelectionState,
    type SelectMode,
    type CustomSelectionOptions,
    type CustomSelectionTableState,
    type CustomSelectionInstance,
} from './custom-selection.feature'; 