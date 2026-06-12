# Data Table v2 — Ground-up Rebuild Plan

> Rebuild the data table from zero as a **lightweight, fully-featured, deeply themeable,
> fully overridable** React grid. Keep the **headless TanStack engine**; render with
> **div + CSS Grid + MUI** (validated in the Phase 0 spike). **All features stay free** —
> no paid tiers, ever. Build the new package **alongside** the current one, test everything
> locally, write **proper docs**, ship a **migration guide**, then cut over publishing.

**Status:** Phase 1 in progress. Phase 0 spike done (`apps/example/.../GridSpikePage.tsx`). New package
`packages/data-table/` scaffolded — config + theming system (tokens, `palette.tanstackDataGrid`,
`MuiTanstackDataGrid` registration, `createDataTableTheme`) + full prop/API/column/slot types. Builds
green; consumer theme-override (`createTheme({ palette.tanstackDataGrid, components.MuiTanstackDataGrid })`)
type-checks. Next: headless core (engine → hooks), then render layer.
**Parity source of truth:** [FEATURE-PARITY.md](FEATURE-PARITY.md) · **Upgrade:** [MIGRATION.md](MIGRATION.md)

---

## 1. Goals & non-negotiables

| # | Goal | How we meet it |
|---|------|----------------|
| 1 | **No feature loss** | Every current capability is tracked in [FEATURE-PARITY.md](FEATURE-PARITY.md) with a "done" gate. |
| 2 | **Lightweight** | Headless core (~14KB TanStack) + thin MUI render layer. Drop `moment`/`rxjs`/full `lodash`; lazy-load `xlsx`. |
| 3 | **Theme like MUI** | Inherits the app's MUI theme; register as a themeable MUI component (`defaultProps` + `styleOverrides`); CSS-variable tokens; `sx` everywhere. |
| 4 | **Fully overridable** | Slots for every part + `slotProps`; per-column renderers; `apiRef`; a headless `useDataTable()` escape hatch. |
| 5 | **All features free** | No license gating. Pinning, reorder, expansion, export, virtualization — all included. |
| 6 | **Proper docs** | Restructured docs site: one page per feature, live demos, auto-generated props/API tables, theming + migration guides. |
| 7 | **Clean prop names** | Consistent naming conventions + a documented old→new map with deprecation aliases. |
| 8 | **Safe migration** | v1 stays publishable until v2 reaches parity; codemod + guide for consumers. |

---

## 2. Package & folder strategy ("start at zero, swap later")

- **New folder** `packages/data-table/` is built from scratch. The current
  `packages/react-tanstack-data-table/` is **left untouched** and remains publishable the whole time.
- During development the new package uses a **temporary npm name** (e.g. `@ackplus/data-table-next`)
  so both can coexist in the pnpm workspace without a name clash.
- The **example app** gets a second nav section ("v2") that imports the new package, so we demo
  v1 and v2 **side by side** and verify parity visually.
- **Local-first:** nothing publishes. We build, run, and test entirely on localhost until parity +
  tests pass.
- **Cutover (final phase):** rename the new package to the **published name**, bump to **v2.0.0**,
  archive/remove the old folder, point CI/release at the new package.

> **Decision needed:** published name & version — keep `@ackplus/react-tanstack-data-table` at **v2.0.0**
> (best for existing users: a plain `npm i …@2`), or rebrand to `@ackplus/data-table`. Recommendation:
> **keep the name, ship v2.** (See decisions at the end.)

---

## 3. Architecture — four clean layers

```
┌──────────────────────────────────────────────────────────────┐
│ <DataTable />  — public component (props · slots · apiRef)     │
├──────────────────────────────────────────────────────────────┤
│ Theme layer   — MUI integration + CSS-variable tokens          │
├──────────────────────────────────────────────────────────────┤
│ Render layer  — div + CSS Grid (Header/Row/Cell/Detail/...)    │   ← from the spike
│                 CSS-var column sizing · pinning · virtualization│
├──────────────────────────────────────────────────────────────┤
│ Headless core — useDataTable(): TanStack instance + features   │   ← logic only
│                 sorting · filtering · pagination · selection ·  │
│                 server fetch · export · column state · apiRef   │
└──────────────────────────────────────────────────────────────┘
```

**Why layered:** the headless core has no DOM, so it's testable and reusable; the render layer is
swappable; the theme layer is isolated. Power users can drop the render layer and use
`useDataTable()` directly — the ultimate "extend/override" escape hatch.

