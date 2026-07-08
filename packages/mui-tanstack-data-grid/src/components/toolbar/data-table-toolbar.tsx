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
import { useEffect, useRef, useState, type ComponentType, type CSSProperties, type ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

import type { DataTableDensity } from '../../theme/tokens';
import type { DataTableSlots, DataTableSlotProps } from '../../types/slots.types';
import type { DataTableToolbarControls } from '../../types/data-table.types';
import type { UseDataTableResult } from '../../core/use-data-table';
import { resolveSlotProps, mergeSx, joinClassNames } from '../grid/slot-utils';
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
    slotProps?: DataTableSlotProps;
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
    sx?: SxProps<Theme>;
    className?: string;
    style?: CSSProperties;
}): ReactNode {
    // sx/className/style come from `slotProps.searchInput` when the default search
    // is styled (not swapped) — forward them onto the root so that path isn't inert.
    const { value, onChange, placeholder, SearchIcon, ClearIcon, sx, className, style } = props;
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
        <Box className={className} style={style} sx={mergeSx({ display: 'inline-flex', alignItems: 'center' }, sx)}>
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
        slotProps,
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
    // caller's `renderToolbar(controls)` share the exact same elements. Each is
    // swappable via slots.<key> and stylable via slotProps.<key>.
    const SearchInputCtl = slots?.searchInput ?? ToolbarSearch;
    const searchEl = enableGlobalFilter ? (
        <SearchInputCtl value={search} onChange={onSearch} placeholder={searchPlaceholder ?? locale.searchPlaceholder} SearchIcon={SearchIcon} ClearIcon={ClearIcon} {...slotProps?.searchInput} />
    ) : null;

    const extraFilterEl = extraFilter ? <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>{extraFilter}</Box> : null;

    const ViewsCtl = slots?.viewsControl ?? ViewsControl;
    const viewsEl = enableSavedViews ? <ViewsCtl engine={engine} slots={slots} {...slotProps?.viewsControl} /> : null;

    const FilterCtl = slots?.columnFilterControl ?? ColumnFilterControl;
    const filterEl = enableColumnFilter ? <FilterCtl engine={engine} slots={slots} {...slotProps?.columnFilterControl} /> : null;

    const columnsEl = enableColumnVisibility || enableColumnPinning || enableColumnReordering ? (
        slots?.columnVisibilityControl ? (
            <slots.columnVisibilityControl engine={engine} enableColumnVisibility={enableColumnVisibility} enableColumnPinning={enableColumnPinning} enableColumnReordering={enableColumnReordering} icon={ColumnsIcon} {...slotProps?.columnVisibilityControl} />
        ) : (
        <>
            <Tooltip title={locale.toolbarColumns}>
                <IconButton size="small" onClick={(e) => setColAnchor(e.currentTarget)} {...slotProps?.columnVisibilityControl}>
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
        )
    ) : null;

    const densityEl = enableDensitySelector ? (
        slots?.densityControl ? (
            <slots.densityControl density={derived.density} onDensityChange={actions.setDensity} icon={DensityIcon} {...slotProps?.densityControl} />
        ) : (
        <>
            <Tooltip title={locale.toolbarDensity}>
                <IconButton size="small" onClick={(e) => setDensityAnchor(e.currentTarget)} {...slotProps?.densityControl}>
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
        )
    ) : null;

    const exportEl = enableExport ? (
        slots?.exportButton ? (
            <slots.exportButton onExportCSV={() => api.export.exportCSV()} onExportExcel={() => api.export.exportExcel()} icon={ExportIcon} {...slotProps?.exportButton} />
        ) : (
        <>
            <Tooltip title={locale.toolbarExport}>
                <IconButton size="small" onClick={(e) => setExportAnchor(e.currentTarget)} {...slotProps?.exportButton}>
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
        )
    ) : null;

    const refreshEl = enableRefresh ? (
        slots?.refreshButton ? (
            <slots.refreshButton onRefresh={() => api.data.refresh()} icon={RefreshIcon} label={locale.toolbarRefresh} {...slotProps?.refreshButton} />
        ) : (
        <Tooltip title={locale.toolbarRefresh}>
            <IconButton size="small" onClick={() => api.data.refresh()} {...slotProps?.refreshButton}>
                <RefreshIcon fontSize="small" />
            </IconButton>
        </Tooltip>
        )
    ) : null;

    const resetEl = enableReset ? (
        slots?.resetButton ? (
            <slots.resetButton onReset={() => api.layout.resetAll()} icon={ResetIcon} label={locale.toolbarReset} {...slotProps?.resetButton} />
        ) : (
        <Tooltip title={locale.toolbarReset}>
            <IconButton size="small" onClick={() => api.layout.resetAll()} {...slotProps?.resetButton}>
                <ResetIcon fontSize="small" />
            </IconButton>
        </Tooltip>
        )
    ) : null;

    // `slotProps.toolbar` styles the built-in toolbar container (slots.toolbar,
    // which replaces the whole toolbar, is handled one level up in GridView).
    const tb = resolveSlotProps(slotProps, 'toolbar');

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
        return (
            <GridToolbar {...tb.rest} className={joinClassNames(tb.className)} style={tb.style} sx={mergeSx(tb.sx)}>
                {renderToolbar(controls)}
            </GridToolbar>
        );
    }

    return (
        <GridToolbar {...tb.rest} className={joinClassNames(tb.className)} style={tb.style} sx={mergeSx(tb.sx)}>
            {/* All built-in tools left-aligned in a stable order (search first, then
                the column/data controls) — matching the MUI DataGrid toolbar. Only the
                caller's `extraFilter` slot is pushed to the trailing edge. */}
            {searchEl}
            {viewsEl}
            {filterEl}
            {columnsEl}
            {densityEl}
            {exportEl}
            {hasActionGroup && (enableRefresh || enableReset) ? (
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 1 }} />
            ) : null}
            {refreshEl}
            {resetEl}
            {extraFilterEl ? (
                <>
                    <Box sx={{ flex: 1 }} />
                    {extraFilterEl}
                </>
            ) : null}
        </GridToolbar>
    );
}
