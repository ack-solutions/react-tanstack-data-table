import { useCallback, useEffect, useMemo, useRef } from 'react';
import { debounce } from 'lodash';
import {
    DEFAULT_EXPANDING_COLUMN_NAME,
    DEFAULT_SELECTION_COLUMN_NAME,
    DataTableApi,
    TableFilters,
} from '@ackplus/react-tanstack-data-table';
import { DataTableLayoutState, useDataTableState } from '../datatable-state-context';

interface UseDataTablePersistenceOptions {
    stateKey?: string;
    tableRef: React.RefObject<DataTableApi<any>>;
    defaultHiddenColumns?: string[];
    initialState?: any;
    onLayoutChange?: (layout: DataTableLayoutState) => void;
    // if you want also store filters:
    onDataStateChange?: (state: Partial<any>) => void;
}

export function useDataTablePersistence({
    stateKey,
    tableRef,
    defaultHiddenColumns,
    initialState,
    onLayoutChange,
    onDataStateChange,
}: UseDataTablePersistenceOptions) {
    const ctx = stateKey ? useDataTableState(stateKey) : null;
    const savedLayout = ctx?.layout;

    const isLayoutRestoredRef = useRef(false);
    const isRestoringRef = useRef(false);

    const computedInitialState = useMemo(() => {
        const defaultColumnVisibility: Record<string, boolean> = {};
        (defaultHiddenColumns || []).forEach(col => {
            defaultColumnVisibility[col] = false;
        });

        return {
            pagination: { pageIndex: 0, pageSize: 50 },
            columnVisibility: defaultColumnVisibility,
            ...initialState,
            columnPinning: {
                left: [
                    DEFAULT_EXPANDING_COLUMN_NAME,
                    DEFAULT_SELECTION_COLUMN_NAME,
                    ...(initialState?.columnPinning?.left || []),
                ],
                right: [
                    'action',
                    ...(initialState?.columnPinning?.right || []),
                ],
            },
        };
    }, [defaultHiddenColumns, initialState]);

    const debouncedSaveLayout = useMemo(() => {
        return debounce(() => {
            if (!ctx || isRestoringRef.current || !tableRef.current) return;

            const layout = tableRef.current.layout.saveLayout();
            const layoutOnly: DataTableLayoutState = {
                columnVisibility: layout.columnVisibility,
                columnOrder: layout.columnOrder,
                columnSizing: layout.columnSizing,
                columnPinning: layout.columnPinning,
            };

            ctx.saveLayout(layoutOnly);
            onLayoutChange?.(layoutOnly);
        }, 700);
    }, [ctx, onLayoutChange, tableRef]);

    const handleTableStateChange = useCallback(
        (state: TableFilters) => {
            onDataStateChange?.(state);

            // If you want to store session table state here, do it outside (CrudDataGrid already does).
            // This hook focuses on layout persistence.
            if (ctx && !isRestoringRef.current) {
                debouncedSaveLayout();
            }
        },
        [ctx, debouncedSaveLayout, onDataStateChange],
    );

    const handleLayoutChange = useCallback(() => {
        if (!ctx || isRestoringRef.current) return;
        debouncedSaveLayout();
    }, [ctx, debouncedSaveLayout]);

    // Restore layout once on mount
    useEffect(() => {
        if (!savedLayout || isLayoutRestoredRef.current || !tableRef.current) return;

        isRestoringRef.current = true;

        const t1 = setTimeout(() => {
            if (!tableRef.current) return;

            tableRef.current.layout.restoreLayout(savedLayout);
            isLayoutRestoredRef.current = true;

            const t2 = setTimeout(() => {
                isRestoringRef.current = false;
            }, 100);

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return () => clearTimeout(t2);
        }, 100);

        return () => clearTimeout(t1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => debouncedSaveLayout.cancel();
    }, [debouncedSaveLayout]);

    return {
        initialState: computedInitialState,
        handleTableStateChange,
        handleLayoutChange,
    };
}
