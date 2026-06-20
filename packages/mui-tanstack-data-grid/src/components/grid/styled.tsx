/**
 * Styled slot primitives. Each uses MUI `styled(..., { name, slot })`, so the
 * grid participates in MUI theming exactly like a built-in component:
 * `components.MuiTanstackDataGrid.styleOverrides.{root,scroller,header,...}`.
 * Visuals read from the `--dt-*` design tokens (which default from the MUI theme).
 *
 * Each export is annotated with `DivSlot` — without an explicit, nameable type the
 * emitted `.d.ts` references pnpm-internal paths (TS2742) and the build fails.
 */
import { styled } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ForwardRefExoticComponent, HTMLAttributes, RefAttributes } from 'react';

import { DT_VARS } from '../../theme/tokens';

type DivSlot = ForwardRefExoticComponent<
    HTMLAttributes<HTMLDivElement> & { sx?: SxProps<Theme> } & RefAttributes<HTMLDivElement>
>;

export const GridRoot = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Root' })(({ theme }) => {
    const p = theme.palette as any;
    // Mode-dependent token defaults. Emitted scheme-conditionally so the grid
    // follows dark mode under MUI `cssVariables: true` + `colorSchemes` (where
    // `palette.mode` no longer reflects the active scheme). Overridable via
    // `palette.tanstackDataGrid.*` or the `--dt-*` variables.
    const darkTokens = {
        [DT_VARS.headerBg]: p.grey[900],
        [DT_VARS.rowBgStripe]: 'rgba(255,255,255,0.03)',
        [DT_VARS.pinnedShadow]: 'rgba(0,0,0,0.5)',
    };
    return {
        position: 'relative',
        // Flex column so the scroller can fill a fixed/`100%` height while the
        // toolbar and footer keep their size — header pins to the top, footer to
        // the bottom, body scrolls between them. Inert in auto-height mode.
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        fontSize: 'var(--dt-font-size)',
        // Self-framing card: a single outer border + rounded corners (consumes the
        // --dt-radius token) so the grid reads as a modern surface, not bare rules.
        backgroundColor: 'var(--dt-pinned-bg)',
        border: '1px solid var(--dt-border-color)',
        borderRadius: 'var(--dt-radius)',
        overflow: 'hidden',
        [DT_VARS.headerBg]: p.grey[50],
        [DT_VARS.rowBgStripe]: 'rgba(0,0,0,0.02)',
        [DT_VARS.pinnedShadow]: 'rgba(0,0,0,0.18)',
        ...(typeof theme.applyStyles === 'function'
            ? theme.applyStyles('dark', darkTokens)
            : p.mode === 'dark'
                ? darkTokens
                : {}),
    };
}) as unknown as DivSlot;

export const GridToolbar = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Toolbar' })({
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
    flexShrink: 0,
    minHeight: 52,
    paddingInline: 12,
    paddingBlock: 8,
    borderBottom: '1px solid var(--dt-border-color)',
}) as unknown as DivSlot;

export const GridScroller = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Scroller' })({
    position: 'relative',
    width: '100%',
    overflow: 'auto',
    // The single growing/shrinking child: fills a fixed-height root and `minHeight:0`
    // lets it shrink below content so the body (not the page) scrolls.
    flex: '1 1 auto',
    minHeight: 0,
}) as unknown as DivSlot;

export const GridHeader = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Header' })({
    position: 'sticky',
    top: 0,
    zIndex: 'var(--dt-z-header)' as unknown as number,
}) as unknown as DivSlot;

export const GridHeaderRow = styled('div', { name: 'MuiTanstackDataGrid', slot: 'HeaderRow' })({
    display: 'flex',
    minHeight: 'var(--dt-header-height)',
    background: 'var(--dt-header-bg)',
    borderBottom: '1px solid var(--dt-border-color)',
}) as unknown as DivSlot;

export const GridHeaderCell = styled('div', { name: 'MuiTanstackDataGrid', slot: 'HeaderCell' })({
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    paddingInline: 'var(--dt-cell-padding-x)',
    fontSize: '0.8125rem',
    fontWeight: 600,
    color: 'var(--dt-header-color)',
    userSelect: 'none',
    // Subtle vertical separators between header columns (design reference).
    '&:not(:first-of-type)': { boxShadow: 'inset 1px 0 0 var(--dt-border-color)' },
}) as unknown as DivSlot;

export const GridBody = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Body' })({}) as unknown as DivSlot;

export const GridRow = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Row' })({
    display: 'flex',
    minHeight: 'var(--dt-row-height)',
    background: 'var(--dt-row-bg)',
    borderBottom: '1px solid var(--dt-border-color)',
    transition: 'background-color 120ms ease',
    // The card's own bottom border closes the grid; drop the last row's rule.
    '&:last-of-type': { borderBottom: 'none' },
}) as unknown as DivSlot;

export const GridCell = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Cell' })({
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    paddingInline: 'var(--dt-cell-padding-x)',
}) as unknown as DivSlot;

// Aggregation summary row — sticks to the bottom of the scroll viewport, above
// the (out-of-scroller) pagination footer. Sits inside the column-sized track so
// its cells align with the data columns and honour pinning.
export const GridFooterRow = styled('div', { name: 'MuiTanstackDataGrid', slot: 'FooterRow' })({
    display: 'flex',
    position: 'sticky',
    bottom: 0,
    zIndex: 'var(--dt-z-header)' as unknown as number,
    minHeight: 'var(--dt-row-height)',
    background: 'var(--dt-header-bg)',
    borderTop: '1px solid var(--dt-border-color)',
    fontWeight: 600,
    fontSize: '0.8125rem',
    color: 'var(--dt-header-color)',
}) as unknown as DivSlot;

export const GridDetailPanel = styled('div', { name: 'MuiTanstackDataGrid', slot: 'DetailPanel' })({
    boxSizing: 'border-box',
    width: '100%',
    padding: 'var(--dt-cell-padding-y) var(--dt-cell-padding-x)',
    background: 'var(--dt-pinned-bg)',
    borderBottom: '1px solid var(--dt-border-color)',
}) as unknown as DivSlot;

export const GridFooter = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Footer' })({
    borderTop: '1px solid var(--dt-border-color)',
    // Held at its natural height so it pins to the bottom while the scroller flexes.
    flexShrink: 0,
    // Tame MUI's <TablePagination> so the footer is robust everywhere it's
    // embedded — including CSS-heavy hosts (Docusaurus, WordPress themes,
    // Tailwind/Bootstrap resets).
    //
    // - Root spans the full width (so it right-aligns and only wraps when the
    //   grid is genuinely narrow, never because the flex row shrink-wrapped it).
    // - overflow:visible kills MUI's private horizontal scrollbar.
    // - Padding aligns with the grid cells (default is a cramped 2px on the right).
    '& .MuiTablePagination-root': { overflow: 'visible', width: '100%' },
    '& .MuiTablePagination-spacer': { display: 'none' },
    '& .MuiTablePagination-toolbar': {
        minHeight: 48,
        paddingInline: 'var(--dt-cell-padding-x)',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        rowGap: 4,
    },
    // Global `p { margin }` (Docusaurus/WordPress/Tailwind) leaks into the
    // pagination labels and balloons the row height — pin them flush.
    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
        margin: 0,
        lineHeight: 1.43,
    },
}) as unknown as DivSlot;

export const GridOverlay = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Overlay' })({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    color: 'var(--dt-header-color)',
}) as unknown as DivSlot;
