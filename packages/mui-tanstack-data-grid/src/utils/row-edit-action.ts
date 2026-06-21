/**
 * Row-edit actions for the actions column (whole-row `editMode: 'row'`). Returns
 * **Edit** when the row isn't being edited, or **Save** + **Cancel** when it is —
 * driven by `api.editing`. When `editMode: 'row'` is set the grid injects these
 * automatically (no wiring); spread it into your own `getRowActions` to combine with
 * custom actions. The api is read lazily, so pass your `apiRef` (a `RefObject`).
 */
import CheckOutlined from '@mui/icons-material/CheckOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import type { RefObject } from 'react';
import type { Row } from '@tanstack/react-table';

import type { DataTableApi } from '../types/api.types';
import type { DataTableRowAction } from '../types/data-table.types';
import type { DataTableLocaleText } from '../types/locale.types';
import { DEFAULT_LOCALE_TEXT } from '../locale/default-locale';

type ApiOrRef<T> = DataTableApi<T> | RefObject<DataTableApi<T> | null> | null | undefined;

function resolveApi<T>(apiOrRef: ApiOrRef<T>): DataTableApi<T> | null {
    if (!apiOrRef) return null;
    if ('editing' in apiOrRef) return apiOrRef as DataTableApi<T>;
    return (apiOrRef as RefObject<DataTableApi<T> | null>).current ?? null;
}

export function createRowEditAction<T>(
    apiRef: ApiOrRef<T>,
    row: Row<T>,
    localeText: DataTableLocaleText = DEFAULT_LOCALE_TEXT,
): DataTableRowAction<T>[] {
    const api = resolveApi(apiRef);
    const editing = api?.editing?.isRowInEditMode?.(row.id) ?? false;
    if (editing) {
        return [
            { label: localeText.editSave, icon: CheckOutlined, color: 'primary', onClick: () => resolveApi(apiRef)?.editing.saveRowEdit() },
            { label: localeText.editCancel, icon: CloseOutlined, onClick: () => resolveApi(apiRef)?.editing.cancelRowEdit() },
        ];
    }
    return [
        {
            label: localeText.editRow,
            icon: EditOutlined,
            // Only top-level rows are editable (tree sub-rows can't enter edit).
            hidden: (row.depth ?? 0) > 0,
            onClick: () => resolveApi(apiRef)?.editing.startRowEdit(row.id),
        },
    ];
}
