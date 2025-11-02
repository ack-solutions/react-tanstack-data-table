import { ComponentType } from 'react';
import {
  SimpleLocalExample,
  SimpleEnhancedSlotsExample,
  ServerSideFetchingExample,
  ServerSideTest,
} from '@ackplus/react-tanstack-data-table';

import { ImprovedServerSideExample } from './ImprovedServerSideExample';

export interface ExampleDefinition {
  id: string;
  title: string;
  description: string;
  component: ComponentType<any>;
  features: string[];
  githubPath: string;
}

export const exampleDefinitions: ExampleDefinition[] = [
  {
    id: 'simple-local',
    title: 'Local Data Example',
    description: 'Basic client-side table with local data, perfect for getting started.',
    component: SimpleLocalExample,
    features: ['Client-side data', 'Sorting', 'Filtering', 'Pagination', 'Row selection'],
    githubPath: 'packages/react-tanstack-data-table/src/lib/examples/simple-local-example.tsx',
  },
  {
    id: 'server-side',
    title: 'Server-Side Fetching',
    description: 'Advanced example with server-side data fetching, pagination, and filtering.',
    component: ServerSideFetchingExample,
    features: ['Server-side data', 'API integration', 'Debounced search', 'Loading states'],
    githubPath: 'packages/react-tanstack-data-table/src/lib/examples/server-side-fetching-example.tsx',
  },
  {
    id: 'improved-server-side',
    title: 'Improved Server-Side (Fixed Filtering)',
    description: 'Enhanced server-side example with proper status and department filtering.',
    component: ImprovedServerSideExample,
    features: ['Fixed status filtering', 'Department filtering', 'Custom filter controls', 'Better UX'],
    githubPath: 'apps/example/src/app/components/examples/ImprovedServerSideExample.tsx',
  },
  {
    id: 'custom-slots',
    title: 'Custom Slots & Styling',
    description: 'Demonstrates extensive customization using slots and custom components.',
    component: SimpleEnhancedSlotsExample,
    features: ['Custom components', 'Slot system', 'Advanced styling', 'Theme integration'],
    githubPath: 'packages/react-tanstack-data-table/src/lib/examples/simple-slots-example.tsx',
  },
  {
    id: 'api-playground',
    title: 'API Playground',
    description: 'Interactive playground to test the imperative API and various features.',
    component: ServerSideTest,
    features: ['API testing', 'Interactive controls', 'Feature demonstration', 'Real-time updates'],
    githubPath: 'packages/react-tanstack-data-table/src/lib/examples/server-side-test.tsx',
  },
];
