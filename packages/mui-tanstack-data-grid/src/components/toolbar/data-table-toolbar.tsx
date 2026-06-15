/**
 * DataTableToolbar — surfaces engine capabilities as UI: a collapsible global
 * search (expands on click), column filters, column visibility, density, export
 * (CSV/Excel), refresh, reset, plus a caller `extraFilter` slot on the right.
 * Each control drives the headless engine through `engine.api` / `engine.actions`.
 */
import AlignHorizontalLeftOutlined from '@mui/icons-material/AlignHorizontalLeftOutlined';
import AlignHorizontalRightOutlined from '@mui/icons-material/AlignHorizontalRightOutlined';
import CheckOutlined from '@mui/icons-material/CheckOutlined';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import DensityLargeOutlined from '@mui/icons-material/DensityLargeOutlined';
import DensityMediumOutlined from '@mui/icons-material/DensityMediumOutlined';
import DensitySmallOutlined from '@mui/icons-material/DensitySmallOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import RestartAltOutlined from '@mui/icons-material/RestartAltOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import ViewColumnOutlined from '@mui/icons-material/ViewColumnOutlined';
import {
    Box,
    Checkbox,
    Collapse,
    Divider,
    IconButton,
    InputAdornment,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    Menu,
    MenuItem,
    TextField,
    Tooltip,
} from '@mui/material';
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';

import type { DataTableDensity } from '../../theme/tokens';
import type { DataTableSlots } from '../../types/slots.types';
import type { UseDataTableResult } from '../../core/use-data-table';
import { GridToolbar } from '../grid/styled';
import { ColumnFilterControl } from './column-filter-control';

export interface DataTableToolbarProps<T> {
    engine: UseDataTableResult<T>;
    enableGlobalFilter?: boolean;
    enableColumnFilter?: boolean;
    enableColumnVisibility?: boolean;
    enableColumnPinning?: boolean;
    enableExport?: boolean;
    enableDensitySelector?: boolean;
    enableReset?: boolean;
    enableRefresh?: boolean;
    extraFilter?: ReactNode;
    searchPlaceholder?: string;
    slots?: Partial<DataTableSlots>;
}

const DENSITY_LABEL: Record<DataTableDensity, string> = {
    compact: 'Compact',
    standard: 'Standard',
    comfortable: 'Comfortable',
};

const DENSITY_ICON: Record<DataTableDensity, ComponentType<{ fontSize?: 'small' }>> = {
    compact: DensitySmallOutlined,
    standard: DensityMediumOutlined,
    comfortable: DensityLargeOutlined,
};

// Shared modern menu surface: rounded, lightly elevated, sensible min width.
const menuSlotProps = { paper: { elevation: 3, sx: { mt: 0.75, borderRadius: 2, minWidth: 200 } } } as const;

const columnLabel = (col: any): string => {
    const header = col.columnDef?.header;
    return typeof header === 'string' && header ? header : col.id;
};

