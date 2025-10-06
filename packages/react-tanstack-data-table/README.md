# @ackplus/react-tanstack-data-table

A powerful, feature-rich, and highly customizable React data table component built with Material-UI (MUI) and TanStack Table. Perfect for building modern data-intensive applications with advanced table functionality.

## 🚀 Live Demo

**[View Live Demo](https://ack-solutions.github.io/react-tanstack-data-table/)**

Experience all the features in action with our interactive demo showcasing advanced table functionality, filtering, sorting, pagination, and more.

## ✨ Features

- 🚀 **High Performance**: Built on TanStack Table for excellent performance with large datasets
- 🎨 **Material Design**: Beautiful UI components using MUI with consistent design system
- 📱 **Responsive**: Mobile-friendly responsive design with adaptive layouts
- 🔍 **Advanced Filtering**: Global search, column filters, and filter components
- 📊 **Multi-Column Sorting**: Powerful sorting with multiple columns support
- 📄 **Flexible Pagination**: Client-side and server-side pagination options
- 🎯 **Column Management**: Show/hide, resize, reorder, and pin columns
- 📤 **Data Export**: Export to CSV/Excel with progress tracking and customization
- 🖱️ **Row Selection**: Single and multi-row selection with bulk actions
- ⚡ **Virtualization**: Handle large datasets efficiently with row virtualization
- 🔄 **Server Integration**: Built-in support for server-side operations
- 🎛️ **Highly Customizable**: Extensive customization through slots and props
- 📝 **TypeScript**: Full TypeScript support with comprehensive type definitions
- 🔌 **Extensible**: Plugin architecture with custom components and hooks

## 📦 Installation

```bash
npm install @ackplus/react-tanstack-data-table
```

```bash
yarn add @ackplus/react-tanstack-data-table
```

```bash
pnpm add @ackplus/react-tanstack-data-table
```

## 🔧 Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
npm install @emotion/react @emotion/styled @mui/icons-material @mui/material @tanstack/react-table @tanstack/react-virtual react react-dom
```

## 🚀 Quick Start

```tsx
import React from 'react';
import { DataTable } from '@ackplus/react-tanstack-data-table';
import { createColumnHelper } from '@tanstack/react-table';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  role: string;
}

const columnHelper = createColumnHelper<User>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
    size: 150,
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    size: 200,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: ({ getValue }) => (
      <Chip 
        label={getValue()} 
        color={getValue() === 'active' ? 'success' : 'default'} 
      />
    ),
  }),
  columnHelper.accessor('role', {
    header: 'Role',
    size: 120,
  }),
];

const data: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'inactive', role: 'User' },
  // ... more data
];

function MyDataTable() {
  return (
    <DataTable
      columns={columns}
      data={data}
      enableSorting
      enableGlobalFilter
      enablePagination
      enableRowSelection
      enableColumnVisibility
      enableExport
    />
  );
}
```

## 📋 Core Props

### Basic Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `DataTableColumn<T>[]` | **Required** | Column definitions array |
| `data` | `T[]` | `[]` | Array of data objects |
| `idKey` | `keyof T` | `'id'` | Unique identifier key for rows |
| `loading` | `boolean` | `false` | Loading state indicator |
| `emptyMessage` | `string` | `'No data available'` | Message when no data |

### Data Management

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dataMode` | `'client' \| 'server'` | `'client'` | Data management mode |
| `initialLoadData` | `boolean` | `true` | Load data on component mount |
| `onFetchData` | `(filters) => Promise<{data, total}>` | - | Server-side data fetching |
| `onDataStateChange` | `(state) => void` | - | Called when table state changes |
| `totalRow` | `number` | `0` | Total rows for server-side pagination |

### Selection & Interaction

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableRowSelection` | `boolean \| ((row) => boolean)` | `false` | Enable row selection |
| `enableMultiRowSelection` | `boolean` | `true` | Allow multiple row selection |
| `selectMode` | `'page' \| 'all'` | `'page'` | Selection scope (page or all data) |
| `isRowSelectable` | `(params: {row: T, id: string}) => boolean` | - | Control if specific row is selectable |
| `onSelectionChange` | `(selection: SelectionState) => void` | - | Selection state change callback |
| `enableBulkActions` | `boolean` | `false` | Enable bulk actions toolbar |
| `bulkActions` | `(selectionState: SelectionState) => ReactNode` | - | Custom bulk actions component |

### Selection State

The `SelectionState` interface provides detailed information about the current selection:

```typescript
interface SelectionState {
  ids: string[];           // Array of selected/excluded row IDs
  type: 'include' | 'exclude';  // Selection mode
}
```

- **Include mode**: `ids` contains the selected row IDs
- **Exclude mode**: `ids` contains the excluded row IDs (all others are selected)

This allows for efficient handling of large datasets where you might select "all except these few".

### Pagination

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enablePagination` | `boolean` | `true` | Enable pagination |
| `paginationMode` | `'client' \| 'server'` | `'client'` | Pagination mode |
| `onPaginationChange` | `(pagination: PaginationState) => void` | - | Pagination change callback |
| `initialState.pagination` | `{pageIndex: number, pageSize: number}` | `{pageIndex: 0, pageSize: 50}` | Initial pagination state |

