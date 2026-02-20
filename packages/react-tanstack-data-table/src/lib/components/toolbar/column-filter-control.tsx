import { FilterList } from "@mui/icons-material";
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
    type IconButtonProps,
    type SxProps,
} from "@mui/material";
import React, {
    useMemo,
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactElement,
} from "react";

import { MenuDropdown } from "../droupdown/menu-dropdown";
import { useDataTableContext } from "../../contexts/data-table-context";
import { AddIcon, DeleteIcon } from "../../icons";
import { getColumnType, isColumnFilterable } from "../../utils/column-helpers";
import { getSlotComponent, mergeSlotProps, extractSlotProps } from "../../utils/slot-helpers";
import { FILTER_OPERATORS } from "../filters";
import { FilterValueInput } from "../filters/filter-value-input";
import type { ColumnFilterRule } from "../../features";

export interface ColumnFilterControlProps {
    title?: string;
    titleSx?: SxProps;
    menuSx?: SxProps;

    iconButtonProps?: IconButtonProps;
    badgeProps?: any;

    clearButtonProps?: any;
    applyButtonProps?: any;
    addButtonProps?: any;
    deleteButtonProps?: any;
    logicSelectProps?: any;

    [key: string]: any;
}

/**
 * Small helper component to sync MenuDropdown open state to parent state
 * WITHOUT calling hooks inside render-prop callback.
 */
function OpenStateSync({
    open,
    onChange,
}: {
    open: boolean;
    onChange: (open: boolean) => void;
}) {
    useEffect(() => onChange(open), [open, onChange]);
    return null;
}

