/**
 * ColumnMenu — the per-column header "⋮" kebab menu. Surfaces engine features so
 * they're discoverable from the header; it adds NO new engine logic, only calls the
 * imperative `api`. Structure (mirrors MUI X / AG Grid):
 *   sort · pin · filter · ─── · hide · manage columns
 * shown dynamically by state (the active sort direction / pin side is hidden, its
 * inverse + a clear option appear). Sorting is disabled on non-sortable columns.
 *
 * The trigger is `tabIndex={-1}` (the roving tabindex stays on the header cell, which
 * opens the menu via keyboard Enter), and every handler goes through `run(e, fn)` which
 * stops propagation (so opening/acting never also fires the cell's sort `onClick`) and
 * closes the menu. When the column has an APPLIED filter the kebab stays visible with a
 * red dot. Filter → opens the toolbar filter panel targeting this column; Manage
 * columns → opens the toolbar Columns panel (both via the shared engine `api`).
 */
import ArrowUpwardOutlined from '@mui/icons-material/ArrowUpwardOutlined';
import ArrowDownwardOutlined from '@mui/icons-material/ArrowDownwardOutlined';
import ClearOutlined from '@mui/icons-material/ClearOutlined';
import AlignHorizontalLeftOutlined from '@mui/icons-material/AlignHorizontalLeftOutlined';
import AlignHorizontalRightOutlined from '@mui/icons-material/AlignHorizontalRightOutlined';
import PushPinOutlined from '@mui/icons-material/PushPinOutlined';
import FilterListOutlined from '@mui/icons-material/FilterListOutlined';
import FilterAltOffOutlined from '@mui/icons-material/FilterAltOffOutlined';
import VisibilityOffOutlined from '@mui/icons-material/VisibilityOffOutlined';
import ViewColumnOutlined from '@mui/icons-material/ViewColumnOutlined';
import MoreVertOutlined from '@mui/icons-material/MoreVertOutlined';
import { Badge, Box, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState, type ComponentType, type MouseEvent, type ReactElement } from 'react';
import type { Column } from '@tanstack/react-table';

import type { UseDataTableResult } from '../../core/use-data-table';
import { isColumnFilterable } from '../../utils/column-helpers';
import { useLocaleText } from '../../locale/locale-context';

export interface ColumnMenuProps<T> {
    column: Column<T, unknown>;
    engine: UseDataTableResult<T>;
    /** Mirrors the table prop; gates the Hide item (needs `column.getCanHide()` too). */
    enableColumnVisibility?: boolean;
    /** Mirrors the table prop; gates the Pin items (needs `column.getCanPin()` too). */
    enableColumnPinning?: boolean;
    /**
     * Whether the built-in **Columns** panel exists to open (grid-view computes this from
     * `(enableColumnVisibility || enableColumnPinning)` AND no custom `slots.columnVisibilityControl`).
     * Gates the "Manage columns" item so it's never a dead action.
     */
    enableColumnsPanel?: boolean;
    /**
     * Whether the built-in **Filter** panel exists to open (grid-view computes this from
     * `enableColumnFilter` AND no custom `slots.columnFilterControl`). Gates the "Filter" item.
     */
    enableColumnFilter?: boolean;
    icon?: ComponentType<any>;
}

