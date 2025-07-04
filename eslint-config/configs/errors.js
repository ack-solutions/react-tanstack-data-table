module.exports = {
    // Enforce “for” loop update clause moving the counter in the right direction
    // https://eslint.org/docs/rules/for-direction
    'for-direction': 'error',

    // disallow using an async function as a Promise executor
    // https://eslint.org/docs/rules/no-async-promise-executor
    'no-async-promise-executor': 'error',

    // disallow assignment in conditional expressions
    // https://eslint.org/docs/latest/rules/no-cond-assign
    'no-cond-assign': ['error', 'always'],

    // disallow use of console
    'no-console': [
        'warn',
        {
            allow: [
                'warn',
                'error',
                'info',
            ],
        },
    ],

    // disallow use of constant expressions in conditions
    // https://eslint.org/docs/latest/rules/no-constant-condition
    'no-constant-condition': 'warn',

    // disallow use of debugger
    // https://eslint.org/docs/latest/rules/no-debugger
    'no-debugger': 'error',

    // disallow duplicate arguments in functions
    // https://eslint.org/docs/latest/rules/no-dupe-args
    'no-dupe-args': 'error',

    // Disallow duplicate conditions in if-else-if chains
    // https://eslint.org/docs/rules/no-dupe-else-if
    'no-dupe-else-if': 'error',

    // disallow duplicate keys when creating object literals
    // https://eslint.org/docs/latest/rules/no-dupe-keys
    'no-dupe-keys': 'error',

    // disallow a duplicate case label.
    // https://eslint.org/docs/latest/rules/no-duplicate-case
    'no-duplicate-case': 'error',

    // disallow empty statements
    // https://eslint.org/docs/latest/rules/no-empty
    'no-empty': 'error',

    // disallow double-negation boolean casts in a boolean context
    // https://eslint.org/docs/rules/no-extra-boolean-cast
    'no-extra-boolean-cast': 'error',

    // disallow overwriting functions written as function declarations
    // https://eslint.org/docs/latest/rules/no-func-assign
    'no-func-assign': 'error',

    // https://eslint.org/docs/rules/no-import-assign
    'no-import-assign': 'error',

    // disallow function or variable declarations in nested blocks
    // https://eslint.org/docs/latest/rules/no-inner-declarations
    'no-inner-declarations': 'error',

    // disallow invalid regular expression strings in the RegExp constructor
    // https://eslint.org/docs/latest/rules/no-invalid-regexp
    'no-invalid-regexp': 'error',

    // disallow irregular whitespace outside of strings and comments
    // https://eslint.org/docs/latest/rules/no-irregular-whitespace
    'no-irregular-whitespace': 'error',

    // Disallow characters which are made with multiple code points in character class syntax
    // https://eslint.org/docs/rules/no-misleading-character-class
    'no-misleading-character-class': 'error',

    // disallow the use of object properties of the global object (Math and JSON) as functions
    'no-obj-calls': 'error',

    // Disallow returning values from Promise executor functions
    // https://eslint.org/docs/rules/no-promise-executor-return
    'no-promise-executor-return': 'error',

    // disallow use of Object.prototypes builtins directly
    // https://eslint.org/docs/rules/no-prototype-builtins
    'no-prototype-builtins': 'error',

    // disallow multiple spaces in a regular expression literal
    // https://eslint.org/docs/latest/rules/no-regex-spaces
    'no-regex-spaces': 'error',

    // disallow sparse arrays
    // https://eslint.org/docs/latest/rules/no-sparse-arrays
    'no-sparse-arrays': 'error',

    // Disallow template literal placeholder syntax in regular strings
    // https://eslint.org/docs/rules/no-template-curly-in-string
    'no-template-curly-in-string': 'error',

    // disallow unreachable statements after a return, throw, continue, or break statement
    // https://eslint.org/docs/latest/rules/no-unreachable
    'no-unreachable': 'error',

    // Disallow loops with a body that allows only one iteration
    // https://eslint.org/docs/rules/no-unreachable-loop
    'no-unreachable-loop': [
        'error',
        {
            ignore: [], // WhileStatement, DoWhileStatement, ForStatement, ForInStatement, ForOfStatement
        },
    ],

    // disallow return/throw/break/continue inside finally blocks
    // https://eslint.org/docs/rules/no-unsafe-finally
    'no-unsafe-finally': 'error',

    // Disallow Unused Private Class Members
    // https://eslint.org/docs/rules/no-unused-private-class-members
    'no-unused-private-class-members': 'warn',

    // disallow comparisons with the value NaN
    'use-isnan': 'error',
};