**Core refactor:** the current 1557-line `use-data-table-engine.ts` is split into composable hooks
(`useTableData`, `useServerFetch`, `useSelection`, `useColumnState`, `useExport`, `useTableApi`, …)
that the top-level `useDataTable()` assembles. Behaviour is preserved; maintainability improves.

---

## 4. Theming system — "customize like a MUI component"

**Your MUI theme is the single source of truth.** Every token and override derives from it — you set
colours once in MUI and the grid follows; you never manage the theme twice. A 4-tier model, from
zero-config to total control:

> **This mirrors MUI X DataGrid 1:1.** DataGrid (also div-based) themes via a palette namespace
> (`palette.DataGrid`), component `styleOverrides`/`defaultProps`, `--DataGrid-*` CSS variables, and `sx`.
> We expose the identical surface so consumers override our grid with the **same standard MUI patterns**.

**Tier 1 — Inherit MUI theme (zero config).** Colours, typography, spacing, radius, dark mode and RTL
come straight from the app's `ThemeProvider`. Out of the box the grid looks native to the app.

**Tier 1.5 — Theme palette namespace (set colours once, in the theme).** Like DataGrid's `palette.DataGrid`,
we add `palette.tanstackDataGrid.{ headerBg, borderColor, pinnedBg, rowHoverBg, selectedBg, stripeBg }`.
Every key **defaults from the base palette** (`borderColor` ← `divider`, `rowHoverBg` ← `action.hover`, …),
so it's optional and never a second source of truth:
```ts
createTheme({ palette: { tanstackDataGrid: { headerBg: '#eaeff5', borderColor: '#e3e8ef' } } })
```

**Tier 2 — Theme as a registered MUI component (global).** The grid registers itself with MUI's theme
so consumers style it exactly like `MuiButton`/`MuiDataGrid`:

```ts
createTheme({
  components: {
    MuiTanstackDataGrid: {
      defaultProps: { density: 'compact', striped: true },
      styleOverrides: {
        root:   { '--dt-border-color': '#e3e8ef' },
        header: { fontWeight: 700 },
        cell:   { paddingInline: 12 },
        row:    { '&:hover': { '--dt-row-bg': 'rgba(0,0,0,.03)' } },
      },
    },
  },
})
```

**Tier 3 — Design tokens (CSS variables) that DERIVE from your MUI theme.** Tokens are an *optional*
override surface, not a second theme system. Two kinds:

- **Mechanical (internal plumbing, not theme knobs):** `--col-<id>-size` (column widths — the reason
  resize is smooth and min/max work) and `--dt-row-bg` (per-row background so pinned cells match
  hover/stripe/selected without bleed). Users don't manage these.
- **Themeable (optional, every default comes from MUI):**
  `--dt-border-color` ← `palette.divider` · `--dt-header-bg` ← `palette.background.default` ·
  `--dt-row-bg-hover` ← `palette.action.hover` · `--dt-row-bg-selected` ← `palette.action.selected` ·
  `--dt-cell-padding-x/y` · `--dt-row-height` · `--dt-font-size` · `--dt-radius` ← density + `theme.shape`/`typography`.

Set `palette.divider` in MUI and the table border changes automatically — **no double management**. Set
a `--dt-*` token only to make the table deviate from the rest of the app. Density presets
`compact | standard | comfortable` are token bundles; helper `createDataTableTheme({...})`. If the app
uses MUI's CSS-variables mode, tokens can point straight at `var(--mui-palette-*)` for zero-re-render dark mode.

**Tier 4 — `sx` + slot overrides (per instance).** `sx` on the root, `slotProps.<part>.sx` on any part,
or a full component swap via `slots`. Fine-grained, local, escape-everything.

> This is the "theme like MUI DataGrid / MUI theme component" the brief asks for — tiers 2 & 3 are the
> headline feature.

---

## 5. Extensibility & override surface

| Mechanism | What it customizes | Pattern |
|---|---|---|
| **`slots`** | Replace any sub-component (toolbar, header, row, cell, detail panel, pagination, overlays, every icon) | MUI `slots` pattern |
| **`slotProps`** | Inject props/`sx` into any part without replacing it | MUI `slotProps` pattern |
| **Column renderers** | `cell`, `header`, `filterComponent`, `editComponent`, `aggregationFn` per column | column def |
| **`apiRef`** | Imperative control (data CRUD, selection, sorting, layout, export, …) | MUI DataGrid `apiRef` pattern |
| **`useDataTable()`** | Full headless access — bring your own DOM | headless hook |
| **Custom filter operators** | Add operators / value inputs per column `type` | operator registry |
| **TanStack `_features`** | Inject custom table features (like the built-in selection/column-filter) | documented plugin slot |
| **Theme** | Tiers 1–4 above | MUI + tokens |

