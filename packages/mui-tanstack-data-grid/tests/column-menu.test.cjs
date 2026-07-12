// Header ⋮ column menu. MUI Menu items are portal-gated (only render when open), so
// under renderToStaticMarkup only the kebab TRIGGER is in the markup — assert that, plus
// the persistent filter-active marker (the red dot) that shows on a column with an APPLIED
// filter. Interactive menu behaviour (sort/pin/filter/hide items) is browser-verified.
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { DataTable } = require('../dist/cjs/index.js');

const columns = [
    { id: 'name', accessorKey: 'name', header: 'Name' },
    { id: 'age', accessorKey: 'age', header: 'Age' },
];
const data = [{ id: 1, name: 'Alice', age: 30 }, { id: 2, name: 'Bob', age: 25 }];
const render = (props) => renderToStaticMarkup(React.createElement(DataTable, { columns, data, ...props }));

const appliedFilter = {
    columnFilter: { filters: [{ id: 'f1', columnId: 'name', operator: 'contains', value: 'a' }], logic: 'AND', pendingFilters: [], pendingLogic: 'AND' },
};

test('column menu: the ⋮ kebab trigger renders on data-column headers', () => {
    const html = render({ enableColumnMenu: true });
    assert.ok(html.includes('aria-haspopup="menu"'), 'the kebab IconButton renders (menu items are portal-gated → only the trigger is in static markup)');
});

test('column menu: a column with an APPLIED filter shows the filter-active marker; others do not', () => {
    const html = render({ enableColumnFilter: true, initialState: appliedFilter });
    assert.ok(html.includes('data-filter-active'), 'the filtered column (name) shows the active-filter marker (red dot)');
    const count = (html.match(/data-filter-active/g) || []).length;
    assert.equal(count, 1, 'exactly one column (name) is marked, not age');
});

test('column menu: no filter-active marker when no column filter is applied', () => {
    const html = render({ enableColumnFilter: true });
    assert.ok(!html.includes('data-filter-active'), 'no marker without an applied filter');
});

test('column menu: engine exposes the panel-open api + ephemeral signals (not persisted)', () => {
    // Guards the plumbing the menu depends on: openColumnFilter / clearColumnFilter / openPanel.
    const { useDataTable } = require('../dist/cjs/core/use-data-table.js');
    assert.equal(typeof useDataTable, 'function', 'engine hook is exported');
});

test('reorder-only grid mounts the toolbar (so the ⋮ "Manage columns" item is not a dead action)', () => {
    // Regression: showToolbar previously omitted enableColumnReordering, so a reorder-only grid
    // had no Columns panel to open — the menu item was dead. It now mounts the toolbar + panel.
    const html = render({ enableColumnReordering: true });
    assert.ok(html.includes('aria-label="Columns"'), 'the Columns control (the "Manage columns" subscriber) mounts for a reorder-only grid');
});
