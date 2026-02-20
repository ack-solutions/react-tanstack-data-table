import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    ReactNode,
} from 'react';

// Layout state - persisted in localStorage (only column-related properties)
export interface DataTableLayoutState {
    columnVisibility?: Record<string, boolean>;
    columnOrder?: string[];
    columnSizing?: Record<string, number>;
    columnPinning?: {
        left?: string[];
        right?: string[];
    };
}

export interface DataTableState {
    [x: string]: any;
    // Custom screen states
    filterValues?: any;
    currentTab?: string;
    showDeleted?: boolean;

    // Table states
    globalFilter?: string;
    columnFilter?: any;
    sorting?: any[];
    pagination?: { pageIndex: number; pageSize: number };

    // Layout (localStorage)
    layout?: DataTableLayoutState;
}

interface DataTableStateContextValue {
    getState: (key: string) => DataTableState | null;
    setState: (key: string, state: Partial<DataTableState>) => void;
    clearState: (key: string) => void;
    clearAllStates: () => void;

    // Layout (localStorage)
    getLayout: (key: string) => DataTableLayoutState | null;
    saveLayout: (key: string, layout: DataTableLayoutState) => void;
    clearLayout: (key: string) => void;
}

const DataTableStateContext = createContext<DataTableStateContextValue | null>(
    null,
);

/** Table state (filters, pagination, etc.) can be stored in memory or sessionStorage. */
export type StateStorageType = 'memory' | 'session';

interface DataTableStateProviderProps {
    children: ReactNode;
    /** Where to persist table state. Default: 'memory' (lost on refresh). Use 'session' to survive refresh. */
    stateStorage?: StateStorageType;
}

const SESSION_STORAGE_KEY = 'datatable-states-v1';
const LAYOUT_STORAGE_KEY = 'datatable-layouts-v1';

function safeParse<T>(value: string | null): T | null {
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

function readSessionCache(): Record<string, DataTableState> {
    if (typeof window === 'undefined') return {};
    return safeParse<Record<string, DataTableState>>(
        sessionStorage.getItem(SESSION_STORAGE_KEY),
    ) ?? {};
}

function writeSessionCache(cache: Record<string, DataTableState>) {
    try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.error('Error saving datatable session cache:', e);
    }
}

export function DataTableStateProvider({
    children,
    stateStorage = 'memory',
}: DataTableStateProviderProps) {
    const [stateCache, setStateCache] = useState<Record<string, DataTableState>>(
        () =>
            stateStorage === 'session' ? readSessionCache() : {},
    );

    useEffect(() => {
        if (typeof window === 'undefined' || stateStorage !== 'session') return;
        writeSessionCache(stateCache);
    }, [stateCache, stateStorage]);

    const getState = useCallback(
        (key: string): DataTableState | null => stateCache[key] || null,
        [stateCache],
    );

    const setState = useCallback((key: string, state: Partial<DataTableState>) => {
        setStateCache(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                ...state,
            },
        }));
    }, []);

    const clearState = useCallback((key: string) => {
        setStateCache(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    const clearAllStates = useCallback(() => {
        setStateCache({});
    }, []);

    // Layout localStorage methods
    const getLayout = useCallback((key: string): DataTableLayoutState | null => {
        try {
            const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
            if (!stored) return null;
            const layouts = JSON.parse(stored);
            return layouts[key] || null;
        } catch (error) {
            console.error('Error reading layout from localStorage:', error);
            return null;
        }
    }, []);

    const saveLayout = useCallback((key: string, layout: DataTableLayoutState) => {
        try {
            const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
            const layouts = stored ? JSON.parse(stored) : {};
            layouts[key] = layout;
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layouts));
        } catch (error) {
            console.error('Error saving layout to localStorage:', error);
        }
    }, []);

    const clearLayout = useCallback((key: string) => {
        try {
            const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
            if (!stored) return;
            const layouts = JSON.parse(stored);
            delete layouts[key];
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layouts));
        } catch (error) {
            console.error('Error clearing layout from localStorage:', error);
        }
    }, []);

    const value = useMemo(
        () => ({
            getState,
            setState,
            clearState,
            clearAllStates,
            getLayout,
            saveLayout,
            clearLayout,
        }),
        [getState, setState, clearState, clearAllStates, getLayout, saveLayout, clearLayout],
    );

    return (
        <DataTableStateContext.Provider value={value}>
            {children}
        </DataTableStateContext.Provider>
    );
}

export function useDataTableState(key: string) {
    const context = useContext(DataTableStateContext);
    if (!context) {
        throw new Error('useDataTableState must be used within DataTableStateProvider');
    }

    return useMemo(
        () => ({
            // sessionStorage-backed
            state: context.getState(key),
            setState: (state: Partial<DataTableState>) => context.setState(key, state),
            clearState: () => context.clearState(key),
            clearAllStates: context.clearAllStates,

            // localStorage-backed
            layout: context.getLayout(key),
            saveLayout: (layout: DataTableLayoutState) => context.saveLayout(key, layout),
            clearLayout: () => context.clearLayout(key),
            getLayout: context.getLayout,
        }),
        [key, context],
    );
}