### Filtering & Search

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableGlobalFilter` | `boolean` | `true` | Enable global search |
| `enableColumnFilter` | `boolean` | `false` | Enable individual column filters |
| `filterMode` | `'client' \| 'server'` | `'client'` | Filtering mode |
| `onColumnFiltersChange` | `(filterState: ColumnFilterState) => void` | - | Column filters change callback |
| `onGlobalFilterChange` | `(globalFilter: string) => void` | - | Global filter change callback |
| `onColumnFilterChange` | `(columnFilter: ColumnFilterState) => void` | - | Column filter change callback |
| `extraFilter` | `ReactNode` | - | Additional filter components |

### Sorting

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableSorting` | `boolean` | `true` | Enable column sorting |
| `sortingMode` | `'client' \| 'server'` | `'client'` | Sorting mode |
| `onSortingChange` | `(sorting) => void` | - | Sorting change callback |

### Column Management

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableColumnVisibility` | `boolean` | `true` | Show/hide columns control |
| `enableColumnResizing` | `boolean` | `false` | Allow column resizing |
| `columnResizeMode` | `ColumnResizeMode` | `'onChange'` | Column resize mode |
| `enableColumnPinning` | `boolean` | `false` | Allow column pinning |
| `enableColumnDragging` | `boolean` | `false` | Enable column reordering |
| `onColumnDragEnd` | `(order: string[]) => void` | - | Column reorder callback |
| `onColumnPinningChange` | `(pinning: ColumnPinningState) => void` | - | Column pinning callback |

### Export Features

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableExport` | `boolean` | `true` | Enable data export |
| `exportFilename` | `string` | `'export'` | Default export filename |
| `onExportProgress` | `(progress: {processedRows?, totalRows?, percentage?}) => void` | - | Export progress callback |
| `onExportComplete` | `(result: {success: boolean, filename: string, totalRows: number}) => void` | - | Export completion callback |
| `onExportError` | `(error: {message: string, code: string}) => void` | - | Export error callback |
| `onServerExport` | `(filters?: Partial<TableState>, selection?: SelectionState) => Promise<{data: any[], total: number}>` | - | Server-side export handler |
| `onExportCancel` | `() => void` | - | Export cancellation callback |

### Expandable Rows (Enhanced Slot System)

Expandable rows are now fully integrated with the enhanced slot system, providing better customization and type safety.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableExpanding` | `boolean` | `false` | Enable row expansion |
| `getRowCanExpand` | `(row) => boolean` | - | Determine if row can expand |
| `renderSubComponent` | `(row) => ReactNode` | - | Render expanded row content |

The expanding column is automatically added and can be customized through `slotProps.expandColumn` (see Special Column Configuration section above).

### Styling & Layout

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tableSize` | `'small' \| 'medium'` | `'medium'` | Table size/density |
| `enableHover` | `boolean` | `true` | Row hover effects |
| `enableStripes` | `boolean` | `false` | Alternating row colors |
| `fitToScreen` | `boolean` | `true` | Fit table to container width |
| `enableStickyHeaderOrFooter` | `boolean` | `false` | Sticky header/footer |
| `maxHeight` | `string \| number` | `'400px'` | Max table height |
| `tableContainerProps` | `object` | `{}` | Props for table container |
| `tableProps` | `object` | `{}` | Props for table element |

### Virtualization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableVirtualization` | `boolean` | `false` | Enable row virtualization |
| `estimateRowHeight` | `number` | `52` | Estimated row height for virtualization |

### Advanced Customization

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `slots` | `Partial<DataTableSlots<T>>` | `{}` | Custom component slots |
| `slotProps` | `PartialSlotProps<T>` | `{}` | Props for slot components |
| `initialState` | `Partial<TableState>` | `{}` | Initial table state |
| `skeletonRows` | `number` | `5` | Number of skeleton rows for loading state |
| `footerFilter` | `ReactNode` | - | Additional filter components in footer |

### Special Column Configuration (Enhanced Slot System)

Special columns (selection and expanding) are now handled through the enhanced slot system, providing better customization and type safety.

#### Selection Column Configuration

The selection column is automatically added when `enableRowSelection` is true and can be customized through `slotProps.selectionColumn`:

