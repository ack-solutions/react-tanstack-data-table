import { useCallback, useRef } from 'react';

export function useExportToasts(showToasty: any) {
    const toastIdRef = useRef<string | number | null>(null);

    const onExportProgress = useCallback(
        (progress: { processedRows?: number; totalRows?: number; percentage?: number }) => {
            let message = 'Exporting data';
            if (progress?.percentage >= 0) {
                message += `... ${progress.percentage.toFixed(0)}% (${progress.processedRows}/${progress.totalRows})`;
            } else {
                message += `... please wait`;
            }

            console.log('message', message);

            if (toastIdRef.current === null) {
                toastIdRef.current = showToasty(message, 'loading') as any;
            } else {
                showToasty(message, 'loading', { id: toastIdRef.current });
            }
        },
        [showToasty],
    );

    const onExportComplete = useCallback(
        (result: { success: boolean; filename: string; totalRows: number }) => {
            const message = `Successfully exported ${result.totalRows} rows to ${result.filename}`;
            if (toastIdRef.current !== null) {
                showToasty(message, 'success', { id: toastIdRef.current });
                toastIdRef.current = null;
            } else {
                showToasty(message, 'success');
            }
        },
        [showToasty],
    );

    const onExportError = useCallback(
        (error: { message: string; code?: string }) => {
            const message = `Export failed: ${error.message}`;
            if (toastIdRef.current !== null) {
                showToasty(message, 'error', { id: toastIdRef.current });
                toastIdRef.current = null;
            } else {
                showToasty(message, 'error');
            }
        },
        [showToasty],
    );

    const onCancelExport = useCallback(() => {
        if (toastIdRef.current !== null) {
            showToasty('Export cancelled', 'error', { id: toastIdRef.current });
            toastIdRef.current = null;
        }
    }, [showToasty]);

    return { onExportProgress, onExportComplete, onExportError, onCancelExport };
}
