# Migration Guide — v1 → v2

v2 keeps the same mental model and the same `apiRef`, but the table now renders as **`<div>` + CSS
Grid** (not an HTML `<table>`), theming is **MUI-native + tokens**, and some props are **renamed for
consistency**. Old names keep working as **deprecated aliases** through the v2.x line (with a one-time
console warning), so you can upgrade gradually.

> **TL;DR:** `npm i @ackplus/react-tanstack-data-table@2`, run the codemod, fix any CSS that targeted
> raw `table`/`td`, and you're done. Most apps need only prop renames.

---

## 1. Install

```bash
npm i @ackplus/react-tanstack-data-table@^2
# peer deps unchanged: @mui/material @emotion/react @emotion/styled @tanstack/react-table
```

---

## 2. What changed at a glance

| Area | v1 | v2 |
|---|---|---|
| Rendering | MUI `<table>` (`table-layout: fixed`) | `<div>` + CSS Grid + ARIA roles |
| Column sizing | unreliable min/max, resize spring-back | exact widths, reliable min/max, smooth resize |
| Theming | `sx` + MUI Table inheritance | MUI theme inherit + **`MuiTanstackDataGrid` component overrides** + **CSS tokens** + `sx` |
| Density | `tableSize: small\|medium` | `density: compact\|standard\|comfortable` |
| Some props | see table below | renamed (aliases kept) |
| Excel export | bundled `xlsx` | lazy-loaded on demand |

---

## 3. Prop renames (aliases kept until v3)

| v1 | v2 | Notes |
|---|---|---|
| `tableSize="small"` | `density="compact"` | small→compact, medium→standard |
| `tableSize="medium"` | `density="standard"` | |
| `enableTableSizeControl` | `enableDensitySelector` | |
| `enableStripes` | `striped` | |
| `enableHover` | `hover` | |
| `enableStickyHeaderOrFooter` | `stickyHeader` | + new `stickyFooter` |
| `enableColumnDragging` | `enableColumnReordering` | |
| `onColumnDragEnd` | `onColumnOrderChange` | same `(order: string[])` payload |
| `enableExpanding` | `enableRowExpansion` | |
| `renderSubComponent` | `renderDetailPanel` | same `(row) => ReactNode` |
| `bulkActions` | `renderBulkActions` | same signature |
| `totalRow` | `rowCount` | server total |
| `estimateRowHeight` | `estimatedRowHeight` | |
| `emptyMessage` | `noRowsMessage` | |
| `tableProps` | `slotProps.grid` | typed, no more `any` |
| `tableContainerProps` | `slotProps.scroller` | typed |
| `idKey="id"` | `getRowId={(r)=>r.id}` | `idKey` still accepted |

**Filter callbacks consolidated:** v1 had `onColumnFilterChange` (draft), `onColumnFiltersChange`
(applied) and `onGlobalFilterChange`. v2 uses **`onColumnFilterChange(state, isApplied)`** +
**`onGlobalFilterChange`**. The old three are aliased.

---

## 4. Before / after

**Density + styling**
```diff
- <DataTable tableSize="small" enableStripes enableHover
-   enableStickyHeaderOrFooter maxHeight={480} />
+ <DataTable density="compact" striped hover
+   stickyHeader maxHeight={480} />
```

**Reorder + expansion + bulk**
```diff
- <DataTable enableColumnDragging onColumnDragEnd={setOrder}
-   enableExpanding renderSubComponent={renderDetail}
-   enableBulkActions bulkActions={(s) => <Actions sel={s} />} />
+ <DataTable enableColumnReordering onColumnOrderChange={setOrder}
+   enableRowExpansion renderDetailPanel={renderDetail}
+   enableBulkActions renderBulkActions={(s) => <Actions sel={s} />} />
```

**Loose prop bags → typed slotProps**
```diff
- <DataTable tableProps={{ sx: { minWidth: 900 } }}
-   tableContainerProps={{ sx: { maxHeight: 500 } }} />
+ <DataTable slotProps={{ grid: { sx: { minWidth: 900 } },
+                          scroller: { sx: { maxHeight: 500 } } }} />
```

**Server total**
```diff
- <DataTable dataMode="server" totalRow={total} onFetchData={fetch} />
+ <DataTable dataMode="server" rowCount={total} onFetchData={fetch} />
```

The `apiRef` API is **unchanged** — `apiRef.current.data.*`, `.selection.*`, `.export.*`, etc. all keep
their names and signatures. `saveLayout()`/`restoreLayout()`/`getTableState()` now return **typed**
objects instead of `any`.

---

## 5. Visual / behaviour changes to check

1. **CSS that targeted the DOM table.** If you styled `.MuiTable-root`, `table`, `thead`, `td`, `tr`
   directly, those elements no longer exist. Re-target via **tokens** (`--dt-*`), **`MuiTanstackDataGrid`
   theme overrides**, or **`slotProps.<part>.sx`**. Functional usage (props/slots/apiRef) is unaffected.
2. **Density names** changed (`small/medium` → `compact/standard/comfortable`). Default is `standard`.
3. **Column min/max now actually apply.** Layouts that secretly relied on min/max being ignored may
   render slightly differently (usually more correct).
4. **Resize no longer redistributes neighbours.** If you depended on the old spring-back, that's gone.
5. **Slot renames:** `expandedRow`→`detailPanel`, `loadingRow`→`loadingOverlay`, `emptyRow`→`noRowsOverlay`,
   `table`→`grid`, `tableContainer`→`scroller`, `tableSizeControl`→`densityControl` (aliases kept).
6. **Excel export is async-loaded.** First `exportExcel()` call fetches the chunk; no API change.
7. **Helpers tied to the old table** (`getPinnedColumnStyle`, `shouldUseFixedLayout`) are reimplemented
   for the div layout — same names, different internals. Only matters if you imported them directly.

---

## 6. Theming: moving custom styles over

```ts
// v2 — style it like any MUI component, once, app-wide:
createTheme({
  components: {
    MuiTanstackDataGrid: {
      defaultProps: { density: 'compact', striped: true },
      styleOverrides: {
        root:   { '--dt-border-color': theme => theme.palette.divider },
        header: { textTransform: 'uppercase', fontSize: 12 },
        cell:   { paddingInline: 12 },
      },
    },
  },
})
```
Or per instance: `theme={{ tokens: { '--dt-row-height': 44 } }}` / `sx` / `slotProps`. Dark mode and
RTL follow your MUI theme automatically.

---

## 7. Upgrade checklist

- ☐ `npm i @ackplus/react-tanstack-data-table@^2`
- ☐ Run codemod: `npx @ackplus/data-table-codemod v1-to-v2 ./src` *(renames props/slots, flags manual cases)*
- ☐ Replace any direct `table`/`td`/`.MuiTable-*` CSS with tokens / `MuiTanstackDataGrid` overrides / `slotProps`
- ☐ Confirm density mapping (small→compact, medium→standard)
- ☐ Re-check pinned + resized columns visually (they're now exact)
- ☐ Remove the console deprecation warnings at your own pace (aliases work through v2.x)
- ☐ Optional: adopt `getRowId`, the token theme, and `useDataTable()` where useful

> A codemod ships with v2 to automate the mechanical renames; anything it can't safely auto-fix is left
> with a `// TODO(datatable-v2)` comment.
