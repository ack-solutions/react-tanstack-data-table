module.exports = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Enforce naming conventions for props in JSX/TSX',
            category: 'Best Practices',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    patterns: {
                        type: 'object',
                        properties: {
                            callback: { type: 'string' },
                            boolean: { type: 'string' },
                        },
                        additionalProperties: false,
                    },
                },
                additionalProperties: false,
            },
        ],
    },
    create(context) {
        const patterns = context.options[0]?.patterns || {};
        const callbackPattern = patterns.callback ?
            new RegExp(patterns.callback) :
            null;
        const booleanPattern = patterns.boolean ?
            new RegExp(patterns.boolean) :
            null;

        return {
            JSXAttribute(node) {
                const propName = node.name.name;

                // Check for callback props (e.g., functions)
                if (
                    callbackPattern &&
                    node.value &&
                    node.value.expression &&
                    ['ArrowFunctionExpression', 'FunctionExpression'].includes(
                        node.value.expression.type,
                    )
                ) {
                    if (!callbackPattern.test(propName)) {
                        context.report({
                            node,
                            message: `Callback prop "${propName}" should start with "on".`,
                        });
                    }
                }

                // Check for boolean props
                if (
                    booleanPattern &&
                    node.value &&
                    node.value.expression &&
                    node.value.expression.type === 'Literal' &&
                    typeof node.value.expression.value === 'boolean'
                ) {
                    if (!booleanPattern.test(propName)) {
                        context.report({
                            node,
                            message: `Boolean prop "${propName}" should start with "is", "can", "did", or "has".`,
                        });
                    }
                }
            },
        };
    },
};
