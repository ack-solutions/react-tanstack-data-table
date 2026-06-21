/**
 * Saved/named views — a captured snapshot of the full user-visible layout that the
 * user can name, switch between, update, and delete from the toolbar's Views control.
 * Reuses {@link SavedLayout} (the `api.layout` snapshot) plus sorting + density so a
 * view round-trips everything the user can configure.
 */
import type { SortingState } from '@tanstack/react-table';

import type { DataTableDensity } from '../theme/tokens';
import type { SavedLayout } from './api.types';

/** Everything a view captures: the layout snapshot + sorting + density. */
export type ViewBody = SavedLayout & {
    sorting?: SortingState;
    density?: DataTableDensity;
};

export interface SavedView {
    id: string;
    name: string;
    state: ViewBody;
    /** Synthetic, non-deletable views (e.g. the "Default" pseudo-view). */
    builtIn?: boolean;
    createdAt?: number;
    updatedAt?: number;
}

/** On-disk shape under the `dt:<stateKey>:views` storage key. */
export interface SavedViewsFile {
    version: 1;
    activeViewId: string | null;
    views: SavedView[];
}
