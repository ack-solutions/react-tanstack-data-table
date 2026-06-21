/**
 * Pure table utilities.
 *
 * Ported from v1. The MUI-`<table>`-specific helpers (`shouldUseFixedLayout`,
 * `calculatePinnedColumnsWidth`, `calculateTableMetrics`) are intentionally
 * dropped — the div/CSS-Grid render layer computes layout/pinning differently.
 */

/** Estimate how many skeleton rows fill the viewport during load. */
export function calculateSkeletonRows(containerHeight: number, rowHeight: number, maxRows = 10): number {
    const estimatedRows = Math.ceil(containerHeight / rowHeight);
    return Math.min(estimatedRows, maxRows);
}

/** Stable row id: `row[idKey]` when present, else a positional id. For tree
 *  sub-rows pass `parentId` so the positional fallback is namespaced under the
 *  parent (`<parentId>.<index>`) and never collides across siblings of different
 *  parents. A real `idKey` value is assumed globally unique and used as-is. */
export function generateRowId<T>(row: T, index: number, idKey?: keyof T, parentId?: string): string {
    // Honour id === 0, but fall back to a positional id for null/undefined/empty
    // (an empty-string id would collide across rows).
    if (idKey && row[idKey] != null && (row[idKey] as unknown) !== '') {
        return String(row[idKey]);
    }
    return parentId != null ? `${parentId}.${index}` : `row-${index}`;
}

/**
 * Immutably set a (possibly dot-nested) field on a row object — the write counterpart
 * to TanStack's dot-path `accessorKey`. `setNestedValue(row, 'address.city', 'NYC')`
 * returns a new row with `address.city` updated, cloning only along the path. A plain
 * key (`'name'`) behaves like a shallow spread.
 */
export function setNestedValue<T extends Record<string, any>>(obj: T, path: string, value: any): T {
    // Clone, preserving array-ness so an indexed segment (e.g. 'tags.0') stays an array.
    const clone = (o: any): any => (Array.isArray(o) ? [...o] : { ...o });
    if (!path.includes('.')) {
        const next = clone(obj);
        next[path] = value;
        return next;
    }
    const [head, ...rest] = path.split('.');
    const child = (obj as any)?.[head];
    const next = clone(obj);
    next[head] = setNestedValue((child && typeof child === 'object' ? child : {}) as Record<string, any>, rest.join('.'), value);
    return next;
}

/**
 * Coerce a raw editor value to the column's type on commit. Empty → `null` for
 * number/date (else the empty string); numbers via `Number`; a date stays a `Date`
 * only when the original value was a `Date` (so a date column doesn't mix types).
 * Shared by single-cell commit and whole-row Save so both coerce identically.
 */
export function coerceEditValue(value: any, type: string | undefined, originalValue: any): any {
    if (value === '' || value == null) return type === 'number' || type === 'date' ? null : value;
    if (type === 'number') return Number(value);
    if (type === 'date') return originalValue instanceof Date ? new Date(value) : value;
    return value;
}

/** Default value formatting by column type. */
export function formatCellValue(value: any, type: string): string {
    if (value === null || value === undefined) return '-';
    switch (type) {
        case 'date':
            return value instanceof Date ? value.toLocaleDateString() : String(value);
        case 'number':
            return typeof value === 'number' ? value.toLocaleString() : String(value);
        case 'boolean':
            return value ? 'Yes' : 'No';
        default:
            return String(value);
    }
}

/** Debounce a function by `wait` ms. */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