```tsx
<DataTable
  data={data}
  columns={columns}
  enableRowSelection
  enableMultiRowSelection
  slotProps={{
    selectionColumn: {
      width: 80,
      pinLeft: true,
      id: 'custom-selection',
      // Custom column configuration
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={() => table.toggleAllRowsSelected()}
          sx={{ color: 'primary.main' }}
        />
      ),
      cell: ({ row, table }) => (
        <Checkbox
          checked={table.getIsRowSelected(row.id)}
          onChange={() => table.toggleRowSelected(row.id)}
          sx={{ color: 'secondary.main' }}
        />
      ),
    },
  }}
/>
```

#### Expanding Column Configuration

The expanding column is automatically added when `enableExpanding` is true and can be customized through `slotProps.expandColumn`:

```tsx
<DataTable
  data={data}
  columns={columns}
  enableExpanding
  getRowCanExpand={(row) => row.original.details != null}
  renderSubComponent={(row) => (
    <Box p={2}>
      <Typography variant="h6">Details</Typography>
      <pre>{JSON.stringify(row.original.details, null, 2)}</pre>
    </Box>
  )}
  slotProps={{
    expandColumn: {
      width: 60,
      pinLeft: true,
      id: 'custom-expand',
      // Custom column configuration
      header: 'Expand',
      cell: ({ row }) => (
        <IconButton
          onClick={row.getToggleExpandedHandler()}
          size="small"
          sx={{ color: 'primary.main' }}
        >
          {row.getIsExpanded() ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      ),
    },
  }}
/>
```

#### Advanced Special Column Customization

You can completely replace the special column components using the slots system:

```tsx
import { createSelectionColumn, createExpandingColumn } from '@ackplus/react-tanstack-data-table';

function CustomTable() {
  // Create custom selection column
  const customSelectionColumn = createSelectionColumn({
    width: 100,
    pinLeft: true,
    header: ({ table }) => (
      <Tooltip title="Select All">
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          indeterminate={table.getIsSomeRowsSelected()}
          onChange={() => table.toggleAllRowsSelected()}
          sx={{ 
            color: 'primary.main',
            '&.Mui-checked': { color: 'primary.main' }
          }}
        />
      </Tooltip>
    ),
    cell: ({ row, table }) => (
      <Tooltip title="Select Row">
        <Checkbox
          checked={table.getIsRowSelected(row.id)}
          onChange={() => table.toggleRowSelected(row.id)}
          sx={{ 
            color: 'secondary.main',
            '&.Mui-checked': { color: 'secondary.main' }
          }}
        />
      </Tooltip>
    ),
  });

  // Create custom expanding column
  const customExpandingColumn = createExpandingColumn({
    width: 80,
    pinLeft: true,
    header: 'Details',
    cell: ({ row }) => (
      <Tooltip title={row.getIsExpanded() ? "Collapse" : "Expand"}>
        <IconButton
          onClick={row.getToggleExpandedHandler()}
          size="small"
          sx={{ 
            color: 'primary.main',
            transition: 'transform 0.2s',
            transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <KeyboardArrowDownIcon />
        </IconButton>
      </Tooltip>
    ),
  });

  return (
    <DataTable
      data={data}
      columns={[customSelectionColumn, customExpandingColumn, ...columns]}
      enableRowSelection
      enableExpanding
      // ... other props
    />
  );
}
```

#### Special Column Configuration Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `width` | `number` | `60` | Column width in pixels |
| `pinLeft` | `boolean` | `false` | Pin column to the left |
| `id` | `string` | Auto-generated | Custom column ID |
| `header` | `ReactNode \| (props) => ReactNode` | Default header | Custom header component |
| `cell` | `(props) => ReactNode` | Default cell | Custom cell component |
| `sx` | `SxProps` | `{}` | Custom styling |
| `className` | `string` | - | Custom CSS class |
| `style` | `CSSProperties` | - | Custom inline styles |

#### Utility Functions for Special Columns

The library provides utility functions to create custom special columns:

> **Note**: Special columns are now handled through the enhanced slot system instead of table props. This provides better type safety, more customization options, and consistent behavior with the rest of the component system.

