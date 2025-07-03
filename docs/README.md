# 📚 Documentation

This folder contains all the documentation for the **@ackplus/react-tanstack-data-table** project.

## 📋 Table of Contents

### 🔧 Development Guidelines
- **[Coding Rules](./CODING_RULES.md)** - Complete coding standards and rules for the project
  - File naming conventions (kebab-case)
  - Component structure rules (one per file)
  - TypeScript typing standards
  - Import/export guidelines

### ⚙️ Setup & Configuration
- **[Setup Summary](./SETUP_SUMMARY.md)** - Overview of all coding rules and tools that have been set up
  - ESLint configuration
  - Automated file naming checker
  - NPM scripts for rule checking

### 🏗️ Code Refactoring
- **[Filter Refactoring](./FILTER_REFACTORING.md)** - Documentation of function refactoring in filter components
  - Extracted inline handlers to named functions
  - Improved code readability and maintainability

## 🚀 Quick Start

To check if your code follows the project standards:

```bash
# Check file naming conventions
npm run check-naming

# Run all code quality checks
npm run check-rules

# Run linting
npm run lint

# Run TypeScript checks
npx nx run @ackplus/react-tanstack-data-table:typecheck
```

## 📝 Contributing

When working on this project, please:

1. Read the [Coding Rules](./CODING_RULES.md) first
2. Follow the established patterns documented here
3. Run `npm run check-rules` before committing
4. Update documentation when making structural changes

## 📁 Documentation Organization

```
docs/
├── README.md                 # This file - documentation index
├── CODING_RULES.md          # Coding standards and rules
├── SETUP_SUMMARY.md         # Setup and configuration overview
└── FILTER_REFACTORING.md    # Component refactoring examples
```

This documentation helps maintain code quality and consistency across the project! 🎯 