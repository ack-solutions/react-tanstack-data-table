# @ackplus/react-tanstack-data-table

A powerful and feature-rich React data table component built with Material-UI (MUI) and TanStack Table. This library provides a comprehensive solution for displaying and managing tabular data with advanced features like sorting, filtering, pagination, column management, and more.

## Features

- 🚀 **High Performance**: Built on TanStack Table for excellent performance
- 🎨 **Material Design**: Beautiful UI components using MUI
- 📱 **Responsive**: Mobile-friendly responsive design
- 🔍 **Advanced Filtering**: Multiple filter types and custom filters
- 📊 **Sorting**: Multi-column sorting support
- 📄 **Pagination**: Built-in pagination with customizable options
- 🎯 **Column Management**: Show/hide, resize, and reorder columns
- 📤 **Export**: Export data to CSV/Excel formats
- 🖱️ **Row Selection**: Single and multi-row selection
- ⚡ **Virtualization**: Handle large datasets efficiently
- 🎛️ **Customizable**: Extensive customization options
- 📝 **TypeScript**: Full TypeScript support

## Installation

```bash
npm install @ackplus/react-tanstack-data-table
```

```bash
yarn add @ackplus/react-tanstack-data-table
```

```bash
pnpm add @ackplus/react-tanstack-data-table
```

## Peer Dependencies

Make sure you have the following peer dependencies installed:

```bash
npm install @emotion/react @emotion/styled @mui/icons-material @mui/material @tanstack/react-table @tanstack/react-virtual react react-dom
```

## Quick Start

```tsx
import React from 'react';
import { DataTable } from '@ackplus/react-tanstack-data-table';
import { createColumnHelper } from '@tanstack/react-table';

interface Person {
  id: string;
  name: string;
  email: string;
  age: number;
}

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
  }),
  columnHelper.accessor('email', {
    header: 'Email',
  }),
  columnHelper.accessor('age', {
    header: 'Age',
  }),
];

const data: Person[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', age: 30 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25 },
  // ... more data
];

function App() {
  return (
    <DataTable
      columns={columns}
      data={data}
      enableSorting
      enableFiltering
      enablePagination
    />
  );
}

export default App;
```

## Advanced Usage

### With Server-Side Operations

```tsx
import { DataTable, useDataTableApi } from '@ackplus/react-tanstack-data-table';

function ServerSideTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchData = async (params) => {
    setLoading(true);
    try {
      const response = await fetch('/api/data', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      const result = await response.json();
      setData(result.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      manualPagination
      pagination={pagination}
      onPaginationChange={setPagination}
      onDataFetch={fetchData}
    />
  );
}
```

## API Reference

### DataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<T>[]` | - | Column definitions |
| `data` | `T[]` | - | Table data |
| `loading` | `boolean` | `false` | Loading state |
| `enableSorting` | `boolean` | `false` | Enable sorting |
| `enableFiltering` | `boolean` | `false` | Enable filtering |
| `enablePagination` | `boolean` | `false` | Enable pagination |
| `enableRowSelection` | `boolean` | `false` | Enable row selection |
| `enableExport` | `boolean` | `false` | Enable export functionality |

For complete API documentation, please visit our [documentation site](https://github.com/ack-solutions/react-tanstack-data-table).

## Examples

Check out the `examples` directory for more comprehensive examples:

- Basic Usage
- Server-side Operations
- Custom Filtering
- Export Functionality
- Virtualized Tables

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [ACK Solutions](https://github.com/ack-solutions)

## Support

If you find this package helpful, please consider giving it a ⭐ on [GitHub](https://github.com/ack-solutions/react-tanstack-data-table)!

For questions and support, please [open an issue](https://github.com/ack-solutions/react-tanstack-data-table/issues).