```tsx
import { createSelectionColumn, createExpandingColumn } from '@ackplus/react-tanstack-data-table';

// Create a custom selection column
const customSelectionColumn = createSelectionColumn({
  width: 100,
  pinLeft: true,
  multiSelect: true, // Enable multi-select
  header: ({ table }) => (
    <Tooltip title="Select All Rows">
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={() => table.toggleAllRowsSelected()}
        sx={{ color: 'primary.main' }}
      />
    </Tooltip>
  ),
  cell: ({ row, table }) => (
    <Tooltip title="Select Row">
      <Checkbox
        checked={table.getIsRowSelected(row.id)}
        onChange={() => table.toggleRowSelected(row.id)}
        sx={{ color: 'secondary.main' }}
      />
    </Tooltip>
  ),
});

// Create a custom expanding column
const customExpandingColumn = createExpandingColumn({
  width: 80,
  pinLeft: true,
  header: 'Details',
  cell: ({ row }) => (
    <Tooltip title={row.getIsExpanded() ? "Collapse Details" : "Expand Details"}>
      <IconButton
        onClick={row.getToggleExpandedHandler()}
        size="small"
        sx={{ 
          color: 'primary.main',
          transition: 'all 0.2s ease',
          transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(0deg)',
          '&:hover': {
            backgroundColor: 'primary.light',
            color: 'primary.contrastText',
          },
        }}
      >
        <KeyboardArrowDownIcon />
      </IconButton>
    </Tooltip>
  ),
});

// Use in your table
<DataTable
  columns={[customSelectionColumn, customExpandingColumn, ...columns]}
  data={data}
  enableRowSelection
  enableExpanding
  // ... other props
/>
```

## 🔥 Advanced Examples

### Server-Side Data Management

```tsx
import { DataTable } from '@ackplus/react-tanstack-data-table';
import { useState, useCallback } from 'react';

function ServerSideTable() {
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (filters) => {
    setLoading(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });
      const result = await response.json();
      return { data: result.users, total: result.total };
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <DataTable
      columns={columns}
      dataMode="server"
      loading={loading}
      onFetchData={fetchData}
      enablePagination
      enableSorting
      enableGlobalFilter
      paginationMode="server"
      sortingMode="server"
      filterMode="server"
    />
  );
}
```

### Row Selection with Bulk Actions and Enhanced Slot System

```tsx
import { CheckCircleIcon, RadioButtonUncheckedIcon } from '@mui/icons-material';

function SelectableTable() {
  const [selectedUsers, setSelectedUsers] = useState([]);

  const bulkActions = (selectionState) => {
    // Calculate selected count based on selection type
    const selectedCount = selectionState.type === 'include' 
      ? selectionState.ids.length 
      : data.length - selectionState.ids.length;

    // Get actual selected data
    const selectedRows = selectionState.type === 'include'
      ? data.filter(item => selectionState.ids.includes(item.id.toString()))
      : data.filter(item => !selectionState.ids.includes(item.id.toString()));

    return (
      <Stack direction="row" spacing={1}>
        <Button 
          variant="contained" 
          color="error"
          onClick={() => deleteUsers(selectedRows)}
        >
          Delete ({selectedCount})
        </Button>
        <Button 
          variant="outlined"
          onClick={() => exportUsers(selectedRows)}
        >
          Export Selected
        </Button>
      </Stack>
    );
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      enableRowSelection
      enableMultiRowSelection
      enableBulkActions
      bulkActions={bulkActions}
      onSelectionChange={setSelectedUsers}
      slotProps={{
        selectionColumn: {
          width: 80,
          pinLeft: true,
          header: ({ table }) => (
            <Checkbox
              checked={table.getIsAllRowsSelected()}
              indeterminate={table.getIsSomeRowsSelected()}
              onChange={() => table.toggleAllRowsSelected()}
              sx={{ 
                color: 'primary.main',
                '&.Mui-checked': { color: 'primary.main' }
              }}
            />
          ),
          cell: ({ row, table }) => (
            <Checkbox
              checked={table.getIsRowSelected(row.id)}
              onChange={() => table.toggleRowSelected(row.id)}
              sx={{ 
                color: 'secondary.main',
                '&.Mui-checked': { color: 'secondary.main' }
              }}
            />
          ),
        },
      }}
    />
  );
}
```

### Column Filters

```tsx
const columns = [
  {
    accessorKey: 'status',
    header: 'Status',
    filterable: true,
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending' },
    ],
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    filterable: true,
    type: 'number',
  },
  {
    accessorKey: 'created',
    header: 'Created Date',
    filterable: true,
    type: 'date',
  },
];

function FilterableTable() {
  return (
    <DataTable
      columns={columns}
      data={data}
      enableColumnFilter
      enableGlobalFilter
    />
  );
}
```

### Expandable Rows with Enhanced Slot System

```tsx
import { ExpandMoreIcon, ExpandLessIcon } from '@mui/icons-material';

function ExpandableTable() {
  const renderSubComponent = (row) => (
    <Box p={2}>
      <Typography variant="h6">User Details</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography><strong>ID:</strong> {row.original.id}</Typography>
          <Typography><strong>Email:</strong> {row.original.email}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography><strong>Role:</strong> {row.original.role}</Typography>
          <Typography><strong>Status:</strong> {row.original.status}</Typography>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      enableExpanding
      getRowCanExpand={(row) => row.original.details != null}
      renderSubComponent={renderSubComponent}
      slotProps={{
        expandColumn: {
          width: 60,
          pinLeft: true,
          header: 'Details',
          cell: ({ row }) => (
            <IconButton
              onClick={row.getToggleExpandedHandler()}
              size="small"
              sx={{ 
                color: 'primary.main',
                transition: 'transform 0.2s',
                transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              {row.getIsExpanded() ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          ),
        },
      }}
    />
  );
}
```

