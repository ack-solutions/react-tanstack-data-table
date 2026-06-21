/**
 * EditCell — the inline editor rendered in place of a cell while it's being edited.
 * Type-aware (text / number / date / boolean / select). Commits on Enter or blur,
 * cancels on Escape; key events are stopped so grid keyboard-nav doesn't see them.
 */
import { MenuItem, Select, TextField } from '@mui/material';
import { useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import type { Column, Row } from '@tanstack/react-table';

export interface EditCellProps<T> {
    column: Column<T, any>;
    row: Row<T>;
    initialValue: any;
    align: 'left' | 'center' | 'right';
    onCommit: (value: any) => void;
    onCancel: () => void;
}

export function EditCell<T>({ column, initialValue, align, onCommit, onCancel }: EditCellProps<T>): ReactElement {
    const def = column.columnDef as any;
    const type = def.type as string | undefined;
    const options = def.options as { label: string; value: any }[] | undefined;
    const [value, setValue] = useState<any>(initialValue ?? '');
    const done = useRef(false);

    const finish = (fn: () => void) => { if (done.current) return; done.current = true; fn(); };
    const coerce = (v: any): any => {
        if (v === '' || v == null) return type === 'number' || type === 'date' ? null : v;
        if (type === 'number') return Number(v);
        // Match the original representation so a date column doesn't mix Date and string.
        if (type === 'date') return initialValue instanceof Date ? new Date(v) : v;
        return v;
    };
    const commitValue = (v: any) => finish(() => onCommit(coerce(v)));
    const cancel = () => finish(onCancel);

    const onKeyDown = (e: KeyboardEvent) => {
        e.stopPropagation();
        if (e.key === 'Enter') { e.preventDefault(); commitValue(value); }
        else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    };

    // select / boolean → commit immediately on choice
    if ((options && options.length) || type === 'boolean') {
        const opts = options && options.length ? options : [{ label: 'True', value: true }, { label: 'False', value: false }];
        return (
            <Select
                size="small"
                variant="standard"
                disableUnderline
                autoFocus
                open
                fullWidth
                value={value ?? ''}
                onChange={(e) => { setValue(e.target.value); commitValue(e.target.value); }}
                onClose={() => cancel()}
                onKeyDown={onKeyDown}
                sx={{ fontSize: 'inherit', '& .MuiSelect-select': { py: 0 } }}
            >
                {opts.map((o) => <MenuItem key={String(o.value)} value={o.value as any}>{o.label}</MenuItem>)}
            </Select>
        );
    }

    const inputType = type === 'number' ? 'number' : type === 'date' ? 'date' : 'text';
    const display = type === 'date' && value ? String(value).slice(0, 10) : value;
    return (
        <TextField
            size="small"
            variant="standard"
            autoFocus
            fullWidth
            type={inputType}
            value={display ?? ''}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => commitValue(value)}
            // No underline — the editing cell shows a full-cell ring instead (a stray
            // mid-cell baseline line reads as a rendering glitch). Fill the cell height.
            InputProps={{ disableUnderline: true }}
            // Logical alignment (matches the display cell) so it doesn't jump under RTL.
            inputProps={{ style: { textAlign: align === 'center' ? 'center' : align === 'right' ? 'end' : 'start', padding: 0, fontSize: 'inherit' } }}
            sx={{ '& .MuiInputBase-root': { height: '100%', fontSize: 'inherit' } }}
        />
    );
}
