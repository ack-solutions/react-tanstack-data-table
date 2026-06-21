/**
 * Helper that builds a row-pin/unpin {@link DataTableRowAction} from the imperative
 * `api.rowPinning`. Spread it into your `getRowActions(row)` return so the per-row
 * actions column (ActionsCell) gets a "Pin to top/bottom" / "Unpin row" item — the
 * least-invasive trigger, reusing the existing actions pipeline (no new UI surface).
 * The label/icon flip to "Unpin" once the row is pinned to the requested band.
 *
 * Pass your `apiRef` (a `RefObject`) — the api is read lazily at click time, so it
 * works even though `apiRef.current` is populated only after the first render. A
 * resolved `api` value is also accepted.
 */
import PushPinOutlined from '@mui/icons-material/PushPinOutlined';
import PushPin from '@mui/icons-material/PushPin';
import type { RefObject } from 'react';
import type { Row, RowPinningState } from '@tanstack/react-table';

import type { DataTableApi } from '../types/api.types';
import type { DataTableRowAction } from '../types/data-table.types';
import type { DataTableLocaleText } from '../types/locale.types';
import { DEFAULT_LOCALE_TEXT } from '../locale/default-locale';

/**
 * Drop pinned row ids that aren't in the current data. TanStack's `getRow(id, true)`
 * THROWS for an unknown id, so feeding the table an unsanitized `rowPinning` would
 * hard-crash the render after a stale `initialState`/persisted pin, a deleted row, or a
 * data swap. Returns the same object identity when nothing is pruned.
 */
export function sanitizeRowPinning(pinning: RowPinningState, validIds: Set<string>): RowPinningState {
    const top = pinning.top ?? [];
    const bottom = pinning.bottom ?? [];
    const ft = top.filter((id) => validIds.has(id));
    const fb = bottom.filter((id) => validIds.has(id));
    if (ft.length === top.length && fb.length === bottom.length) return pinning;
    return { top: ft, bottom: fb };
}

type ApiOrRef<T> = DataTableApi<T> | RefObject<DataTableApi<T> | null> | null | undefined;

function resolveApi<T>(apiOrRef: ApiOrRef<T>): DataTableApi<T> | null {
    if (!apiOrRef) return null;
    // A resolved api has `rowPinning`; a RefObject has `current`.
    if ('rowPinning' in apiOrRef) return apiOrRef as DataTableApi<T>;
    return (apiOrRef as RefObject<DataTableApi<T> | null>).current ?? null;
}

export function createRowPinAction<T>(
    apiRef: ApiOrRef<T>,
    row: Row<T>,
    position: 'top' | 'bottom' = 'top',
    localeText: DataTableLocaleText = DEFAULT_LOCALE_TEXT,
): DataTableRowAction<T> {
    const isPinnedHere = row.getIsPinned?.() === position;
    // Tree sub-rows can't be pinned (they'd orphan from their subtree) — hide there.
    const pinnable = (row.depth ?? 0) === 0;
    return {
        label: isPinnedHere ? localeText.unpinRow : position === 'top' ? localeText.pinRowTop : localeText.pinRowBottom,
        icon: isPinnedHere ? PushPin : PushPinOutlined,
        hidden: !pinnable,
        onClick: () => {
            const api = resolveApi(apiRef);
            if (!api) return;
            if (isPinnedHere) api.rowPinning.unpinRow(row.id);
            else if (position === 'top') api.rowPinning.pinRowTop(row.id);
            else api.rowPinning.pinRowBottom(row.id);
        },
    };
}
