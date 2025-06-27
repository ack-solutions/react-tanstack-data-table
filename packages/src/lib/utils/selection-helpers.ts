/**
 * Selection Helper Utilities
 * 
 * Common selection logic that can be shared between the API hook and selection column
 * to avoid dependency on API reference in selection column
 */

import { Table } from '@tanstack/react-table';
import { ServerSelectionState } from '../components/table/data-table.types';

export interface SelectionHelperConfig {
    dataMode: 'client' | 'server';
    selectMode: 'page' | 'all';
    serverSelection?: ServerSelectionState;
    onServerSelectionChange?: (state: ServerSelectionState) => void;
    totalRow?: number;
}

/**
 * Toggle select all logic
 */
export function toggleSelectAll<T>(
    table: Table<T>,
    config: SelectionHelperConfig
): void {
    const { dataMode, selectMode, serverSelection, onServerSelectionChange } = config;
    
    if (dataMode === 'server' && selectMode === 'all' && onServerSelectionChange) {
        // Server mode with 'all' selection - toggle selectAllMatching
        onServerSelectionChange({
            selectAllMatching: !serverSelection?.selectAllMatching,
            excludedIds: [],
        });
        // Clear any existing TanStack Table selections
        table.toggleAllRowsSelected(false);
    } else {
        // Client mode or page selection mode
        if (selectMode === 'page') {
            table.toggleAllPageRowsSelected();
        } else {
            table.toggleAllRowsSelected();
        }
    }
}

/**
 * Select all logic
 */
export function selectAll<T>(
    table: Table<T>,
    config: SelectionHelperConfig
): void {
    const { dataMode, selectMode, onServerSelectionChange } = config;
    
    if (dataMode === 'server' && selectMode === 'all' && onServerSelectionChange) {
        onServerSelectionChange({
            selectAllMatching: true,
            excludedIds: [],
        });
    } else if (selectMode === 'page') {
        table.toggleAllPageRowsSelected(true);
    } else {
        table.toggleAllRowsSelected(true);
    }
}

/**
 * Deselect all logic
 */
export function deselectAll<T>(
    table: Table<T>,
    config: SelectionHelperConfig
): void {
    const { dataMode, selectMode, onServerSelectionChange } = config;
    
    if (dataMode === 'server' && selectMode === 'all' && onServerSelectionChange) {
        onServerSelectionChange({
            selectAllMatching: false,
            excludedIds: [],
        });
    }
    table.toggleAllRowsSelected(false);
}

/**
 * Toggle individual row selection
 */
export function toggleRowSelection<T>(
    table: Table<T>,
    rowId: string,
    config: SelectionHelperConfig
): void {
    const { dataMode, selectMode, serverSelection, onServerSelectionChange } = config;
    
    if (dataMode === 'server' && selectMode === 'all' && onServerSelectionChange && serverSelection) {
        if (serverSelection.selectAllMatching) {
            // In "select all matching" mode, toggle exclusion
            const isCurrentlyExcluded = serverSelection.excludedIds.includes(rowId);
            onServerSelectionChange({
                ...serverSelection,
                excludedIds: isCurrentlyExcluded
                    ? serverSelection.excludedIds.filter(id => id !== rowId) // include row
                    : [...serverSelection.excludedIds, rowId], // exclude row
            });
        } else {
            // Normal individual selection via TanStack Table
            table.getRow(rowId)?.toggleSelected();
        }
    } else {
        // Client mode or page selection mode
        table.getRow(rowId)?.toggleSelected();
    }
}

/**
 * Check if all rows are selected
 */
export function isAllSelected<T>(
    table: Table<T>,
    config: SelectionHelperConfig
): boolean {
    const { dataMode, selectMode, serverSelection } = config;
    
    if (dataMode === 'server' && selectMode === 'all') {
        if (serverSelection?.selectAllMatching) {
            return serverSelection.selectAllMatching && serverSelection.excludedIds.length === 0;
        } else {
            // When selectMode='all' but not in selectAllMatching mode, 
            // never return true (so header checkbox can trigger selectAllMatching)
            return false;
        }
    } else {
        return selectMode === 'page' ? table.getIsAllPageRowsSelected() : table.getIsAllRowsSelected();
    }
}

/**
 * Check if some rows are selected (indeterminate state)
 */
export function isSomeSelected<T>(
    table: Table<T>,
    config: SelectionHelperConfig
): boolean {
    const { dataMode, selectMode, serverSelection } = config;
    
    if (dataMode === 'server' && selectMode === 'all') {
        if (serverSelection?.selectAllMatching) {
            return serverSelection.selectAllMatching && serverSelection.excludedIds.length > 0;
        } else {
            // When selectMode='all' but not in selectAllMatching mode,
            // check if any rows are selected via TanStack Table
            return table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected();
        }
    } else {
        return selectMode === 'page' ? table.getIsSomePageRowsSelected() : table.getIsSomeRowsSelected();
    }
}

/**
 * Check if a specific row is selected
 */
export function isRowSelected<T>(
    table: Table<T>,
    rowId: string,
    config: SelectionHelperConfig
): boolean {
    const { dataMode, selectMode, serverSelection } = config;
    
    if (dataMode === 'server' && selectMode === 'all' && serverSelection?.selectAllMatching) {
        return !serverSelection.excludedIds.includes(rowId);
    }
    return table.getRow(rowId)?.getIsSelected() || false;
}

/**
 * Get selected row count
 */
export function getSelectedCount<T>(
    table: Table<T>,
    config: SelectionHelperConfig
): number {
    const { dataMode, selectMode, serverSelection, totalRow } = config;
    
    if (dataMode === 'server' && selectMode === 'all' && serverSelection?.selectAllMatching) {
        return (totalRow || 0) - serverSelection.excludedIds.length;
    } else {
        return Object.keys(table.getState().rowSelection)
            .filter(key => table.getState().rowSelection[key]).length;
    }
} 