import { useCallback } from 'react';

interface Options {
    crudName: string;
    confirmDialog: any;
    showToasty: any;
    datatableRef: React.RefObject<any>;
    onAction?: (type: any) => void;

    deleteItem?: (id: any) => Promise<any>;
    restoreItem?: (id: any) => Promise<any>;
    deleteForeverItem?: (id: any) => Promise<any>;
    bulkDeleteItems?: (ids: string[]) => Promise<any>;
    bulkRestoreItems?: (ids: string[]) => Promise<any>;
    bulkDeleteForeverItems?: (ids: string[]) => Promise<any>;
}

export function useCrudTableActions({
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
}: Options) {
    const clearAndReload = useCallback(() => {
        datatableRef.current?.selection?.deselectAll?.();
    }, [datatableRef]);

    const handleDelete = useCallback(
        (row: any) => {
            confirmDialog({ message: `Are you sure you want to delete this ${crudName}?` })
                .then(() =>
                    deleteItem?.(row.id)
                        .then(() => {
                            clearAndReload();
                            showToasty(`The ${crudName} has been successfully deleted`);
                            onAction?.('deleted');
                        })
                        .catch((err: any) => {
                            showToasty(err || `Oops! Something went wrong while trying to delete the ${crudName}. Please try again.`, 'error');
                        }),
                )
                .catch(() => { });
        },
        [confirmDialog, crudName, deleteItem, clearAndReload, showToasty, onAction],
    );

    const handleRestore = useCallback(
        (row: any) => {
            confirmDialog({ message: `Are you sure you want to restore this ${crudName}?` })
                .then(() =>
                    restoreItem?.(row.id)
                        .then(() => {
                            clearAndReload();
                            showToasty(`The ${crudName} has been successfully restored`);
                            onAction?.('restored');
                        })
                        .catch((err: any) => {
                            showToasty(err || `Oops! Something went wrong while trying to restore the ${crudName}. Please try again.`, 'error');
                        }),
                )
                .catch(() => { });
        },
        [confirmDialog, crudName, restoreItem, clearAndReload, showToasty, onAction],
    );

    const handleDeleteForever = useCallback(
        (row: any) => {
            confirmDialog({
                message: `Are you sure you want to permanently delete this ${crudName}? This action cannot be undone.`,
            })
                .then(() =>
                    deleteForeverItem?.(row.id)
                        .then(() => {
                            clearAndReload();
                            showToasty(`The ${crudName} has been successfully deleted permanently`);
                            onAction?.('deleteForever');
                        })
                        .catch((err: any) => {
                            showToasty(err || `Oops! Something went wrong while trying to delete the ${crudName}. Please try again.`, 'error');
                        }),
                )
                .catch(() => { });
        },
        [confirmDialog, crudName, deleteForeverItem, clearAndReload, showToasty, onAction],
    );

    const handleBulkDelete = useCallback(
        (ids: string[]) => {
            confirmDialog({ message: `Are you sure you want to delete this ${crudName}?` })
                .then(() =>
                    bulkDeleteItems?.(ids)
                        .then(() => {
                            clearAndReload();
                            showToasty(`The ${crudName} has been successfully deleted`);
                            onAction?.('bulkDelete');
                        })
                        .catch((err: any) => {
                            showToasty(err || `Oops! Something went wrong while trying to delete the ${crudName}. Please try again.`, 'error');
                        }),
                )
                .catch(() => { });
        },
        [confirmDialog, crudName, bulkDeleteItems, clearAndReload, showToasty, onAction],
    );

    const handleBulkRestore = useCallback(
        (ids: string[]) => {
            confirmDialog({ message: `Are you sure you want to restore this ${crudName}?` })
                .then(() =>
                    bulkRestoreItems?.(ids)
                        .then(() => {
                            clearAndReload();
                            showToasty(`The ${crudName} has been successfully restored`);
                            onAction?.('bulkRestore');
                        })
                        .catch((err: any) => {
                            showToasty(err || `Oops! Something went wrong while trying to restore the ${crudName}. Please try again.`, 'error');
                        }),
                )
                .catch(() => { });
        },
        [confirmDialog, crudName, bulkRestoreItems, clearAndReload, showToasty, onAction],
    );

    const handleBulkDeleteForever = useCallback(
        (ids: string[]) => {
            confirmDialog({
                message: `Are you sure you want to permanently delete this ${crudName}? This action cannot be undone.`,
            })
                .then(() =>
                    bulkDeleteForeverItems?.(ids)
                        .then(() => {
                            clearAndReload();
                            showToasty(`The ${crudName} has been successfully deleted permanently`);
                            onAction?.('bulkDeleteRestore');
                        })
                        .catch((err: any) => {
                            showToasty(err || `Oops! Something went wrong while trying to delete the ${crudName}. Please try again.`, 'error');
                        }),
                )
                .catch(() => { });
        },
        [confirmDialog, crudName, bulkDeleteForeverItems, clearAndReload, showToasty, onAction],
    );

    return {
        clearAndReload,
        handleDelete,
        handleRestore,
        handleDeleteForever,
        handleBulkDelete,
        handleBulkRestore,
        handleBulkDeleteForever,
    };
}
