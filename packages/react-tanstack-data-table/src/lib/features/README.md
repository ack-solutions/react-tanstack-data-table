# Custom TanStack Table Features

This directory contains custom features that extend TanStack Table functionality following the official custom features pattern introduced in v8.14.0.

## Custom Column Filter Feature

The Custom Column Filter Feature adds advanced column filtering capabilities to TanStack Table, providing a more sophisticated filtering UI with AND/OR logic and multiple operators.

### Features

- **Multiple Filter Conditions**: Add multiple filter rules for different columns
- **Logic Operators**: Choose between AND/OR logic for combining filters
- **Various Operators**: Support for equals, contains, greater than, less than, empty checks, etc.
- **Type-Aware Filtering**: Different operators available based on column type
- **Integrated State Management**: Filters are managed within TanStack Table's state system

### Usage

#### 1. Import the Feature

```typescript
import { CustomColumnFilterFeature } from '@your-package/features';
```

#### 2. Add to Table Options

```typescript
const table = useReactTable({
    _features: [CustomColumnFilterFeature], // Add the custom feature
    data,
    columns,
    // ... other options
});
```

#### 3. Use the Feature Methods

The feature adds several methods to your table instance:

```typescript
// Add a new filter
table.addColumnFilter('columnId', 'contains', 'search value');

// Update an existing filter
table.updateColumnFilter('filterId', { value: 'new value' });

// Remove a filter
table.removeColumnFilter('filterId');

// Clear all filters
table.clearAllColumnFilters();

// Get active filters
const activeFilters = table.getActiveColumnFilters();

// Set filter logic (AND/OR)
table.setFilterLogic('OR');

// Get current filter state
const filterState = table.getCustomColumnFilterState();
```

#### 4. Handle State Changes

```typescript
const table = useReactTable({
    _features: [CustomColumnFilterFeature],
    // ... other options
    onCustomColumnFilterChange: (updater) => {
        // Handle filter state changes
        const newState = typeof updater === 'function' 
            ? updater(currentState)
            : updater;
        
        // Update your local state or trigger server requests
        handleFilterChange(newState);
    },
});
```

### Available Filter Operators

| Operator | Description | Types |
|----------|-------------|-------|
| `equals` | Exact match | All |
| `notEquals` | Not equal to | All |
| `contains` | Contains substring | Text |
| `notContains` | Does not contain | Text |
| `startsWith` | Starts with | Text |
| `endsWith` | Ends with | Text |
| `isEmpty` | Is empty/null | All |
| `isNotEmpty` | Is not empty/null | All |
| `greaterThan` | Greater than | Number, Date |
| `greaterThanOrEqual` | Greater than or equal | Number, Date |
| `lessThan` | Less than | Number, Date |
| `lessThanOrEqual` | Less than or equal | Number, Date |
| `between` | Between two values | Number, Date |
| `in` | In array of values | All |
| `notIn` | Not in array of values | All |

### Client-Side Filtering

For client-side filtering, you can use the provided utility function:

```typescript
import { matchesCustomColumnFilters } from '@your-package/features';

const filteredRows = rows.filter(row => 
    matchesCustomColumnFilters(row, filters, logic)
);
```

### Server-Side Filtering

For server-side filtering, listen to filter changes and send the filter state to your backend:

```typescript
const handleFilterChange = (filterState) => {
    // Send to server
    fetchData({
        filters: filterState.filters,
        logic: filterState.logic,
        // ... other params
    });
};
```

### TypeScript Integration

The feature includes full TypeScript support with declaration merging that extends TanStack Table's types:

```typescript
// These types are automatically available after importing the feature
interface CustomColumnFilterState {
    filters: ColumnFilterRule[];
    logic: 'AND' | 'OR';
}

interface ColumnFilterRule {
    id: string;
    columnId: string;
    operator: string;
    value: any;
    columnType?: string;
}
```

### Example

See `custom-column-filter-example.tsx` for a complete working example.

## Creating Additional Custom Features

To create additional custom features, follow the TanStack Table custom features pattern:

1. Define TypeScript types
2. Use declaration merging to extend TanStack Table types
3. Create the feature object with `getInitialState`, `getDefaultOptions`, and `createTable`
4. Add the feature to your table's `_features` array

Refer to the TanStack Table documentation for more details on creating custom features. 