/**
 * DataTableToolbar — surfaces engine capabilities as UI: global search, column
 * visibility, density, export (CSV/Excel), refresh, reset. Each control drives
 * the headless engine through `engine.api` / `engine.actions`.
 */
import DensitySmallOutlined from '@mui/icons-material/DensitySmallOutlined';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import RestartAltOutlined from '@mui/icons-material/RestartAltOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import ViewColumnOutlined from '@mui/icons-material/ViewColumnOutlined';
import {
    Box,
    Checkbox,
    Divider,
    IconButton,
    InputAdornment,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
} from '@mui/material';
import { useState, type ReactNode } from 'react';

import type { DataTableDensity } from '../../theme/tokens';
import type { DataTableSlots } from '../../types/slots.types';
import type { UseDataTableResult } from '../../core/use-data-table';
import { ColumnFilterControl } from './column-filter-control';

export interface DataTableToolbarProps<T> {
    engine: UseDataTableResult<T>;
    enableGlobalFilter?: boolean;
    enableColumnFilter?: boolean;
    enableColumnVisibility?: boolean;
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

const columnLabel = (col: any): string => {
    const header = col.columnDef?.header;
    return typeof header === 'string' && header ? header : col.id;
};

export function DataTableToolbar<T extends Record<string, any>>(props: DataTableToolbarProps<T>): ReactNode {
    const {
        engine,
        enableGlobalFilter,
        enableColumnFilter,
        enableColumnVisibility,
        enableExport,
        enableDensitySelector,
        enableReset,
        enableRefresh,
        extraFilter,
        searchPlaceholder = 'Search…',
        slots,
    } = props;

    const SearchIcon = slots?.searchIcon ?? SearchOutlined;
    const DensityIcon = slots?.densityIcon ?? DensitySmallOutlined;
    const ColumnsIcon = slots?.columnsIcon ?? ViewColumnOutlined;
    const ExportIcon = slots?.exportIcon ?? FileDownloadOutlined;
    const RefreshIcon = slots?.refreshIcon ?? RefreshOutlined;
    const ResetIcon = slots?.resetIcon ?? RestartAltOutlined;

    const { table, api, state, derived, actions } = engine;
    const [search, setSearch] = useState(state.globalFilter || '');
    const [colAnchor, setColAnchor] = useState<HTMLElement | null>(null);
    const [densityAnchor, setDensityAnchor] = useState<HTMLElement | null>(null);
    const [exportAnchor, setExportAnchor] = useState<HTMLElement | null>(null);

    const onSearch = (value: string) => {
        setSearch(value);
        api.filtering.setGlobalFilter(value);
    };

    return (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 1, flexWrap: 'wrap', gap: 1 }}>
            {enableGlobalFilter ? (
                <TextField
                    size="small"
                    value={search}
                    onChange={(e) => onSearch(e.target.value)}
                    placeholder={searchPlaceholder}
                    sx={{ minWidth: 220 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
            ) : null}

            {extraFilter}

            <Box sx={{ flex: 1 }} />

            {enableColumnFilter ? <ColumnFilterControl engine={engine} slots={slots} /> : null}

            {enableDensitySelector ? (
                <>
                    <Tooltip title="Density">
                        <IconButton size="small" onClick={(e) => setDensityAnchor(e.currentTarget)}>
                            <DensityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Menu anchorEl={densityAnchor} open={!!densityAnchor} onClose={() => setDensityAnchor(null)}>
                        {(['compact', 'standard', 'comfortable'] as DataTableDensity[]).map((d) => (
                            <MenuItem
                                key={d}
                                selected={derived.density === d}
                                onClick={() => {
                                    actions.setDensity(d);
                                    setDensityAnchor(null);
                                }}
                            >
                                {DENSITY_LABEL[d]}
                            </MenuItem>
                        ))}
                    </Menu>
                </>
            ) : null}

            {enableColumnVisibility ? (
                <>
                    <Tooltip title="Columns">
                        <IconButton size="small" onClick={(e) => setColAnchor(e.currentTarget)}>
                            <ColumnsIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Menu anchorEl={colAnchor} open={!!colAnchor} onClose={() => setColAnchor(null)}>
                        {table
                            .getAllLeafColumns()
                            .filter((col) => col.getCanHide())
                            .map((col) => (
                                <MenuItem key={col.id} dense onClick={() => api.columnVisibility.toggleColumn(col.id)}>
                                    <Checkbox edge="start" size="small" checked={col.getIsVisible()} disableRipple sx={{ p: 0.5 }} />
                                    <ListItemText primary={columnLabel(col)} />
                                </MenuItem>
                            ))}
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
                    <Menu anchorEl={exportAnchor} open={!!exportAnchor} onClose={() => setExportAnchor(null)}>
                        <MenuItem onClick={() => { void api.export.exportCSV(); setExportAnchor(null); }}>
                            <ListItemIcon><ExportIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Export CSV" />
                        </MenuItem>
                        <MenuItem onClick={() => { void api.export.exportExcel(); setExportAnchor(null); }}>
                            <ListItemIcon><ExportIcon fontSize="small" /></ListItemIcon>
                            <ListItemText primary="Export Excel" />
                        </MenuItem>
                    </Menu>
                </>
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

            {(enableColumnVisibility || enableExport || enableDensitySelector) && (enableGlobalFilter || extraFilter) ? (
                <Divider orientation="vertical" flexItem sx={{ mx: 0.5, display: 'none' }} />
            ) : null}
        </Stack>
    );
}
