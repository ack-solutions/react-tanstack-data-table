# @ackplus/mui-tanstack-data-grid

> Successor to **`@ackplus/react-tanstack-data-table`** (now deprecated). Same project & repo, new
> package name to reflect the rebuilt architecture.

A lightweight, fully-featured React **data grid** built on the headless **TanStack Table** engine and
**MUI**:

- **`<div>` / CSS-Grid rendering** — no HTML `<table>`, so column sizing, resize, and pinning are
  reliable and pixel-accurate.
- **Themeable like a MUI component** — inherits your MUI theme; override via `palette.tanstackDataGrid`,
  `components.MuiTanstackDataGrid` (`defaultProps` / `styleOverrides`), `--dt-*` CSS variables, or `sx` —
  exactly like MUI X DataGrid.
- **All features free** — sorting, global + column filtering, pagination, selection + bulk actions,
  pinning, reordering, resizing, row expansion, virtualization, CSV + (lazy) Excel export.
- **Headless escape hatch** — `useDataTable()` for full control without the default UI.

## Status

In development (still private). Docs site and first publish to follow.

Plan & parity tracking: see [`/rebuild`](../../rebuild/PLAN.md).
