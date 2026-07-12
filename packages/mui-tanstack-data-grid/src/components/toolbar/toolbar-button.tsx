/**
 * Shared trigger for every built-in toolbar control, so `toolbarVariant` switches
 * them all consistently:
 *  - `'icon'` (default) — an `IconButton` with a `Tooltip` (compact, icon-only).
 *  - `'text'` — a `Button` (`variant="text"`) with `startIcon` + a visible label,
 *    so the action is self-explanatory for new users.
 *
 * Both render standard MUI components and forward all extra props (`onClick`,
 * `aria-*`, `ref`, `sx`, `slotProps.<key>`, …) onto the underlying button, so a
 * caller can override styling/behaviour exactly as with any MUI button. An optional
 * `badge` (count or dot) is shown in either variant (used by filter / saved-views).
 */
import { Badge, Button, IconButton, Tooltip } from '@mui/material';
import type { ComponentType, ReactElement } from 'react';

import type { ToolbarVariant } from '../../types/data-table.types';

export interface ToolbarButtonProps {
    variant?: ToolbarVariant;
    /** Icon component (a built-in Feather icon, a per-path MUI icon, or a custom one). */
    icon: ComponentType<{ fontSize?: 'small' }>;
    /** Tooltip text (icon variant) and button label (text variant). */
    label: string;
    /** Badge value: a number (shown as a count) or `true` (shown as a dot). */
    badge?: number | boolean;
    [key: string]: any;
}

export function ToolbarButton({ variant = 'icon', icon: Icon, label, badge, ...rest }: ToolbarButtonProps): ReactElement {
    const isDot = badge === true;
    const showBadge = isDot ? badge : typeof badge === 'number' && badge > 0;
    // Compact badge: MUI's default (20px, 0.75rem) swamps a 20px toolbar icon. Shrink the
    // count to ~15px / 10px and the dot to 8px so the icon stays legible under it.
    const badgeSx = isDot
        ? { '& .MuiBadge-badge': { minWidth: 8, height: 8 } }
        : { '& .MuiBadge-badge': { height: 15, minWidth: 15, fontSize: '0.625rem', fontWeight: 700, padding: '0 3px' } };
    const withBadge = (node: ReactElement) =>
        badge === undefined ? node : (
            <Badge color="primary" overlap="circular" variant={isDot ? 'dot' : 'standard'} badgeContent={isDot ? undefined : (badge as number)} invisible={!showBadge} sx={badgeSx}>
                {node}
            </Badge>
        );
    const iconNode = <Icon fontSize="small" />;

    if (variant === 'text') {
        return (
            <Button size="small" color="inherit" startIcon={withBadge(iconNode)} sx={{ textTransform: 'none', flexShrink: 0 }} {...rest}>
                {label}
            </Button>
        );
    }
    return (
        <Tooltip title={label}>
            {/* aria-label before rest → a caller can still override it via slotProps. */}
            <IconButton size="small" aria-label={label} {...rest}>
                {withBadge(iconNode)}
            </IconButton>
        </Tooltip>
    );
}
