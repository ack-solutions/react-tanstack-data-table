# React TanStack Data Table

A powerful, feature-rich, and highly customizable React data table component built with Material-UI (MUI) and TanStack Table. Perfect for building modern data-intensive applications with advanced table functionality.

## 🚀 Live Demo

**[View Live Demo](https://ajaykhandla.github.io/react-tanstack-data-table/)**

Experience all the features in action with our interactive demo showcasing advanced table functionality, filtering, sorting, pagination, and more.

## Legal Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

### Important Notes:
1. This software is provided for general use and is not guaranteed to be suitable for any specific purpose
2. Users are responsible for ensuring the software meets their specific requirements
3. Users should perform their own security and compliance assessments
4. The authors make no representations or warranties about the software's fitness for any particular purpose
5. Users are responsible for any modifications they make to the software

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

## 📚 Documentation

For detailed documentation, examples, and API reference, visit the [package documentation](./packages/react-tanstack-data-table/README.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the terms of the MIT license.
