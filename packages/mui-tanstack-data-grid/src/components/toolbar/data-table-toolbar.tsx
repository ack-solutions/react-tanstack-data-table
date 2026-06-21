/**
 * DataTableToolbar — surfaces engine capabilities as UI: a collapsible global
 * search (expands on click), column filters, column visibility, density, export
 * (CSV/Excel), refresh, reset, plus a caller `extraFilter` slot on the right.
 * Each control drives the headless engine through `engine.api` / `engine.actions`.
 */
import CheckOutlined from '@mui/icons-material/CheckOutlined';
import DensityLargeOutlined from '@mui/icons-material/DensityLargeOutlined';
import DensityMediumOutlined from '@mui/icons-material/DensityMediumOutlined';
import DensitySmallOutlined from '@mui/icons-material/DensitySmallOutlined';
import {
    Box,
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
import type { DataTableToolbarControls } from '../../types/data-table.types';
import type { UseDataTableResult } from '../../core/use-data-table';
import {
    ClearFeatherIcon,
    ColumnsFeatherIcon,
    DensityFeatherIcon,
    ExportFeatherIcon,
    RefreshFeatherIcon,
    ResetFeatherIcon,
    SearchFeatherIcon,
} from '../icons';
import { GridToolbar } from '../grid/styled';
import { ColumnFilterControl } from './column-filter-control';
import { ColumnsPanel } from './columns-panel';
import { ViewsControl } from './views-control';
import { useLocaleText } from '../../locale/locale-context';

export interface DataTableToolbarProps<T> {
    engine: UseDataTableResult<T>;
    enableGlobalFilter?: boolean;
    enableColumnFilter?: boolean;
    enableColumnVisibility?: boolean;
    enableColumnPinning?: boolean;
    enableColumnReordering?: boolean;
    enableExport?: boolean;
    enableDensitySelector?: boolean;
    enableReset?: boolean;
    enableRefresh?: boolean;
    enableSavedViews?: boolean;
    extraFilter?: ReactNode;
    searchPlaceholder?: string;
    slots?: Partial<DataTableSlots>;
    renderToolbar?: (controls: DataTableToolbarControls) => ReactNode;
}

const DENSITY_ICON: Record<DataTableDensity, ComponentType<{ fontSize?: 'small' }>> = {
    compact: DensitySmallOutlined,
    standard: DensityMediumOutlined,
    comfortable: DensityLargeOutlined,
};

// Shared modern menu surface: rounded, lightly elevated, sensible min width.
const menuSlotProps = { paper: { elevation: 3, sx: { mt: 0.75, borderRadius: 2, minWidth: 200 } } } as const;

/** Collapsible search: a Search icon that expands to a field (auto-focus, clear, auto-collapse when empty). */
function ToolbarSearch(props: {
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    SearchIcon: ComponentType<{ fontSize?: 'small' }>;
    ClearIcon: ComponentType<{ fontSize?: 'small' }>;
}): ReactNode {
    const { value, onChange, placeholder, SearchIcon, ClearIcon } = props;
    const locale = useLocaleText();
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
                <Tooltip title={locale.toolbarSearch}>
                    <IconButton size="small" onClick={() => setOpen(true)} aria-label={locale.toolbarSearch}>
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
                                <IconButton size="small" edge="end" aria-label={locale.clearSearch} onClick={() => { onChange(''); setOpen(false); }}>
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
        enableColumnReordering,
        enableExport,
        enableDensitySelector,
        enableReset,
        enableRefresh,
        enableSavedViews,
        extraFilter,
        searchPlaceholder,
        slots,
        renderToolbar,
    } = props;

    const SearchIcon = slots?.searchIcon ?? SearchFeatherIcon;
    const ClearIcon = slots?.clearIcon ?? ClearFeatherIcon;
    const DensityIcon = slots?.densityIcon ?? DensityFeatherIcon;
    const ColumnsIcon = slots?.columnsIcon ?? ColumnsFeatherIcon;
    const ExportIcon = slots?.exportIcon ?? ExportFeatherIcon;
    const RefreshIcon = slots?.refreshIcon ?? RefreshFeatherIcon;
    const ResetIcon = slots?.resetIcon ?? ResetFeatherIcon;

    const { api, derived, actions } = engine;
    const locale = engine.localeText;
    const densityLabel: Record<DataTableDensity, string> = {
        compact: locale.densityCompact,
        standard: locale.densityStandard,
        comfortable: locale.densityComfortable,
    };
    const [search, setSearch] = useState(engine.state.globalFilter || '');
    const [colAnchor, setColAnchor] = useState<HTMLElement | null>(null);
    const [densityAnchor, setDensityAnchor] = useState<HTMLElement | null>(null);
    const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null);

    const onSearch = (value: string) => {
        setSearch(value);
        api.filtering.setGlobalFilter(value);
    };

    const hasActionGroup = enableColumnFilter || enableColumnVisibility || enableColumnPinning || enableColumnReordering || enableDensitySelector || enableExport;

    // Each built-in control is built once here, so the default layout and a
    // caller's `renderToolbar(controls)` share the exact same elements.
    const searchEl = enableGlobalFilter ? (
        <ToolbarSearch value={search} onChange={onSearch} placeholder={searchPlaceholder ?? locale.searchPlaceholder} SearchIcon={SearchIcon} ClearIcon={ClearIcon} />
    ) : null;

    const extraFilterEl = extraFilter ? <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>{extraFilter}</Box> : null;

    const viewsEl = enableSavedViews ? <ViewsControl engine={engine} slots={slots} /> : null;

    const filterEl = enableColumnFilter ? <ColumnFilterControl engine={engine} slots={slots} /> : null;

    const columnsEl = enableColumnVisibility || enableColumnPinning || enableColumnReordering ? (
        <>
            <Tooltip title={locale.toolbarColumns}>
                <IconButton size="small" onClick={(e) => setColAnchor(e.currentTarget)}>
                    <ColumnsIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <ColumnsPanel
                engine={engine}
                anchorEl={colAnchor}
                open={!!colAnchor}
                onClose={() => setColAnchor(null)}
                enableColumnVisibility={enableColumnVisibility}
                enableColumnPinning={enableColumnPinning}
                enableColumnReordering={enableColumnReordering}
            />
        </>
    ) : null;

    const densityEl = enableDensitySelector ? (
        <>
            <Tooltip title={locale.toolbarDensity}>
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
                            <ListItemText primary={densityLabel[d]} />
                            {selected ? <CheckOutlined fontSize="small" color="primary" sx={{ ml: 2 }} /> : null}
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    ) : null;

    const exportEl = enableExport ? (
        <>
            <Tooltip title={locale.toolbarExport}>
                <IconButton size="small" onClick={(e) => setExportAnchor(e.currentTarget)}>
                    <ExportIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Menu anchorEl={exportAnchor} open={!!exportAnchor} onClose={() => setExportAnchor(null)} slotProps={menuSlotProps}>
                <ListSubheader sx={{ lineHeight: '32px', bgcolor: 'transparent' }}>{locale.exportAs}</ListSubheader>
                <MenuItem onClick={() => { void api.export.exportCSV(); setExportAnchor(null); }}>
                    <ListItemIcon><ExportIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary={locale.exportCSV} secondary=".csv" />
                </MenuItem>
                <MenuItem onClick={() => { void api.export.exportExcel(); setExportAnchor(null); }}>
                    <ListItemIcon><ExportIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary={locale.exportExcel} secondary=".xlsx" />
                </MenuItem>
            </Menu>
        </>
    ) : null;

    const refreshEl = enableRefresh ? (
        <Tooltip title={locale.toolbarRefresh}>
            <IconButton size="small" onClick={() => api.data.refresh()}>
                <RefreshIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    ) : null;

    const resetEl = enableReset ? (
        <Tooltip title={locale.toolbarReset}>
            <IconButton size="small" onClick={() => api.layout.resetAll()}>
                <ResetIcon fontSize="small" />
            </IconButton>
        </Tooltip>
    ) : null;

    // Caller-controlled layout: hand over the ready-made controls to arrange freely.
    if (renderToolbar) {
        const controls: DataTableToolbarControls = {
            search: searchEl,
            views: viewsEl,
            filter: filterEl,
            columns: columnsEl,
            density: densityEl,
            export: exportEl,
            refresh: refreshEl,
            reset: resetEl,
            extraFilter: extraFilterEl,
        };
        return <GridToolbar>{renderToolbar(controls)}</GridToolbar>;
    }

    return (
        <GridToolbar>
            {searchEl}
            {viewsEl}
            <Box sx={{ flex: 1 }} />
            {extraFilterEl}
            {filterEl}
            {columnsEl}
            {densityEl}
            {exportEl}
            {hasActionGroup && (enableRefresh || enableReset) ? (
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />
            ) : null}
            {refreshEl}
            {resetEl}
        </GridToolbar>
    );
}
