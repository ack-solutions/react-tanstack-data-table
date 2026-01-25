import { useCallback, useEffect, useRef, useState } from 'react';

import { TableFiltersForFetch } from '../types';

const DEFAULT_DEBOUNCE_DELAY = 300;

 interface useDebouncedFetchReturn<T extends Record<string, any>> {
    debouncedFetch: (filters: TableFiltersForFetch, debounceDelay?: number) => Promise<{ data: T[]; total: number }>;
    isLoading: boolean;
}

export function useDebouncedFetch<T extends Record<string, any>>(
    onFetchData: ((filters: TableFiltersForFetch) => Promise<{ data: T[]; total: number }>) | undefined
): useDebouncedFetchReturn<T> {
    const [isLoading, setIsLoading] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedFetch = useCallback(async (filters: TableFiltersForFetch, debounceDelay = DEFAULT_DEBOUNCE_DELAY) => {
        if (!onFetchData) return null;

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
                    const result = await onFetchData(filters);
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
