module.exports = {

    // Specify whether double or single quotes should be used in JSX attributes
    // https://eslint.org/docs/rules/jsx-quotes
    'jsx-quotes': ['error', 'prefer-double'],

    // Enforce boolean attributes notation in JSX
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-boolean-value.md
    'react/jsx-boolean-value': [
        'error',
        'never',
        { always: [] },
    ],

    // Validate closing bracket location in JSX
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-closing-bracket-location.md
    'react/jsx-closing-bracket-location': [
        'error',
        {
            nonEmpty: 'tag-aligned',
            selfClosing: 'line-aligned',
        },
    ],

    // Enforce event handler naming conventions in JSX
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-handler-names.md
    'react/jsx-handler-names': [
        'off',
        {
            eventHandlerPrefix: 'handle',
            eventHandlerPropPrefix: 'on',
        },
    ],

    // Validate JSX has key prop when in array or iterator
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-key.md
    // Turned off because it has too many false positives
    'react/jsx-key': 'error',

    // Limit maximum of props on a single line in JSX
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-max-props-per-line.md
    'react/jsx-max-props-per-line': [
        'error',
        {
            maximum: 1,
            when: 'always',
        },
    ],

    // Prevent duplicate props in JSX
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-duplicate-props.md
    'react/jsx-no-duplicate-props': ['error', { ignoreCase: true }],

    // Enforce PascalCase for user-defined JSX components
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-pascal-case.md
    'react/jsx-pascal-case': [
        'error',
        {
            allowAllCaps: true,
            ignore: [],
        },
    ],

    // Prevent multiple component definition per file
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-multi-comp.md
    'react/no-multi-comp': 'warn',

    // Prevent usage of unknown DOM property
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unknown-property.md
    'react/no-unknown-property': 'error',

    // Prevent extra closing tags for components without children
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/self-closing-comp.md
    'react/self-closing-comp': 'error',

    // Prevent missing parentheses around multilines JSX
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/jsx-wrap-multilines.md
    'react/jsx-wrap-multilines': [
        'error',
        {
            declaration: 'parens-new-line',
            assignment: 'parens-new-line',
            return: 'parens-new-line',
            arrow: 'parens-new-line',
            condition: 'parens-new-line',
            logical: 'parens-new-line',
            prop: 'parens-new-line',
        },
    ],

    // Require that the first prop in a JSX element be on a new line when the element is multiline
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-first-prop-new-line.md
    'react/jsx-first-prop-new-line': ['error', 'multiline'],

    // Enforce spacing around jsx equals signs
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-equals-spacing.md
    'react/jsx-equals-spacing': ['error', 'never'],

    // only .jsx files may have JSX
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-filename-extension.md
    'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],

    // Prevent unused propType definitions
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-unused-prop-types.md
    'react/no-unused-prop-types': [
        'error',
        {
            customValidators: [],
            skipShapeProps: true,
        },
    ],

    // Require style prop value be an object or var
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/style-prop-object.md
    'react/style-prop-object': 'error',

    // Prevent passing of children as props
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-children-prop.md
    'react/no-children-prop': 'error',

    // Validate whitespace in and around the JSX opening and closing brackets
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/jsx-tag-spacing.md
    'react/jsx-tag-spacing': [
        'error',
        {
            closingSlash: 'never',
            beforeSelfClosing: 'always',
            afterOpening: 'never',
            beforeClosing: 'never',
        },
    ],

    // Enforce spaces before the closing bracket of self-closing JSX elements
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-space-before-closing.md
    // Deprecated in favor of jsx-tag-spacing
    'react/jsx-space-before-closing': ['error', 'always'],

    // Prevent usage of Array index in keys
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/no-array-index-key.md
    'react/no-array-index-key': 'error',

    // Prevent void DOM elements from receiving children
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/void-dom-elements-no-children.md
    'react/void-dom-elements-no-children': 'error',

    // Prevent unused state values
    // https://github.com/jsx-eslint/eslint-plugin-react/pull/1103/
    'react/no-unused-state': 'error',

    // Enforces consistent naming for boolean props
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/boolean-prop-naming.md
    'react/boolean-prop-naming': [
        'off',
        {
            propTypeNames: ['bool', 'mutuallyExclusiveTrueProps'],
            rule: '^(is|has|can|did)[A-Z]([A-Za-z0-9]?)+',
            message: '',
        },
    ],

    // Enforce curly braces or disallow unnecessary curly braces in JSX props and/or children
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-curly-brace-presence.md
    'react/jsx-curly-brace-presence': [
        'error',
        {
            props: 'never',
            children: 'never',
        },
    ],

    // One JSX Element Per Line
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/jsx-one-expression-per-line.md
    'react/jsx-one-expression-per-line': ['error', { allow: 'single-child' }],

    // Enforce consistent usage of destructuring assignment of props, state, and context
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/843d71a432baf0f01f598d7cf1eea75ad6896e4b/docs/rules/destructuring-assignment.md
    'react/destructuring-assignment': ['error', 'always'],

    // Disallow multiple spaces between inline JSX props
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/ac102885765be5ff37847a871f239c6703e1c7cc/docs/rules/jsx-props-no-multi-spaces.md
    'react/jsx-props-no-multi-spaces': 'error',

    // Enforce shorthand or standard form for React fragments
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/bc976b837abeab1dffd90ac6168b746a83fc83cc/docs/rules/jsx-fragments.md
    'react/jsx-fragments': ['error', 'syntax'],

    // Enforce state initialization style
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/state-in-constructor.md
    // TODO: set to "never" once babel-preset-airbnb supports public class fields
    'react/state-in-constructor': ['error', 'always'],

    // Disallow unnecessary fragments
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-no-useless-fragment.md
    'react/jsx-no-useless-fragment': 'error',

    // Enforce a specific function type for function components
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/function-component-definition.md
    'react/function-component-definition': [
        'error',
        {
            namedComponents: ['function-declaration', 'function-expression'],
            unnamedComponents: 'function-expression',
        },
    ],

    // Prevent react contexts from taking non-stable values
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/e2eaadae316f9506d163812a09424eb42698470a/docs/rules/jsx-no-constructed-context-values.md
    'react/jsx-no-constructed-context-values': 'error',

    // Prevent creating unstable components inside components
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/c2a790a3472eea0f6de984bdc3ee2a62197417fb/docs/rules/no-unstable-nested-components.md
    'react/no-unstable-nested-components': 'error',

    // Prefer exact proptype definitions
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/8785c169c25b09b33c95655bf508cf46263bc53f/docs/rules/prefer-exact-props.md
    'react/prefer-exact-props': 'error',

    // Lifecycle methods should be methods on the prototype, not class fields
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/21e01b61af7a38fc86d94f27eb66cda8054582ed/docs/rules/no-arrow-function-lifecycle.md
    'react/no-arrow-function-lifecycle': 'error',

    // Prevent problematic leaked values from being rendered
    // https://github.com/jsx-eslint/eslint-plugin-react/blob/c42b624d0fb9ad647583a775ab9751091eec066f/docs/rules/jsx-no-leaked-render.md
    // TODO: semver-major, enable
    'react/jsx-no-leaked-render': 'warn',

};
