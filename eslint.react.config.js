const reactConfig = require('./eslint-config/react-config');
const baseConfig = require('./eslint.base.config');


module.exports = [
    ...baseConfig,
    {
        plugins: {
            react: require('eslint-plugin-react'),
        },
        files: ['**/*.tsx', '**/*.jsx'],

        // Override or add rules here
        rules: {
            ...reactConfig,
            // Enforce rules of hooks
            'react-hooks/rules-of-hooks': 'error',

            // Ensure proper dependencies for hooks
            'react-hooks/exhaustive-deps': ['warn'],
        },
    },
];
