import { useCallback, useEffect, useRef, useState } from 'react';

import { TableFiltersForFetch } from '../types';


export function useDebouncedFetch<T extends Record<string, any>>(
    onFetchData: ((filters: TableFiltersForFetch) => Promise<{ data: T[]; total: number }>) | undefined,
    delay = 300,
) {
    const [isLoading, setIsLoading] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const debouncedFetch = useCallback(async (filters: TableFiltersForFetch) => {
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
                    resolve(null);
                } finally {
                    setIsLoading(false);
                }
            }, delay);
        });
    }, [onFetchData, delay]);

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
