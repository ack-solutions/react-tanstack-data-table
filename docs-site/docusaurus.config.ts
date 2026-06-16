import fs from 'fs';
import path from 'path';

import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// Runs in Node.js — no browser APIs / JSX here.

// The grid package is linked via `file:` and ships @mui/material as a peer dep,
// so the bundle ends up with TWO copies of MUI/emotion (docs-site's + the grid's
// own). Duplicate instances mean the demo's MUI ThemeProvider context never
// reaches the grid — so theming and dark mode silently fail in the docs only.
// Alias each to docs-site's single copy so the context is shared.
function muiEmotionDedupe() {
    const pkgs = [
        '@mui/material', '@mui/system', '@mui/private-theming', '@mui/styled-engine',
        '@mui/utils', '@mui/base', '@emotion/react', '@emotion/styled', '@emotion/cache',
    ];
    const alias: Record<string, string> = {};
    for (const pkg of pkgs) {
        const dir = path.resolve(process.cwd(), 'node_modules', pkg);
        if (fs.existsSync(dir)) alias[pkg] = dir;
    }
    return {
        name: 'mui-emotion-dedupe',
        configureWebpack: () => ({ resolve: { alias } }),
    };
}

const config: Config = {
    title: 'MUI TanStack Data Grid',
    tagline: 'A lightweight, fully-featured React data grid — TanStack engine, MUI theming, div/CSS-Grid render.',
    favicon: 'img/favicon.ico',

    future: { v4: true },

    url: 'https://ack-solutions.github.io',
    // '/' for local dev (port 3200); the Pages build sets DOCS_BASE_URL=/react-tanstack-data-table/docs/
    baseUrl: process.env.DOCS_BASE_URL ?? '/',
    organizationName: 'ack-solutions',
    projectName: 'mui-tanstack-data-grid',

    onBrokenLinks: 'warn',
    onBrokenAnchors: 'warn',

    i18n: { defaultLocale: 'en', locales: ['en'] },

    plugins: [muiEmotionDedupe],

    presets: [
        [
            'classic',
            {
                docs: {
                    sidebarPath: './sidebars.ts',
                    routeBasePath: '/', // docs are the site root
                },
                blog: false,
                theme: { customCss: './src/css/custom.css' },
            } satisfies Preset.Options,
        ],
    ],

    // Offline full-text search — "find any feature or setting".
    themes: [
        [
            '@easyops-cn/docusaurus-search-local',
            { hashed: true, indexBlog: false, docsRouteBasePath: '/', highlightSearchTermsOnTargetPage: true },
        ],
    ],

    themeConfig: {
        colorMode: { respectPrefersColorScheme: true },
        navbar: {
            title: 'MUI TanStack Data Grid',
            items: [
                { type: 'docSidebar', sidebarId: 'docs', position: 'left', label: 'Docs' },
                { to: '/api/props', label: 'API', position: 'left' },
                { href: 'https://www.npmjs.com/package/@ackplus/mui-tanstack-data-grid', label: 'npm', position: 'right' },
                { href: 'https://github.com/ack-solutions/react-tanstack-data-table', label: 'GitHub', position: 'right' },
            ],
        },
        footer: {
            style: 'dark',
            links: [
                {
                    title: 'Docs',
                    items: [
                        { label: 'Getting Started', to: '/getting-started' },
                        { label: 'Theming', to: '/theming' },
                        { label: 'API Reference', to: '/api/props' },
                        { label: 'Migration', to: '/migration' },
                    ],
                },
                {
                    title: 'More',
                    items: [
                        { label: 'npm', href: 'https://www.npmjs.com/package/@ackplus/mui-tanstack-data-grid' },
                        { label: 'GitHub', href: 'https://github.com/ack-solutions/react-tanstack-data-table' },
                    ],
                },
            ],
            copyright: `Copyright © ${new Date().getFullYear()} ACK Plus. Built with Docusaurus.`,
        },
        prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula },
    } satisfies Preset.ThemeConfig,
};

export default config;
