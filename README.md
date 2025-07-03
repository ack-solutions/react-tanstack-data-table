# React TanStack Data Table

A powerful, feature-rich, and highly customizable React data table component built with Material-UI (MUI) and TanStack Table. Perfect for building modern data-intensive applications with advanced table functionality.

## 🚀 Quick Links

- 📦 **NPM Package**: [@ackplus/react-tanstack-data-table](https://www.npmjs.com/package/@ackplus/react-tanstack-data-table)
- 📖 **Documentation**: [Package README](./packages/README.md)
- 📚 **Development Docs**: [docs/](./docs/) - Coding standards, setup guides, and technical documentation
- 🔗 **Repository**: [GitHub](https://github.com/ack-solutions/react-tanstack-data-table)

## 📂 Project Structure

This is a monorepo containing:

```
├── docs/               # 📚 Development documentation
│   ├── README.md           # Documentation index
│   ├── CODING_RULES.md     # Coding standards
│   └── ...                 # Other dev docs
├── packages/           # Main data table library
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/    # React components
│   │   │   ├── types/         # TypeScript definitions
│   │   │   ├── utils/         # Utility functions
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── contexts/      # React contexts
│   │   │   └── examples/      # Usage examples
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md      # 📖 Main documentation
├── react/             # Demo/development app
└── react-e2e/         # End-to-end tests
```

## ✨ Features

- 🚀 **High Performance** - Built on TanStack Table
- 🎨 **Material Design** - Beautiful MUI components
- 📱 **Responsive** - Mobile-friendly design
- 🔍 **Advanced Filtering** - Global search & column filters
- 📊 **Multi-Column Sorting** - Powerful sorting capabilities
- 📄 **Flexible Pagination** - Client & server-side options
- 🎯 **Column Management** - Show/hide, resize, reorder, pin
- 📤 **Data Export** - CSV/Excel with progress tracking
- 🖱️ **Row Selection** - Single & multi-selection with bulk actions
- ⚡ **Virtualization** - Handle large datasets efficiently
- 🔄 **Server Integration** - Built-in server-side operations
- 🎛️ **Highly Customizable** - Extensive slots & props system
- 📝 **TypeScript** - Full type safety
- 🔌 **Extensible** - Plugin architecture

## 🏗️ Development

### Prerequisites

- Node.js 18+
- Yarn or npm

### Getting Started

```bash
# Clone the repository
git clone https://github.com/ack-solutions/react-tanstack-data-table.git
cd react-tanstack-data-table

# Install dependencies
yarn install

# Build the library
yarn build:all

# Start development server
yarn start

# Run tests
yarn test
```

### Development Commands

```bash
# Build the library
yarn build:all

# Build and watch for changes
yarn build --watch

# Start demo app
yarn start

# Run tests
yarn test

# Run linting
yarn lint

# Format code
yarn format

# Clean build artifacts
yarn clean
```

## 📦 Package Development

The main library is located in the `packages/` directory:

```bash
# Work in the packages directory
cd packages

# Build the library
npm run build

# Test the package locally
npm pack
```

## 🚀 Publishing

This project uses automated publishing via GitHub Actions:

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

Or publish manually:

```bash
cd packages
npm publish --access public
```

## 🧪 Testing

### Unit Tests

```bash
yarn test
```

### E2E Tests

```bash
yarn e2e
```

### Manual Testing

```bash
# Start the demo app
yarn start

# Open http://localhost:4200
```

## 📚 Usage

For detailed usage instructions, examples, and API documentation, see the [Package README](./packages/README.md).

### Basic Example

```tsx
import { DataTable } from '@ackplus/react-tanstack-data-table';

function MyTable() {
  return (
    <DataTable
      columns={columns}
      data={data}
      enableSorting
      enableGlobalFilter
      enablePagination
      enableRowSelection
    />
  );
}
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/my-feature`
3. **Make your changes**
4. **Add tests** for new functionality
5. **Run tests**: `yarn test`
6. **Commit changes**: `git commit -m "Add my feature"`
7. **Push to branch**: `git push origin feature/my-feature`
8. **Create Pull Request**

### Development Guidelines

- **Read the docs**: Check [docs/CODING_RULES.md](./docs/CODING_RULES.md) for coding standards
- **Follow TypeScript best practices**
- **Add comprehensive tests** for new features
- **Update documentation** for API changes
- **Follow the existing code style**
- **Use conventional commit messages**
- **Run code checks**: `npm run check-rules` before committing

## 📋 Roadmap

- [ ] More export formats (PDF, JSON)
- [ ] Advanced filtering UI
- [ ] Drag & drop row reordering
- [ ] Mobile-optimized layouts
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Storybook documentation
- [ ] More themes and customization options

## 🆘 Support

- 📖 [Documentation](./packages/README.md)
- 🐛 [Issue Tracker](https://github.com/ack-solutions/react-tanstack-data-table/issues)
- 💬 [Discussions](https://github.com/ack-solutions/react-tanstack-data-table/discussions)
- 📧 [Contact](mailto:support@ack-solutions.com)

## 📄 License

MIT © [ACK Solutions](https://github.com/ack-solutions)

## 🏆 Built With

- [React](https://reactjs.org/) - UI library
- [TanStack Table](https://tanstack.com/table) - Headless table library
- [Material-UI](https://mui.com/) - React component library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Nx](https://nx.dev/) - Monorepo toolkit

---

⭐ **Star this repository** if you find it helpful!
