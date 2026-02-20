/**
 * Frontend column filter rule (matches table.types ColumnFilterState.filters items).
 * We use only filters + logic; pendingFilters and pendingLogic are not sent to the server.
 */
export interface ColumnFilterRuleForQuery {
    columnId: string;
    operator: string;
    value: any;
    columnType?: string;
}

export interface ColumnFilterStateForQuery {
    filters: ColumnFilterRuleForQuery[];
    logic: 'AND' | 'OR';
}

/**
 * Maps frontend filter operator + columnType to backend condition object
 * compatible with QueryBuilder (WhereOperatorEnum).
 * Returns { $operator: value } with value formatted for the backend (e.g. % for like).
 */
export function mapFilterRuleToCondition(
    operator: string,
    value: any,
    columnType: string = 'text'
): Record<string, unknown> | null {
    const type = columnType || 'text';

    // --- Boolean: "is" with true/false/any ---
    if (type === 'boolean') {
        if (operator !== 'is') return null;
        if (value === 'any') return null; // no condition
        if (value === 'true' || value === true) return { 'isTrue': true };
        if (value === 'false' || value === false) return { 'isFalse': true };
        return { 'eq': value };
    }

    // --- Date ---
    if (type === 'date') {
        switch (operator) {
            case 'equals':
                return value != null ? { 'eq': value } : null;
            case 'notEquals':
                return value != null ? { 'notEq': value } : null;
            case 'after':
                return value != null ? { 'gt': value } : null;
            case 'before':
                return value != null ? { 'lt': value } : null;
            case 'isEmpty':
                return { 'isNull': true };
            case 'isNotEmpty':
                return { 'isNotNull': true };
            default:
                return null;
        }
    }

    // --- Select: in, notIn, equals, notEquals ---
    if (type === 'select') {
        if (operator === 'in') {
            return Array.isArray(value) && value.length > 0
                ? { 'in': value }
                : null;
        }
        if (operator === 'notIn') {
            return Array.isArray(value) && value.length > 0
                ? { 'notIn': value }
                : null;
        }
        if (operator === 'equals') return { 'eq': value };
        if (operator === 'notEquals') return { 'notEq': value };
        return null;
    }

    // --- Text / Number (and fallback) ---
    switch (operator) {
        case 'contains':
            return value != null && String(value).trim() !== ''
                ? { 'ilike': `%${String(value)}%` }
                : null;
        case 'notContains':
            return value != null && String(value).trim() !== ''
                ? { 'notIlike': `%${String(value)}%` }
                : null;
        case 'startsWith':
            return value != null && String(value).trim() !== ''
                ? { 'istartsWith': String(value) }
                : null;
        case 'endsWith':
            return value != null && String(value).trim() !== ''
                ? { 'iendsWith': String(value) }
                : null;
        case 'isEmpty':
            return { 'isNull': true };
        case 'isNotEmpty':
            return { 'isNotNull': true };
        case 'equals':
            return { 'eq': value };
        case 'notEquals':
            return { 'notEq': value };
        case 'greaterThan':
            return value != null ? { 'gt': Number(value) } : null;
        case 'greaterThanOrEqual':
            return value != null ? { 'gtOrEq': Number(value) } : null;
        case 'lessThan':
            return value != null ? { 'lt': Number(value) } : null;
        case 'lessThanOrEqual':
            return value != null ? { 'ltOrEq': Number(value) } : null;
        default:
            return null;
    }
}

/**
 * Builds a single grouped condition for all column filters ($and or $or),
 * so it can be applied with one andWhere() call (same idea as global search
 * using multiple orWhere for one $or group).
 */
export function buildColumnFilterGroup(
    columnFilter: ColumnFilterStateForQuery | undefined | null
): Record<string, unknown> | null {
    if (!columnFilter?.filters?.length) return null;

    const activeFilters = columnFilter.filters.filter(
        (f): f is ColumnFilterRuleForQuery => Boolean(f?.columnId && f?.operator)
    );
    if (activeFilters.length === 0) return null;

    const conditions: Record<string, unknown>[] = [];

    activeFilters.forEach((filter) => {
        const condition = mapFilterRuleToCondition(
            filter.operator,
            filter.value,
            filter.columnType || 'text'
        );
        if (condition == null) return;

        conditions.push({ [filter.columnId]: condition } as Record<string, unknown>);
    });

    if (conditions.length === 0) return null;

    const logic = columnFilter.logic === 'OR' ? 'or' : 'and';
    return { [logic]: conditions };
}

/**
 * Applies column filter state (filters + logic only; pendingFilters are ignored)
 * to the given QueryBuilder as a single group (like global search), so it is
 * combined with the rest of the query via andWhere.
 */
export function applyColumnFilterToQueryBuilder(
    qb: any,
    columnFilter: ColumnFilterStateForQuery | undefined | null
): void {
    const group = buildColumnFilterGroup(columnFilter);
    if (group) qb['where'] = group;
}