### Column Management

```tsx
function ManageableColumnsTable() {
  const [columnOrder, setColumnOrder] = useState([]);
  const [columnPinning, setColumnPinning] = useState({ left: [], right: [] });

  return (
    <DataTable
      columns={columns}
      data={data}
      enableColumnVisibility
      enableColumnResizing
      enableColumnPinning
      draggable
      onColumnDragEnd={setColumnOrder}
      onColumnPinningChange={setColumnPinning}
      initialState={{
        columnOrder,
        columnPinning,
      }}
    />
  );
}
```

### Export with Progress Tracking

```tsx
function ExportableTable() {
  const [exportProgress, setExportProgress] = useState(null);

  const handleExportProgress = (progress) => {
    setExportProgress(progress);
  };

  const handleExportComplete = (result) => {
    setExportProgress(null);
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      enableExport
      exportFilename="users-export"
      onExportProgress={handleExportProgress}
      onExportComplete={handleExportComplete}
      onExportError={(error) => console.error('Export failed:', error)}
    />
  );
}
```

## 🎛️ API Reference

### DataTable Component

The main component that renders the data table with all features.

```tsx
<DataTable<T>
  columns={DataTableColumn<T>[]}
  data={T[]}
  // ... other props
/>
```

### Column Definition

Columns are defined using TanStack Table's column definition format with additional properties:

```tsx
interface DataTableColumn<T> extends ColumnDef<T> {
  // Display properties
  align?: 'left' | 'center' | 'right';
  // Filtering
  filterable?: boolean;
  type?: 'boolean' | 'number' | 'date' | 'select' | 'text';
  options?: { label: string; value: string }[];
  
  // Export
  hideInExport?: boolean;
}
```

### DataTable API

The DataTable exposes a comprehensive API through refs for programmatic control:

```tsx
import { useRef } from 'react';
import { DataTable, DataTableApi } from '@ackplus/react-tanstack-data-table';

function MyComponent() {
  const tableRef = useRef<DataTableApi<User>>(null);

  const handleGetData = () => {
    const allData = tableRef.current?.data.getAllData();
  };

  return (
    <DataTable
      ref={tableRef}
      columns={columns}
      data={data}
    />
  );
}
```

#### Available API Methods

**Column Management:**
- `columnVisibility.showColumn(columnId)` - Show specific column
- `columnVisibility.hideColumn(columnId)` - Hide specific column
- `columnVisibility.toggleColumn(columnId)` - Toggle column visibility
- `columnVisibility.showAllColumns()` - Show all columns
- `columnVisibility.hideAllColumns()` - Hide all columns
- `columnVisibility.resetColumnVisibility()` - Reset to default visibility

**Column Ordering:**
- `columnOrdering.setColumnOrder(order)` - Set column order
- `columnOrdering.moveColumn(columnId, toIndex)` - Move column to position
- `columnOrdering.resetColumnOrder()` - Reset to default order

**Column Pinning:**
- `columnPinning.pinColumnLeft(columnId)` - Pin column to left
- `columnPinning.pinColumnRight(columnId)` - Pin column to right
- `columnPinning.unpinColumn(columnId)` - Unpin column
- `columnPinning.setPinning(pinning)` - Set pinning state
- `columnPinning.resetColumnPinning()` - Reset pinning

**Column Resizing:**
- `columnResizing.resizeColumn(columnId, width)` - Resize column
- `columnResizing.autoSizeColumn(columnId)` - Auto-size column
- `columnResizing.autoSizeAllColumns()` - Auto-size all columns
- `columnResizing.resetColumnSizing()` - Reset column sizing

**Filtering:**
- `filtering.setGlobalFilter(filter)` - Set global filter
- `filtering.clearGlobalFilter()` - Clear global filter
- `filtering.setColumnFilters(filters)` - Set column filters
- `filtering.addColumnFilter(columnId, operator, value)` - Add column filter
- `filtering.removeColumnFilter(filterId)` - Remove column filter
- `filtering.clearAllFilters()` - Clear all filters
- `filtering.resetFilters()` - Reset all filters

**Sorting:**
- `sorting.setSorting(sortingState)` - Set sorting state
- `sorting.sortColumn(columnId, direction)` - Sort specific column
- `sorting.clearSorting()` - Clear all sorting
- `sorting.resetSorting()` - Reset sorting

