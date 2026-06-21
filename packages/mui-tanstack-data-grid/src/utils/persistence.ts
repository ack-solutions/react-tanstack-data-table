/**
 * Opt-in view-state persistence for `<DataTable stateKey="…">`. Reads a saved
 * `Partial<TableState>` on mount (merged into `initialState`) and writes the
 * whitelisted slices on change. SSR-safe (no-ops without `window`) and resilient
 * to disabled/quota-exceeded storage.
 */
import type { TableState } from '../types/state.types';

export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

export interface PersistOptions {
    /** Where to store. `'local'` (default) · `'session'` · a custom Storage-like object. */
    storage?: 'local' | 'session' | StorageLike;
    /** Which state slices to persist. Defaults to everything except selection + expansion. */
    include?: (keyof TableState)[];
    /** Debounce writes, in ms (default `300`). */
    debounceMs?: number;
}

/**
 * Restorable slices persisted by default — excludes transient selection/expansion.
 * `rowPinning` is also excluded: it stores row ids, so it's only safe to persist with a
 * stable `getRowId` (the positional default would re-pin the wrong record after the data
 * changes). Opt in via `persist.include` when you supply a stable `getRowId`.
 */
export const DEFAULT_PERSIST_KEYS: (keyof TableState)[] = [
    'sorting',
    'pagination',
    'globalFilter',
    'columnFilter',
    'columnVisibility',
    'columnSizing',
    'columnOrder',
    'columnPinning',
    'density',
];

const storageKey = (key: string) => `dt:${key}`;

export function resolveStorage(persist?: PersistOptions): StorageLike | null {
    const s = persist?.storage ?? 'local';
    // A custom Storage-like is the caller's responsibility and works under SSR.
    if (s !== 'local' && s !== 'session') return s;
    if (typeof window === 'undefined') return null;
    try {
        return s === 'local' ? window.localStorage : window.sessionStorage;
    } catch {
        return null; // storage blocked (private mode, etc.)
    }
}

export function readPersistedState(storage: StorageLike | null, key: string | undefined): Partial<TableState> {
    if (!storage || !key) return {};
    try {
        const raw = storage.getItem(storageKey(key));
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? (parsed as Partial<TableState>) : {};
    } catch {
        return {};
    }
}

export function writePersistedState(
    storage: StorageLike | null,
    key: string | undefined,
    state: Partial<TableState>,
    include: (keyof TableState)[],
): void {
    if (!storage || !key) return;
    const snapshot: Partial<TableState> = {};
    for (const k of include) {
        if (state[k] !== undefined) (snapshot as Record<string, unknown>)[k] = state[k];
    }
    try {
        storage.setItem(storageKey(key), JSON.stringify(snapshot));
    } catch {
        /* quota exceeded / disabled — ignore */
    }
}

/**
 * Forget a grid's saved view. Call with the same `stateKey` (+ `persist`) you
 * passed to `<DataTable>`, then remount/reload to start from `initialState` —
 * e.g. a "Reset saved view" button. SSR-safe.
 */
export function clearPersistedState(stateKey: string | undefined, persist?: PersistOptions): void {
    const storage = resolveStorage(persist);
    if (!storage || !stateKey) return;
    try {
        storage.removeItem(storageKey(stateKey));
    } catch {
        /* disabled — ignore */
    }
}
