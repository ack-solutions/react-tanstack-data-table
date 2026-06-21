/**
 * ActionsCell — renders the per-row actions from `getRowActions(row)` for the
 * auto-generated `_actions` column. Few actions show as inline icon buttons;
 * more (or any without an icon) collapse into an overflow ⋮ menu. Every handler
 * stops propagation so the row's own `onClick` never fires.
 */
import MoreVertOutlined from '@mui/icons-material/MoreVertOutlined';
import { Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { createElement, useState, type ComponentType, type MouseEvent, type ReactElement } from 'react';
import type { Row } from '@tanstack/react-table';

import type { DataTableRowAction } from '../../types/data-table.types';
import { useLocaleText } from '../../locale/locale-context';

export interface ActionsCellProps<T> {
    row: Row<T>;
    getRowActions: (row: Row<T>) => DataTableRowAction<T>[];
    display?: 'icons' | 'menu' | 'auto';
    moreIcon?: ComponentType<any>;
}

export function ActionsCell<T>({ row, getRowActions, display = 'auto', moreIcon }: ActionsCellProps<T>): ReactElement | null {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    const locale = useLocaleText();
    const menuHoriz = useTheme().direction === 'rtl' ? 'left' : 'right';
    const actions = (getRowActions(row) || []).filter((a) => !a.hidden);
    if (!actions.length) return null;

    const useMenu = display === 'menu' || (display === 'auto' && (actions.length > 2 || actions.some((a) => !a.icon)));
    const run = (e: MouseEvent, a: DataTableRowAction<T>) => {
        e.stopPropagation();
        setAnchor(null);
        if (!a.disabled) a.onClick(row);
    };

    if (!useMenu) {
        return (
            <Box sx={{ display: 'inline-flex', gap: 0.25 }} onClick={(e) => e.stopPropagation()}>
                {actions.map((a) => (
                    <Tooltip key={a.label} title={a.label}>
                        <span>
                            <IconButton
                                size="small"
                                color={a.color ?? 'default'}
                                disabled={a.disabled}
                                aria-label={a.label}
                                tabIndex={-1}
                                onClick={(e) => run(e, a)}
                            >
                                {a.icon
                                    ? createElement(a.icon, { fontSize: 'small' })
                                    : <Box component="span" sx={{ fontSize: 12, fontWeight: 600 }}>{a.label.slice(0, 1)}</Box>}
                            </IconButton>
                        </span>
                    </Tooltip>
                ))}
            </Box>
        );
    }

    const MoreIcon = moreIcon ?? MoreVertOutlined;
    return (
        <Box sx={{ display: 'inline-flex' }} onClick={(e) => e.stopPropagation()}>
            <IconButton
                size="small"
                aria-label={locale.rowActions}
                aria-haspopup="menu"
                aria-expanded={!!anchor}
                aria-controls={anchor ? 'dt-row-actions-menu' : undefined}
                tabIndex={-1}
                onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
            >
                <MoreIcon fontSize="small" />
            </IconButton>
            <Menu
                id="dt-row-actions-menu"
                anchorEl={anchor}
                open={!!anchor}
                onClose={() => setAnchor(null)}
                onClick={(e) => e.stopPropagation()}
                MenuListProps={{ 'aria-label': locale.rowActions }}
                anchorOrigin={{ vertical: 'bottom', horizontal: menuHoriz }}
                transformOrigin={{ vertical: 'top', horizontal: menuHoriz }}
            >
                {actions.map((a) => (
                    <MenuItem
                        key={a.label}
                        disabled={a.disabled}
                        onClick={(e) => run(e, a)}
                        sx={a.color && a.color !== 'inherit' ? { color: `${a.color}.main` } : undefined}
                    >
                        {a.icon ? <ListItemIcon sx={{ color: 'inherit' }}>{createElement(a.icon, { fontSize: 'small' })}</ListItemIcon> : null}
                        <ListItemText>{a.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
}