**Pagination:**
- `pagination.goToPage(pageIndex)` - Go to specific page
- `pagination.nextPage()` - Go to next page
- `pagination.previousPage()` - Go to previous page
- `pagination.setPageSize(pageSize)` - Set page size
- `pagination.goToFirstPage()` - Go to first page
- `pagination.goToLastPage()` - Go to last page

**Selection:**
- `selection.selectRow(rowId)` - Select specific row
- `selection.deselectRow(rowId)` - Deselect specific row
- `selection.toggleRowSelection(rowId)` - Toggle row selection
- `selection.selectAll()` - Select all rows
- `selection.deselectAll()` - Deselect all rows
- `selection.toggleSelectAll()` - Toggle select all
- `selection.getSelectionState()` - Get current selection state
- `selection.getSelectedRows()` - Get selected rows
- `selection.getSelectedCount()` - Get selected count
- `selection.isRowSelected(rowId)` - Check if row is selected

**Data Management:**
- `data.refresh()` - Refresh data
- `data.reload()` - Reload data
- `data.getAllData()` - Get all data
- `data.getRowData(rowId)` - Get specific row data
- `data.getRowByIndex(index)` - Get row by index
- `data.updateRow(rowId, updates)` - Update specific row
- `data.updateRowByIndex(index, updates)` - Update row by index
- `data.insertRow(newRow, index?)` - Insert new row
- `data.deleteRow(rowId)` - Delete specific row
- `data.deleteRowByIndex(index)` - Delete row by index
- `data.deleteSelectedRows()` - Delete selected rows
- `data.replaceAllData(newData)` - Replace all data
- `data.updateMultipleRows(updates)` - Update multiple rows
- `data.insertMultipleRows(newRows, startIndex?)` - Insert multiple rows
- `data.deleteMultipleRows(rowIds)` - Delete multiple rows
- `data.updateField(rowId, fieldName, value)` - Update specific field
- `data.updateFieldByIndex(index, fieldName, value)` - Update field by index
- `data.findRows(predicate)` - Find rows by predicate
- `data.findRowIndex(predicate)` - Find row index by predicate
- `data.getDataCount()` - Get data count
- `data.getFilteredDataCount()` - Get filtered data count

**Layout Management:**
- `layout.resetLayout()` - Reset layout
- `layout.resetAll()` - Reset everything
- `layout.saveLayout()` - Save current layout
- `layout.restoreLayout(layout)` - Restore saved layout

**Export:**
- `export.exportCSV(options?)` - Export to CSV
- `export.exportExcel(options?)` - Export to Excel
- `export.exportServerData(options)` - Server-side export
- `export.isExporting()` - Check if exporting
- `export.cancelExport()` - Cancel export

**Table State:**
- `state.getTableState()` - Get current table state
- `state.getCurrentFilters()` - Get current filters
- `state.getCurrentSorting()` - Get current sorting
- `state.getCurrentPagination()` - Get current pagination
- `state.getCurrentSelection()` - Get current selection

### useDataTableApi Hook

Access the table's imperative API:

```tsx
import { useRef } from 'react';
import { DataTable, DataTableApi } from '@ackplus/react-tanstack-data-table';

function MyComponent() {
  const tableRef = useRef<DataTableApi<User>>(null);

  const handleGetData = () => {
    const allData = tableRef.current?.data.getAllData();
  };

  return (
    <DataTable
      ref={tableRef}
      columns={columns}
      data={data}
    />
  );
}
```

## 🎨 Enhanced Customization with Slots System

The enhanced slot system provides powerful customization capabilities for DataTable components without limitations. This system allows you to override any component with full prop control and proper TypeScript support.

### Key Features

- **Full Component Customization**: Replace any component without limitations
- **Intelligent Prop Merging**: Special handling for `sx`, `style`, and `className` props
- **Enhanced Type Safety**: Better TypeScript inference and proper component prop typing
- **Performance Optimized**: Efficient prop merging and component creation
- **Easy Migration**: Works with existing code while providing enhanced capabilities

### Basic Slot Customization

```tsx
import { DataTable } from '@ackplus/react-tanstack-data-table';
import { Star as StarIcon } from '@mui/icons-material';

// Custom icon component
const CustomSearchIcon = (props) => (
    <StarIcon {...props} sx={{ color: 'warning.main', ...props.sx }} />
);

function MyTable() {
    return (
        <DataTable
            data={data}
            columns={columns}
            slots={{
                searchIcon: CustomSearchIcon,
            }}
            slotProps={{
                searchIcon: {
                    fontSize: 'large',
                    sx: {
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.1)' },
                            '100%': { transform: 'scale(1)' },
                        },
                    },
                },
            }}
        />
    );
}
```

### Advanced Component Replacement

