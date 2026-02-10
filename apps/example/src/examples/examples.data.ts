import { ComponentType } from 'react';
import {
  SimpleLocalExample,
  ProductsExample,
  ServerSideExample,
  SelectionExample,
  ExternalDataControlExample,
  SlotsExample,
  ColumnFeaturesExample,
  ImprovedServerSideExample,
} from './index';

// Import code as raw strings for display
import simpleLocalCode from './basic/SimpleLocalExample.tsx?raw';
import productsCode from './basic/ProductsExample.tsx?raw';
import serverSideCode from './advanced/ServerSideExample.tsx?raw';
import selectionCode from './advanced/SelectionExample.tsx?raw';
import externalControlCode from './advanced/ExternalDataControlExample.tsx?raw';
import slotsCode from './customization/SlotsExample.tsx?raw';
import columnFeaturesCode from './customization/ColumnFeaturesExample.tsx?raw';
import improvedServerCode from './ImprovedServerSideExample.tsx?raw';

export interface ExampleDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType<any>;
  features: string[];
  githubPath: string;
  code?: string;
  category?: 'basic' | 'advanced' | 'customization';
}

/**
 * Example Definitions
 * 
 * All interactive examples are defined here in order of complexity.
 * Each example showcases specific features and use cases.
 */
export const exampleDefinitions: ExampleDefinition[] = [
  // ============ BASIC EXAMPLES ============
  {
    id: 'simple-local',
    title: 'Simple Local Data',
    description: 'A beginner-friendly example demonstrating client-side data handling with essential table features. Perfect for getting started with small datasets.',
    component: SimpleLocalExample,
    features: ['Client-side data', 'Sorting', 'Global filtering', 'Pagination', 'Row selection'],
    githubPath: 'apps/example/src/examples/basic/SimpleLocalExample.tsx',
    code: simpleLocalCode,
    category: 'basic',
  },
  {
    id: 'products',
    title: 'Products Table',
    description: 'Showcase custom cell rendering with status badges, formatted numbers, and MUI components integration for a real-world product catalog.',
    component: ProductsExample,
    features: ['Custom cells', 'Status badges', 'Number formatting', 'MUI integration', 'Visual styling'],
    githubPath: 'apps/example/src/examples/basic/ProductsExample.tsx',
    code: productsCode,
    category: 'basic',
  },

  // ============ ADVANCED EXAMPLES ============
  {
    id: 'server-side',
    title: 'Server-Side Data Fetching',
    description: 'Advanced pattern for handling large datasets with backend API integration, debounced search, and proper loading states.',
    component: ServerSideExample,
    features: ['Server-side mode', 'API integration', 'Debounced search', 'Loading states', 'Dynamic pagination'],
    githubPath: 'apps/example/src/examples/advanced/ServerSideExample.tsx',
    code: serverSideCode,
    category: 'advanced',
  },
  {
    id: 'external-data-control',
    title: 'External Data Control',
    description: 'Control all fetching and row mutation outside DataTable while still using apiRef methods for refresh/update/insert/delete.',
    component: ExternalDataControlExample,
    features: ['External state', 'onDataStateChange', 'onRefreshData', 'onDataChange', 'apiRef row updates'],
    githubPath: 'apps/example/src/examples/advanced/ExternalDataControlExample.tsx',
    code: externalControlCode,
    category: 'advanced',
  },
  {
    id: 'improved-server-side',
    title: 'Enhanced Server-Side',
    description: 'Production-ready server-side example with advanced filtering plus robust export controls (chunked/streaming, cancel, progress, and concurrency policy).',
    component: ImprovedServerSideExample,
    features: ['Advanced filtering', 'Status filters', 'Department filters', 'Export progress', 'Streaming export', 'Concurrency policy'],
    githubPath: 'apps/example/src/examples/ImprovedServerSideExample.tsx',
    code: improvedServerCode,
    category: 'advanced',
  },
  {
    id: 'selection',
    title: 'Row Selection & Bulk Actions',
    description: 'Comprehensive row selection example with single/multi-select modes, bulk operations, and selection state management across pages.',
    component: SelectionExample,
    features: ['Row selection', 'Multi-select', 'Bulk actions', 'Selection state', 'Cross-page selection'],
    githubPath: 'apps/example/src/examples/advanced/SelectionExample.tsx',
    code: selectionCode,
    category: 'advanced',
  },

  // ============ CUSTOMIZATION EXAMPLES ============
  {
    id: 'column-features',
    title: 'Advanced Column Features',
    description: 'Explore powerful column capabilities including resizing, drag-and-drop reordering, left/right pinning, and dynamic visibility control.',
    component: ColumnFeaturesExample,
    features: ['Column resizing', 'Drag & drop', 'Column pinning', 'Visibility toggle', 'State persistence'],
    githubPath: 'apps/example/src/examples/customization/ColumnFeaturesExample.tsx',
    code: columnFeaturesCode,
    category: 'customization',
  },
  {
    id: 'custom-slots',
    title: 'Custom Slots & Theming',
    description: 'Deep dive into the slots system for complete UI customization. Replace any component while maintaining functionality and accessibility.',
    component: SlotsExample,
    features: ['Slot system', 'Custom components', 'Advanced theming', 'Custom toolbar', 'Custom empty state'],
    githubPath: 'apps/example/src/examples/customization/SlotsExample.tsx',
    code: slotsCode,
    category: 'customization',
  },
];

/**
 * Get examples by category
 */
export function getExamplesByCategory(category: 'basic' | 'advanced' | 'customization') {
  return exampleDefinitions.filter((example) => example.category === category);
}

/**
 * Get example by ID
 */
export function getExampleById(id: string) {
  return exampleDefinitions.find((example) => example.id === id);
}
