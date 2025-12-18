import { ComponentType } from 'react';
import {
  SimpleLocalExample,
  SimpleEnhancedSlotsExample,
  ServerSideFetchingExample,
  ServerSideTest,
} from '@ackplus/react-tanstack-data-table';

import simpleLocalCode from '../../../../packages/react-tanstack-data-table/src/lib/examples/simple-local-example.tsx?raw';
import serverSideCode from '../../../../packages/react-tanstack-data-table/src/lib/examples/server-side-fetching-example.tsx?raw';
import simpleSlotsCode from '../../../../packages/react-tanstack-data-table/src/lib/examples/simple-slots-example.tsx?raw';
import apiPlaygroundCode from '../../../../packages/react-tanstack-data-table/src/lib/examples/server-side-test.tsx?raw';
import improvedServerCode from './ImprovedServerSideExample.tsx?raw';
import { ImprovedServerSideExample } from './ImprovedServerSideExample';

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
    title: 'Local Data Example',
    description: 'Basic client-side table with local data, perfect for getting started.',
    component: SimpleLocalExample,
    features: ['Client-side data', 'Sorting', 'Filtering', 'Pagination', 'Row selection'],
    githubPath: 'packages/react-tanstack-data-table/src/lib/examples/simple-local-example.tsx',
    code: simpleLocalCode,
  },
  {
    id: 'server-side',
    title: 'Server-Side Fetching',
    description: 'Advanced example with server-side data fetching, pagination, and filtering.',
    component: ServerSideFetchingExample,
    features: ['Server-side data', 'API integration', 'Debounced search', 'Loading states'],
    githubPath: 'packages/react-tanstack-data-table/src/lib/examples/server-side-fetching-example.tsx',
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
    id: 'custom-slots',
    title: 'Custom Slots & Styling',
    description: 'Demonstrates extensive customization using slots and custom components.',
    component: SimpleEnhancedSlotsExample,
    features: ['Custom components', 'Slot system', 'Advanced styling', 'Theme integration'],
    githubPath: 'packages/react-tanstack-data-table/src/lib/examples/simple-slots-example.tsx',
    code: simpleSlotsCode,
  },
  {
    id: 'api-playground',
    title: 'API Playground',
    description: 'Interactive playground to test the imperative API and various features.',
    component: ServerSideTest,
    features: ['API testing', 'Interactive controls', 'Feature demonstration', 'Real-time updates'],
    githubPath: 'packages/react-tanstack-data-table/src/lib/examples/server-side-test.tsx',
    code: apiPlaygroundCode,
  },
];
