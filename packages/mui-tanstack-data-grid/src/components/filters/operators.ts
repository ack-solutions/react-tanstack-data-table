/** Operator lists per column type, surfaced in the column-filter UI. */
export const FILTER_OPERATORS = {
    text: [
        { value: 'contains', label: 'Contains' },
        { value: 'startsWith', label: 'Starts with' },
        { value: 'endsWith', label: 'Ends with' },
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Not equals' },
        { value: 'isEmpty', label: 'Is empty' },
        { value: 'isNotEmpty', label: 'Is not empty' },
    ],
    boolean: [{ value: 'is', label: 'Is' }],
    number: [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Not equals' },
        { value: 'greaterThan', label: 'Greater than' },
        { value: 'lessThan', label: 'Less than' },
        { value: 'greaterThanOrEqual', label: 'Greater than or equal' },
        { value: 'lessThanOrEqual', label: 'Less than or equal' },
        { value: 'between', label: 'Between' },
        { value: 'isEmpty', label: 'Is empty' },
        { value: 'isNotEmpty', label: 'Is not empty' },
    ],
    date: [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Not equals' },
        { value: 'after', label: 'After' },
        { value: 'before', label: 'Before' },
        { value: 'between', label: 'Between' },
        { value: 'isEmpty', label: 'Is empty' },
        { value: 'isNotEmpty', label: 'Is not empty' },
    ],
    select: [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Not equals' },
        { value: 'in', label: 'In' },
        { value: 'notIn', label: 'Not in' },
        { value: 'isEmpty', label: 'Is empty' },
        { value: 'isNotEmpty', label: 'Is not empty' },
    ],
} as const;

export type OperatorOption = { value: string; label: string };

/**
 * Operator lists with labels localized from `localeText.operators` (the keyed
 * `value` stays — only the display label changes). Falls back to the English
 * labels above for any operator the locale doesn't override.
 */
export function getOperators(operatorLabels?: Record<string, string>): Record<string, OperatorOption[]> {
    const relabel = (arr: readonly OperatorOption[]): OperatorOption[] =>
        arr.map((o) => ({ value: o.value, label: operatorLabels?.[o.value] ?? o.label }));
    return {
        text: relabel(FILTER_OPERATORS.text),
        boolean: relabel(FILTER_OPERATORS.boolean),
        number: relabel(FILTER_OPERATORS.number),
        date: relabel(FILTER_OPERATORS.date),
        select: relabel(FILTER_OPERATORS.select),
    };
}