/** Collapsible search: a Search icon that expands to a field (auto-focus, clear, auto-collapse when empty). */
function ToolbarSearch(props: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    SearchIcon: ComponentType<{ fontSize?: 'small' }>;
    ClearIcon: ComponentType<{ fontSize?: 'small' }>;
}): ReactNode {
    const { value, onChange, placeholder, SearchIcon, ClearIcon } = props;
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const hasText = value.length > 0;
    const expanded = open || hasText;

    useEffect(() => {
        if (open) {
            const t = setTimeout(() => inputRef.current?.focus(), 210);
            return () => clearTimeout(t);
        }
    }, [open]);

    return (
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            {!expanded ? (
                <Tooltip title="Search">
                    <IconButton size="small" onClick={() => setOpen(true)} aria-label="Open search">
                        <SearchIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ) : null}
            <Collapse in={expanded} orientation="horizontal" timeout={200} unmountOnExit>
                <TextField
                    inputRef={inputRef}
                    size="small"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={() => { if (!hasText) setOpen(false); }}
                    placeholder={placeholder}
                    sx={{ width: 240, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                        endAdornment: hasText ? (
                            <InputAdornment position="end">
                                <IconButton size="small" edge="end" aria-label="Clear search" onClick={() => { onChange(''); setOpen(false); }}>
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : null,
                    }}
                />
            </Collapse>
        </Box>
    );
}

export function DataTableToolbar<T extends Record<string, any>>(props: DataTableToolbarProps<T>): ReactNode {
    const {
        engine,
        enableGlobalFilter,
        enableColumnFilter,
        enableColumnVisibility,
        enableColumnPinning,
        enableExport,
        enableDensitySelector,
        enableReset,
        enableRefresh,
        extraFilter,
        searchPlaceholder = 'Search…',
        slots,
    } = props;

    const SearchIcon = slots?.searchIcon ?? SearchOutlined;
    const ClearIcon = slots?.clearIcon ?? ClearOutlined;
    const DensityIcon = slots?.densityIcon ?? DensitySmallOutlined;
    const ColumnsIcon = slots?.columnsIcon ?? ViewColumnOutlined;
    const ExportIcon = slots?.exportIcon ?? FileDownloadOutlined;
    const RefreshIcon = slots?.refreshIcon ?? RefreshOutlined;
    const ResetIcon = slots?.resetIcon ?? RestartAltOutlined;

    const { table, api, derived, actions } = engine;
    const [search, setSearch] = useState(engine.state.globalFilter || '');
    const [colAnchor, setColAnchor] = useState<HTMLElement | null>(null);
    const [densityAnchor, setDensityAnchor] = useState<HTMLElement | null>(null);
    const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null);

    const onSearch = (value: string) => {
        setSearch(value);
        api.filtering.setGlobalFilter(value);
    };

    const hasActionGroup = enableColumnFilter || enableColumnVisibility || enableDensitySelector || enableExport;

    return (
        <GridToolbar>
            {enableGlobalFilter ? (
                <ToolbarSearch
                    value={search}
                    onChange={onSearch}
                    placeholder={searchPlaceholder}
                    SearchIcon={SearchIcon}
                    ClearIcon={ClearIcon}
                />
            ) : null}

            <Box sx={{ flex: 1 }} />

            {extraFilter ? <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>{extraFilter}</Box> : null}

            {enableColumnFilter ? <ColumnFilterControl engine={engine} slots={slots} /> : null}

            {enableColumnVisibility || enableColumnPinning ? (
                <>
                    <Tooltip title="Columns">
                        <IconButton size="small" onClick={(e) => setColAnchor(e.currentTarget)}>
                            <ColumnsIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Menu anchorEl={colAnchor} open={!!colAnchor} onClose={() => setColAnchor(null)} slotProps={menuSlotProps}>
                        <ListSubheader sx={{ lineHeight: '32px', bgcolor: 'transparent' }}>Columns</ListSubheader>
                        {table
                            .getAllLeafColumns()
                            // Skip the built-in selection/expander columns (ids start with "_").
                            .filter((col) => !col.id.startsWith('_')
                                && ((enableColumnVisibility && col.getCanHide()) || (enableColumnPinning && col.getCanPin())))
                            .map((col) => {
                                const canHide = !!enableColumnVisibility && col.getCanHide();
                                const canPin = !!enableColumnPinning && col.getCanPin();
                                const pinned = col.getIsPinned();
                                return (
                                    <MenuItem
                                        key={col.id}
                                        dense
                                        disableRipple
                                        onClick={canHide ? () => api.columnVisibility.toggleColumn(col.id) : undefined}
                                        sx={{ gap: 0.5 }}
                                    >
                                        {canHide ? (
                                            <Checkbox edge="start" size="small" checked={col.getIsVisible()} disableRipple sx={{ p: 0.5, mr: 0.5 }} />
                                        ) : null}
                                        <ListItemText primary={columnLabel(col)} sx={{ mr: 2 }} />
                                        {canPin ? (
                                            <Box sx={{ display: 'inline-flex' }} onClick={(e) => e.stopPropagation()}>
                                                <Tooltip title={pinned === 'left' ? 'Unpin' : 'Pin left'}>
                                                    <IconButton
                                                        size="small"
                                                        color={pinned === 'left' ? 'primary' : 'default'}
                                                        onClick={() => (pinned === 'left' ? api.columnPinning.unpinColumn(col.id) : api.columnPinning.pinColumnLeft(col.id))}
                                                    >
                                                        <AlignHorizontalLeftOutlined fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={pinned === 'right' ? 'Unpin' : 'Pin right'}>
                                                    <IconButton
                                                        size="small"
                                                        color={pinned === 'right' ? 'primary' : 'default'}
                                                        onClick={() => (pinned === 'right' ? api.columnPinning.unpinColumn(col.id) : api.columnPinning.pinColumnRight(col.id))}
                                                    >
                                                        <AlignHorizontalRightOutlined fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        ) : null}
                                    </MenuItem>
                                );
                            })}
                    </Menu>
                </>
            ) : null}

            {enableDensitySelector ? (
                <>
                    <Tooltip title="Density">
                        <IconButton size="small" onClick={(e) => setDensityAnchor(e.currentTarget)}>
                            <DensityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Menu anchorEl={densityAnchor} open={!!densityAnchor} onClose={() => setDensityAnchor(null)} slotProps={menuSlotProps}>
                        {(['compact', 'standard', 'comfortable'] as DataTableDensity[]).map((d) => {
                            const Icon = DENSITY_ICON[d];
                            const selected = derived.density === d;
                            return (
                                <MenuItem
                                    key={d}
                                    selected={selected}
                                    onClick={() => {
                                        actions.setDensity(d);
                                        setDensityAnchor(null);
                                    }}
                                >
                                    <ListItemIcon><Icon fontSize="small" /></ListItemIcon>
                                    <ListItemText primary={DENSITY_LABEL[d]} />
                                    {selected ? <CheckOutlined fontSize="small" color="primary" sx={{ ml: 2 }} /> : null}
                                </MenuItem>
                            );
                        })}
                    </Menu>
                </>
            ) : null}

            {enableExport ? (
                <>
                    <Tooltip title="Export">
                        <IconButton size="small" onClick={(e) => setExportAnchor(e.currentTarget)}>
                            <ExportIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Menu anchorEl={exportAnchor} open={!!exportAnchor} onClose={() => setExportAnchor(null)} slotProps={menuSlotProps}>
                        <ListSubheader sx={{ lineHeight: '32px', bgcolor: 'transparent' }}>Export as</ListSubheader>
                        <MenuItem onClick={() => { void api.export.exportCSV(); setExportAnchor(null); }}>
                            <ListItemIcon><ExportIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="CSV" secondary=".csv" />
                        </MenuItem>
                        <MenuItem onClick={() => { void api.export.exportExcel(); setExportAnchor(null); }}>
                            <ListItemIcon><ExportIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Excel" secondary=".xlsx" />
                        </MenuItem>
                    </Menu>
                </>
            ) : null}

            {hasActionGroup && (enableRefresh || enableReset) ? (
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />
            ) : null}

            {enableRefresh ? (
                <Tooltip title="Refresh">
                    <IconButton size="small" onClick={() => api.data.refresh()}>
                        <RefreshIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ) : null}

            {enableReset ? (
                <Tooltip title="Reset">
                    <IconButton size="small" onClick={() => api.layout.resetAll()}>
                        <ResetIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            ) : null}
        </GridToolbar>
    );
}
