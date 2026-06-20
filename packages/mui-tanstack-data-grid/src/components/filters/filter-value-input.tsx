/**
 * Per-column-type value input for the filter rule builder. Boolean → Any/True/
 * False; select → single/multi; date → native date input (no heavy date-picker
 * peer dep — the value is an ISO string `dayjs` parses); number/text → TextField.
 */
import { Box, Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select, Stack, TextField } from '@mui/material';
import type { Column } from '@tanstack/react-table';
import type { ReactElement } from 'react';

import { getColumnOptions, getColumnType, getCustomFilterComponent } from '../../utils/column-helpers';
import type { ColumnFilterRule } from '../../types/filter.types';
import { useLocaleText } from '../../locale/locale-context';

export interface FilterValueInputProps<T> {
    filter: ColumnFilterRule;
    column: Column<T, any>;
    onValueChange: (value: any) => void;
}

const sx = { flex: 1, minWidth: 150 };

export function FilterValueInput<T>({ filter, column, onValueChange }: FilterValueInputProps<T>): ReactElement {
    const locale = useLocaleText();
    const columnType = getColumnType(column);
    const Custom = getCustomFilterComponent(column);
    const options = getColumnOptions(column);
    const operator = filter.operator;

    if (Custom) {
        return (
            <Box sx={sx}>
                <Custom value={filter.value} onChange={onValueChange} filter={filter} column={column} />
            </Box>
        );
    }

    if (columnType === 'boolean') {
        return (
            <FormControl size="small" sx={sx}>
                <InputLabel>{locale.filterValue}</InputLabel>
                <Select value={filter.value || 'any'} label={locale.filterValue} onChange={(e) => onValueChange(e.target.value)}>
                    <MenuItem value="any">{locale.booleanAny}</MenuItem>
                    <MenuItem value="true">{locale.booleanTrue}</MenuItem>
                    <MenuItem value="false">{locale.booleanFalse}</MenuItem>
                </Select>
            </FormControl>
        );
    }

    if (options && options.length > 0) {
        if (operator === 'in' || operator === 'notIn') {
            const current = Array.isArray(filter.value) ? filter.value : [];
            return (
                <FormControl size="small" sx={sx}>
                    <InputLabel>{locale.filterValues}</InputLabel>
                    <Select
                        multiple
                        value={current}
                        label={locale.filterValues}
                        onChange={(e) => onValueChange(e.target.value)}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                    >
                        {options.map((o) => (
                            <MenuItem key={String(o.value)} value={o.value}>
                                <Checkbox checked={current.includes(o.value)} size="small" />
                                <ListItemText primary={o.label} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        }
        return (
            <FormControl size="small" sx={sx}>
                <InputLabel>{locale.filterValue}</InputLabel>
                <Select value={filter.value ?? ''} label={locale.filterValue} onChange={(e) => onValueChange(e.target.value)}>
                    {options.map((o) => (
                        <MenuItem key={String(o.value)} value={o.value}>{o.label}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }

    if (operator === 'between' && (columnType === 'date' || columnType === 'number')) {
        const v = filter.value && typeof filter.value === 'object' ? filter.value : {};
        const isDate = columnType === 'date';
        const fmt = (x: any) => (isDate ? (x ? String(x).slice(0, 10) : '') : (x ?? ''));
        const set = (key: 'from' | 'to', val: string) => onValueChange({ ...v, [key]: val });
        return (
            <Stack direction="row" spacing={1} sx={sx}>
                <TextField
                    size="small"
                    type={isDate ? 'date' : 'number'}
                    label={locale.rangeFrom}
                    InputLabelProps={isDate ? { shrink: true } : undefined}
                    value={fmt(v.from)}
                    onChange={(e) => set('from', e.target.value)}
                    fullWidth
                />
                <TextField
                    size="small"
                    type={isDate ? 'date' : 'number'}
                    label={locale.rangeTo}
                    InputLabelProps={isDate ? { shrink: true } : undefined}
                    value={fmt(v.to)}
                    onChange={(e) => set('to', e.target.value)}
                    fullWidth
                />
            </Stack>
        );
    }

    if (columnType === 'date') {
        return (
            <TextField
                size="small"
                type="date"
                label={locale.filterValue}
                InputLabelProps={{ shrink: true }}
                value={filter.value ? String(filter.value).slice(0, 10) : ''}
                onChange={(e) => onValueChange(e.target.value)}
                sx={sx}
            />
        );
    }

    if (columnType === 'number') {
        return <TextField size="small" type="number" label={locale.filterValue} value={filter.value ?? ''} onChange={(e) => onValueChange(e.target.value)} sx={sx} />;
    }

    return <TextField size="small" label={locale.filterValue} value={filter.value ?? ''} onChange={(e) => onValueChange(e.target.value)} sx={sx} />;
}