```tsx
import { styled, alpha } from '@mui/material/styles';

const CustomToolbar = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    borderRadius: theme.shape.borderRadius,
}));

const CustomSearchInput = styled('input')(({ theme }) => ({
    padding: theme.spacing(1, 2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    fontSize: theme.typography.body2.fontSize,
    '&:focus': {
        outline: 'none',
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
}));

function AdvancedTable() {
    return (
        <DataTable
            data={data}
            columns={columns}
            slots={{
                toolbar: CustomToolbar,
                searchInput: ({ value, onChange, placeholder, ...props }) => (
                    <CustomSearchInput
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        {...props}
                    />
                ),
            }}
            slotProps={{
                toolbar: {
                    sx: {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                    },
                },
                searchInput: {
                    placeholder: 'Search anything...',
                    style: {
                        minWidth: '300px',
                    },
                },
            }}
        />
    );
}
```

### Complete Customization Example

```tsx
function FullyCustomizedTable() {
    const theme = useTheme();

    return (
        <DataTable
            data={data}
            columns={columns}
            slots={{
                // Custom toolbar with complete styling freedom
                toolbar: CustomToolbar,
                
                // Custom search input with full control
                searchInput: ({ value, onChange, placeholder, ...props }) => (
                    <CustomSearchInput
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder || 'Search anything...'}
                        {...props}
                    />
                ),
                
                // Custom column visibility control
                columnVisibilityControl: (props) => {
                    const { table, color, ...buttonProps } = props;
                    return (
                        <CustomButton
                            variant="outlined"
                            startIcon={<VisibilityIcon />}
                            {...buttonProps}
                        >
                            Columns
                        </CustomButton>
                    );
                },
                
                // Custom export button
                exportButton: (props) => {
                    const { table, color, ...buttonProps } = props;
                    return (
                        <CustomButton
                            variant="contained"
                            startIcon={<ExportIcon />}
                            sx={{ 
                                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                                color: 'white',
                                ...buttonProps.sx
                            }}
                            {...buttonProps}
                        >
                            Export Data
                        </CustomButton>
                    );
                },
                
                // Custom table with enhanced styling
                table: ({ children, ...props }) => (
                    <Paper
                        elevation={3}
                        sx={{ 
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: `2px solid ${theme.palette.primary.main}`,
                        }}
                    >
                        <table {...props} style={{ width: '100%' }}>
                            {children}
                        </table>
                    </Paper>
                ),
                
                // Custom row with hover effects
                row: ({ children, row, ...props }) => (
                    <tr 
                        {...props}
                        style={{
                            backgroundColor: row.index % 2 === 0 ? alpha(theme.palette.primary.main, 0.03) : 'transparent',
                            transition: 'background-color 0.2s ease',
                            cursor: 'pointer',
                            ...props.style,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = alpha(theme.palette.primary.main, 0.1);
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = row.index % 2 === 0 ? alpha(theme.palette.primary.main, 0.03) : 'transparent';
                        }}
                    >
                        {children}
                    </tr>
                ),
            }}
            
            slotProps={{
                // Customize toolbar props
                toolbar: {
                    title: 'Custom Users Table',
                    subtitle: 'Manage your users with enhanced controls',
                    sx: {
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    },
                },
                
                // Customize search input
                searchInput: {
                    placeholder: 'Search users by name, email, or role...',
                    style: {
                        minWidth: '300px',
                        fontSize: '14px',
                    },
                },
                
                // Customize column visibility control
                columnVisibilityControl: {
                    title: 'Manage Columns',
                    menuSx: {
                        minWidth: 250,
                        maxHeight: 400,
                    },
                    titleSx: {
                        color: theme.palette.primary.main,
                        fontWeight: 'bold',
                    },
                    checkboxProps: {
                        color: 'primary',
                    },
                },
                
                // Customize table container
                tableContainer: {
                    sx: {
                        maxHeight: '600px',
                        '&::-webkit-scrollbar': {
                            width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: alpha(theme.palette.grey[300], 0.5),
                            borderRadius: '4px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: theme.palette.primary.dark,
                            },
                        },
                    },
                },
                
                // Customize pagination
                pagination: {
                    rowsPerPageOptions: [10, 25, 50, 100, 300, 500, 1000],
                    sx: {
                        '& .MuiTablePagination-toolbar': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            borderTop: `1px solid ${theme.palette.divider}`,
                        },
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                            color: theme.palette.primary.main,
                            fontWeight: 'medium',
                        },
                    },
                },
            }}
        />
    );
}
```

### Available Slots

#### Container Slots
- `root` - Main container
- `tableContainer` - Table container wrapper
- `table` - Table element

#### Header Slots
- `toolbar` - Main toolbar
- `header` - Table header
- `headerRow` - Header row
- `headerCell` - Header cell

#### Body Slots
- `body` - Table body
- `row` - Table row
- `cell` - Table cell

