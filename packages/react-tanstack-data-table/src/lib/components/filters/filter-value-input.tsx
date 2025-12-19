import React, { ReactElement } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField, Checkbox, ListItemText, Box, FormControlProps, TextFieldProps, SelectProps, SxProps } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Column } from '@tanstack/react-table';
import moment from 'moment';

import { getColumnOptions, getColumnType, getCustomFilterComponent } from '../../utils/column-helpers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { ColumnFilterRule } from '../../features';

interface FilterValueInputProps<T> {
    filter: ColumnFilterRule;
    column: Column<T, any>;
    onValueChange: (value: any) => void;
    // Enhanced customization props
    formControlProps?: FormControlProps;
    textFieldProps?: TextFieldProps;
    selectProps?: SelectProps;
    datePickerProps?: any;
    containerSx?: SxProps;
    [key: string]: any;
}

export function FilterValueInput<T>(props: FilterValueInputProps<T>): ReactElement {
    const {
        filter,
        column,
        onValueChange,
        formControlProps,
        textFieldProps,
        selectProps,
        datePickerProps,
        containerSx,
        ...otherProps
    } = props;

    const columnType = getColumnType(column);
    const customComponent = getCustomFilterComponent(column);
    const options = getColumnOptions(column);
    const operator = filter.operator;

    // If custom component is provided, use it
    if (customComponent) {
        const CustomComponent = customComponent;
        return (
            <Box sx={containerSx}>
                <CustomComponent
                    value={filter.value}
                    onChange={onValueChange}
                    filter={filter}
                    column={column}
                    {...otherProps}
                />
            </Box>
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
                    ...containerSx,
                }}
                {...formControlProps}
            >
                <InputLabel>Value</InputLabel>
                <Select
                    value={filter.value || 'any'}
                    label="Value"
                    onChange={(e) => onValueChange(e.target.value)}
                    {...selectProps}
                >
                    <MenuItem
                        key={'any'}
                        value={'any'}
                    >
                        Any
                    </MenuItem>
                    <MenuItem
                        key={'true'}
                        value={'true'}
                    >
                        True
                    </MenuItem>
                    <MenuItem
                        key={'false'}
                        value={'false'}
                    >
                        False
                    </MenuItem>
                </Select>
            </FormControl>
        );
    }

    // Select type with options
    if (options && options.length > 0) {
        // Multi-select for 'in' operator
        if (operator === 'in') {
            const currentValue = Array.isArray(filter.value) ? filter.value : [];
            
            return (
                <FormControl 
                    size="small" 
                    sx={{ 
                        flex: 1, 
                        minWidth: 120,
                        ...containerSx,
                    }}
                    {...formControlProps}
                >
                    <InputLabel>Values</InputLabel>
                    <Select
                        multiple
                        value={currentValue}
                        label="Values"
                        onChange={(e) => onValueChange(e.target.value)}
                        renderValue={(selected) => (selected as string[]).join(', ')}
                        {...selectProps}
                    >
                        {options.map(option => (
                            <MenuItem key={String(option.value)} value={option.value}>
                                <Checkbox checked={currentValue.includes(option.value)} />
                                <ListItemText primary={option.label} />
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        }
        // Single select for other operators
        return (
            <FormControl 
                size="small" 
                sx={{ 
                    flex: 1, 
                    minWidth: 120,
                    ...containerSx,
                }}
                {...formControlProps}
            >
                <InputLabel>Value</InputLabel>
                <Select
                    value={filter.value}
                    label="Value"
                    onChange={(e) => onValueChange(e.target.value)}
                    {...selectProps}
                >
                    {options.map(option => (
                        <MenuItem key={String(option.value)} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }

    // Date type
    if (columnType === 'date') {
        // Only single date picker, no 'between' support
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
                                ...containerSx,
                            },
                            ...textFieldProps,
                        },
                    }}
                    {...datePickerProps}
                />
            </LocalizationProvider>
        );
    }

    // Number type
    if (columnType === 'number') {
        // Only single number input, no 'between' support
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
                    ...containerSx,
                }}
                {...textFieldProps}
            />
        );
    }

    // Default: text input
    return (
        <TextField
            size="small"
            label="Value"
            value={filter.value}
            onChange={(e) => onValueChange(e.target.value)}
            sx={{
                flex: 1,
                minWidth: 120,
                ...containerSx,
            }}
            {...textFieldProps}
        />
    );
}
