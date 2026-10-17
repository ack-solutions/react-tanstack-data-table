// Pinned-column visuals are themeable CSS (not inline), the edge shadow is scroll-aware,
// the built-in columns are identifiable + immune to cell padding, and the expander can sit
// in the first data cell. Rendered with react-dom/server; assertions read the emitted
// HTML + CSS.
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { DataTable } = require('../dist/cjs/index.js');

const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'city', header: 'City' },
    { accessorKey: 'age', header: 'Age' },
];
const data = [{ id: 1, name: 'Alice', city: 'Paris', age: 30 }];
const render = (props) => renderToStaticMarkup(React.createElement(DataTable, { columns, data, ...props }));
const tag = (html, role, colId) => (html.match(new RegExp(`<div[^>]*role="${role}"[^>]*data-col-id="${colId}"[^>]*>`)) || [''])[0];
const rootTag = (html) => (html.match(/<div[^>]*data-pinned-shadow="[^"]*"[^>]*>/) || [''])[0];
const css = (html) => [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('');

const pinned = { enableColumnPinning: true, initialState: { columnPinning: { left: ['name'], right: ['age'] } } };

test('pinned cells keep only sticky + offset inline; background and shadow are CSS', () => {
    const cell = tag(render(pinned), 'gridcell', 'name');
    assert.match(cell, /position:sticky/, 'pinning still works');
    assert.doesNotMatch(cell, /background|box-shadow/, 'no inline visuals left for a theme to fight');
});

test('pinned cells carry the theme hooks: data-pinned and the edge marker', () => {
    const html = render(pinned);
    assert.match(tag(html, 'gridcell', 'name'), /data-pinned="left"[^>]*data-pinned-edge="start"/);
    assert.match(tag(html, 'gridcell', 'age'), /data-pinned="right"[^>]*data-pinned-edge="end"/);
    assert.doesNotMatch(tag(html, 'gridcell', 'city'), /data-pinned/, 'unpinned cells are untouched');
    assert.match(tag(html, 'columnheader', 'name'), /data-pinned-edge="start"/, 'header cells too');
});

test('edge shadow defaults to scroll-only: nothing is scrolled on first render, so no shadow flag', () => {
    const root = rootTag(render(pinned));
    assert.match(root, /data-pinned-shadow="scroll"/);
    assert.doesNotMatch(root, /data-scrolled-(start|end)/);
    const rules = css(render(pinned));
    assert.match(rules, /\[data-scrolled-start\] \[data-pinned-edge="start"\]/, 'shadow appears once scrolled');
});

test("pinnedShadow='always' and 'none' are passed to the CSS", () => {
    assert.match(rootTag(render({ ...pinned, pinnedShadow: 'always' })), /data-pinned-shadow="always"/);
    assert.match(css(render(pinned)), /\[data-pinned-shadow="always"\] \[data-pinned-edge="start"\]/);
    const none = rootTag(render({ ...pinned, pinnedShadow: 'none' }));
    assert.match(none, /data-pinned-shadow="none"/);
    assert.doesNotMatch(none, /data-scrolled/);
});

test('built-in columns are identifiable by data-col-kind (header and body)', () => {
    const html = render({ enableRowSelection: true, enableRowExpansion: true, renderDetailPanel: () => null, getRowActions: () => [] });
    for (const [id, kind] of [['_selection', 'selection'], ['_expanding', 'expand'], ['_actions', 'actions']]) {
        assert.match(tag(html, 'gridcell', id), new RegExp(`data-col-kind="${kind}"`), `${id} body cell`);
        assert.match(tag(html, 'columnheader', id), new RegExp(`data-col-kind="${kind}"`), `${id} header cell`);
    }
    assert.doesNotMatch(tag(html, 'gridcell', 'name'), /data-col-kind/);
});

test('checkbox and expander cells ignore cell padding, so a theme padding change cannot shift them', () => {
    const rules = css(render({ enableRowSelection: true }));
    const rule = rules.split('}').find((r) => r.includes('[data-col-kind="selection"]') && r.includes('[data-col-kind="expand"]'));
    assert.ok(rule, 'a rule targets both kinds');
    assert.match(rule, /padding-inline:\s*0/);
});

test("expandPlacement='first-cell' drops the expander column and puts the arrow in the first data cell", () => {
    const html = render({ enableRowExpansion: true, renderDetailPanel: () => null, expandPlacement: 'first-cell' });
    assert.ok(!/data-col-id="_expanding"/.test(html), 'no expander column');
    const start = html.indexOf(tag(html, 'gridcell', 'name'));
    const end = html.indexOf('role="gridcell"', start + 20); // the next cell
    assert.match(html.slice(start, end), /data-expand-toggle[\s\S]*aria-label="Expand row"/, 'arrow inside the first data cell');
});

test("expandPlacement='first-cell' keeps an empty slot for rows that can't expand (tree leaves)", () => {
    const tree = [{ id: 1, name: 'Parent', city: 'X', age: 1, children: [{ id: 2, name: 'Leaf', city: 'Y', age: 2 }] }];
    const html = renderToStaticMarkup(React.createElement(DataTable, {
        columns, data: tree, getSubRows: (r) => r.children, expandPlacement: 'first-cell',
        initialState: { expanded: true },
    }));
    const toggles = html.match(/<span[^>]*data-expand-toggle[^>]*>/g) || [];
    assert.equal(toggles.length, 2, 'parent and leaf both get the slot (aligned text)');
    assert.equal((html.match(/aria-label="(Expand|Collapse) row"/g) || []).length, 1, 'only the parent has an arrow');
});

test("expandPlacement defaults to 'column' (unchanged)", () => {
    const html = render({ enableRowExpansion: true, renderDetailPanel: () => null });
    assert.ok(/data-col-id="_expanding"/.test(html));
    assert.ok(!/data-expand-toggle/.test(html));
});
