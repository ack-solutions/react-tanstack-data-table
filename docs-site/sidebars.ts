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
                {
                    type: 'category',
                    label: 'Data',
                    items: [
                        'features/sorting',
                        'features/filtering',
                        'features/pagination',
                        'features/aggregation',
                        'features/server-side',
                    ],
                },
                {
                    type: 'category',
                    label: 'Columns',
                    items: [
                        'features/columns',
                        'features/pinning',
                    ],
                },
                {
                    type: 'category',
                    label: 'Rows',
                    items: [
                        'features/selection',
                        'features/editing',
                        'features/expansion',
                        'features/tree-data',
                    ],
                },
                {
                    type: 'category',
                    label: 'Display & layout',
                    items: [
                        'features/layout',
                        'features/toolbar',
                        'features/list-view',
                        'features/saved-views',
                        'features/export',
                    ],
                },
                {
                    type: 'category',
                    label: 'Accessibility & i18n',
                    items: [
                        'features/accessibility',
                        'features/localization',
                    ],
                },
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
