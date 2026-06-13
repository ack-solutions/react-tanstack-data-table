/** Shared cancellation primitives for the export pipeline. */

export const EXPORT_CANCELLED_CODE = 'CANCELLED';

export function createCancelledExportError(): Error & { code: string } {
    const error = new Error('Export cancelled') as Error & { code: string };
    error.name = 'AbortError';
    error.code = EXPORT_CANCELLED_CODE;
    return error;
}

export function isCancelledError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;
    return error.name === 'AbortError' || (error as any).code === EXPORT_CANCELLED_CODE;
}

export function throwIfAborted(signal?: AbortSignal): void {
    if (signal?.aborted) throw createCancelledExportError();
}

/** Resolve after `ms`, rejecting if the signal aborts first. `ms = 0` yields to the event loop. */
export function waitWithAbort(ms: number, signal?: AbortSignal): Promise<void> {
    if (!signal) return new Promise((resolve) => setTimeout(resolve, ms));
    if (signal.aborted) return Promise.reject(createCancelledExportError());
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            signal.removeEventListener('abort', onAbort);
            resolve();
        }, ms);
        const onAbort = () => {
            clearTimeout(timer);
            signal.removeEventListener('abort', onAbort);
            reject(createCancelledExportError());
        };
        signal.addEventListener('abort', onAbort, { once: true });
    });
}

/** Let the browser paint / process events between heavy chunks. */
export function yieldToEventLoop(signal?: AbortSignal): Promise<void> {
    return waitWithAbort(0, signal);
}
