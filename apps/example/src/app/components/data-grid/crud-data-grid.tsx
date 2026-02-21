import React, { forwardRef, useCallback, useMemo, useRef, useImperativeHandle, useState, useEffect } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { DataTable, DataTableApi, DataTableProps, TableFilters, TableState } from '@ackplus/react-tanstack-data-table';

import { useDataTableState } from './datatable-state-context';

import { useExportToasts } from './hooks/use-export-toasts';
import { useCrudTableActions } from './hooks/use-crud-table-actions';

import { buildQBFromTableState } from './ table-to-qb';
import { UseQueryResult } from '@tanstack/react-query';
import { useLatestRef } from './hooks/use-latest-ref';
import { TableActionMenu, TableActionMenuProps } from './comp/table-action-menu';
import { TableAction } from './comp/table-action-menu';
import { useConfirm } from './hooks/confirm-dialog-context';

export interface CrudDataGridProps<T>
    extends Partial<Omit<DataTableProps<T>, 'data' | 'ref' | 'onFetchData' | 'bulkActions' | 'onRowClick'>> {
    crudOperationHooks: {
        useGetMany: any;
    } & Partial<
        Pick<
            ReturnType<any>,
            | 'fetchMany'
            | 'useBulkDelete'
            | 'useBulkDeleteForever'
            | 'useDelete'
            | 'useDeleteForever'
            | 'useBulkRestore'
            | 'useRestore'
        >
    >;
    crudName: string;
    hasSoftDelete?: boolean;

    stateKey?: string;
    defaultHiddenColumns?: string[];

    onView?: (row: Partial<T>) => void;
    onRowClick?: (row: Partial<T>) => void;
    onEdit?: (row: Partial<T>) => void;

    /** Receives selected ids and optional context (e.g. isTrash). Return custom bulk actions; when isTrash is true you may return [] or custom actions for deleted data. */
    bulkActions?: (rowIds: string[], context?: { isTrash?: boolean }) => TableAction[];
    onAction?: (
        type:
            | 'created'
            | 'updated'
            | 'deleted'
            | 'restored'
            | 'deleteForever'
            | 'bulkDelete'
            | 'bulkRestore'
            | 'bulkDeleteRestore',
    ) => void;

    onToggleTrashData?: (checked: boolean) => void;

    /** Receives row and optional context (e.g. isDeleted). Return custom menu props; when isDeleted you may return { actions: [] } or custom actions for deleted rows. */
    tableActionMenuProps?: (row?: any, context?: { isDeleted?: boolean }) => TableActionMenuProps;

    dataTableApiRequestMap?: (queryBuilder?: any, filter?: Partial<TableState>) => Promise<any> | any;

    permissionsKey?: {
        delete?: string;
        deleteForever?: string;
        restore?: string;
        edit?: string;
        view?: string;
    };
}

