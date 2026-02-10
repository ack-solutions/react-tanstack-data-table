import { useCallback, useEffect, useRef, useState } from 'react';

import { DataFetchMeta, TableFilters } from '../types';

const DEFAULT_DEBOUNCE_DELAY = 300;

interface DebouncedFetchOptions {
    debounceDelay?: number;
    meta?: DataFetchMeta;
}

interface useDebouncedFetchReturn<T extends Record<string, any>> {
    debouncedFetch: (
        filters: Partial<TableFilters>,
        optionsOrDelay?: number | DebouncedFetchOptions
    ) => Promise<{ data: T[]; total: number } | null>;
    isLoading: boolean;
}

export function useDebouncedFetch<T extends Record<string, any>>(
    onFetchData: ((
        filters: Partial<TableFilters>,
        meta?: DataFetchMeta
    ) => Promise<{ data: T[]; total: number }>) | undefined
): useDebouncedFetchReturn<T> {
    const [isLoading, setIsLoading] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedFetch = useCallback(async (
        filters: Partial<TableFilters>,
        optionsOrDelay: number | DebouncedFetchOptions = DEFAULT_DEBOUNCE_DELAY
    ) => {
        if (!onFetchData) return null;

        const options = typeof optionsOrDelay === 'number'
            ? { debounceDelay: optionsOrDelay }
            : optionsOrDelay;
        const debounceDelay = options.debounceDelay ?? DEFAULT_DEBOUNCE_DELAY;

        // Create a unique key for the current fetch parameters
        // const currentParams = JSON.stringify(filters);
        // Clear existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        return new Promise<{ data: T[]; total: number } | null>((resolve) => {
            debounceTimer.current = setTimeout(async () => {
                setIsLoading(true);
                try {
                    const result = await onFetchData(filters, options.meta);
                    resolve(result);
                } catch (error) {
                    // Handle fetch error silently or could be passed to onError callback
                    console.error('Error fetching data:', error);
                    resolve(null);
                } finally {
                    setIsLoading(false);
                }
            }, debounceDelay);
        });
    }, [onFetchData]);

    // Cleanup timer on unmount
    useEffect(() => {
        // Fetch data when dependencies change
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    return {
        debouncedFetch,
        isLoading,
    };
}
