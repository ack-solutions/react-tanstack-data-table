module.exports = {
    '@stylistic/js/array-bracket-spacing': ['error', 'never'],

    '@stylistic/js/array-bracket-newline': [
        'error',
        {
            multiline: true,
            minItems: 3,
        },
    ],

    '@stylistic/js/array-element-newline': [
        'error',
        {
            multiline: true,
            minItems: 3,
        },
    ],

    // require trailing commas in multiline object literals
    '@stylistic/js/comma-dangle': [
        'error',
        {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'always-multiline',
            exports: 'always-multiline',
            functions: 'always-multiline',
        },
    ],

    // enforce one true brace style
    '@stylistic/js/brace-style': [
        'error',
        '1tbs',
        { allowSingleLine: true },
    ],

    // enforce spacing before and after comma
    '@stylistic/js/comma-spacing': [
        'error',
        {
            before: false,
            after: true,
        },
    ],

    // enforce one true comma style
    '@stylistic/js/comma-style': [
        'error',
        'last',
        {
            exceptions: {
                ArrayExpression: false,
                ArrayPattern: false,
                ArrowFunctionExpression: false,
                CallExpression: false,
                FunctionDeclaration: false,
                FunctionExpression: false,
                ImportDeclaration: false,
                ObjectExpression: false,
                ObjectPattern: false,
                VariableDeclaration: false,
                NewExpression: false,
            },
        },
    ],

    // enforce newline at the end of file, with no multiple empty lines
    '@stylistic/js/eol-last': ['error', 'always'],

    // require line breaks inside function parentheses if there are line breaks between parameters
    '@stylistic/js/function-paren-newline': ['error', 'multiline-arguments'],

    // Enforce the location of arrow function bodies with implicit returns
    '@stylistic/js/implicit-arrow-linebreak': ['error', 'beside'],

    '@stylistic/js/function-call-argument-newline': ['error', 'consistent'],

    '@stylistic/js/function-call-spacing': ['error', 'never'],

    '@stylistic/js/block-spacing': ['error', 'always'],

    // this option sets a specific tab width for your code
    '@stylistic/js/indent': [
        'error',
        4,
        {
            SwitchCase: 1,
            VariableDeclarator: 1,
            outerIIFEBody: 1,
            // MemberExpression: null,
            FunctionDeclaration: {
                parameters: 1,
                body: 1,
            },
            FunctionExpression: {
                parameters: 1,
                body: 1,
            },
            CallExpression: {
                arguments: 1,
            },
            ArrayExpression: 1,
            ObjectExpression: 1,
            ImportDeclaration: 1,
            flatTernaryExpressions: false,
            // list derived from https://github.com/benjamn/ast-types/blob/HEAD/def/jsx.js
            ignoredNodes: [
                // 'JSXElement',
                // 'JSXElement > *',
                // 'JSXAttribute',
                // 'JSXIdentifier',
                // 'JSXNamespacedName',
                // 'JSXMemberExpression',
                // 'JSXSpreadAttribute',
                // 'JSXExpressionContainer',
                // 'JSXOpeningElement',
                // 'JSXClosingElement',
                // 'JSXFragment',
                // 'JSXOpeningFragment',
                // 'JSXClosingFragment',
                // 'JSXText',
                // 'JSXEmptyExpression',
                // 'JSXSpreadChild',
                'PropertyDefinition',
            ],
            ignoreComments: false,
        },
    ],

    // enforces spacing between keys and values in object literal properties
    '@stylistic/js/key-spacing': [
        'error',
        {
            beforeColon: false,
            afterColon: true,
        },
    ],

    // disallow mixed spaces and tabs for indentation
    '@stylistic/js/no-mixed-spaces-and-tabs': 'error',

    // disallow multiple empty lines, only one newline at the end, and no new lines at the beginning
    '@stylistic/js/no-multiple-empty-lines': [
        'error',
        {
            max: 2,
            maxBOF: 0,
            maxEOF: 1,
        },
    ],
    // disallow mixed 'LF' and 'CRLF' as linebreaks
    // https://eslint.org/docs/rules/linebreak-style
    '@stylistic/js/linebreak-style': ['error', 'unix'],

    // disallow trailing whitespace at the end of lines
    '@stylistic/js/no-trailing-spaces': [
        'error',
        {
            skipBlankLines: false,
            ignoreComments: false,
        },
    ],

    // disallow whitespace before properties
    '@stylistic/js/no-whitespace-before-property': 'error',

    // enforce "same line" or "multiple line" on object properties.
    '@stylistic/js/object-property-newline': [
        'error',
        {
            allowAllPropertiesOnSameLine: false,
        },
    ],

    // require a newline around variable declaration
    '@stylistic/js/one-var-declaration-per-line': ['error', 'always'],

    // disallow padding within blocks
    '@stylistic/js/padded-blocks': [
        'error',
        {
            blocks: 'never',
            classes: 'always',
            switches: 'never',
        },
        {
            allowSingleLineBlocks: true,
        },
    ],

    // require quotes around object literal property names
    '@stylistic/js/quote-props': [
        'error',
        'as-needed',
        {
            keywords: false,
            unnecessary: true,
            numbers: false,
        },
    ],

    // specify whether double or single quotes should be used
    '@stylistic/js/quotes': [
        'error',
        'single',
        { avoidEscape: true },
    ],

    // require or disallow use of semicolons instead of ASI
    '@stylistic/js/semi': ['error', 'always'],

    // enforce spacing before and after semicolons
    '@stylistic/js/semi-spacing': [
        'error',
        {
            before: false,
            after: true,
        },
    ],

    // Enforce location of semicolons
    '@stylistic/js/semi-style': ['error', 'last'],

    // disallow unnecessary semicolons
    '@stylistic/js/no-extra-semi': 'error',

    // require or disallow a space immediately following the // or /* in a comment
    '@stylistic/js/spaced-comment': [
        'error',
        'always',
        {
            line: {
                exceptions: ['-', '+'],
                markers: [
                    '=',
                    '!',
                    '/',
                ], // space here to support sprockets directives, slash for TS /// comments
            },
            block: {
                exceptions: ['-', '+'],
                markers: [
                    '=',
                    '!',
                    ':',
                    '::',
                ], // space here to support sprockets directives and flow comment types
                balanced: true,
            },
        },
    ],

    // Enforce spacing around colons of switch statements
    '@stylistic/js/switch-colon-spacing': [
        'error',
        {
            after: true,
            before: false,
        },
    ],

    // require camel case names
    // https://eslint.org/docs/latest/rules/camelcase
    camelcase: [
        'error',
        {
            properties: 'never',
            ignoreDestructuring: false,
        },
    ],

    // enforce or disallow capitalization of the first letter of a comment
    // https://eslint.org/docs/rules/capitalized-comments
    'capitalized-comments': [
        'off',
        'never',
        {
            line: {
                ignorePattern: '.*',
                ignoreInlineComments: true,
                ignoreConsecutiveComments: true,
            },
            block: {
                ignorePattern: '.*',
                ignoreInlineComments: true,
                ignoreConsecutiveComments: true,
            },
        },
    ],


    // require a space before & after certain keywords
    'keyword-spacing': [
        'error',
        {
            before: true,
            after: true,
            overrides: {
                return: { after: true },
                throw: { after: true },
                case: { after: true },
            },
        },
    ],

    // enforces new line after each method call in the chain to make it
    // more readable and easy to maintain
    // https://eslint.org/docs/rules/newline-per-chained-call
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 4 }],

    // disallow use of the Array constructor
    'no-array-constructor': 'error',

    // disallow use of bitwise operators
    // https://eslint.org/docs/rules/no-bitwise
    'no-bitwise': 'error',

    // disallow if as the only statement in an else block
    // https://eslint.org/docs/rules/no-lonely-if
    'no-lonely-if': 'error',

    // disallow use of chained assignment expressions
    // https://eslint.org/docs/rules/no-multi-assign
    'no-multi-assign': ['error'],

    // disallow nested ternary expressions
    'no-nested-ternary': 'error',

    // disallow use of the Object constructor
    'no-object-constructor': 'error',

    // disallow the use of Boolean literals in conditional expressions
    // also, prefer `a || b` over `a ? a : b`
    // https://eslint.org/docs/rules/no-unneeded-ternary
    'no-unneeded-ternary': ['error', { defaultAssignment: false }],

    // Prefer use of an object spread over Object.assign
    // https://eslint.org/docs/rules/prefer-object-spread
    'prefer-object-spread': 'error',

    // Ensure imports are at the top
    'import/first': ['error'],
    // Enforce import sorting
    'import/order': [
        'error',
        {
            groups: [
                ['builtin', 'external'],
                ['internal'],
                [
                    'parent',
                    'sibling',
                    'index',
                ],
            ],
            pathGroups: [
                {
                    pattern: '@/**',
                    group: 'internal',
                    position: 'after',
                },
            ],
            pathGroupsExcludedImportTypes: ['builtin'],
            alphabetize: {
                order: 'asc', // Sort imports alphabetically
                caseInsensitive: true,
            },
            'newlines-between': 'always', // Add newlines between groups
        },
    ],
    'import/newline-after-import': [
        'error',
        {
            count: 2,
            exactCount: true,
            considerComments: true,
        },
    ],
    // Enforce line breaks for objects with multiple properties
    'object-curly-newline': [
        'error',
        {
            ObjectExpression: {
                multiline: true,
                minProperties: 2,
                consistent: true,
            },
        },
    ],
    // Enforce one property per line in object literals
    'object-property-newline': [
        'error',
        {
            allowAllPropertiesOnSameLine: false,
        },
    ],
    // Enforce blank lines for TypeScript-specific nodes
    '@stylistic/padding-line-between-statements': [
        'error',
        {
            blankLine: 'always',
            next: [
                'enum',
                'interface',
                'type',
                'class',
                'function',
                'directive',
            ],
            prev: '*',
        },
        {
            blankLine: 'never',
            prev: 'function-overload',
            next: 'function',
        },
    ],
};
