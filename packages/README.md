# @ackplus/react-tanstack-data-table

A powerful, feature-rich, and highly customizable React data table component built with Material-UI (MUI) and TanStack Table. Perfect for building modern data-intensive applications with advanced table functionality.

## ✨ Features

- 🚀 **High Performance**: Built on TanStack Table for excellent performance with large datasets
- 🎨 **Material Design**: Beautiful UI components using MUI with consistent design system
- 📱 **Responsive**: Mobile-friendly responsive design with adaptive layouts
- 🔍 **Advanced Filtering**: Global search, column filters, and custom filter components
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
| `onRowSelectionChange` | `(selectedRows: T[]) => void` | - | Selection change callback |
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
| `initialState.pagination` | `{pageIndex: number, pageSize: number}` | `{pageIndex: 0, pageSize: 50}` | Initial pagination state |

### Filtering & Search

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableGlobalFilter` | `boolean` | `true` | Enable global search |
| `enableColumnFilters` | `boolean` | `false` | Enable individual column filters |
| `filterMode` | `'client' \| 'server'` | `'client'` | Filtering mode |
| `onColumnFiltersChange` | `(filters) => void` | - | Column filters change callback |
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
| `enableColumnPinning` | `boolean` | `false` | Allow column pinning |
| `draggable` | `boolean` | `false` | Enable column reordering |
| `onColumnDragEnd` | `(order: string[]) => void` | - | Column reorder callback |
| `onColumnPinningChange` | `(pinning) => void` | - | Column pinning callback |

### Export Features

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableExport` | `boolean` | `true` | Enable data export |
| `exportFilename` | `string` | `'export'` | Default export filename |
| `onExportProgress` | `(progress) => void` | - | Export progress callback |
| `onExportComplete` | `(result) => void` | - | Export completion callback |
| `onExportError` | `(error) => void` | - | Export error callback |
| `onServerExport` | `(filters) => Promise<{data, total}>` | - | Server-side export handler |

### Expandable Rows

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableExpanding` | `boolean` | `false` | Enable row expansion |
| `getRowCanExpand` | `(row) => boolean` | - | Determine if row can expand |
| `renderSubComponent` | `(row) => ReactNode` | - | Render expanded row content |

### Styling & Layout

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tableSize` | `'small' \| 'medium'` | `'medium'` | Table size/density |
| `enableHover` | `boolean` | `true` | Row hover effects |
| `enableStripes` | `boolean` | `false` | Alternating row colors |
| `fitToScreen` | `boolean` | `true` | Fit table to container width |
| `enableStickyHeaderOrFooter` | `boolean` | `false` | Sticky header/footer |
| `maxHeight` | `string \| number` | `'400px'` | Max table height |

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
| `tableContainerProps` | `object` | `{}` | Props for table container |
| `tableProps` | `object` | `{}` | Props for table element |

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

### Row Selection with Bulk Actions

```tsx
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
      onRowSelectionChange={setSelectedUsers}
    />
  );
}
```

### Custom Column Filters

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
      enableColumnFilters
      enableGlobalFilter
    />
  );
}
```

### Expandable Rows

```tsx
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

## 🎨 Customization

### Slots System

Customize any part of the table using the slots system:

```tsx
const customSlots = {
  toolbar: MyCustomToolbar,
  pagination: MyCustomPagination,
  loadingRow: MyCustomLoadingRow,
  emptyRow: MyCustomEmptyRow,
};

<DataTable
  columns={columns}
  data={data}
  slots={customSlots}
  slotProps={{
    toolbar: { customProp: 'value' },
    pagination: { showFirstLastButtons: true },
  }}
/>
```

### Available Slots

- `root` - Root container
- `toolbar` - Main toolbar
- `bulkActionsToolbar` - Bulk actions toolbar
- `tableContainer` - Table container
- `table` - Table element
- `header` - Table header
- `body` - Table body
- `row` - Table row
- `cell` - Table cell
- `footer` - Table footer
- `pagination` - Pagination component
- `loadingRow` - Loading state row
- `emptyRow` - Empty state row

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

[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/paypalme/my/profile)
[![Razorpay](https://img.shields.io/badge/Razorpay-02042B?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.me/@ackplus)

**[💳 PayPal](https://www.paypal.com/paypalme/my/profile)** • **[💳 Razorpay](https://razorpay.me/@ackplus)**

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
