/**
 * EditCell — the inline editor rendered in place of a cell while it's being edited.
 * Type-aware (text / number / date / boolean / select), or a column's custom
 * `editComponent`. Two modes:
 *  - **cell** (default): self-contained — commits on Enter or blur, cancels on Escape.
 *  - **row**: value-controlled — every change is buffered up via `onChange` (no
 *    commit-on-blur); Enter saves the whole row (`onEnter`), Escape cancels it.
 */
import { MenuItem, Select, TextField } from '@mui/material';
import { createElement, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import type { Column, Row } from '@tanstack/react-table';

import { coerceEditValue } from '../../utils/table-helpers';

export interface EditCellProps<T> {
    column: Column<T, any>;
    row: Row<T>;
    initialValue: any;
    align: 'left' | 'center' | 'right';
    onCommit: (value: any) => void;
    onCancel: () => void;
    editMode?: 'cell' | 'row';
    /** Row mode: the buffered (controlled) value. */
    value?: any;
    /** Row mode: push every change to the row's pending buffer. */
    onChange?: (value: any) => void;
    /** Row mode: Enter saves the whole row. */
    onEnter?: () => void;
    /** Focus this editor on mount (default true). Row mode focuses only the first cell. */
    autoFocusEditor?: boolean;
}

export function EditCell<T>({ column, row, initialValue, align, onCommit, onCancel, editMode = 'cell', value: controlledValue, onChange, onEnter, autoFocusEditor = true }: EditCellProps<T>): ReactElement {
    const def = column.columnDef as any;
    const type = def.type as string | undefined;
    const options = def.options as { label: string; value: any }[] | undefined;
    const isRowMode = editMode === 'row';
    // Cell mode keeps its own state; row mode is controlled by the row's pending buffer.
    const [localValue, setLocalValue] = useState<any>(initialValue ?? '');
    const shown = isRowMode ? (controlledValue ?? '') : localValue;
    const done = useRef(false);

    // The one-shot latch only dedupes cell mode's blur+Enter double-commit; row mode has
    // no commit-on-blur, so don't latch there (else a stray commit could poison cancel).
    const finish = (fn: () => void) => { if (!isRowMode && done.current) return; if (!isRowMode) done.current = true; fn(); };
    const commitValue = (v: any) => finish(() => onCommit(coerceEditValue(v, type, initialValue)));
    const cancel = () => finish(onCancel);
    // During typing both modes store the RAW value (coercion happens at commit / row Save).
    const update = (v: any) => { if (isRowMode) onChange?.(v); else setLocalValue(v); };

    const onKeyDown = (e: KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === 'Enter') { e.preventDefault(); if (isRowMode) onEnter?.(); else commitValue(localValue); }
        else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    };

    // Custom editor wins — it owns its UX (cell mode: call onCommit/onCancel; row mode: onChange).
    const Custom = def.editComponent;
    if (Custom) {
        return createElement(Custom, {
            value: shown,
            onChange: update,
            // In row mode onCommit must NOT do a single-cell write — buffer it like onChange
            // so a custom editor can't bypass the row buffer or latch out the row's cancel.
            onCommit: isRowMode ? update : (v: any) => commitValue(v),
            onCancel: cancel,
            row,
            column,
            align,
            editMode: isRowMode ? 'row' : 'cell',
            autoFocus: autoFocusEditor,
        });
    }

    // select / boolean → a dropdown
    if ((options && options.length) || type === 'boolean') {
        const opts = options && options.length ? options : [{ label: 'True', value: true }, { label: 'False', value: false }];
        return (
            <Select
                size="small"
                variant="standard"
                disableUnderline
                autoFocus={autoFocusEditor}
                // Cell mode auto-opens (controlled) and commits on choice. Row mode must be
                // UNCONTROLLED so a click opens it — a controlled `open={false}` never would.
                {...(isRowMode ? {} : { open: true })}
                fullWidth
                value={shown}
                onChange={(e) => { if (isRowMode) update(e.target.value); else { setLocalValue(e.target.value); commitValue(e.target.value); } }}
                onClose={() => { if (!isRowMode) cancel(); }}
                onKeyDown={onKeyDown}
                sx={{ fontSize: 'inherit', '& .MuiSelect-select': { py: 0 } }}
            >
                {opts.map((o) => <MenuItem key={String(o.value)} value={o.value as any}>{o.label}</MenuItem>)}
            </Select>
        );
    }

    const inputType = type === 'number' ? 'number' : type === 'date' ? 'date' : 'text';
    const display = type === 'date' && shown ? String(shown).slice(0, 10) : shown;
    return (
        <TextField
            size="small"
            variant="standard"
            autoFocus={autoFocusEditor}
            fullWidth
            type={inputType}
            value={display ?? ''}
            onChange={(e) => update(e.target.value)}
            onKeyDown={onKeyDown}
            // Cell mode commits on blur; row mode never auto-commits (Save commits the row).
            onBlur={() => { if (!isRowMode) commitValue(localValue); }}
            // No underline — the editing cell shows a full-cell ring instead.
            InputProps={{ disableUnderline: true }}
            // Logical alignment (matches the display cell) so it doesn't jump under RTL.
            inputProps={{ style: { textAlign: align === 'center' ? 'center' : align === 'right' ? 'end' : 'start', padding: 0, fontSize: 'inherit' } }}
            sx={{ '& .MuiInputBase-root': { height: '100%', fontSize: 'inherit' } }}
        />
    );
}