Everything is documented with a recipe. Defaults are sensible; nothing is locked.

---

## 6. Prop-name redesign ("proper props name")

**Conventions:** `enableX` = feature toggle · `onXChange` = state callback · `xMode` = client/server ·
`renderX` = render function · plain adjectives (`striped`, `hover`) = visual modifiers · `slotProps` for
component props (no loose `any` prop bags).

**Headline renames** (full list + aliases in [MIGRATION.md](MIGRATION.md)):

| Current (v1) | v2 | Why |
|---|---|---|
| `tableSize` (`'small'\|'medium'`) | `density` (`'compact'\|'standard'\|'comfortable'`) | Matches DataGrid; 3 levels |
| `enableTableSizeControl` | `enableDensitySelector` | Consistent with `density` |
| `enableStickyHeaderOrFooter` | `stickyHeader` (+ `stickyFooter`) | Awkward combined name |
| `enableColumnDragging` | `enableColumnReordering` | Feature, not mechanism |
| `onColumnDragEnd` | `onColumnOrderChange` | `onXChange` convention |
| `renderSubComponent` | `renderDetailPanel` | Clearer; DataGrid parity |
| `enableExpanding` | `enableRowExpansion` | Explicit |
| `bulkActions` | `renderBulkActions` | It's a render fn |
| `enableStripes` | `striped` | Visual modifier |
| `enableHover` | `hover` | Visual modifier |
| `tableProps` / `tableContainerProps` (`any`) | `slotProps.table` / `slotProps.scroller` | Typed, no `any` |
| `totalRow` | `rowCount` | DataGrid parity (server total) |
| `estimateRowHeight` | `estimatedRowHeight` | Grammar |
| `idKey` | `getRowId` (fn) + `idKey` alias | Flexible row identity |
| `emptyMessage` | `noRowsMessage` | Pairs with `noRowsOverlay` slot |
| slot `loadingRow` / `emptyRow` | `loadingOverlay` / `noRowsOverlay` | DataGrid parity |
| slot `table` / `tableContainer` | `grid` / `scroller` | No more HTML-table semantics |

**Cleanups:** the three overlapping filter callbacks (`onColumnFilterChange`, `onColumnFiltersChange`,
`onGlobalFilterChange`) collapse to **`onColumnFilterChange(state, isApplied)`** + **`onGlobalFilterChange`**.
`fitToScreen` stays but is reframed under a unified column-sizing model (`fixed | fit`).

**Deprecation policy:** old names kept as **aliases with a one-time console warning** through the v2.x
line, removed in v3. So a v1 app keeps working, then migrates at its own pace.

---

## 7. Feature parity (every feature accounted for)

Full checklist in [FEATURE-PARITY.md](FEATURE-PARITY.md). Headline coverage — **all carried over**:

- **Data:** client/server modes, `onFetchData`, debounced fetch, CRUD via `apiRef`, refresh/reload/reset.
- **Sorting:** single + multi, client/server.
- **Filtering:** global search; advanced column filters (pending/draft → apply, AND/OR logic, per-type
  operators: text/number/date/boolean/select), custom filter components.
- **Pagination:** client/server, page size, total count.
- **Selection:** single/multi, page vs all (include/exclude), `isRowSelectable`, bulk actions toolbar.
- **Columns:** visibility, reorder (drag), pinning (L/R), resizing, alignment, wrap/ellipsis, types.
- **Rows:** expansion / detail panel, row click, hover, stripes, density.
- **Export:** CSV + Excel, client + server, progress, cancel, concurrency modes, chunking, CSV sanitize,
  per-column export header/value/format, hideInExport.
- **Layout:** sticky header/footer, max-height scroll, fit-to-screen, **row virtualization**.
- **Toolbar:** search, column visibility, column filter, pinning, density, reset, refresh, export, extras.
- **State:** initialState, save/restore layout, controlled callbacks for everything.
- **Infra:** debug logging, slots/slotProps (full), idKey/getRowId, empty/loading states, a11y.

**Improvements layered on parity:** reliable min/max widths · smooth CSS-var resize · pinned pixel-accuracy ·
fit-to-screen + fixed coexisting · keyboard navigation (roving tabindex) · proper ARIA grid roles ·
lazy export · 3-level density.

---

## 8. Docs plan ("make proper docs")

Current docs are ad-hoc. v2 ships a real docs site (keep the Vite example app, restructure it):

