import { FilterList } from '@mui/icons-material';
import {
    Box,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Button,
    Stack,
    Typography,
    Chip,
    IconButton,
    Divider,
    Badge,
} from '@mui/material';
import { useState, useMemo, useCallback } from 'react';

import { MenuDropdown } from '../../../../menu-dropdown';
import { useDataTableContext } from '../../contexts/data-table-context';
import {
    AddIcon,
    DeleteIcon,
} from '../../icons';
import { getColumnType, isColumnFilterable } from '../../utils/column-helpers';
import { getSlotComponent } from '../../utils/slot-helpers';
import { FILTER_OPERATORS } from '../filters';
import { FilterValueInput } from '../filters/filter-value-input';


export interface ColumnFilterRule {
    id: string;
    columnId: string;
    operator: string;
    value: any;
    columnType?: string;
}


export function ColumnCustomFilterControl() {
    const { table, customColumnsFilter, onChangeCustomColumnsFilter, slots, slotProps } = useDataTableContext();
    const FilterIconSlot = getSlotComponent(slots, 'filterIcon', FilterList);
    const [filters, setFilters] = useState<ColumnFilterRule[]>(customColumnsFilter?.filters || []);
    const [filterLogic, setFilterLogic] = useState<'AND' | 'OR'>('AND');

    const filterableColumns = useMemo(() => {
        return table.getAllLeafColumns()
            .filter(column => isColumnFilterable(column));
    }, [table]);

    const addFilter = useCallback(() => {
        const newFilter: ColumnFilterRule = {
            id: `filter_${Date.now()}`,
            columnId: '',
            operator: '',
            value: '',
        };
        const updatedFilters = [...filters, newFilter];
        setFilters(updatedFilters);
    }, [filters]);

    const updateFilter = useCallback((filterId: string, updates: Partial<ColumnFilterRule>) => {
        const updatedFilters = filters.map(filter => filter.id === filterId ? {
            ...filter,
            ...updates,
        } : filter);
        setFilters(updatedFilters);

        const activeFilters = updatedFilters.filter(f => f.columnId && f.operator);
        if (activeFilters.length > 0 || filters.some(f => f.columnId && f.operator)) {
            onChangeCustomColumnsFilter?.({
                filters: activeFilters,
                logic: filterLogic,
            });
        }
    }, [
        filterLogic,
        filters,
        onChangeCustomColumnsFilter,
    ]);

    const removeFilter = useCallback((filterId: string) => {
        const updatedFilters = filters.filter(filter => filter.id !== filterId);
        setFilters(updatedFilters);

        const activeFilters = updatedFilters.filter(f => f.columnId && f.operator);
        onChangeCustomColumnsFilter?.({
            filters: activeFilters,
            logic: filterLogic,
        });
    }, [
        filterLogic,
        filters,
        onChangeCustomColumnsFilter,
    ]);

    const clearAllFilters = useCallback(() => {
        setFilters([]);
        onChangeCustomColumnsFilter?.({
            filters: [],
            logic: filterLogic,
        });
    }, [filterLogic, onChangeCustomColumnsFilter]);

    const handleLogicChange = useCallback((newLogic: 'AND' | 'OR') => {
        setFilterLogic(newLogic);
        const activeFilters = filters.filter(f => f.columnId && f.operator);
        if (activeFilters.length > 0) {
            onChangeCustomColumnsFilter?.({
                filters: activeFilters,
                logic: newLogic,
            });
        }
    }, [filters, onChangeCustomColumnsFilter]);

    const getOperatorsForColumn = useCallback((columnId: string) => {
        const column = filterableColumns.find(col => col.id === columnId);
        const type = getColumnType(column);
        return FILTER_OPERATORS[type as keyof typeof FILTER_OPERATORS] || FILTER_OPERATORS.text;
    }, [filterableColumns]);

    const activeFiltersCount = filters.filter(f => f.columnId && f.operator).length;

    return (
        <MenuDropdown
            anchor={(
                <Badge
                    variant="dot"
                    color="primary"
                    invisible={activeFiltersCount === 0}
                >
                    <IconButton
                        size="small"
                        color={activeFiltersCount > 0 ? 'primary' : 'default'}
                        sx={{
                            flexShrink: 0,
                        }}
                    >
                        <FilterIconSlot {...slotProps.filterIcon} />
                    </IconButton>
                </Badge>
            )}
        >
            {({ handleClose }) => (
                <Box
                    sx={{
                        p: 2,
                        minWidth: 500,
                        maxWidth: 650,
                    }}
                >
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ mb: 2 }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                        >
                            <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 'bold' }}
                            >
                                Column Filters
                            </Typography>
                            {activeFiltersCount > 0 && (
                                <Chip
                                    size="small"
                                    label={`${activeFiltersCount} active`}
                                    color="primary"
                                    variant="outlined"
                                />
                            )}
                        </Stack>
                        <Stack
                            direction="row"
                            spacing={1}
                        >
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={addFilter}
                            >
                                Add Filter
                            </Button>
                            {filters.length > 0 && (
                                <Button
                                    size="small"
                                    variant="text"
                                    onClick={clearAllFilters}
                                >
                                    Clear All
                                </Button>
                            )}
                        </Stack>
                    </Stack>

                    {/* Logic Selection for Multiple Filters */}
                    {filters.filter(f => f.columnId && f.operator).length > 1 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                            >
                                Filter Logic:
                            </Typography>
                            <Stack
                                direction="row"
                                spacing={1}
                            >
                                <Button
                                    size="small"
                                    variant={filterLogic === 'AND' ? 'contained' : 'outlined'}
                                    onClick={() => handleLogicChange('AND')}
                                >
                                    AND (All conditions)
                                </Button>
                                <Button
                                    size="small"
                                    variant={filterLogic === 'OR' ? 'contained' : 'outlined'}
                                    onClick={() => handleLogicChange('OR')}
                                >
                                    OR (Any condition)
                                </Button>
                            </Stack>
                        </Box>
                    )}

                    <Divider sx={{ mb: 2 }} />

                    {filters.length === 0 ? (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                textAlign: 'center',
                                py: 2,
                            }}
                        >
                            No filters applied. Click "Add Filter" to start.
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {filters.map((filter) => (
                                <Box key={filter.id}>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                    >
                                        <FormControl
                                            size="small"
                                            sx={{ minWidth: 140 }}
                                        >
                                            <InputLabel>Column</InputLabel>
                                            <Select
                                                value={filter.columnId}
                                                label="Column"
                                                onChange={(e) => updateFilter(filter.id, {
                                                    columnId: e.target.value,
                                                    operator: '', // Reset operator when column changes
                                                    value: '', // Reset value when column changes
                                                })}
                                            >
                                                {filterableColumns.map(column => (
                                                    <MenuItem
                                                        key={column.id}
                                                        value={column.id}
                                                    >
                                                        {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl
                                            size="small"
                                            sx={{ minWidth: 160 }}
                                            disabled={!filter.columnId}
                                        >
                                            <InputLabel>Operator</InputLabel>
                                            <Select
                                                value={filter.operator}
                                                label="Operator"
                                                onChange={(e) => updateFilter(filter.id, {
                                                    operator: e.target.value,
                                                    value: '', // Reset value when operator changes
                                                })}
                                            >
                                                {getOperatorsForColumn(filter.columnId).map(op => (
                                                    <MenuItem
                                                        key={op.value}
                                                        value={op.value}
                                                    >
                                                        {op.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {!['isEmpty', 'isNotEmpty'].includes(filter.operator) ? (
                                            <FilterValueInput
                                                filter={filter}
                                                column={filterableColumns.find(col => col.id === filter.columnId)}
                                                onValueChange={(value) => updateFilter(filter.id, { value })}
                                            />
                                        ) : (
                                            <Box sx={{ flex: 1 }} /> /* Spacer when no value input needed */
                                        )}

                                        <IconButton
                                            size="small"
                                            onClick={() => removeFilter(filter.id)}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Stack
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                    >
                        <Button
                            variant="outlined"
                            onClick={handleClose}
                        >
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleClose}
                            disabled={filters.filter(f => f.columnId && f.operator).length === 0}
                        >
                            Apply
                            {' '}
                            {activeFiltersCount}
                            {' '}
                            Filter
                            {activeFiltersCount !== 1 ? 's' : ''}
                            {activeFiltersCount > 1 ? ` (${filterLogic})` : ''}
                        </Button>
                    </Stack>
                </Box>
            )}
        </MenuDropdown>
    );
}
