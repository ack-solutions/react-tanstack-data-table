export type NavNode = {
  id: string;
  title: string;
  type: 'section' | 'label' | 'item';
  children?: NavNode[];
  badge?: 'new' | 'beta' | 'soon';
};

export const navigationTree: NavNode[] = [
  {
    id: 'data-grid',
    title: 'React TanStack Data Table (deprecated)',
    type: 'section',
    children: [
      { id: 'overview', title: 'Overview', type: 'item' },
      { id: 'quickstart', title: 'Quickstart', type: 'item' },
      { id: 'features', title: 'Features', type: 'item' },
      { id: 'demos', title: 'Demos', type: 'item' },
      {
        id: 'main-features',
        title: 'Main Features',
        type: 'label',
        children: [
          { id: 'layout', title: 'Layout', type: 'item' },
          { id: 'columns', title: 'Columns', type: 'item' },
          { id: 'pinning', title: 'Pinning', type: 'item' },
          { id: 'expansion', title: 'Row expansion', type: 'item' },
          { id: 'sorting', title: 'Sorting', type: 'item' },
          { id: 'filtering', title: 'Filtering', type: 'item' },
          { id: 'pagination', title: 'Pagination', type: 'item' },
          { id: 'selection', title: 'Selection', type: 'item' },
          { id: 'virtualization', title: 'Virtualization', type: 'item' }
        ]
      },
      {
        id: 'advanced-features',
        title: 'Advanced Features',
        type: 'label',
        children: [
          { id: 'export', title: 'Export', type: 'item' },
          { id: 'toolbar', title: 'Toolbar', type: 'item' },
          { id: 'accessibility', title: 'Accessibility', type: 'item' },
          { id: 'localization', title: 'Localization', type: 'item' }
        ]
      },
      {
        id: 'api-reference',
        title: 'API Reference',
        type: 'label',
        children: [
          { id: 'datatable-props', title: 'DataTable Props', type: 'item' },
          { id: 'api', title: 'API Methods', type: 'item' }
        ]
      },
      {
        id: 'real-api-debug',
        title: 'Real API (Debug)',
        type: 'item'
      }
    ]
  },
  {
    id: 'dev-demos',
    title: 'Dev Demos (v2 — WIP)',
    type: 'section',
    children: [
      { id: 'v2-demo', title: 'v2 Grid Demo', type: 'item', badge: 'new' },
      { id: 'grid-spike', title: 'Grid Spike (POC)', type: 'item', badge: 'beta' }
    ]
  }
];
