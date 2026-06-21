/**
 * ColumnMenu — the per-column header "⋮" kebab menu. Surfaces engine features
 * that already exist (sort asc/desc/clear, hide column, autosize) so they are
 * discoverable from the header; it adds NO new engine logic, only calls the
 * imperative `api`. Mirrors ActionsCell's MUI Menu pattern: the trigger is
 * `tabIndex={-1}` (the roving tabindex stays on the header cell, which opens the
 * menu via keyboard Enter), and every handler stops propagation so opening the
 * menu never also fires the cell's sort `onClick`.
 */
import ArrowUpwardOutlined from '@mui/icons-material/ArrowUpwardOutlined';
import ArrowDownwardOutlined from '@mui/icons-material/ArrowDownwardOutlined';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import SyncAltOutlined from '@mui/icons-material/SyncAltOutlined';
import MoreVertOutlined from '@mui/icons-material/MoreVertOutlined';
import { Box, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { useState, type ComponentType, type MouseEvent, type ReactElement } from 'react';
import type { Column } from '@tanstack/react-table';

import type { UseDataTableResult } from '../../core/use-data-table';
import { useLocaleText } from '../../locale/locale-context';

export interface ColumnMenuProps<T> {
    column: Column<T, unknown>;
    engine: UseDataTableResult<T>;
    /** Mirrors the table prop; gates the autosize item (needs `column.getCanResize()` too). */
    enableColumnResizing?: boolean;
    /** Mirrors the table prop; gates the hide item (needs `column.getCanHide()` too). */
    enableColumnVisibility?: boolean;
    icon?: ComponentType<any>;
}

export function ColumnMenu<T>({ column, engine, enableColumnResizing, enableColumnVisibility, icon }: ColumnMenuProps<T>): ReactElement | null {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const locale = useLocaleText();
    const api = engine.api;

    const canSort = column.getCanSort();
    const sorted = column.getIsSorted(); // 'asc' | 'desc' | false
    const canHide = !!enableColumnVisibility && column.getCanHide();
    const canAutosize = !!enableColumnResizing && column.getCanResize() && !column.id.startsWith('_');

    // Nothing actionable → render no kebab at all (keeps the header clean).
    if (!canSort && !canHide && !canAutosize) return null;

    // Don't let the user hide the last visible data column (would blank the grid).
    const visibleDataCols = engine.table.getVisibleLeafColumns().filter((c) => !c.id.startsWith('_'));
    const isLastColumn = visibleDataCols.length <= 1;

    const MoreIcon = icon ?? MoreVertOutlined;
    const close = () => setAnchor(null);
    const run = (e: MouseEvent, fn: () => void) => { e.stopPropagation(); close(); fn(); };
    const menuId = `dt-col-menu-${column.id}`;

    const items: ReactElement[] = [];
    if (canSort) {
        items.push(
            <MenuItem
                key="asc"
                selected={sorted === 'asc'}
                disabled={sorted === 'asc'}
                onClick={(e) => run(e, () => api.sorting.sortColumn(column.id, 'asc'))}
            >
                <ListItemIcon><ArrowUpwardOutlined fontSize="small" /></ListItemIcon>
                <ListItemText>{locale.columnMenuSortAsc}</ListItemText>
            </MenuItem>,
            <MenuItem
                key="desc"
                selected={sorted === 'desc'}
                disabled={sorted === 'desc'}
                onClick={(e) => run(e, () => api.sorting.sortColumn(column.id, 'desc'))}
            >
                <ListItemIcon><ArrowDownwardOutlined fontSize="small" /></ListItemIcon>
                <ListItemText>{locale.columnMenuSortDesc}</ListItemText>
            </MenuItem>,
            <MenuItem
                key="clear"
                disabled={!sorted}
                // Per-column: remove only THIS column's sort (preserves any shift-click
                // multi-sort on other columns). For single-sort this equals clearing all.
                onClick={(e) => run(e, () => api.sorting.setSorting(engine.table.getState().sorting.filter((s) => s.id !== column.id)))}
            >
                <ListItemIcon><ClearOutlined fontSize="small" /></ListItemIcon>
                <ListItemText>{locale.columnMenuClearSort}</ListItemText>
            </MenuItem>,
        );
    }
    if (canSort && (canAutosize || canHide)) items.push(<Divider key="div" />);
    if (canAutosize) {
        items.push(
            <MenuItem key="autosize" onClick={(e) => run(e, () => api.columnResizing.autoSizeColumn(column.id))}>
                <ListItemIcon><SyncAltOutlined fontSize="small" /></ListItemIcon>
                <ListItemText>{locale.columnMenuAutosize}</ListItemText>
            </MenuItem>,
        );
    }
    if (canHide) {
        items.push(
            <MenuItem
                key="hide"
                disabled={isLastColumn}
                onClick={(e) => run(e, () => api.columnVisibility.hideColumn(column.id))}
            >
                <ListItemIcon><VisibilityOffOutlined fontSize="small" /></ListItemIcon>
                <ListItemText>{locale.columnMenuHide}</ListItemText>
            </MenuItem>,
        );
    }

    return (
        <Box
            component="span"
            data-column-menu
            sx={{
                display: 'inline-flex',
                // Quiet by default; revealed on cell hover or keyboard focus (focus-within
                // covers the roving-tabindex cell). Stays in the DOM so it's always clickable.
                opacity: anchor ? 1 : 0,
                transition: 'opacity 120ms',
                '[role="columnheader"]:hover &, [role="columnheader"]:focus-within &': { opacity: 1 },
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <IconButton
                size="small"
                aria-label={locale.columnMenuLabel}
                aria-haspopup="menu"
                aria-expanded={!!anchor}
                aria-controls={anchor ? menuId : undefined}
                tabIndex={-1}
                onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
                sx={{ p: 0.25, '& > svg': { fontSize: 16 } }}
            >
                <MoreIcon fontSize="small" />
            </IconButton>
            <Menu
                id={menuId}
                anchorEl={anchor}
                open={!!anchor}
                onClose={close}
                onClick={(e) => e.stopPropagation()}
                MenuListProps={{ 'aria-label': locale.columnMenuLabel, dense: true }}
                // Cap height so a long menu scrolls instead of overflowing (MUI's recommended
                // "add a max-height"); a fixed px avoids collapsing in a degenerate viewport.
                slotProps={{ paper: { sx: { maxHeight: 360 } } }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {items}
            </Menu>
        </Box>
    );
}
