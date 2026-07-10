// List view: renderListItem replaces the columnar row with one full-width item.
// The engine is unchanged (selection/pagination still apply); only rendering switches.
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { DataTable } = require('../dist/cjs/index.js');

const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'role', header: 'Role' },
];
const data = [
    { id: 1, name: 'Alice', role: 'Admin' },
    { id: 2, name: 'Bob', role: 'Editor' },
    { id: 3, name: 'Carol', role: 'Viewer' },
];

const render = (props) => renderToStaticMarkup(React.createElement(DataTable, { columns, data, ...props }));

const listItem = ({ row, index, isSelected }) =>
    React.createElement('div', { 'data-list-item': row.id, 'data-idx': index, 'data-sel': String(isSelected) }, `${row.name} — ${row.role}`);

test('listView renders one custom item per row and hides column headers', () => {
    const html = render({ listView: true, renderListItem: listItem });
    // custom items present for all rows
    assert.ok(html.includes('data-list-item="1"') && html.includes('data-list-item="2"') && html.includes('data-list-item="3"'), 'a custom item renders per row');
    assert.ok(html.includes('Alice — Admin'), 'the item content renders');
    // column headers are gone
    assert.ok(!html.includes('role="columnheader"'), 'no column headers in list view');
    // exactly one gridcell per row (the list item), not one per column
    const cellCount = (html.match(/role="gridcell"/g) || []).length;
    assert.equal(cellCount, 3, 'one full-width cell per row (not one per column)');
});

test('grid view (no listView) still renders columnar headers + per-column cells', () => {
    const html = render({ renderListItem: listItem }); // renderListItem present but listView off
    assert.ok(html.includes('role="columnheader"'), 'headers present in grid mode');
    assert.ok(!html.includes('data-list-item'), 'the list item is NOT used when listView is off');
    assert.equal((html.match(/role="gridcell"/g) || []).length, 6, 'two columns × three rows = 6 cells');
});

test('listView requires renderListItem (falls back to grid if missing)', () => {
    const html = render({ listView: true }); // no renderListItem
    assert.ok(html.includes('role="columnheader"'), 'without renderListItem it stays a normal grid');
});

test('engine still applies in list view — pagination slices rows', () => {
    const many = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `U${i + 1}`, role: 'X' }));
    const html = renderToStaticMarkup(
        React.createElement(DataTable, { columns, data: many, listView: true, renderListItem: listItem, enablePagination: true, rowsPerPageOptions: [10] }),
    );
    const items = (html.match(/data-list-item=/g) || []).length;
    assert.equal(items, 10, 'only the first page of items renders');
});

test('list view has a keyboard entry point (first item tabbable, no phantom header)', () => {
    const html = render({ listView: true, renderListItem: listItem });
    // Roving-tabindex home is the first data row (row 1) since there is no header row.
    assert.ok(/data-r="1"[^>]*tabindex="0"/.test(html), 'the first list item is the tab stop');
    assert.ok(!/data-r="0"[^>]*tabindex="0"/.test(html), 'no header tab stop in list view');
});

test('grid mode keeps the header as the tab stop (list-view change did not regress it)', () => {
    const html = render({ renderListItem: listItem }); // grid mode
    assert.ok(/data-r="0"[^>]*tabindex="0"/.test(html), 'header cell (row 0) is the tab stop in grid mode');
});

test('enableListView shows the toolbar grid⇄list toggle', () => {
    const html = render({ enableListView: true, renderListItem: listItem });
    assert.ok(/aria-label="(List view|Grid view)"/.test(html), 'the toolbar toggle button is present');
});
