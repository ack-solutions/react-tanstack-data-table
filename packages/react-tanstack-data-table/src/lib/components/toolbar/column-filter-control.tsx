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
    IconButton,
    Divider,
    Badge,
    IconButtonProps,
    SxProps,
} from '@mui/material';
import { useMemo, useCallback, useEffect } from 'react';

import { MenuDropdown } from '../droupdown/menu-dropdown';
import { useDataTableContext } from '../../contexts/data-table-context';
import {
    AddIcon,
    DeleteIcon,
} from '../../icons';
import { getColumnType, isColumnFilterable } from '../../utils/column-helpers';
import { getSlotComponent, mergeSlotProps, extractSlotProps } from '../../utils/slot-helpers';
import { FILTER_OPERATORS } from '../filters';
import { FilterValueInput } from '../filters/filter-value-input';
import { ColumnFilterRule } from '../../features';

export interface ColumnFilterControlProps {
    // Allow full customization of any prop
    title?: string;
    titleSx?: SxProps;
    menuSx?: SxProps;
    iconButtonProps?: IconButtonProps;
    badgeProps?: any;
    clearButtonProps?: any;
    applyButtonProps?: any;
    addButtonProps?: any;
    logicSelectProps?: any;
    [key: string]: any;
}

export function ColumnFilterControl(props: ColumnFilterControlProps = {}) {
    const { table, slots, slotProps } = useDataTableContext();
    
    // Extract slot-specific props with enhanced merging
    const iconSlotProps = extractSlotProps(slotProps, 'filterIcon');
    
    const FilterIconSlot = getSlotComponent(slots, 'filterIcon', FilterList);

    // Use the custom feature state from the table - now using pending filters for UI
    const filterState = table?.getColumnFilterState?.() || {
        filters: [],
        logic: 'AND',
        pendingFilters: [],
        pendingLogic: 'AND'
    };

    // Use pending filters for the UI (draft state)
    const filters = filterState.pendingFilters;
    const filterLogic = filterState.pendingLogic;

    // Active filters are the actual applied filters
    const activeFiltersCount = table?.getActiveColumnFilters?.()?.length || 0;

    const filterableColumns = useMemo(() => {
        return table?.getAllLeafColumns()
            .filter(column => isColumnFilterable(column));
    }, [table]);

    const addFilter = useCallback((columnId?: string, operator?: string) => {
        // If no column specified, use empty (user will select)
        // If column specified, get its appropriate default operator
        let defaultOperator = operator || '';

        if (columnId && !operator) {
            const column = filterableColumns?.find(col => col.id === columnId);
            const columnType = getColumnType(column as any);
            const operators = FILTER_OPERATORS[columnType as keyof typeof FILTER_OPERATORS] || FILTER_OPERATORS.text;
            defaultOperator = operators[0]?.value || 'contains';
        }

        table?.addPendingColumnFilter?.(columnId || '', defaultOperator, '');
    }, [table, filterableColumns]);

    const handleAddFilter = useCallback(() => {
        addFilter();
    }, [addFilter]);

    const updateFilter = useCallback((filterId: string, updates: Partial<ColumnFilterRule>) => {
        table?.updatePendingColumnFilter?.(filterId, updates);
    }, [table]);

    const removeFilter = useCallback((filterId: string) => {
        table?.removePendingColumnFilter?.(filterId);
    }, [table]);

    const clearAllFilters = useCallback((closeDialog?: () => void) => {
        // Clear all pending filters
        table?.clearAllPendingColumnFilters?.();
        // Immediately apply the clear (which will clear active filters too)
        setTimeout(() => {
            table?.applyPendingColumnFilters?.();
            // Close dialog if callback provided
            if (closeDialog) {
                closeDialog();
            }
        }, 0);
    }, [table]);

    // Handle filter logic change (AND/OR)
    const handleLogicChange = useCallback((newLogic: 'AND' | 'OR') => {
        table?.setPendingFilterLogic?.(newLogic);
    }, [table]);

    // Apply all pending filters
    const applyFilters = useCallback(() => {
        table?.applyPendingColumnFilters?.();
    }, [table]);

    // Handle apply button click
    const handleApplyFilters = useCallback((closeDialog: () => void) => {
        applyFilters();
        closeDialog();
    }, [applyFilters]);

    const getOperatorsForColumn = useCallback((columnId: string) => {
        const column = filterableColumns?.find(col => col.id === columnId);
        const type = getColumnType(column as any);
        return FILTER_OPERATORS[type as keyof typeof FILTER_OPERATORS] || FILTER_OPERATORS.text;
    }, [filterableColumns]);

    // Handle column selection change
    const handleColumnChange = useCallback((filterId: string, newColumnId: string, currentFilter: ColumnFilterRule) => {
        const newColumn = filterableColumns?.find(col => col.id === newColumnId);
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
        if (filters.length === 0 && filterableColumns && filterableColumns?.length > 0 && activeFiltersCount === 0) {
            const firstColumn = filterableColumns[0];
            const columnType = getColumnType(firstColumn as any);
            const operators = FILTER_OPERATORS[columnType as keyof typeof FILTER_OPERATORS] || FILTER_OPERATORS.text;
            const defaultOperator = operators[0]?.value || 'contains';
            // Add default filter with first column and its first operator
            addFilter(firstColumn?.id, defaultOperator);
        }
    }, [filters.length, filterableColumns, addFilter, activeFiltersCount]);

    // Merge all props for maximum flexibility
    const mergedProps = mergeSlotProps(
        {
            // Default props
            size: 'small',
            sx: { flexShrink: 0 },
        },
        slotProps?.columnFilterControl || {},
        props
    );

    return (
        <MenuDropdown
            anchor={(
                <Badge
                    badgeContent={activeFiltersCount > 0 ? activeFiltersCount : 0}
                    color="primary"
                    invisible={activeFiltersCount === 0}
                    {...mergedProps.badgeProps}
                >
                    <IconButton
                        {...mergedProps}
                    >
                        <FilterIconSlot
                            {...iconSlotProps}
                        />
                    </IconButton>
                </Badge>
            )}
        >
            {({ handleClose }: { handleClose: () => void }) => (
                <Box
                    sx={{
                        p: 2,
                        minWidth: 400,
                        maxWidth: 600,
                        ...mergedProps.menuSx,
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{
                            mb: 1,
                            ...mergedProps.titleSx,
                        }}
                    >
                        {mergedProps.title || 'Column Filters'}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {/* Filter Logic Selection */}
                    {filters.length > 1 && (
                        <Box sx={{ mb: 2 }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Logic</InputLabel>
                                <Select
                                    value={filterLogic}
                                    label="Logic"
                                    onChange={(e) => handleLogicChange(e.target.value as 'AND' | 'OR')}
                                    {...mergedProps.logicSelectProps}
                                >
                                    <MenuItem value="AND">AND</MenuItem>
                                    <MenuItem value="OR">OR</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    )}

                    {/* Filter Rules */}
                    <Stack spacing={2} sx={{ mb: 2 }}>
                        {filters.map((filter) => {
                            const selectedColumn = filterableColumns?.find(col => col.id === filter.columnId);
                            const operators = filter.columnId ? getOperatorsForColumn(filter.columnId) : [];
                            const needsValue = !['isEmpty', 'isNotEmpty'].includes(filter.operator);

                            return (
                                <Stack key={filter.id} direction="row" spacing={1} alignItems="center">
                                    {/* Column Selection */}
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Column</InputLabel>
                                        <Select
                                            value={filter.columnId || ''}
                                            label="Column"
                                            onChange={(e) => handleColumnChange(filter.id, e.target.value, filter)}
                                        >
                                            {filterableColumns?.map(column => (
                                                <MenuItem key={column.id} value={column.id}>
                                                    {typeof column.columnDef.header === 'string'
                                                        ? column.columnDef.header
                                                        : column.id}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* Operator Selection */}
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Operator</InputLabel>
                                        <Select
                                            value={filter.operator || ''}
                                            label="Operator"
                                            onChange={(e) => handleOperatorChange(filter.id, e.target.value, filter)}
                                            disabled={!filter.columnId}
                                        >
                                            {operators.map(op => (
                                                <MenuItem key={op.value} value={op.value}>
                                                    {op.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* Value Input */}
                                    {needsValue && selectedColumn && (
                                        <FilterValueInput
                                            filter={filter}
                                            column={selectedColumn}
                                            onValueChange={(value) => handleFilterValueChange(filter.id, value)}
                                        />
                                    )}

                                                                         {/* Remove Filter Button */}
                                     <IconButton
                                         size="small"
                                         onClick={() => handleRemoveFilter(filter.id)}
                                         color="error"
                                         {...mergedProps.deleteButtonProps}
                                     >
                                         <DeleteIcon fontSize="small" />
                                     </IconButton>
                                </Stack>
                            );
                        })}
                    </Stack>

                                         {/* Add Filter Button */}
                     <Button
                         variant="outlined"
                         size="small"
                         startIcon={<AddIcon />}
                         onClick={handleAddFilter}
                         disabled={!filterableColumns || filterableColumns.length === 0}
                         sx={{ mb: 2 }}
                         {...mergedProps.addButtonProps}
                     >
                         Add Filter
                     </Button>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {hasAppliedFilters && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => clearAllFilters(handleClose)}
                                color="error"
                                {...mergedProps.clearButtonProps}
                            >
                                Clear All
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleApplyFilters(handleClose)}
                            disabled={!hasPendingChanges}
                            {...mergedProps.applyButtonProps}
                        >
                            Apply
                        </Button>
                    </Stack>
                </Box>
            )}
        </MenuDropdown>
    );
}
