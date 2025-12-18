import { ComponentType } from 'react';
import {
  SimpleLocalExample,
  ProductsExample,
  ServerSideExample,
  SelectionExample,
  SlotsExample,
  ColumnFeaturesExample,
  ImprovedServerSideExample,
} from './index';

// Import code as raw strings for display
import simpleLocalCode from './basic/SimpleLocalExample.tsx?raw';
import productsCode from './basic/ProductsExample.tsx?raw';
import serverSideCode from './advanced/ServerSideExample.tsx?raw';
import selectionCode from './advanced/SelectionExample.tsx?raw';
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
}

export const exampleDefinitions: ExampleDefinition[] = [
  {
    id: 'simple-local',
    title: 'Simple Local Data',
    description: 'Basic client-side table with local data, perfect for getting started.',
    component: SimpleLocalExample,
    features: ['Client-side data', 'Sorting', 'Filtering', 'Pagination', 'Row selection'],
    githubPath: 'apps/example/src/examples/basic/SimpleLocalExample.tsx',
    code: simpleLocalCode,
  },
  {
    id: 'products',
    title: 'Products Table',
    description: 'Example with custom cell rendering, status badges, and number formatting.',
    component: ProductsExample,
    features: ['Custom cells', 'Status badges', 'Number formatting', 'MUI components'],
    githubPath: 'apps/example/src/examples/basic/ProductsExample.tsx',
    code: productsCode,
  },
  {
    id: 'server-side',
    title: 'Server-Side Fetching',
    description: 'Advanced example with server-side data fetching, pagination, and filtering.',
    component: ServerSideExample,
    features: ['Server-side data', 'API integration', 'Debounced search', 'Loading states'],
    githubPath: 'apps/example/src/examples/advanced/ServerSideExample.tsx',
    code: serverSideCode,
  },
  {
    id: 'improved-server-side',
    title: 'Improved Server-Side (Fixed Filtering)',
    description: 'Enhanced server-side example with proper status and department filtering.',
    component: ImprovedServerSideExample,
    features: ['Fixed status filtering', 'Department filtering', 'Custom filter controls', 'Better UX'],
    githubPath: 'apps/example/src/examples/ImprovedServerSideExample.tsx',
    code: improvedServerCode,
  },
  {
    id: 'selection',
    title: 'Row Selection',
    description: 'Demonstrates row selection, bulk actions, and selection state management.',
    component: SelectionExample,
    features: ['Row selection', 'Bulk actions', 'Selection state', 'Multi-select'],
    githubPath: 'apps/example/src/examples/advanced/SelectionExample.tsx',
    code: selectionCode,
  },
  {
    id: 'custom-slots',
    title: 'Custom Slots & Styling',
    description: 'Demonstrates extensive customization using slots and custom components.',
    component: SlotsExample,
    features: ['Custom components', 'Slot system', 'Advanced styling', 'Theme integration'],
    githubPath: 'apps/example/src/examples/customization/SlotsExample.tsx',
    code: slotsCode,
  },
  {
    id: 'column-features',
    title: 'Column Features',
    description: 'Advanced column features: resizing, reordering, pinning, and visibility.',
    component: ColumnFeaturesExample,
    features: ['Column resizing', 'Column dragging', 'Column pinning', 'Column visibility'],
    githubPath: 'apps/example/src/examples/customization/ColumnFeaturesExample.tsx',
    code: columnFeaturesCode,
  },
];
