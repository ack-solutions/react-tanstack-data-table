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

## Install

```bash
npm install @ackplus/mui-tanstack-data-grid
```

Published on npm. Docs: https://ack-solutions.github.io/react-tanstack-data-table/docs/

### Optional peer: `xlsx` (Excel export only)

**CSV export needs nothing extra.** Excel (`.xlsx`) export needs the SheetJS `xlsx`
package, declared as an **optional peer** — install it only if you use Excel export:

```bash
npm install xlsx
```

Why optional: SheetJS abandoned its npm package at `0.18.5` (newer builds ship only from
`cdn.sheetjs.com`), and that version carries two high-severity **parsing** advisories with
no registry fix — so making it a hard dependency would give **every** consumer a
permanently red `npm audit`, even ones that never export a spreadsheet. This grid only
ever *writes* workbooks (`book_new` / `json_to_sheet` / `book_append_sheet` / `write`) and
never parses one, so those advisories are unreachable. `xlsx` is therefore loaded lazily,
only on the Excel path: consumers who don't install it get a clean audit, and triggering an
Excel export without it throws a clear _"install the `xlsx` peer, or export to CSV"_ error
(CSV keeps working). **Please don't move `xlsx` back into `dependencies`** — that
re-introduces the audit noise for all consumers.

## Module formats & build

Shipped as a **dual ESM + CommonJS** package, tree-shakeable, with types:

| Resolved via | Path | Used by |
| --- | --- | --- |
| `exports.import` + `module` | `dist/esm/index.js` | bundlers (Vite, webpack, Rollup, esbuild, Next.js) — ESM, tree-shaken |
| `exports.require` + `main` | `dist/cjs/index.js` | Node `require`, Jest, older toolchains |
| `exports.types` + `types` | `dist/types/index.d.ts` | TypeScript |

The root package stays `"type": "commonjs"` and carries `"sideEffects": false`.

### How the build works

`pnpm build` runs three `tsc` passes plus a finalize step:

```bash
tsc -p tsconfig.cjs.json     # -> dist/cjs   (module: CommonJS)
tsc -p tsconfig.esm.json     # -> dist/esm   (module: ES2020)
tsc -p tsconfig.types.json   # -> dist/types (.d.ts + .d.ts.map only)
node scripts/finalize-dist.mjs
```

`finalize-dist.mjs` drops a tiny `package.json` into each format dir:

- `dist/cjs/package.json` → `{ "type": "commonjs", "sideEffects": false }`
- `dist/esm/package.json` → `{ "type": "module",   "sideEffects": false }`

That marker is what lets the root stay CommonJS while `dist/esm/*.js` is treated as ES modules.

> **Gotcha — both markers must repeat `"sideEffects": false`.** Bundlers resolve `sideEffects` from the
> *closest* `package.json` to a module file. They hit `dist/esm/package.json` first; if it omits the flag
> they fall back to the default ("has side effects"), shadowing the root flag and **silently disabling
> tree-shaking**. (Verified: with the flag, importing one helper bundles to ~227 B; without it, ~6 KB of
> `styled()` calls and icon imports leak in.)

### Icon rule — don't regress

Import MUI icons **per-path only**:

```ts
import Search from '@mui/icons-material/Search';      // ✅ tree-shakeable
import { Search } from '@mui/icons-material';         // ❌ pulls the whole barrel (~2,100 icons)
```

The barrel can't be tree-shaken in the CommonJS build, so it would force every consumer to bundle the
full icon set. Expose icons as [`slots`](https://ack-solutions.github.io/react-tanstack-data-table/docs/features/toolbar#custom-icons)
so consumers can swap in their own. The repo has no ESLint config, so the rule is enforced by a test —
`tests/no-barrel-icons.test.cjs` fails the build if a bare `@mui/icons-material` import reappears.

Plan & parity tracking: see [`/rebuild`](../../rebuild/PLAN.md).