export function ColumnFilterControl(props: ColumnFilterControlProps = {}): ReactElement {
    const { table, slots, slotProps } = useDataTableContext();

    const iconSlotProps = extractSlotProps(slotProps, "filterIcon");
    const FilterIconSlot = getSlotComponent(slots, "filterIcon", FilterList);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const didAutoAddRef = useRef(false);

    const filterState =
        table?.getColumnFilterState?.() || ({
            filters: [],
            logic: "AND",
            pendingFilters: [],
            pendingLogic: "AND",
        } as any);

    const filters: ColumnFilterRule[] = filterState.pendingFilters || [];
    const filterLogic: "AND" | "OR" = (filterState.pendingLogic || "AND") as any;

    const activeFiltersCount = table?.getActiveColumnFilters?.()?.length || 0;

    const filterableColumns = useMemo(() => {
        return table?.getAllLeafColumns().filter((column: any) => isColumnFilterable(column)) || [];
    }, [table]);

    const getOperatorsForColumn = useCallback(
        (columnId: string) => {
            const column = filterableColumns.find((col: any) => col.id === columnId);
            const type = getColumnType(column as any);
            return FILTER_OPERATORS[type as keyof typeof FILTER_OPERATORS] || FILTER_OPERATORS.text;
        },
        [filterableColumns]
    );

    const addFilter = useCallback(
        (columnId?: string, operator?: string) => {
            let defaultOperator = operator || "";

            if (columnId && !operator) {
                const column = filterableColumns.find((col: any) => col.id === columnId);
                const columnType = getColumnType(column as any);
                const operators =
                    FILTER_OPERATORS[columnType as keyof typeof FILTER_OPERATORS] || FILTER_OPERATORS.text;
                defaultOperator = operators[0]?.value || "contains";
            }

            table?.addPendingColumnFilter?.(columnId || "", defaultOperator, "");
        },
        [table, filterableColumns]
    );

    const updateFilter = useCallback(
        (filterId: string, updates: Partial<ColumnFilterRule>) => {
            table?.updatePendingColumnFilter?.(filterId, updates);
        },
        [table]
    );

    const removeFilter = useCallback(
        (filterId: string) => {
            table?.removePendingColumnFilter?.(filterId);
        },
        [table]
    );

    const clearAllFilters = useCallback((closeDialog?: () => void) => {
        // Defer all work to avoid long-running click handler (prevents "[Violation] 'click' handler took Xms")
        setTimeout(() => {
            table?.resetColumnFilter?.();
            // Prevent auto-add effect from adding a row when it sees empty state after clear
            didAutoAddRef.current = true;
            closeDialog?.();
        }, 0);
    }, [table]);

    const handleLogicChange = useCallback(
        (newLogic: "AND" | "OR") => {
            table?.setPendingFilterLogic?.(newLogic);
        },
        [table]
    );

    const applyFilters = useCallback(() => {
        table?.applyPendingColumnFilters?.();
    }, [table]);

    const handleApplyFilters = useCallback(
        (closeDialog: () => void) => {
            // Defer so click handler returns immediately (prevents "[Violation] 'click' handler took Xms")
            setTimeout(() => {
                applyFilters();
                closeDialog();
            }, 0);
        },
        [applyFilters]
    );

    const handleColumnChange = useCallback(
        (filterId: string, newColumnId: string, currentFilter: ColumnFilterRule) => {
            const newColumn = filterableColumns.find((col: any) => col.id === newColumnId);
            const columnType = getColumnType(newColumn as any);
            const operators =
                FILTER_OPERATORS[columnType as keyof typeof FILTER_OPERATORS] || FILTER_OPERATORS.text;

            const currentOperatorValid = operators.some((op) => op.value === currentFilter.operator);
            const newOperator = currentOperatorValid ? currentFilter.operator : operators[0]?.value || "";

            updateFilter(filterId, {
                columnId: newColumnId,
                operator: newOperator,
                value: ["isEmpty", "isNotEmpty"].includes(newOperator) ? "" : currentFilter.value,
            });
        },
        [filterableColumns, updateFilter]
    );

    const handleOperatorChange = useCallback(
        (filterId: string, newOperator: string, currentFilter: ColumnFilterRule) => {
            updateFilter(filterId, {
                operator: newOperator,
                value: ["isEmpty", "isNotEmpty"].includes(newOperator) ? "" : currentFilter.value,
            });
        },
        [updateFilter]
    );

    const handleFilterValueChange = useCallback(
        (filterId: string, value: any) => {
            updateFilter(filterId, { value });
        },
        [updateFilter]
    );

    const pendingReadyCount = useMemo(() => {
        return filters.filter((f) => {
            if (!f.columnId || !f.operator) return false;
            if (["isEmpty", "isNotEmpty"].includes(f.operator)) return true;
            return f.value != null && String(f.value).trim() !== "";
        }).length;
    }, [filters]);

    const hasAppliedFilters = activeFiltersCount > 0;
    const hasPendingChanges = pendingReadyCount > 0 || (filters.length === 0 && hasAppliedFilters);

    // Auto-add only once per open. If menu opened with existing filters, mark as processed so
    // "Clear All" doesn't cause a new row to be auto-added when state becomes empty.
    useEffect(() => {
        if (!isMenuOpen) {
            didAutoAddRef.current = false;
            return;
        }
        if (didAutoAddRef.current) return;
        if (!filterableColumns.length) {
            didAutoAddRef.current = true;
            return;
        }
        if (filters.length > 0 || activeFiltersCount > 0) {
            // Already have filters this session; mark processed so clear won't re-trigger auto-add
            didAutoAddRef.current = true;
            return;
        }

        const firstColumn = filterableColumns[0];
        const columnType = getColumnType(firstColumn as any);
        const operators =
            FILTER_OPERATORS[columnType as keyof typeof FILTER_OPERATORS] || FILTER_OPERATORS.text;
        const defaultOperator = operators[0]?.value || "contains";

        didAutoAddRef.current = true;
        addFilter(firstColumn.id, defaultOperator);
    }, [isMenuOpen, filterableColumns, filters.length, activeFiltersCount, addFilter]);

    // Merge props but do NOT spread non-icon props onto IconButton
    const mergedProps = mergeSlotProps(
        { size: "small", sx: { flexShrink: 0 } },
        slotProps?.columnFilterControl || {},
        props
    );

    const {
        badgeProps,
        menuSx,
        title,
        titleSx,
        logicSelectProps,
        clearButtonProps,
        applyButtonProps,
        addButtonProps,
        deleteButtonProps,
        iconButtonProps,
        ...iconButtonRestProps
    } = mergedProps;

    return (
        <MenuDropdown
            anchor={({ isOpen }) => (
                <Box sx={{ display: "inline-flex" }}>
                    {/* sync dropdown open state to our local state */}
                    <OpenStateSync open={isOpen} onChange={setIsMenuOpen} />

                    <Badge
                        badgeContent={activeFiltersCount > 0 ? activeFiltersCount : 0}
                        color="primary"
                        invisible={activeFiltersCount === 0}
                        {...badgeProps}
                    >
                        <IconButton
                            {...(iconButtonRestProps as IconButtonProps)}
                            {...(iconButtonProps as IconButtonProps)}
                        >
                            <FilterIconSlot {...iconSlotProps} />
                        </IconButton>
                    </Badge>
                </Box>
            )}
        >
            {({ handleClose }: { handleClose: (event?: any) => void }) => (
                <Box
                    sx={{
                        p: 2,
                        minWidth: 400,
                        maxWidth: 600,
                        ...(menuSx || {}),
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Typography
                        variant="subtitle2"
                        sx={{
                            mb: 1,
                            ...(titleSx || {}),
                        }}
                    >
                        {title || "Column Filters"}
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    {filters.length > 1 && (
                        <Box sx={{ mb: 2 }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Logic</InputLabel>
                                <Select
                                    value={filterLogic}
                                    label="Logic"
                                    onChange={(e) => handleLogicChange(e.target.value as "AND" | "OR")}
                                    {...logicSelectProps}
                                >
                                    <MenuItem value="AND">AND</MenuItem>
                                    <MenuItem value="OR">OR</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    )}

                    <Stack spacing={2} sx={{ mb: 2 }}>
                        {filters.map((filter) => {
                            const selectedColumn = filterableColumns.find((col: any) => col.id === filter.columnId);
                            const operators = filter.columnId ? getOperatorsForColumn(filter.columnId) : [];
                            const needsValue = !["isEmpty", "isNotEmpty"].includes(filter.operator);

                            return (
                                <Stack key={filter.id} direction="row" spacing={1} alignItems="center">
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Column</InputLabel>
                                        <Select
                                            value={filter.columnId || ""}
                                            label="Column"
                                            onChange={(e) =>
                                                handleColumnChange(filter.id, e.target.value as string, filter)
                                            }
                                        >
                                            {filterableColumns.map((column: any) => (
                                                <MenuItem key={column.id} value={column.id}>
                                                    {typeof column.columnDef.header === "string"
                                                        ? column.columnDef.header
                                                        : column.id}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Operator</InputLabel>
                                        <Select
                                            value={filter.operator || ""}
                                            label="Operator"
                                            onChange={(e) =>
                                                handleOperatorChange(filter.id, e.target.value as string, filter)
                                            }
                                            disabled={!filter.columnId}
                                        >
                                            {operators.map((op: any) => (
                                                <MenuItem key={op.value} value={op.value}>
                                                    {op.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {needsValue && selectedColumn && (
                                        <FilterValueInput
                                            filter={filter}
                                            column={selectedColumn}
                                            onValueChange={(value) => handleFilterValueChange(filter.id, value)}
                                        />
                                    )}

                                    <IconButton
                                        size="small"
                                        onClick={() => removeFilter(filter.id)}
                                        color="error"
                                        {...deleteButtonProps}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            );
                        })}
                    </Stack>

                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => addFilter()}
                        disabled={filterableColumns.length === 0}
                        sx={{ mb: 2 }}
                        {...addButtonProps}
                    >
                        Add Filter
                    </Button>

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {hasAppliedFilters && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    clearAllFilters(handleClose);
                                }}
                                color="error"
                                {...clearButtonProps}
                            >
                                Clear All
                            </Button>
                        )}

                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleApplyFilters(() => handleClose?.())}
                            disabled={!hasPendingChanges}
                            {...applyButtonProps}
                        >
                            Apply
                        </Button>
                    </Stack>
                </Box>
            )}
        </MenuDropdown>
    );
}