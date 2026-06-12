import type { ComponentType } from 'react';

/**
 * Replaceable sub-components. Pass a component to fully swap a part; pair with
 * `slotProps` to inject props/`sx` without replacing it. (MUI `slots`/`slotProps` pattern.)
 *
 * The index signature keeps this extensible while the full set is filled in across phases.
 */
export interface DataTableSlots {
    // Structure
    root?: ComponentType<any>;
    scroller?: ComponentType<any>;
    grid?: ComponentType<any>;
    header?: ComponentType<any>;
    headerRow?: ComponentType<any>;
    headerCell?: ComponentType<any>;
    body?: ComponentType<any>;
    row?: ComponentType<any>;
    cell?: ComponentType<any>;
    detailPanel?: ComponentType<any>;
    footer?: ComponentType<any>;
    pagination?: ComponentType<any>;
    // States
    loadingOverlay?: ComponentType<any>;
    noRowsOverlay?: ComponentType<any>;
    // Toolbar + controls
    toolbar?: ComponentType<any>;
    searchInput?: ComponentType<any>;
    columnVisibilityControl?: ComponentType<any>;
    columnFilterControl?: ComponentType<any>;
    columnPinningControl?: ComponentType<any>;
    densityControl?: ComponentType<any>;
    resetButton?: ComponentType<any>;
    refreshButton?: ComponentType<any>;
    exportButton?: ComponentType<any>;
    bulkActionsToolbar?: ComponentType<any>;
    // Icons (subset — extended across phases)
    sortIconAsc?: ComponentType<any>;
    sortIconDesc?: ComponentType<any>;

    [slot: string]: ComponentType<any> | undefined;
}

export type DataTableSlotProps = {
    [K in keyof DataTableSlots]?: Record<string, any>;
};

export type PartialSlotProps = DataTableSlotProps;
