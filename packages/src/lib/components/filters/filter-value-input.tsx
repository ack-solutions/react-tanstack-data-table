import { FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Column } from '@tanstack/react-table';
import moment from 'moment';

import { getColumnType } from '../../utils/column-helpers';
import { ColumnFilterRule } from '../toolbar/column-custum-filter-control';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers';


function getColumnOptions(column: Column<any, unknown>): any[] {
    // Check if column has explicit options in meta
    if ((column?.columnDef as any)?.options) {
        return (column?.columnDef as any)?.options || [];
    }

    // Default options for boolean type
    const columnType = getColumnType(column);
    if (columnType === 'boolean') {
        return [
            {
                value: true,
                label: 'Yes',
            },
            {
                value: false,
                label: 'No',
            },
        ];
    }

    return [];
}

function getCustomFilterComponent(column: Column<any, unknown>): any {
    // Check if column has custom filter component in meta
    return (column?.columnDef?.meta as any)?.filterComponent;
}

interface FilterValueInputProps<T> {
    filter: ColumnFilterRule;
    column: Column<T, any>;
    onValueChange: (value: any) => void;
}

export function FilterValueInput<T>({
    filter,
    column,
    onValueChange,
}: FilterValueInputProps<T>) {
    const columnType = getColumnType(column);
    const customComponent = getCustomFilterComponent(column);
    const options = getColumnOptions(column);

    // If custom component is provided, use it
    if (customComponent) {
        const CustomComponent = customComponent;
        return (
            <CustomComponent
                value={filter.value}
                onChange={onValueChange}
                filter={filter}
                column={column}
            />
        );
    }

    // Boolean type - Yes/No select
    if (columnType === 'boolean') {
        return (
            <FormControl
                size="small"
                sx={{
                    flex: 1,
                    minWidth: 120,
                }}
            >
                <InputLabel>Value</InputLabel>
                <Select
                    value={filter.value}
                    label="Value"
                    onChange={(e) => onValueChange(e.target.value)}
                >
                    {options.map(option => (
                        <MenuItem
                            key={String(option.value)}
                            value={option.value}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }

    // Select type with options
    if (columnType === 'select' && options.length > 0) {
        return (
            <FormControl
                size="small"
                sx={{
                    flex: 1,
                    minWidth: 120,
                }}
            >
                <InputLabel>Value</InputLabel>
                <Select
                    value={filter.value}
                    label="Value"
                    onChange={(e) => onValueChange(e.target.value)}
                >
                    {options.map(option => (
                        <MenuItem
                            key={String(option.value)}
                            value={option.value}
                        >
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }
    if (columnType === 'date') {
        return (
            <LocalizationProvider dateAdapter={AdapterMoment}>
            <DatePicker
                value={filter.value ? moment(filter.value) : null}
                onChange={(e) => onValueChange(e?.toDate())}
                slotProps={{
                    textField: {
                        size: 'small',
                        label: 'Value',
                        sx: {
                            flex: 1,
                            minWidth: 120,
                        },
                    },
                }}
            />
            </LocalizationProvider>
        );
    }
    if (columnType === 'number') {
        return (
            <TextField
                size="small"
                label="Value"
                value={filter.value}
                onChange={(e) => onValueChange(e.target.value)}
                type="number"
                sx={{
                    flex: 1,
                    minWidth: 120,
                }}
            />
        );
    }
    return (
        <TextField
            size="small"
            label="Value"
            value={filter.value}
            onChange={(e) => onValueChange(e.target.value)}
            sx={{
                flex: 1,
                minWidth: 120,
            }}
        />
    );
}
