import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * MUI-X-style docs nav: labelled sections (MAIN FEATURES · SERVER-SIDE ·
 * COMPONENTS · CUSTOMIZATION · RESOURCES) rendered as non-clickable `type:'html'`
 * headers, with `badge-soon` / `badge-new` classNames driving the sidebar pills
 * (styled in src/css/custom.css). Section membership is independent of a page's
 * file location, so existing pages keep their URLs.
 */
const section = (label: string, className = 'sidebar-section-title') =>
    ({ type: 'html' as const, value: label, className, defaultStyle: false });

const sidebars: SidebarsConfig = {
    docs: [
        // ── Top-level: get in fast ──────────────────────────────────────────
        'index',
        'getting-started',
        'migration',

        // ── Main features ───────────────────────────────────────────────────
        section('MAIN FEATURES'),
        'features/layout',
        {
            type: 'category',
            label: 'Columns',
            items: ['features/columns', 'features/pinning'],
        },
        'features/cells',
        'features/expansion',
        'features/editing',
        'features/sorting',
        'features/filtering',
        'features/pagination',
        'features/selection',
        'features/virtualization',

        // ── Server-side data ────────────────────────────────────────────────
        section('SERVER-SIDE DATA <span class="pill pill-new">New</span>'),
        'features/server-side',
        'features/tree-data',
        'features/aggregation',
        { type: 'doc', id: 'features/row-grouping', className: 'badge-soon' },
        { type: 'doc', id: 'features/pivoting', className: 'badge-soon' },

        // ── Components ──────────────────────────────────────────────────────
        section('COMPONENTS <span class="pill pill-new">New</span>'),
        'components/usage',
        'features/toolbar',
        'features/export',
        'components/quick-filter',
        'features/saved-views',
        'features/list-view',
        { type: 'doc', id: 'components/columns-panel', className: 'badge-soon' },
        { type: 'doc', id: 'components/filter-panel', className: 'badge-soon' },

        // ── Customization ───────────────────────────────────────────────────
        section('CUSTOMIZATION'),
        'theming',
        'customization/styling-recipes',
        'customization/overlays',
        'customization/custom-subcomponents',
        'features/localization',
        'features/accessibility',

        // ── Resources ───────────────────────────────────────────────────────
        section('RESOURCES'),
        'api/api-ref',
        'resources/events',
        'resources/state',
        'resources/performance',
        'api/props',
        'api/use-data-table',

        'changelog',
    ],
};

export default sidebars;
