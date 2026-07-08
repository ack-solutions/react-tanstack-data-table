// Slots / slotProps / sx are only real if the render layer actually reads them.
// This is the regression guard for the reported bug (root sx + slotProps.root
// declared but never applied) and the broader audit: every structural slot must
// be swappable (slots.X) and injectable (slotProps.X) without a developer hitting
// a dead API. We render the real component with react-dom/server and assert the
// customization shows up in the emitted HTML.
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { DataTable } = require('../dist/cjs/index.js');

const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'age', header: 'Age' },
];
const data = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
];

const render = (props) => renderToStaticMarkup(React.createElement(DataTable, { columns, data, ...props }));

test('root: props.className AND slotProps.root.className both survive (the reported clobber bug)', () => {
    const html = render({
        className: 'my-app-root',
        slotProps: { root: { className: 'injected-root', 'data-root': 'ROOT_OK' } },
    });
    assert.ok(html.includes('my-app-root'), 'caller className must not be dropped');
    assert.ok(html.includes('injected-root'), 'slotProps.root.className must be applied');
    assert.ok(html.includes('data-root="ROOT_OK"'), 'slotProps.root rest props spread onto the root');
});

test('root: sx is applied and slotProps.root.style merges WITHOUT nuking the --dt-* tokens', () => {
    const html = render({
        sx: { '--dt-border-color': 'rgb(1, 2, 3)' },
        slotProps: { root: { style: { outline: '5px solid magenta' } } },
    });
    assert.ok(/--dt-/.test(html), 'the --dt-* design tokens are still emitted as inline style');
    assert.ok(html.includes('outline:5px solid magenta'), 'slotProps.root.style is merged, not replaced');
    // sx flows through emotion → a generated class on the root; the value lands in a <style> rule.
    assert.ok(html.includes('rgb(1, 2, 3)') || html.includes('rgb(1,2,3)'), 'root sx override is present in the output');
});

test('root: slotProps.root.style cannot override the --dt-* tokens or scroll-layout height (internal wins)', () => {
    const html = renderToStaticMarkup(
        React.createElement(DataTable, {
            columns, data, height: 400,
            slotProps: { root: { style: { '--dt-border-color': 'HACKED', height: '9px' } } },
        })
    );
    assert.ok(!html.includes('HACKED'), 'a --dt-* token set via slotProps.root.style does not win (use sx/theme instead)');
    // The real height (400) wins over the injected 9px; assert the token is intact and 9px lost.
    assert.ok(!/height:9px/.test(html), 'the scroll-layout height is not clobbered by slotProps.root.style');
});

test('slotProps `key` is dropped from the rest bag (no duplicate-key across cells)', () => {
    // Passing a shared key would collide across every cell — the helper must strip it.
    const html = render({ slotProps: { cell: { key: 'shared', 'data-ok': 'YES' } } });
    assert.ok(html.includes('data-ok="YES"'), 'other props still spread');
    assert.ok(!html.includes('key="shared"'), 'key is not emitted as an attribute (it was stripped, not rendered)');
});

test('slotProps reach the structural parts (cell / row / headerCell)', () => {
    const html = render({
        slotProps: {
            cell: { 'data-cell': 'CELL_OK' },
            row: { 'data-row': 'ROW_OK' },
            headerCell: { 'data-hc': 'HC_OK' },
        },
    });
    assert.ok(html.includes('data-cell="CELL_OK"'), 'slotProps.cell spreads onto every cell');
    assert.ok(html.includes('data-row="ROW_OK"'), 'slotProps.row spreads onto every row');
    assert.ok(html.includes('data-hc="HC_OK"'), 'slotProps.headerCell spreads onto every header cell');
});

test('slotProps must NOT clobber the required behavior props on a cell', () => {
    // A caller passing role/data-r is spread FIRST; the grid re-asserts role="gridcell".
    const html = render({ slotProps: { cell: { role: 'presentation' } } });
    assert.ok(html.includes('role="gridcell"'), 'the grid keeps role="gridcell" even if slotProps tries role="presentation"');
});

test('slots.cell swaps the cell renderer and still receives the injected slotProps', () => {
    const CustomCell = (props) =>
        React.createElement('div', { ...props, 'data-custom-cell': 'CUSTOM' }, props.children);
    const html = render({
        slots: { cell: CustomCell },
        slotProps: { cell: { 'data-cell': 'STILL_OK' } },
    });
    assert.ok(html.includes('data-custom-cell="CUSTOM"'), 'the custom cell component renders');
    assert.ok(html.includes('data-cell="STILL_OK"'), 'slotProps.cell still reaches the swapped component');
});

test('slots.noRowsOverlay renders when there are no rows', () => {
    const NoRows = () => React.createElement('div', { 'data-empty': 'EMPTY_OK' }, 'Nothing here');
    const html = renderToStaticMarkup(
        React.createElement(DataTable, { columns, data: [], slots: { noRowsOverlay: NoRows } })
    );
    assert.ok(html.includes('data-empty="EMPTY_OK"'), 'custom no-rows overlay renders for an empty dataset');
});

test('toolbar controls are swappable (searchInput) and injectable (slotProps.searchInput)', () => {
    const CustomSearch = (props) =>
        React.createElement('input', { 'data-search': 'SEARCH_OK', 'data-extra': props['data-extra'], placeholder: props.placeholder });
    const html = render({
        enableGlobalFilter: true,
        slots: { searchInput: CustomSearch },
        slotProps: { searchInput: { 'data-extra': 'EXTRA_OK' } },
    });
    assert.ok(html.includes('data-search="SEARCH_OK"'), 'custom searchInput renders in the toolbar');
    assert.ok(html.includes('data-extra="EXTRA_OK"'), 'slotProps.searchInput reaches the swapped control');
});

test('slotProps.searchInput styles the DEFAULT search too (className forwarded, not just on swap)', () => {
    const html = render({
        enableGlobalFilter: true,
        slotProps: { searchInput: { className: 'my-search-box' } },
    });
    assert.ok(html.includes('my-search-box'), 'the default (un-swapped) search forwards className from slotProps.searchInput');
});

test('slotProps.toolbar styles the built-in toolbar container', () => {
    const html = render({
        enableGlobalFilter: true,
        slotProps: { toolbar: { 'data-toolbar': 'TB_OK' } },
    });
    assert.ok(html.includes('data-toolbar="TB_OK"'), 'slotProps.toolbar spreads onto the toolbar container');
});

test('slotProps.pagination reaches the pagination control (leaf: caller override wins)', () => {
    const html = render({ enablePagination: true, slotProps: { pagination: { 'data-pg': 'PG_OK' } } });
    assert.ok(html.includes('data-pg="PG_OK"'), 'slotProps.pagination spreads onto the pagination control');
});
