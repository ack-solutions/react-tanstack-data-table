# Data Table Rebuild Plan — Headless engine + `div`/CSS‑Grid render layer

> **Decision (2026‑06‑12):** Keep the headless TanStack engine. Replace the MUI `<table>`
> render layer with a `<div>` + CSS‑Grid layer, themed with MUI. Rejected MUI X DataGrid
> and AG Grid (bundle weight + features we ship free becoming paid + loss of override control).
>
> **Goals:** fully featured · lightweight · MUI‑style theming · no user limitations ·
> easy to extend/override · all current features stay free.

---

## Status

- **Phase 0 — DONE / validated (2026‑06‑12).** Standalone POC at
  `apps/example/src/docs/features/GridSpikePage.tsx` (nav: "Grid Spike (POC)").
  Proven together on 10,000 rows / 12 columns, no `<table>`:
  div + flex layout · per‑column CSS‑variable widths (`--col-<id>-size`) · resize handles ·
  pinned left **and** right (geometry‑verified sticky to the container edges; Name held an exact
  200px) · row virtualization (~11 rows in the DOM) · fit‑to‑screen coexisting with pinned columns ·
  MUI theming + density + stripes. One real bug surfaced and fixed (translucent stripe bled through
  pinned cells → opaque‑base + tint‑overlay). Typechecks inside the full app; console clean.
  Decision: **flex rows** (not per‑row CSS Grid) — simpler for virtualization + pinning.
- **Next: Phase 1** — port this into the package's presentation components behind `layout="grid"`.

---

## 1. Why (root cause we are fixing)

Today the render layer uses a real HTML `<table>` with `table-layout: fixed` and per‑column
widths set on `<col>`, `<th>` and `<td>` (see `use-data-table-engine.ts` ~L613 and
`data-table-view.tsx`). The browser's table algorithm fights us:

1. `table-layout: fixed` + `width: 100%` **redistributes** widths → `size` is not respected.
2. `min-width` / `max-width` on table cells are **largely ignored** → `minSize`/`maxSize` unreliable.
3. Resize **springs back / moves neighbours** because the table must still total 100%.
4. `columnResizeMode: 'onChange'` **re‑renders every cell** per mousemove → jank.
5. Pinned offsets (from `getSize()`) disagree with rendered widths → **misalignment**.

None of these are fully fixable while using `<table>`. Moving to `div` + CSS gives us direct
control of the box model — exactly how MUI X DataGrid and AG Grid render internally.

---

## 2. Target architecture

```
<DataTable />                         ← public surface (props, slots, apiRef) — keep stable
   │
   ├─ useDataTableEngine()            ← KEEP (brain): TanStack instance, reducer,
   │                                     server fetch, export, selection, the public API
   │
   ├─ Presentation (REBUILD)          ← div + CSS Grid + ARIA roles
   │     GridView · GridHeader · GridRow · GridCell · GridVirtualizer
   │
   └─ Theme layer (NEW contract)      ← CSS variables, defaulting from MUI theme
```

The engine and the public API do **not** change behaviour. Only the presentation + theming change.

### 2.1 Column sizing model (the core fix)

- Compute every column width once per render from TanStack `getSize()` and publish them as
  **CSS custom properties** on the grid root: `--col-<id>-size`, plus pinned start/end offsets.
