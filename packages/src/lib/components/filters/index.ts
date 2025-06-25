export const FILTER_OPERATORS = {
    text: [
        {
            value: 'contains',
            label: 'Contains',
        },
        {
            value: 'startsWith',
            label: 'Starts with',
        },
        {
            value: 'endsWith',
            label: 'Ends with',
        },
        {
            value: 'equals',
            label: 'Equals',
        },
        {
            value: 'notEquals',
            label: 'Not equals',
        },
        {
            value: 'isEmpty',
            label: 'Is empty',
        },
        {
            value: 'isNotEmpty',
            label: 'Is not empty',
        },
    ],
    boolean: [
        {
            value: 'equals',
            label: 'Equals',
        },
        {
            value: 'notEquals',
            label: 'Not equals',
        },
        {
            value: 'isEmpty',
            label: 'Is empty',
        },
        {
            value: 'isNotEmpty',
            label: 'Is not empty',
        },
    ],
    number: [
        {
            value: 'equals',
            label: 'Equals',
        },
        {
            value: 'notEquals',
            label: 'Not equals',
        },
        {
            value: 'greaterThan',
            label: 'Greater than',
        },
        {
            value: 'lessThan',
            label: 'Less than',
        },
        {
            value: 'greaterThanOrEqual',
            label: 'Greater than or equal',
        },
        {
            value: 'lessThanOrEqual',
            label: 'Less than or equal',
        },
        {
            value: 'isEmpty',
            label: 'Is empty',
        },
        {
            value: 'isNotEmpty',
            label: 'Is not empty',
        },
    ],
    date: [
        {
            value: 'equals',
            label: 'Equals',
        },
        {
            value: 'notEquals',
            label: 'Not equals',
        },
        {
            value: 'after',
            label: 'After',
        },
        {
            value: 'before',
            label: 'Before',
        },
        {
            value: 'between',
            label: 'Between',
        },
        {
            value: 'isEmpty',
            label: 'Is empty',
        },
        {
            value: 'isNotEmpty',
            label: 'Is not empty',
        },
    ],
    select: [
        {
            value: 'equals',
            label: 'Equals',
        },
        {
            value: 'notEquals',
            label: 'Not equals',
        },
        {
            value: 'in',
            label: 'In',
        },
        {
            value: 'notIn',
            label: 'Not in',
        },
        {
            value: 'isEmpty',
            label: 'Is empty',
        },
        {
            value: 'isNotEmpty',
            label: 'Is not empty',
        },
    ],
};

export * from './filter-value-input';
