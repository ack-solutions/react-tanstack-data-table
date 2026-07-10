import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
    docs: [
        'index',
        'getting-started',
        'theming',
        {
            type: 'category',
            label: 'Features',
            collapsed: false,
            items: [
                'features/sorting',
                'features/filtering',
                'features/pagination',
                'features/aggregation',
                'features/selection',
                'features/layout',
                'features/columns',
                'features/list-view',
                'features/editing',
                'features/localization',
                'features/pinning',
                'features/expansion',
                'features/tree-data',
                'features/toolbar',
                'features/export',
                'features/accessibility',
                'features/server-side',
            ],
        },
        {
            type: 'category',
            label: 'API',
            items: ['api/props', 'api/api-ref', 'api/use-data-table'],
        },
        'migration',
        'changelog',
    ],
};

export default sidebars;