**Information architecture**
1. **Getting Started** — install, peer deps, first table, TypeScript setup.
2. **Core Concepts** — data flow, client vs server, controlled vs uncontrolled, the engine.
3. **Features** — one page each (Sorting, Filtering, Pagination, Selection, Pinning, Reordering,
   Resizing, Visibility, Expansion, Virtualization, Export, Toolbar, Bulk actions, Server-side). Each page:
   description → **live demo** → code → **props table** → gotchas.
4. **Theming & Customization** — the 4 tiers, token reference, dark mode, RTL, recipes.
5. **Slots & Overrides** — every slot, with examples.
6. **API Reference** — `apiRef` (all namespaces), `useDataTable()`, column-def reference.
7. **Recipes** — CRUD grid, server pagination + React Query, custom filter operator, master-detail, etc.
8. **Migration v1 → v2** — generated from [MIGRATION.md](MIGRATION.md).
9. **Changelog**.

**Auto-generated tables:** props & API reference tables are generated from the TypeScript types
(typedoc / react-docgen) so docs never drift from code. JSDoc on every public prop becomes the description.

**Tooling:** keep it lightweight — the existing Vite app + structured MDX-style pages + a generated
API-reference step. (No heavy docs framework unless we want hosted search later.)

---

## 9. Lightweight / dependency pass

| Dep (v1) | Action in v2 |
|---|---|
| `moment` | → `dayjs` (or `date-fns`); only for date-filter/format |
| `rxjs` | → tiny internal debounce/subject; drop the dep |
| `lodash` (full) | → per-method imports or native equivalents |
| `xlsx` (SheetJS) | → **dynamic `import()`** — loaded only when Excel export runs |
| `@tanstack/react-table` + `react-virtual` | keep (core) |
| MUI / emotion | keep as peer deps (the themed render layer) |

Goal: meaningfully smaller install + initial bundle; Excel code out of the main chunk.

---

## 10. Roadmap (phases, each independently testable)

| Phase | Deliverable | Done when |
|---|---|---|
| **1 — Scaffold + core** | New package; port engine into split feature hooks + `useDataTable()`; unit tests | Engine tests green; headless table works without DOM |
| **2 — Render + theme** | Port spike → real `Grid*` components; CSS-var sizing/pinning/virtualization; token system + MUI component registration | Renders a themed grid; density + dark mode + RTL work |
| **3 — Feature wiring** | Sorting, filtering (global + column), pagination, selection, reorder, resize, pinning, expansion on the new layer | Parity demos pass for each |
| **4 — Toolbar + export** | Toolbar controls, bulk actions, density/visibility/pinning controls, CSV + lazy Excel export, progress/cancel | Toolbar + export parity |
| **5 — Polish** | Lightweight dep pass, a11y (roles + keyboard nav), RTL, dark mode, perf pass | a11y + perf checks pass |
| **6 — Docs + migration** | Restructured docs site, auto-gen API tables, migration guide, codemod for renames | Docs cover every feature; codemod runs |
| **7 — Cutover** | Side-by-side parity sign-off; rename to published name; v2.0.0; archive v1 | Parity checklist 100%; v2 published from new package |

---

## 11. Testing & parity gate

- **Unit** — engine/features (selection include/exclude, filter operators, server fetch dedupe, export chunking).
- **Interaction** — resize (no spring-back, min/max), pin alignment, reorder, selection, keyboard nav, expansion.
- **A11y** — roles, `aria-sort`/`aria-selected`, focus management (axe).
- **Visual regression** — key states across light/dark/RTL/density.
- **Parity gate** — [FEATURE-PARITY.md](FEATURE-PARITY.md) every row checked + a v1-vs-v2 side-by-side demo before cutover.

---

## 12. Decisions (locked 2026-06-12)

1. **Publishing strategy (LOCKED 2026-06-12):** **same repo**, **new package name**
   `@ackplus/mui-tanstack-data-grid` (folder `packages/mui-tanstack-data-grid/`, v1.0.0), and
   **deprecate** the old `@ackplus/react-tanstack-data-table` on npm. Fresh publish as the latest with new
   docs — standard practice. The name matches the `MuiTanstackDataGrid` theme component. *Supersedes the
   earlier "keep the name, ship v2.0.0" decision.* Migration guide applies old → new across package names.
2. **MUI coupling:** ✅ **MUI render layer + headless `useDataTable()` core** (hybrid). Ships styled with
   MUI and themes like a MUI component; headless escape hatch for non-MUI/advanced users.
3. **Docs tooling:** ✅ **extend the current Vite example app** into the docs site (no new framework).
