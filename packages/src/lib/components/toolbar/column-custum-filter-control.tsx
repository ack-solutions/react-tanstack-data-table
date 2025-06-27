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

import { MenuDropdown } from '../droupdown/menu-dropdown';
import { useDataTableContext } from '../../contexts/data-table-context';
import {
    AddIcon,
    DeleteIcon,
} from '../../icons';
import { getColumnType, isColumnFilterable } from '../../utils/column-helpers';
import { getSlotComponent } from '../../utils/slot-helpers';
import { FILTER_OPERATORS } from '../filters';
import { FilterValueInput } from '../filters/filter-value-input';
import { ColumnFilterRule } from '../../features';


export function ColumnCustomFilterControl() {
    const { table, slots, slotProps } = useDataTableContext();
    const FilterIconSlot = getSlotComponent(slots, 'filterIcon', FilterList);
    
    // Use the custom feature state from the table - now using pending filters for UI
    const customFilterState = table.getCustomColumnFilterState?.() || { 
        filters: [], 
        logic: 'AND',
        pendingFilters: [],
        pendingLogic: 'AND'
    };
    
    // Use pending filters for the UI (draft state)
    const filters = customFilterState.pendingFilters;
    const filterLogic = customFilterState.pendingLogic;
    
    // Active filters are the actual applied filters
    const activeFiltersCount = table.getActiveColumnFilters?.()?.length || 0;

    const filterableColumns = useMemo(() => {
        return table.getAllLeafColumns()
            .filter(column => isColumnFilterable(column));
    }, [table]);

    const addFilter = useCallback(() => {
        table.addPendingColumnFilter?.('', '', '');
    }, [table]);

    const updateFilter = useCallback((filterId: string, updates: Partial<ColumnFilterRule>) => {
        table.updatePendingColumnFilter?.(filterId, updates);
    }, [table]);

    const removeFilter = useCallback((filterId: string) => {
        table.removePendingColumnFilter?.(filterId);
    }, [table]);

    const clearAllFilters = useCallback(() => {
        table.clearAllPendingColumnFilters?.();
    }, [table]);

    const handleLogicChange = useCallback((newLogic: 'AND' | 'OR') => {
        table.setPendingFilterLogic?.(newLogic);
    }, [table]);

    const applyFilters = useCallback(() => {
        table.applyPendingColumnFilters?.();
    }, [table]);

    const getOperatorsForColumn = useCallback((columnId: string) => {
        const column = filterableColumns.find(col => col.id === columnId);
        const type = getColumnType(column as any);
        return FILTER_OPERATORS[type as keyof typeof FILTER_OPERATORS] || FILTER_OPERATORS.text;
    }, [filterableColumns]);

    // Count pending filters that have both column and operator selected
    const pendingFiltersCount = filters.filter(f => f.columnId && f.operator).length;

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
                        <FilterIconSlot {...slotProps?.filterIcon} />
                    </IconButton>
                </Badge>
            )}
        >
            {({ handleClose }: any) => (
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
                    {filters.length > 1 && (
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
                                                column={filterableColumns.find(col => col.id === filter.columnId) as any}
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
                            onClick={(e) => {
                                applyFilters();
                                handleClose();
                            }}
                            disabled={pendingFiltersCount === 0}
                        >
                            Apply
                            {' '}
                            {pendingFiltersCount}
                            {' '}
                            Filter
                            {pendingFiltersCount !== 1 ? 's' : ''}
                            {pendingFiltersCount > 1 ? ` (${filterLogic})` : ''}
                        </Button>
                    </Stack>
                </Box>
            )}
        </MenuDropdown>
    );
}
