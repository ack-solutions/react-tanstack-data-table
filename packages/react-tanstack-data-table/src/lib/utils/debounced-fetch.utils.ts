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

interface PendingRequest<T extends Record<string, any>> {
    id: number;
    resolve: (value: { data: T[]; total: number } | null) => void;
    reject: (reason?: unknown) => void;
}

export function useDebouncedFetch<T extends Record<string, any>>(
    onFetchData: ((
        filters: Partial<TableFilters>,
        meta?: DataFetchMeta
    ) => Promise<{ data: T[]; total: number }>) | undefined
): useDebouncedFetchReturn<T> {
    const [isLoading, setIsLoading] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingRequestRef = useRef<PendingRequest<T> | null>(null);
    const latestRequestIdRef = useRef(0);
    const activeRequestCountRef = useRef(0);
    const isMountedRef = useRef(true);

    const resetLoadingIfIdle = useCallback(() => {
        if (!isMountedRef.current) return;
        if (!debounceTimer.current && !pendingRequestRef.current && activeRequestCountRef.current === 0) {
            setIsLoading(false);
        }
    }, []);

    const debouncedFetch = useCallback(async (
        filters: Partial<TableFilters>,
        optionsOrDelay: number | DebouncedFetchOptions = DEFAULT_DEBOUNCE_DELAY
    ) => {
        if (!onFetchData) return null;

        const options = typeof optionsOrDelay === 'number'
            ? { debounceDelay: optionsOrDelay }
            : optionsOrDelay;
        const debounceDelay = options.debounceDelay ?? DEFAULT_DEBOUNCE_DELAY;
        const requestId = latestRequestIdRef.current + 1;
        latestRequestIdRef.current = requestId;

        // Clear existing timer and resolve pending debounced request.
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
        }
        if (pendingRequestRef.current) {
            pendingRequestRef.current.resolve(null);
            pendingRequestRef.current = null;
        }

        setIsLoading(true);

        return new Promise<{ data: T[]; total: number } | null>((resolve, reject) => {
            pendingRequestRef.current = {
                id: requestId,
                resolve,
                reject,
            };

            debounceTimer.current = setTimeout(async () => {
                const pendingRequest = pendingRequestRef.current;
                if (!pendingRequest || pendingRequest.id !== requestId) {
                    return;
                }

                pendingRequestRef.current = null;
                debounceTimer.current = null;
                activeRequestCountRef.current += 1;

                try {
                    const result = await onFetchData(filters, options.meta);

                    // Ignore stale responses if a newer request was queued.
                    if (requestId === latestRequestIdRef.current) {
                        resolve(result);
                    } else {
                        resolve(null);
                    }
                } catch (error) {
                    if (requestId === latestRequestIdRef.current) {
                        reject(error);
                    } else {
                        resolve(null);
                    }
                } finally {
                    activeRequestCountRef.current = Math.max(0, activeRequestCountRef.current - 1);
                    resetLoadingIfIdle();
                }
            }, debounceDelay);
        });
    }, [onFetchData, resetLoadingIfIdle]);

    // Cleanup timer on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
                debounceTimer.current = null;
            }
            if (pendingRequestRef.current) {
                pendingRequestRef.current.resolve(null);
                pendingRequestRef.current = null;
            }
        };
    }, []);

    return {
        debouncedFetch,
        isLoading,
    };
}