- Each cell sets `width: var(--col-<id>-size)` (+ `min/max-width` honored because it's a real box).
- **Resize:** write the live width to the CSS variable directly during drag (or derive from
  `columnSizingInfo`) so only one style updates — **no body re‑render**. Commit to React state
  on resize end. This kills the jank and the spring‑back.
- **Fit‑to‑screen:** a flexible track / `flex-grow` spacer fills leftover space, so "fill the
  screen" and "respect fixed + min/max widths" finally coexist.
- **Row layout:** decide in the spike between
  (a) flex rows (`display:flex`, cell `width: var(...)`) — simplest for virtualization/pinning, or
  (b) per‑row CSS Grid (`grid-template-columns` from the size vars) — perfect header/body alignment.
  Leaning (a).
- **Pinned columns:** `position: sticky; left/right: var(--col-<id>-start)` computed from the same
  size vars → pixel‑perfect alignment.

### 2.2 Theming contract ("manage theme like MUI")

Root‑level CSS variables, defaulting from the MUI theme, overridable per‑table:

```
--dt-row-height · --dt-cell-px · --dt-cell-py
--dt-border-color · --dt-header-bg · --dt-header-color
--dt-hover-bg · --dt-selected-bg · --dt-stripe-bg · --dt-font-size
```

Density (compact/small/medium/large) just swaps a token set. Users override via a theme object,
`sx`, or raw CSS vars. Keeps the MUI feel while decoupling enough to not *require* a full MUI theme.

### 2.3 Accessibility

Replace free table semantics with explicit roles: `role="table"` (or `grid` for keyboard nav),
`rowgroup` (header/body), `row`, `columnheader` (+ `aria-sort`), `cell`/`gridcell`,
`aria-rowcount/colcount` + `aria-row/colindex` for virtualization, `aria-selected` on rows.

---

## 3. File map

**New**
- `src/lib/components/grid/grid-view.tsx`
- `src/lib/components/grid/grid-header.tsx`
- `src/lib/components/grid/grid-row.tsx`
- `src/lib/components/grid/grid-cell.tsx`
- `src/lib/components/grid/grid-virtualizer.tsx`
- `src/lib/components/grid/use-column-sizing-vars.ts`  (builds the CSS‑var map)
- `src/lib/theme/data-table-theme.ts`                   (token contract + MUI defaults)

**Changed**
- `src/lib/components/data-table-view.tsx`  — branch on `layout` prop
- `src/lib/types/data-table.types.ts`       — add `layout?: 'grid' | 'table'`, theme override prop
- Keep `components/headers/*` and `components/rows/*` (table mode) until the default flips.

**Unchanged (behaviour)**
- `src/lib/hooks/use-data-table-engine.ts`  (optional internal split in Phase 5)
- features, toolbar, pagination, export, contexts, the public API.

---

## 4. Phases & definition of done

| Phase | Scope | Done when |
|---|---|---|
| **0 — Spike** | Prototype CSS‑Grid layout + CSS‑var resize + pinned + virtualization together. Pick flex vs grid. Lock theme token contract. | Resize is smooth on 50+ cols / 1k rows with no body re‑render; pinned aligns to the pixel. |
| **1 — Render layer (flagged)** | `GridView/Header/Row/Cell` with ARIA roles; widths via CSS vars; fit‑to‑screen; `layout` prop (default still `table`). | Engine wired unchanged; a column grid renders and matches feature parity for static display. |
| **2 — Resize/pin/sticky/virtualize** | CSS‑var resize, pinned offsets, sticky header/footer, `translateY` virtualization (drop `<tr>` spacers). | All four behave correctly together; no spring‑back; min/max respected. |
| **3 — Theming** | Density tokens, dark mode, RTL, documented overrides. | Visual parity with current MUI look; users can restyle via tokens/sx. |
| **4 — Lightweight pass** | `moment`→`dayjs`/`date-fns`; `lodash`→native/per‑method; `rxjs`→tiny debounce; `xlsx`→dynamic import. | Measured bundle drop; Excel code only loads on export. |
| **5 — Extensibility & API polish** | Slots for every part; expose `table` + `apiRef`; document extension points. Optional: split the 1557‑line engine hook into feature hooks. | Every sub‑part overridable; docs cover override/extend. |
| **6 — Migrate & flip** | Update docs/examples, visual + interaction + a11y tests, flip `layout` default to `grid`, deprecate table path, major version. | Green CI; new default ships; table path marked deprecated. |

---

## 5. Lightweight pass (current heavy deps)

| Dep | Issue | Action |
|---|---|---|
| `moment` | large, maintenance mode | → `dayjs` or `date-fns` |
| `lodash` | full import | → per‑method / native |
| `rxjs` | ~heavy for a debounce | → tiny internal debounce |
| `xlsx` (SheetJS) | heavy | → **dynamic import**, load only on Excel export |

---

## 6. Risks & mitigations

- **Resize perf / re‑renders** → CSS‑var write during drag; validate in Phase 0 spike.
- **Virtualization × sticky header × pinned** interplay → prototyped together in Phase 0.
- **Losing MUI cell density/borders "for free"** → reproduced via the theme token contract.
- **A11y regression vs native table** → explicit roles + automated a11y tests.
- **Back‑compat** → `layout` flag; keep table path until the default flip (major version).

---

## 7. Testing

- Existing engine/feature tests keep passing (engine untouched).
- Add interaction tests: resize, pin, reorder, keyboard nav, selection.
- Add a11y assertions (roles, `aria-sort`, selection state).
- `apps/example`: a `layout` toggle playground for manual + visual checks.
