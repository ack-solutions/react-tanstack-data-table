/**
 * Column-filter control — a Filter button + popover rule builder driven by the
 * engine's ColumnFilterFeature: add/remove rules, per-type operators + value
 * inputs, AND/OR logic, pending → Apply. The badge shows the active filter count.
 */
import AddOutlined from '@mui/icons-material/AddOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import {
    Badge,
    Box,
    Button,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Popover,
    Select,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react';

import { getColumnType, isColumnFilterable } from '../../utils/column-helpers';
import type { ColumnFilterRule } from '../../types/filter.types';
import type { DataTableSlots } from '../../types/slots.types';
import type { UseDataTableResult } from '../../core/use-data-table';
import { FILTER_OPERATORS } from '../filters/operators';
import { FilterValueInput } from '../filters/filter-value-input';

export interface ColumnFilterControlProps<T> {
    engine: UseDataTableResult<T>;
    title?: string;
    slots?: Partial<DataTableSlots>;
}

const NO_VALUE_OPS = ['isEmpty', 'isNotEmpty'];

export function ColumnFilterControl<T extends Record<string, any>>({ engine, title = 'Column Filters', slots }: ColumnFilterControlProps<T>): ReactElement {
    const table = engine.table as any;
    const FilterIcon = slots?.filterIcon ?? FilterListOutlined;
    const AddFilterIcon = slots?.addFilterIcon ?? AddOutlined;
    const ClearIcon = slots?.clearIcon ?? CloseOutlined;
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const open = !!anchor;
    const didAutoAdd = useRef(false);

    const filterState = table.getColumnFilterState?.() ?? { filters: [], logic: 'AND', pendingFilters: [], pendingLogic: 'AND' };
    const filters: ColumnFilterRule[] = filterState.pendingFilters || [];
    const filterLogic: 'AND' | 'OR' = filterState.pendingLogic || 'AND';
    const activeCount = table.getActiveColumnFilters?.()?.length || 0;

    const filterableColumns = useMemo(() => table.getAllLeafColumns().filter((c: any) => isColumnFilterable(c)), [table]);

    const operatorsFor = (columnId: string) => {
        const col = filterableColumns.find((c: any) => c.id === columnId);
        const type = getColumnType(col);
        return (FILTER_OPERATORS as any)[type] || FILTER_OPERATORS.text;
    };

    const addFilter = (columnId?: string, operator?: string) => {
        let op = operator || '';
        if (columnId && !operator) op = operatorsFor(columnId)[0]?.value || 'contains';
        table.addPendingColumnFilter?.(columnId || '', op, '');
    };
    const updateFilter = (id: string, updates: Partial<ColumnFilterRule>) => table.updatePendingColumnFilter?.(id, updates);

    const handleColumnChange = (id: string, newColumnId: string, cur: ColumnFilterRule) => {
        const operators = operatorsFor(newColumnId);
        const valid = operators.some((o: any) => o.value === cur.operator);
        const newOp = valid ? cur.operator : operators[0]?.value || '';
        updateFilter(id, { columnId: newColumnId, operator: newOp, value: NO_VALUE_OPS.includes(newOp) ? '' : cur.value });
    };
    const handleOperatorChange = (id: string, newOp: string, cur: ColumnFilterRule) => {
        updateFilter(id, { operator: newOp, value: NO_VALUE_OPS.includes(newOp) ? '' : cur.value });
    };

    const pendingReady = filters.filter((f) => {
        if (!f.columnId || !f.operator) return false;
        if (NO_VALUE_OPS.includes(f.operator)) return true;
        return f.value != null && String(f.value).trim() !== '';
    }).length;
    const hasApplied = activeCount > 0;
    const canApply = pendingReady > 0 || (filters.length === 0 && hasApplied);

    useEffect(() => {
        if (!open) {
            didAutoAdd.current = false;
            return;
        }
        if (didAutoAdd.current) return;
        didAutoAdd.current = true;
        if (filterableColumns.length && filters.length === 0 && activeCount === 0) {
            const first = filterableColumns[0];
            addFilter(first.id, operatorsFor(first.id)[0]?.value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const close = () => setAnchor(null);
    const apply = () => {
        table.applyPendingColumnFilters?.();
        close();
    };
    const clearAll = () => {
        table.resetColumnFilter?.();
        didAutoAdd.current = true;
        close();
    };

    return (
        <>
            <Tooltip title="Filters">
                <Badge badgeContent={activeCount} color="primary" invisible={activeCount === 0}>
                    <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
                        <FilterIcon fontSize="small" />
                    </IconButton>
                </Badge>
            </Tooltip>
            <Popover
                open={open}
                anchorEl={anchor}
                onClose={close}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { elevation: 3, sx: { mt: 0.75, borderRadius: 2 } } }}
            >
                <Box sx={{ p: 2, minWidth: 440, maxWidth: 640 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>{title}</Typography>
                    <Divider sx={{ mb: 2 }} />

                    {filters.length > 1 ? (
                        <Box sx={{ mb: 2 }}>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>Logic</InputLabel>
                                <Select value={filterLogic} label="Logic" onChange={(e) => table.setPendingFilterLogic?.(e.target.value)}>
                                    <MenuItem value="AND">AND</MenuItem>
                                    <MenuItem value="OR">OR</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    ) : null}

                    <Stack spacing={2} sx={{ mb: 2 }}>
                        {filters.map((filter) => {
                            const selectedColumn = filterableColumns.find((c: any) => c.id === filter.columnId);
                            const operators = filter.columnId ? operatorsFor(filter.columnId) : [];
                            const needsValue = !NO_VALUE_OPS.includes(filter.operator);
                            return (
                                <Stack key={filter.id} direction="row" spacing={1} alignItems="center">
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Column</InputLabel>
                                        <Select value={filter.columnId || ''} label="Column" onChange={(e) => handleColumnChange(filter.id, e.target.value as string, filter)}>
                                            {filterableColumns.map((c: any) => (
                                                <MenuItem key={c.id} value={c.id}>
                                                    {typeof c.columnDef.header === 'string' ? c.columnDef.header : c.id}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Operator</InputLabel>
                                        <Select value={filter.operator || ''} label="Operator" disabled={!filter.columnId} onChange={(e) => handleOperatorChange(filter.id, e.target.value as string, filter)}>
                                            {operators.map((o: any) => (
                                                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {needsValue && selectedColumn ? (
                                        <FilterValueInput filter={filter} column={selectedColumn} onValueChange={(v) => updateFilter(filter.id, { value: v })} />
                                    ) : null}

                                    <IconButton size="small" color="error" onClick={() => table.removePendingColumnFilter?.(filter.id)}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            );
                        })}
                    </Stack>

                    <Button variant="outlined" size="small" startIcon={<AddFilterIcon />} onClick={() => addFilter()} disabled={!filterableColumns.length} sx={{ mb: 2 }}>
                        Add filter
                    </Button>

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {hasApplied ? (
                            <Button variant="outlined" size="small" color="error" onClick={clearAll}>Clear all</Button>
                        ) : null}
                        <Button variant="contained" size="small" onClick={apply} disabled={!canApply}>Apply</Button>
                    </Stack>
                </Box>
            </Popover>
        </>
    );
}