function CrudDataGridInner<T>(
    {
        crudOperationHooks,
        idKey = 'id' as keyof T,
        crudName,
        hasSoftDelete,
        stateKey,
        defaultHiddenColumns,
        onEdit,
        onView,
        onRowClick,
        bulkActions,
        extraFilter,
        columns: initialColumns = [],
        dataTableApiRequestMap,
        onAction,
        onToggleTrashData,
        tableActionMenuProps,
        maxHeight,
        initialState,
        permissionsKey,
        ...props
    }: CrudDataGridProps<T>,
    ref: React.Ref<DataTableApi<T>>,
) {
    const confirmDialog = useConfirm();
    const datatableRef = useRef<DataTableApi<any>>(null);

    // expose table api
    useImperativeHandle(ref, () => datatableRef.current, []);

    // state persistence (sessionStorage now)
    const ctx = stateKey ? useDataTableState(stateKey) : null;
    const cached = ctx?.state;
    const [mappedFilters, setMappedFilters] = useState<Partial<TableFilters> | undefined>(undefined);
    const [queryObj, setQueryObj] = useState<any | undefined>(undefined);

    const [isTrash, setIsTrash] = useState<boolean>(cached?.showDeleted || false);
    const [rows, setRows] = useState<T[]>([]);
    const [total, setTotal] = useState<number>(0);

    // CRUD hooks
    const {
        fetchMany,
        useGetMany,
        useDelete,
        useRestore,
        useDeleteForever,
        useBulkDelete,
        useBulkRestore,
        useBulkDeleteForever,
    } = crudOperationHooks;

    const { mutateAsync: deleteItem } = useDelete?.() || ({} as any);
    const { mutateAsync: restoreItem } = useRestore?.() || ({} as any);
    const { mutateAsync: deleteForeverItem } = useDeleteForever?.() || ({} as any);
    const { mutateAsync: bulkDeleteItems } = useBulkDelete?.() || ({} as any);
    const { mutateAsync: bulkRestoreItems } = useBulkRestore?.() || ({} as any);
    const { mutateAsync: bulkDeleteForeverItems } = useBulkDeleteForever?.() || ({} as any);

    const mapQueryRef = useLatestRef(dataTableApiRequestMap);
    const { data, error, isSuccess, refetch, isFetching }: UseQueryResult<any, any> = useGetMany(queryObj, {
        enabled: !!queryObj,
    });

    const showToasty = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' | 'loading') => {
        if (type === 'success') {
            console.log('message success', message);
        } else if (type === 'error') {
            console.error('message', message);
        } else if (type === 'warning') {
            console.warn('message', message);
        } else if (type === 'info') {
            console.info('message', message);
        } else if (type === 'loading') {
            console.log('message loading', message);
        }
    }, []);

    const crudActions = useCrudTableActions({
        crudName,
        confirmDialog,
        showToasty,
        datatableRef,
        onAction,
        deleteItem,
        restoreItem,
        deleteForeverItem,
        bulkDeleteItems,
        bulkRestoreItems,
        bulkDeleteForeverItems,
    });
    const mergedInitialState = useMemo(() => {
        const base = initialState || {};
        if (!cached) return base;

        return {
            ...base,
            ...(cached.sorting && { sorting: cached.sorting }),
            ...(cached.pagination && { pagination: cached.pagination }),
            ...(cached.globalFilter && { globalFilter: cached.globalFilter }),
            ...(cached.columnFilter && { columnFilter: cached.columnFilter }),
        };
    }, [cached, initialState]);


    // row click adapter
    const adaptedOnRowClick = useMemo(() => {
        if (!onRowClick) return undefined;
        return (_event: any, row: any) => onRowClick(row.original);
    }, [onRowClick]);

    // build columns (append action)
    const columns = useMemo(() => {
        return [
            ...initialColumns,
            {
                id: 'action',
                header: 'Action',
                enablePinning: false,
                enableHiding: false,
                enableResizing: false,
                hideInExport: true,
                maxSize: 120,
                size: 80,
                cell: ({ row }: any) => {
                    const isDeleted = !!(row.original as any).deletedAt;
                    return (
                        <TableActionMenu
                            permissionsKeys={permissionsKey}
                            {...(isDeleted
                                ? {
                                    onDeleteForever: () => crudActions.handleDeleteForever(row.original),
                                    onRestore: () => crudActions.handleRestore(row.original),
                                }
                                : {
                                    onDelete: () => crudActions.handleDelete(row.original),
                                })}
                            {...(onEdit && !isDeleted && {
                                onEdit: () => onEdit(row.original),
                            })}
                            {...(onView && !isDeleted && {
                                onView: () => onView(row.original),
                            })}
                            {...tableActionMenuProps?.(row.original, { isDeleted })}
                        />
                    );
                },
            },
        ];
    }, [initialColumns, permissionsKey, crudActions, onEdit, onView, tableActionMenuProps]);

    const handleQueryObjectChange = useCallback(
        async (data: { filters?: Partial<TableFilters>, isTrash?: boolean }) => {
            const filters = data.filters || mappedFilters;
            const qb = await buildQBFromTableState({
                columns: initialColumns,
                filters,
                isTrash: data.isTrash ?? false,
                mapQuery: mapQueryRef.current
                    ? async (qb, f) => mapQueryRef.current!(qb, f)
                    : undefined,
            });
            const obj = qb.toObject() as any;
            setQueryObj(obj);
        },
        [initialColumns, mappedFilters, mapQueryRef],
    );

    const handleChangeSoftDelete = useCallback(
        (_e: any, checked: boolean) => {
            onToggleTrashData?.(checked);
            setIsTrash(checked);
            datatableRef.current?.selection?.deselectAll?.();
            if (stateKey && ctx) {
                ctx.setState({ showDeleted: checked });
            }
            handleQueryObjectChange({ filters: mappedFilters, isTrash: checked });
        },
        [onToggleTrashData, stateKey, ctx, handleQueryObjectChange, mappedFilters],
    );

    const handleServerExportData = useCallback(
        async (filters?: Partial<TableFilters>) => {
            // return fetchData(filters as any);
            const qb = await buildQBFromTableState({
                columns: initialColumns,
                filters,
                isTrash,
                mapQuery: mapQueryRef.current
                    ? async (qb, f) => mapQueryRef.current!(qb, f)
                    : undefined,
            });

            const q = await fetchMany(qb.toObject() as any);
            return {
                data: q?.items || [],
                total: q?.total || 0,
            };
        },
        [fetchMany, initialColumns, isTrash, mapQueryRef],
    );

    const { onExportProgress, onExportComplete, onExportError, onCancelExport } = useExportToasts(showToasty);


    const handleFetchRequestGeneration = useCallback(
        (filters: Partial<TableFilters>) => {
            setTimeout(() => {
                setMappedFilters(filters);
                handleQueryObjectChange({ filters, isTrash });
            }, 0);
        },
        [handleQueryObjectChange, isTrash],
    );
    // save table session state (sorting/pagination/globalFilter/columnFilter)
    const handleTableStateChange = useCallback(
        (state: Partial<TableState>) => {
            if (!stateKey || !ctx) return;
            ctx.setState({
                sorting: state.sorting,
                pagination: state.pagination,
                globalFilter: state.globalFilter,
                columnFilter: state.columnFilter,
            });
        },
        [stateKey, ctx],
    );

    useEffect(() => {
        if (!isSuccess || !data) {
            return;
        }
        const items = data.items ?? [];
        const totalCount = data.total ?? 0;
        setRows(items);
        setTotal(totalCount);
    }, [data, isSuccess]);
    return (
        <DataTable
            ref={datatableRef}
            idKey={idKey as string}
            data={rows}
            totalRow={total}
            columns={columns}
            loading={isFetching}
            dataMode="server"
            stateKey={stateKey}
            onFetchStateChange={handleFetchRequestGeneration}
            onDataStateChange={(state)=>{
                console.log('onDataStateChange', state);
                handleTableStateChange(state);
            }}
            onColumnVisibilityChange={() => {
                console.log('onColumnVisibilityChange');
            }}
            onColumnDragEnd={() => {
                console.log('onColumnDragEnd');
            }}
            onColumnPinningChange={() => {
                console.log('onColumnPinningChange');
            }}
            onColumnSizingChange={() => {
                console.log('onColumnSizingChange');
            }}
            onRowClick={adaptedOnRowClick}


            defaultHiddenColumns={defaultHiddenColumns}
            enableStickyHeaderOrFooter
            enablePagination
            enableRowSelection
            enableRefresh
            enableColumnDragging
            enableGlobalFilter
            enableColumnFilter
            enableSorting
            enableHover
            enableColumnResizing
            enableColumnPinning
            enableBulkActions
            enableStripes

            enableExport
            onExportProgress={onExportProgress}
            onExportComplete={onExportComplete}
            onExportError={onExportError}
            onExportCancel={onCancelExport}
            onServerExport={handleServerExportData}

            initialState={mergedInitialState}
            // bulkActions={bulkActions}
            maxHeight={maxHeight || `calc(100svh - ${320}px)`}
            skeletonRows={10}
            extraFilter={extraFilter}
            footerFilter={
                hasSoftDelete ? (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isTrash}
                                onChange={handleChangeSoftDelete}
                            />
                        }
                        label="Show Deleted"
                        slotProps={{ typography: { noWrap: true } }}
                    />
                ) : null
            }
            {...props}
            slotProps={props.slotProps}
        />
    );
}

export const CrudDataGrid = forwardRef(CrudDataGridInner) as <T>(
    props: CrudDataGridProps<T> & { ref?: React.Ref<DataTableApi<T>> },
) => React.ReactElement;

export default CrudDataGrid;
