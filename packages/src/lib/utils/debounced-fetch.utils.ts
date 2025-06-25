import { useCallback, useEffect, useRef, useState } from 'react';

import { TableFiltersForFetch } from '../types';


export function useDebouncedFetch<T extends Record<string, any>>(
    onFetchData: ((filters: TableFiltersForFetch) => Promise<{ data: T[]; total: number }>) | undefined,
    delay = 300,
) {
    const [isLoading, setIsLoading] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastFetchParams = useRef<string>('');

    const debouncedFetch = useCallback(async (filters: TableFiltersForFetch) => {
        if (!onFetchData) return null;

        // Create a unique key for the current fetch parameters
        const currentParams = JSON.stringify(filters);

        // Clear existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        return new Promise<{ data: T[]; total: number } | null>((resolve) => {
            debounceTimer.current = setTimeout(async () => {
                // Don't fetch if parameters haven't changed
                if (lastFetchParams.current === currentParams) {
                    resolve(null);
                    return;
                }

                lastFetchParams.current = currentParams;
                setIsLoading(true);

                try {
                    const result = await onFetchData(filters);
                    resolve(result);
                } catch (error) {
                    console.error('Fetch data error:', error);
                    resolve(null);
                } finally {
                    setIsLoading(false);
                }
            }, delay);
        });
    }, [onFetchData, delay]);

    // Cleanup timer on unmount
    useEffect(() => {
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
