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
    title: 'Data Grid',
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
      }
    ]
  }
];