export function ColumnMenu<T>({
    column,
    engine,
    enableColumnVisibility,
    enableColumnPinning,
    enableColumnsPanel,
    enableColumnFilter,
    icon,
}: ColumnMenuProps<T>): ReactElement | null {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const locale = useLocaleText();
    const api = engine.api;
    const menuHoriz = useTheme().direction === 'rtl' ? 'left' : 'right';

    const canSort = column.getCanSort();
    const sorted = column.getIsSorted(); // 'asc' | 'desc' | false
    const canHide = !!enableColumnVisibility && column.getCanHide();
    const canPin = !!enableColumnPinning && column.getCanPin();
    const pinned = column.getIsPinned(); // 'left' | 'right' | false
    const canFilter = !!enableColumnFilter && isColumnFilterable(column);
    const canManageColumns = !!enableColumnsPanel;
    // APPLIED (not pending) filter → red dot + persistent kebab. getActiveColumnFilters is a
    // custom table method (guarded for safety); it reads state.columnFilter.filters.
    const hasColumnFilter = !!(engine.table as any).getActiveColumnFilters?.()?.some((f: any) => f.columnId === column.id);

    // Nothing actionable → render no kebab at all (keeps the header clean). `hasColumnFilter`
    // keeps the menu (and the dot + Clear filter) available even if `canFilter` is off.
    if (!canSort && !canHide && !canPin && !canFilter && !hasColumnFilter && !canManageColumns) return null;

    // Don't let the user hide the last visible data column (would blank the grid).
    const visibleDataCols = engine.table.getVisibleLeafColumns().filter((c) => !c.id.startsWith('_'));
    const isLastColumn = visibleDataCols.length <= 1;

    const MoreIcon = icon ?? MoreVertOutlined;
    const close = () => setAnchor(null);
    const run = (e: MouseEvent, fn: () => void) => { e.stopPropagation(); close(); fn(); };
    const menuId = `dt-col-menu-${column.id}`;

    // ── Sort group ──────────────────────────────────────────────────────────
    // The active direction is hidden; its inverse + Clear appear (disabled when not sortable).
    const sortGroup: ReactElement[] = [];
    if (sorted !== 'asc') {
        sortGroup.push(
            <MenuItem key="sort-asc" disabled={!canSort} onClick={(e) => run(e, () => api.sorting.sortColumn(column.id, 'asc'))}>
                <ListItemIcon><ArrowUpwardOutlined fontSize="small" /></ListItemIcon>
                <ListItemText>{locale.columnMenuSortAsc}</ListItemText>
            </MenuItem>,
        );
    }
    if (sorted !== 'desc') {
        sortGroup.push(
            <MenuItem key="sort-desc" disabled={!canSort} onClick={(e) => run(e, () => api.sorting.sortColumn(column.id, 'desc'))}>
                <ListItemIcon><ArrowDownwardOutlined fontSize="small" /></ListItemIcon>
                <ListItemText>{locale.columnMenuSortDesc}</ListItemText>
            </MenuItem>,
        );
    }
    if (sorted) {
        sortGroup.push(
            // Per-column: remove only THIS column's sort (preserves shift-click multi-sort on others).
            <MenuItem key="sort-clear" onClick={(e) => run(e, () => api.sorting.setSorting(engine.table.getState().sorting.filter((s) => s.id !== column.id)))}>
                <ListItemIcon><ClearOutlined fontSize="small" /></ListItemIcon>
                <ListItemText>{locale.columnMenuClearSort}</ListItemText>
            </MenuItem>,
        );
    }

    // ── Pin group ───────────────────────────────────────────────────────────
    const pinGroup: ReactElement[] = [];
    if (canPin) {
        if (pinned) {
            pinGroup.push(
                <MenuItem key="unpin" onClick={(e) => run(e, () => api.columnPinning.unpinColumn(column.id))}>
                    <ListItemIcon><PushPinOutlined fontSize="small" /></ListItemIcon>
                    <ListItemText>{locale.columnMenuUnpin}</ListItemText>
                </MenuItem>,
            );
        }
        if (pinned !== 'left') {
            pinGroup.push(
                <MenuItem key="pin-left" onClick={(e) => run(e, () => api.columnPinning.pinColumnLeft(column.id))}>
                    <ListItemIcon><AlignHorizontalLeftOutlined fontSize="small" /></ListItemIcon>
                    <ListItemText>{locale.columnMenuPinLeft}</ListItemText>
                </MenuItem>,
            );
        }
        if (pinned !== 'right') {
            pinGroup.push(
                <MenuItem key="pin-right" onClick={(e) => run(e, () => api.columnPinning.pinColumnRight(column.id))}>
                    <ListItemIcon><AlignHorizontalRightOutlined fontSize="small" /></ListItemIcon>
                    <ListItemText>{locale.columnMenuPinRight}</ListItemText>
                </MenuItem>,
            );
        }
    }

    // ── Filter group ────────────────────────────────────────────────────────
    // "Filter" opens the built-in panel (only when it exists → canFilter); "Clear filter"
    // calls the engine directly (works whenever the column has an applied filter, even under
    // a custom filter control), so a filtered column can always be cleared from the menu.
    const filterGroup: ReactElement[] = [];
    if (canFilter) {
        filterGroup.push(
            <MenuItem key="filter" onClick={(e) => run(e, () => api.filtering.openColumnFilter(column.id))}>
                <ListItemIcon><FilterListOutlined fontSize="small" /></ListItemIcon>
                <ListItemText>{locale.columnMenuFilter}</ListItemText>
            </MenuItem>,
        );
    }
    if (hasColumnFilter) {
        filterGroup.push(
            <MenuItem key="clear-filter" onClick={(e) => run(e, () => api.filtering.clearColumnFilter(column.id))}>
                <ListItemIcon><FilterAltOffOutlined fontSize="small" /></ListItemIcon>
                <ListItemText>{locale.columnMenuClearFilter}</ListItemText>
            </MenuItem>,
        );
    }

    // ── Visibility group (below the divider) ────────────────────────────────
    const visGroup: ReactElement[] = [];
    if (canHide) {
        visGroup.push(
            <MenuItem key="hide" disabled={isLastColumn} onClick={(e) => run(e, () => api.columnVisibility.hideColumn(column.id))}>
                <ListItemIcon><VisibilityOffOutlined fontSize="small" /></ListItemIcon>
                <ListItemText>{locale.columnMenuHide}</ListItemText>
            </MenuItem>,
        );
    }
    if (canManageColumns) {
        visGroup.push(
            <MenuItem key="manage" onClick={(e) => run(e, () => api.columnVisibility.openPanel())}>
                <ListItemIcon><ViewColumnOutlined fontSize="small" /></ListItemIcon>
                <ListItemText>{locale.columnMenuManageColumns}</ListItemText>
            </MenuItem>,
        );
    }

    // Flatten groups with a divider between each non-empty group (no leading/trailing/double).
    const groups = [sortGroup, pinGroup, filterGroup, visGroup].filter((g) => g.length > 0);
    const items: ReactElement[] = [];
    groups.forEach((group, gi) => {
        if (gi > 0) items.push(<Divider key={`div-${gi}`} />);
        items.push(...group);
    });

    return (
        <Box
            component="span"
            data-column-menu
            data-filter-active={hasColumnFilter || undefined}
            sx={{
                display: 'inline-flex',
                // Quiet by default; revealed on hover / keyboard focus, OR kept visible while the
                // menu is open or the column has an active filter (so the red dot always shows).
                opacity: anchor || hasColumnFilter ? 1 : 0,
                transition: 'opacity 120ms',
                '[role="columnheader"]:hover &, [role="columnheader"]:focus-within &': { opacity: 1 },
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <Badge
                color="error"
                overlap="circular"
                variant="dot"
                invisible={!hasColumnFilter}
                // Small, tucked into the ⋮ corner (the default dot is oversized on a 16px glyph).
                sx={{ '& .MuiBadge-badge': { minWidth: 7, height: 7, right: 3, top: 3 } }}
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
            </Badge>
            <Menu
                id={menuId}
                anchorEl={anchor}
                open={!!anchor}
                onClose={close}
                onClick={(e) => e.stopPropagation()}
                MenuListProps={{ 'aria-label': locale.columnMenuLabel, dense: true }}
                // Cap height so a long menu scrolls instead of overflowing; fixed px avoids
                // collapsing in a degenerate viewport.
                slotProps={{ paper: { sx: { maxHeight: 360 } } }}
                anchorOrigin={{ vertical: 'bottom', horizontal: menuHoriz }}
                transformOrigin={{ vertical: 'top', horizontal: menuHoriz }}
            >
                {items}
            </Menu>
        </Box>
    );
}