#### Control Slots
- `searchInput` - Search input component
- `columnVisibilityControl` - Column visibility control
- `columnCustomFilterControl` - Column filter control
- `columnPinningControl` - Column pinning control
- `exportButton` - Export button
- `resetButton` - Reset button
- `tableSizeControl` - Table size control
- `bulkActionsToolbar` - Bulk actions toolbar

#### Icon Slots
- `searchIcon` - Search icon
- `filterIcon` - Filter icon
- `exportIcon` - Export icon
- `columnIcon` - Column visibility icon
- `resetIcon` - Reset icon
- `pinIcon` - Pin column icon
- `unpinIcon` - Unpin column icon
- `csvIcon` - CSV export icon
- `excelIcon` - Excel export icon
- `viewComfortableIcon` - Comfortable view icon
- `viewCompactIcon` - Compact view icon

#### Special Slots
- `loadingRow` - Loading state row
- `emptyRow` - Empty state row
- `footer` - Table footer
- `pagination` - Pagination component

### Best Practices

#### 1. Component Composition
```tsx
// Good: Compose components properly
const CustomControl = ({ children, ...props }) => (
    <Box sx={{ display: 'flex', gap: 1 }} {...props}>
        {children}
    </Box>
);

// Usage
slots={{
    toolbar: ({ children, ...props }) => (
        <CustomControl {...props}>
            {children}
        </CustomControl>
    ),
}}
```

#### 2. Prop Forwarding
```tsx
// Good: Always forward props
const CustomIcon = (props) => (
    <StarIcon {...props} sx={{ color: 'primary.main', ...props.sx }} />
);

// Bad: Not forwarding props
const CustomIcon = () => <StarIcon color="primary" />;
```

#### 3. TypeScript Support
```tsx
// Good: Use proper typing
interface CustomButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    [key: string]: any; // Allow additional props
}

const CustomButton: React.FC<CustomButtonProps> = ({ children, ...props }) => (
    <Button {...props}>{children}</Button>
);
```

#### 4. Performance Considerations
```tsx
// Good: Memoize expensive components
const CustomToolbar = React.memo(({ children, ...props }) => (
    <Box {...props}>{children}</Box>
));

// Good: Use callbacks for event handlers
const handleClick = useCallback(() => {
    // Handle click
}, []);
```

### Migration from Basic Slots

```tsx
// Before
<DataTable
    slots={{
        searchIcon: MyIcon,
    }}
    slotProps={{
        searchIcon: { color: 'primary' },
    }}
/>

// After (Enhanced)
<DataTable
    slots={{
        searchIcon: MyIcon,
    }}
    slotProps={{
        searchIcon: {
            color: 'primary',
            sx: { fontSize: 20 }, // Now supports sx prop merging
        },
    }}
/>
```

### Troubleshooting

#### Common Issues

1. **Props not merging correctly**
   - Ensure you're using the enhanced slot system
   - Check prop priority order (user > slot > default)

2. **TypeScript errors**
   - Use `[key: string]: any` for flexible prop interfaces
   - Ensure proper prop forwarding with spread operator
   - Filter out incompatible props like `table` and `color` for Button components

3. **Styling conflicts**
   - Check sx prop merging order
   - Use proper CSS specificity

4. **Performance issues**
   - Memoize expensive components
   - Use callbacks for event handlers
   - Avoid inline function definitions

The enhanced slot system provides unprecedented flexibility for customizing DataTable components. With proper prop merging, full TypeScript support, and intelligent component composition, you can create highly customized tables without limitations.

## 🔧 Migration Guide

### From v0.x to v1.x

Key changes in v1.0:
- Updated to latest TanStack Table v8
- Improved TypeScript support
- Enhanced slot system
- Better server-side integration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/ack-solutions/react-tanstack-data-table/blob/main/CONTRIBUTING.md) for details.

## 💖 Support the Project

If you find this package helpful and want to support its development, consider making a donation:

<div align="center">

[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/paypalme/ckhandla94)
[![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.me/@ackplus)

**[💳 PayPal](https://www.paypal.com/paypalme/ckhandla94)** • **[💳 Razorpay](https://razorpay.me/@ackplus)**

</div>

Your support helps us:
- 🛠️ Maintain and improve the library
- 🐛 Fix bugs and add new features
- 📚 Create better documentation
- 🚀 Keep the project active and up-to-date

## 📄 License

MIT © [ACK Solutions](https://github.com/ack-solutions)

## 🆘 Support

- 📖 [Documentation](https://github.com/ack-solutions/react-tanstack-data-table)
- 🐛 [Issue Tracker](https://github.com/ack-solutions/react-tanstack-data-table/issues)
- 💬 [Discussions](https://github.com/ack-solutions/react-tanstack-data-table/discussions)

If you find this package helpful, please consider giving it a ⭐ on [GitHub](https://github.com/ack-solutions/react-tanstack-data-table)!
