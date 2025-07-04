module.exports = {
    // enforces return statements in callbacks of array's methods
    // https://eslint.org/docs/rules/array-callback-return
    'array-callback-return': ['error', { allowImplicit: true }],

    // require return statements to either always or never specify values
    // https://eslint.org/docs/rules/consistent-return
    'consistent-return': 'error',

    // require default case in switch statements
    // https://eslint.org/docs/rules/default-case
    'default-case': ['error', { commentPattern: '^no default$' }],

    // require the use of === and !==
    // https://eslint.org/docs/rules/eqeqeq
    eqeqeq: [
        'error',
        'always',
        { null: 'ignore' },
    ],

    // enforce a maximum number of classes per file
    // https://eslint.org/docs/rules/max-classes-per-file
    // 'max-classes-per-file': ['error', 1],

    // disallow the use of alert, confirm, and prompt
    // https://eslint.org/docs/rules/no-alert
    'no-alert': 'warn',

    // Disallow returning value in constructor
    // https://eslint.org/docs/rules/no-constructor-return
    'no-constructor-return': 'error',

    // disallow else after a return in an if
    // https://eslint.org/docs/rules/no-else-return
    'no-else-return': ['error', { allowElseIf: false }],


    // disallow reassignments of native objects or read-only globals
    // https://eslint.org/docs/rules/no-global-assign
    'no-global-assign': ['error', { exceptions: [] }],

    // deprecated in favor of no-global-assign
    // https://eslint.org/docs/rules/no-native-reassign
    'no-native-reassign': 'off',

    // disallow unnecessary nested blocks
    // https://eslint.org/docs/rules/no-lone-blocks
    'no-lone-blocks': 'error',

    // disallow creation of functions within loops
    // https://eslint.org/docs/rules/no-loop-func
    'no-loop-func': 'error',

    // disallow use of multiple spaces
    // https://eslint.org/docs/rules/no-multi-spaces
    'no-multi-spaces': [
        'error',
        {
            ignoreEOLComments: false,
        },
    ],

    // disallow use of multiline strings
    // https://eslint.org/docs/rules/no-multi-str
    'no-multi-str': 'error',

    // disallow use of new operator when not part of the assignment or comparison
    // https://eslint.org/docs/rules/no-new
    'no-new': 'error',

    // disallow use of (old style) octal literals
    // https://eslint.org/docs/rules/no-octal
    'no-octal': 'error',

    // disallow use of octal escape sequences in string literals, such as
    // var foo = 'Copyright \251';
    // https://eslint.org/docs/rules/no-octal-escape
    'no-octal-escape': 'error',

    // disallow declaring the same variable more than once
    // https://eslint.org/docs/rules/no-redeclare
    'no-redeclare': 'error',

    // disallow use of assignment in return statement
    // https://eslint.org/docs/rules/no-return-assign
    'no-return-assign': ['error', 'always'],

    // disallow redundant `return await`
    // https://eslint.org/docs/rules/no-return-await
    'no-return-await': 'error',

    // disallow use of `javascript:` urls.
    // https://eslint.org/docs/rules/no-script-url
    'no-script-url': 'error',

    // disallow self assignment
    // https://eslint.org/docs/rules/no-self-assign
    'no-self-assign': [
        'error',
        {
            props: true,
        },
    ],

    // disallow comparisons where both sides are exactly the same
    // https://eslint.org/docs/rules/no-self-compare
    'no-self-compare': 'error',

    // disallow use of comma operator
    // https://eslint.org/docs/rules/no-sequences
    'no-sequences': 'error',

    // restrict what can be thrown as an exception
    // https://eslint.org/docs/rules/no-throw-literal
    'no-throw-literal': 'error',

    // disallow usage of expressions in statement position
    // https://eslint.org/docs/rules/no-unused-expressions
    'no-unused-expressions': [
        'error',
        {
            allowShortCircuit: false,
            allowTernary: false,
            allowTaggedTemplates: false,
        },
    ],

    // Disallow unnecessary catch clauses
    // https://eslint.org/docs/rules/no-useless-catch
    'no-useless-catch': 'error',

    // disallow useless string concatenation
    // https://eslint.org/docs/rules/no-useless-concat
    'no-useless-concat': 'error',

    // disallow unnecessary string escaping
    // https://eslint.org/docs/rules/no-useless-escape
    'no-useless-escape': 'error',

    // disallow redundant return; keywords
    // https://eslint.org/docs/rules/no-useless-return
    'no-useless-return': 'error',

    // disallow use of void operator
    // https://eslint.org/docs/rules/no-void
    'no-void': 'error',

    "no-case-declarations": 'off',

    // disallow the use of leading or trailing decimal points in numeric literals
    // https://eslint.org/docs/rules/no-floating-decimal
    '@stylistic/js/no-floating-decimal': 'error',

    // require immediate function invocation to be wrapped in parentheses
    // https://eslint.org/docs/rules/wrap-iife.html
    '@stylistic/js/wrap-iife': [
        'error',
        'outside',
        { functionPrototypeMethods: false },
    ],

    '@typescript-eslint/no-unsafe-function-type': 'off',

    '@typescript-eslint/no-unused-vars': [
        'error',
        {
            args: 'all',
            argsIgnorePattern: '^_',
            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            ignoreRestSiblings: true,
        },
    ],

    '@typescript-eslint/naming-convention': [
        'error',
        {
            selector: 'variable',
            format: ['camelCase', 'UPPER_CASE'],
        },
        {
            selector: 'variable',
            modifiers: ['const'],
            format: [
                'camelCase',
                'UPPER_CASE',
                'PascalCase',
            ],
            leadingUnderscore: 'allow',
        },
        {
            selector: 'variable',
            format: ['camelCase'],
            prefix: [
                'is',
                'should',
                'has',
                'can',
                'did',
                'will',
            ],
            leadingUnderscore: 'allow',
        },
        {
            selector: 'function',
            format: ['camelCase', 'PascalCase'],
        },
        {
            selector: 'parameter',
            format: ['camelCase'],
            leadingUnderscore: 'allow',
        },
        {
            selector: [
                'interface',
                'class',
                'typeLike',
                'enum',
            ],
            format: ['PascalCase'],
        },
        {
            selector: 'enumMember',
            format: ['UPPER_CASE'], // Ensures all enum members are in UPPER_CASE
        },

    ],
};
