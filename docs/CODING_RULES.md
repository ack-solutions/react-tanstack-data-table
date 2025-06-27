# Coding Rules and Standards

This document outlines the coding standards and rules for the **@ackplus/react-tanstack-data-table** project.

## 📁 File Naming Conventions

### Rule 1: Use kebab-case for all file names
- ✅ **Correct**: `data-table.tsx`, `export-progress-dialog.tsx`, `use-table-state.ts`
- ❌ **Incorrect**: `DataTable.tsx`, `exportProgressDialog.tsx`, `useTableState.ts`

**Examples:**
```
✅ components/data-table.tsx
✅ hooks/use-data-table-api.ts
✅ utils/column-helpers.ts
✅ types/data-table-api.ts

❌ components/DataTable.tsx
❌ hooks/useDataTableApi.ts
❌ utils/columnHelpers.ts
❌ types/DataTableApi.ts
```

## 🏗️ Component Structure Rules

### Rule 2: One component per file
- Each file should contain **only one React component**
- This improves maintainability and makes testing easier
- Exception: Helper components that are only used within the main component can be in the same file if they are very small

**Examples:**
```typescript
// ✅ CORRECT - data-table.tsx
export const DataTable = () => {
  return <div>...</div>;
};

// ❌ INCORRECT - multiple-components.tsx  
export const DataTable = () => {
  return <div>...</div>;
};

export const DataTableHeader = () => {  // Should be in separate file
  return <div>...</div>;
};
```

## 🔷 TypeScript Rules

### Rule 3: Always use proper TypeScript types

#### 3.1 No `any` type
- ❌ **Never use** `any` type
- ✅ **Use** specific types, interfaces, or generics

```typescript
// ❌ INCORRECT
const handleData = (data: any) => {
  // ...
};

// ✅ CORRECT
interface TableData {
  id: string;
  name: string;
  value: number;
}

const handleData = (data: TableData[]) => {
  // ...
};
```

#### 3.2 Explicit function return types
- Always specify return types for functions
- Use `void` for functions that don't return anything

```typescript
// ✅ CORRECT
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.value, 0);
};

const updateTable = (): void => {
  // ...
};
```

#### 3.3 Proper interface and type definitions
- Use `interface` for object shapes that can be extended
- Use `type` for unions, primitives, and computed types
- Always export types/interfaces that are used in multiple files

```typescript
// ✅ CORRECT - types/table.types.ts
export interface TableColumn {
  id: string;
  label: string;
  sortable?: boolean;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: string;
  direction: SortDirection;
}
```

#### 3.4 Component Props Typing
- Always define props interfaces
- Use generic types where appropriate
- Mark optional props with `?`

```typescript
// ✅ CORRECT
interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
}

export const DataTable = <T,>({ 
  data, 
  columns, 
  loading = false,
  onRowClick 
}: DataTableProps<T>): JSX.Element => {
  // ...
};
```

## 📦 Import/Export Rules

### Rule 4: Prefer named exports over default exports
- Use named exports to improve IDE support and refactoring
- Exception: For the main component of a file, you may use default export

```typescript
// ✅ PREFERRED
export const DataTable = () => {
  // ...
};

// ✅ ACCEPTABLE (for main components)
const DataTable = () => {
  // ...
};

export default DataTable;
```

### Rule 5: Organize imports properly
```typescript
// ✅ CORRECT import order
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { Button, TextField } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

// 3. Internal imports (absolute paths)
import { useDataTableApi } from '../hooks/use-data-table-api';
import { TableColumn } from '../types/column.types';

// 4. Relative imports
import './data-table.styles.css';
```

## 🏷️ Variable and Function Naming

### Rule 6: Use descriptive names
- Use camelCase for variables and functions
- Use PascalCase for components and classes
- Use UPPER_SNAKE_CASE for constants

```typescript
// ✅ CORRECT
const isTableLoading = true;
const fetchTableData = () => {};
const TableHeader = () => {};
const MAX_ROWS_PER_PAGE = 100;

// ❌ INCORRECT  
const loading = true;  // Not descriptive enough
const fetch = () => {};  // Too generic
const header = () => {};  // Should be PascalCase for components
```

## 📝 Code Quality Rules

### Rule 7: Use const instead of let when possible
```typescript
// ✅ CORRECT
const tableData = fetchData();
const sortedData = useMemo(() => sortData(data), [data]);

// ❌ INCORRECT (if value doesn't change)
let tableData = fetchData();
```

### Rule 8: Avoid console.log in production code
- Use proper logging libraries or remove debug statements
- Console statements should only be warnings during development

## 🧪 Testing Rules

### Rule 9: Test files can have multiple test cases
- Exception to the "one component per file" rule
- Test files can contain multiple test suites and cases
- Use descriptive test names

```typescript
// ✅ CORRECT - data-table.spec.tsx
describe('DataTable', () => {
  it('should render table headers correctly', () => {
    // ...
  });

  it('should handle sorting when column header is clicked', () => {
    // ...
  });
});
```

## 🔧 Configuration Files

The following files enforce these rules:

- **`.eslintrc.json`** - Enforces TypeScript rules, component structure, and code quality
- **`tsconfig.json`** - TypeScript compiler configuration
- **This document** - Complete reference for all coding standards

## ✅ Checklist for Code Reviews

Before submitting code, ensure:

- [ ] All file names are in kebab-case
- [ ] Each file contains only one component
- [ ] No `any` types are used
- [ ] All functions have explicit return types
- [ ] Props interfaces are properly defined
- [ ] Named exports are used (preferred)
- [ ] Imports are organized correctly
- [ ] Variable names are descriptive
- [ ] No console.log statements in production code
- [ ] Code passes ESLint checks

## 🚀 Automation

Run the following commands to check compliance:

```bash
# Check TypeScript types
nx run @ackplus/react-tanstack-data-table:typecheck

# Check ESLint rules
nx lint @ackplus/react-tanstack-data-table

# Run all checks
nx run-many -t lint,typecheck
``` 