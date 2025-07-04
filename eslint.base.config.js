const nx = require('@nx/eslint-plugin');
const stylisticPlugin = require('@stylistic/eslint-plugin');
const stylisticJsPlugin = require('@stylistic/eslint-plugin-js');
const importPlugin = require('eslint-plugin-import');

const eslintConfig = require('./eslint-config/base-config');


module.exports = [
    {
        files: ['*.json', '**/*.json'],
        // Override or add rules here
        rules: { '@typescript-eslint/no-unused-expressions': 'off' },
        languageOptions: { parser: require('jsonc-eslint-parser') },
    },
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/javascript'],
    {
        ignores: [
            'node_modules/',
            'dist/',
            'tmp/',
            '.github',
            '.nx',
            '.vscode',

            // Project Specific
            '**/icon-font/**',
        ],
    },
    {
        files: [
            '**/*.ts',
            '**/*.tsx',
            '**/*.js',
            '**/*.jsx',
        ],
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
                    depConstraints: [
                        {
                            sourceTag: '*',
                            onlyDependOnLibsWithTags: ['*'],
                        },
                    ],
                },
            ],
        },
    },
    {
        plugins: {
            import: importPlugin,
            '@stylistic': stylisticPlugin,
            '@stylistic/js': stylisticJsPlugin,
        },

        files: [
            '**/*.ts',
            '**/*.tsx',
            '**/*.js',
            '**/*.jsx',
        ],

        // Override or add rules here
        rules: {
            ...eslintConfig,
            'no-restricted-imports': [
                'error',
                {
                    patterns: ['libs/*', 'apps/*'], // Disallow imports starting with 'packages'
                },
            ],
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-interface': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            'no-empty-function': 'off',
        },
    },
    {
        files: ['**/package.json', '**/generators.json'],
        rules: { '@nx/nx-plugin-checks': 'error' },
        languageOptions: { parser: require('jsonc-eslint-parser') },
    },
];
