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

type DivSlot = ForwardRefExoticComponent<
    HTMLAttributes<HTMLDivElement> & { sx?: SxProps<Theme> } & RefAttributes<HTMLDivElement>
>;

export const GridRoot = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Root' })({
    position: 'relative',
    width: '100%',
    fontSize: 'var(--dt-font-size)',
}) as unknown as DivSlot;

export const GridScroller = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Scroller' })({
    position: 'relative',
    width: '100%',
    overflow: 'auto',
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
    fontWeight: 600,
    color: 'var(--dt-header-color)',
    userSelect: 'none',
}) as unknown as DivSlot;

export const GridBody = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Body' })({}) as unknown as DivSlot;

export const GridRow = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Row' })({
    display: 'flex',
    minHeight: 'var(--dt-row-height)',
    background: 'var(--dt-row-bg)',
    borderBottom: '1px solid var(--dt-border-color)',
}) as unknown as DivSlot;

export const GridCell = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Cell' })({
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
    paddingInline: 'var(--dt-cell-padding-x)',
}) as unknown as DivSlot;

export const GridFooter = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Footer' })({
    borderTop: '1px solid var(--dt-border-color)',
}) as unknown as DivSlot;

export const GridOverlay = styled('div', { name: 'MuiTanstackDataGrid', slot: 'Overlay' })({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    color: 'var(--dt-header-color)',
}) as unknown as DivSlot;
