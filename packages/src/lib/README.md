# MUI TanStack DataTable

A comprehensive, highly customizable data table component built with Material-UI (MUI) and TanStack Table.

## 🏗️ Improved Structure

The DataTable has been reorganized into a clean, maintainable structure:

```
📁 data-table/
├── 📁 components/
│   ├── 📁 table/           # Main table component and types
│   ├── 📁 headers/         # Header-related components
│   ├── 📁 rows/           # Row-related components
│   ├── 📁 toolbar/        # Toolbar and controls
│   ├── 📁 filters/        # Filtering components
│   ├── 📁 actions/        # Action column components
│   └── 📁 pagination/     # Pagination components
├── 📁 hooks/              # Custom React hooks
├── 📁 utils/              # Utility functions
├── 📁 examples/           # Usage examples
└── index.ts               # Main export file
```

## 🎯 Key Improvements

### ✅ **Better Organization**
- **Separated by functionality**: Each component type has its own folder
- **Clear imports**: No more circular dependencies or confusing paths
- **Modular design**: Each component can be used independently

### ✅ **Improved Naming Conventions**
- `emprty-data-row.tsx` → `empty-data-row.tsx` (fixed typo)
- `helper.ts` → `styling-helpers.ts` + `column-helpers.ts` + `table-helpers.ts`
- More descriptive and specific naming

### ✅ **Enhanced Type Safety**
- Centralized type definitions in `data-table.types.ts`
- Better TypeScript support with proper interfaces
- Reduced type conflicts and ambiguity

### ✅ **Utility Functions**
- **Styling helpers**: Consistent styling utilities for pinned columns
- **Column helpers**: Type checking, filtering, sorting logic
- **Table helpers**: Performance, formatting, and calculation utilities

### ✅ **Custom Hooks**
- **API management**: Reusable data table API hooks
- **Reusable logic**: Extract common patterns into hooks  
- **Better performance**: Optimized state updates and memoization

## 📦 Component Structure

### 🗂️ Components
```typescript
// Main table
import { DataTable } from './components/table';

// Headers
import { TableHeader, DraggableHeader } from './components/headers';

// Rows
import { DataTableRow, LoadingRows, EmptyDataRow } from './components/rows';

// Toolbar
import { DataTableToolbar, TableSizeControl } from './components/toolbar';

// Filters
import { ColumnFilter, FilterValueInput } from './components/filters';

// Actions & Pagination
import { ActionColumn } from './components/actions';
import { DataTablePagination } from './components/pagination';
```

### 🔧 Utilities
```typescript
// Styling utilities
import { getPinnedColumnStyle, tableCellStyles } from './utils/styling-helpers';

// Column utilities
import { getColumnType, isColumnFilterable } from './utils/column-helpers';

// Table utilities
import { getEstimatedRowHeight, formatCellValue } from './utils/table-helpers';
```

### 🎣 Hooks
```typescript
// API management
import { useDataTableApi } from './hooks/use-data-table-api';
```

## 🚀 Usage

### Basic Example
```typescript
import { DataTable } from './data-table';
import type { DataTableProps } from './data-table';

const MyTable = () => {
  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' },
  ];

  const data = [
    { name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    // ... more data
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      enableSorting
      enableColumnFilters
      enablePagination
    />
  );
};
```

### Advanced Example with Custom Configuration
```typescript
const AdvancedTable = () => {
  return (
    <DataTable
      columns={columns}
      data={data}
      enableSorting
      enableColumnFilters
      enablePagination
      initialPagination={{ pageIndex: 0, pageSize: 25 }}
      initialSorting={[{ id: 'name', desc: false }]}
      // ... other props
    />
  );
};
```

## 🎨 Features

- ✅ **Column Management**: Sort, filter, resize, reorder, pin
- ✅ **Row Features**: Selection, expansion, virtualization
- ✅ **Pagination**: Customizable page sizes and navigation
- ✅ **Search & Filter**: Global search + column-specific filters
- ✅ **Export**: CSV, XLSX, JSON formats
- ✅ **Responsive**: Mobile-friendly design
- ✅ **Accessibility**: ARIA labels and keyboard navigation
- ✅ **Performance**: Virtualization for large datasets
- ✅ **Theming**: Material-UI theme integration
- ✅ **TypeScript**: Full type safety

## 📈 Performance Optimizations

1. **Component Memoization**: React.memo for expensive components
2. **State Management**: Optimized state updates with custom hooks
3. **Virtualization**: Only render visible rows for large datasets
4. **Debounced Filters**: Prevent excessive re-renders during typing
5. **Utility Functions**: Memoized calculations and formatting

## 🔄 Migration Guide

### From Old Structure
```typescript
// Old
import { getPinnedColumnStyle } from './helper';

// New
import { getPinnedColumnStyle } from './utils/styling-helpers';
```

### Import Changes
```typescript
// Old
import { DataTable } from './data-table';
import { EmptyStateRow } from './empty-state-row';

// New
import { DataTable } from './components/table';
import { EmptyDataRow } from './components/rows';
```

## 🛠️ Development

### Adding New Components
1. Create component in appropriate folder (`components/[category]/`)
2. Add to category's `index.ts` file
3. Update main `components/index.ts` if needed
4. Add TypeScript definitions in `data-table.types.ts`

### Adding New Utilities
1. Create in `utils/` folder with descriptive name
2. Add to `utils/index.ts`
3. Document with JSDoc comments
4. Add unit tests if applicable

This structure provides better maintainability, clearer separation of concerns, and improved developer experience! 🎉
