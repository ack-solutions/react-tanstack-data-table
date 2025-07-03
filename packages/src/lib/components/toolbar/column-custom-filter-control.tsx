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
import { useMemo, useCallback, useEffect } from 'react';

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

    const addFilter = useCallback((columnId?: string, operator?: string) => {
        // If no column specified, use empty (user will select)
        // If column specified, get its appropriate default operator
        let defaultOperator = operator || '';

        if (columnId && !operator) {
            const column = filterableColumns.find(col => col.id === columnId);
            const columnType = getColumnType(column as any);
            const operators = FILTER_OPERATORS[columnType as keyof typeof FILTER_OPERATORS] || FILTER_OPERATORS.text;
            defaultOperator = operators[0]?.value || 'contains';
        }

        table.addPendingColumnFilter?.(columnId || '', defaultOperator, '');
    }, [table, filterableColumns]);

    const handleAddFilter = useCallback(() => {
        addFilter();
    }, [addFilter]);

    const updateFilter = useCallback((filterId: string, updates: Partial<ColumnFilterRule>) => {
        table.updatePendingColumnFilter?.(filterId, updates);
    }, [table]);

    const removeFilter = useCallback((filterId: string) => {
        table.removePendingColumnFilter?.(filterId);
    }, [table]);

    const clearAllFilters = useCallback((closeDialog?: () => void) => {
        // Clear all pending filters
        table.clearAllPendingColumnFilters?.();
        // Immediately apply the clear (which will clear active filters too)
        setTimeout(() => {
            table.applyPendingColumnFilters?.();
            // Close dialog if callback provided
            if (closeDialog) {
                closeDialog();
            }
        }, 0);
    }, [table]);



    // Handle filter logic change (AND/OR)
    const handleLogicChange = useCallback((newLogic: 'AND' | 'OR') => {
        table.setPendingFilterLogic?.(newLogic);
    }, [table]);

    // Apply all pending filters
    const applyFilters = useCallback(() => {
        table.applyPendingColumnFilters?.();
    }, [table]);

    // Handle apply button click
    const handleApplyFilters = useCallback((closeDialog: () => void) => {
        applyFilters();
        closeDialog();
    }, [applyFilters]);

    const getOperatorsForColumn = useCallback((columnId: string) => {
        const column = filterableColumns.find(col => col.id === columnId);
        const type = getColumnType(column as any);
        return FILTER_OPERATORS[type as keyof typeof FILTER_OPERATORS] || FILTER_OPERATORS.text;
    }, [filterableColumns]);

    // Handle column selection change
    const handleColumnChange = useCallback((filterId: string, newColumnId: string, currentFilter: ColumnFilterRule) => {
        const newColumn = filterableColumns.find(col => col.id === newColumnId);
        const columnType = getColumnType(newColumn as any);
        const operators = FILTER_OPERATORS[columnType as keyof typeof FILTER_OPERATORS] || FILTER_OPERATORS.text;

        // Only reset operator if current operator is not valid for new column type
        const currentOperatorValid = operators.some(op => op.value === currentFilter.operator);
        const newOperator = currentOperatorValid ? currentFilter.operator : operators[0]?.value || '';

        updateFilter(filterId, {
            columnId: newColumnId,
            operator: newOperator,
            // Keep the current value unless operator is empty/notEmpty
            value: ['isEmpty', 'isNotEmpty'].includes(newOperator) ? '' : currentFilter.value,
        });
    }, [filterableColumns, updateFilter]);

    // Handle operator selection change
    const handleOperatorChange = useCallback((filterId: string, newOperator: string, currentFilter: ColumnFilterRule) => {
        updateFilter(filterId, {
            operator: newOperator,
            // Only reset value if operator is empty/notEmpty, otherwise preserve it
            value: ['isEmpty', 'isNotEmpty'].includes(newOperator) ? '' : currentFilter.value,
        });
    }, [updateFilter]);

    // Handle filter value change
    const handleFilterValueChange = useCallback((filterId: string, value: any) => {
        updateFilter(filterId, { value });
    }, [updateFilter]);

    // Handle filter removal
    const handleRemoveFilter = useCallback((filterId: string) => {
        removeFilter(filterId);
    }, [removeFilter]);

    // Count pending filters that are ready to apply (have column, operator, and value OR are empty/notEmpty operators)
    const pendingFiltersCount = filters.filter(f => {
        if (!f.columnId || !f.operator) return false;
        // For empty/notEmpty operators, no value is needed
        if (['isEmpty', 'isNotEmpty'].includes(f.operator)) return true;
        // For other operators, value is required
        return f.value && f.value.toString().trim() !== '';
    }).length;

    // Check if we need to show "Clear Applied Filters" button
    const hasAppliedFilters = activeFiltersCount > 0;

    // Determine if there are pending changes that can be applied
    const hasPendingChanges = pendingFiltersCount > 0 || (filters.length === 0 && hasAppliedFilters);

    // Auto-add default filter when opening if no filters exist AND no applied filters
    useEffect(() => {
        if (filters.length === 0 && filterableColumns.length > 0 && activeFiltersCount === 0) {
            const firstColumn = filterableColumns[0];
            const columnType = getColumnType(firstColumn as any);
            const operators = FILTER_OPERATORS[columnType as keyof typeof FILTER_OPERATORS] || FILTER_OPERATORS.text;
            const defaultOperator = operators[0]?.value || 'contains';

            // Add default filter with first column and its first operator
            addFilter(firstColumn.id, defaultOperator);
        }
    }, [filters.length, filterableColumns, addFilter, activeFiltersCount]);

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
                                onClick={handleAddFilter}
                            >
                                Add Filter
                            </Button>
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
                                                onChange={(e) => handleColumnChange(filter.id, e.target.value, filter)}
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
                                                onChange={(e) => handleOperatorChange(filter.id, e.target.value, filter)}
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
                                                onValueChange={(value) => handleFilterValueChange(filter.id, value)}
                                            />
                                        ) : (
                                            <Box sx={{ flex: 1 }} /> /* Spacer when no value input needed */
                                        )}

                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveFilter(filter.id)}
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
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                    >
                        {/* Reset button - show when there are any filters (pending or applied) */}
                        {(hasAppliedFilters || filters.length > 0) && (
                            <Button
                                size="small"
                                variant="text"
                                color="warning"
                                onClick={() => clearAllFilters(handleClose)}
                                startIcon={<DeleteIcon />}
                            >
                                Reset
                            </Button>
                        )}

                        {/* Spacer when no reset button */}
                        {!(hasAppliedFilters || filters.length > 0) && <Box />}

                        {/* Close and Apply buttons */}
                        <Stack
                            direction="row"
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
                                onClick={() => handleApplyFilters(handleClose)}
                                disabled={!hasPendingChanges}
                            >
                                {pendingFiltersCount === 0 && hasAppliedFilters ? 'Clear All Filters' :
                                    `Apply ${pendingFiltersCount} Filter${pendingFiltersCount !== 1 ? 's' : ''}${pendingFiltersCount > 1 ? ` (${filterLogic})` : ''}`
                                }
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            )}
        </MenuDropdown>
    );
}
