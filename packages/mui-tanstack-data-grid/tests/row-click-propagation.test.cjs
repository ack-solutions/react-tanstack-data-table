// Interactive controls inside a clickable row must stop click propagation, so ticking
// the selection checkbox or toggling the row expander does NOT also fire the row's
// onRowClick (e.g. navigate to a detail page). Regression guard — these had no
// stopPropagation through 1.20.2. The column factories return React elements, so we can
// invoke their onClick with a fake event and assert stopPropagation (no DOM needed).
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { DataTable } = require('../dist/cjs/index.js');
const { createSelectionColumn, createExpandingColumn, createActionsColumn } = require('../dist/cjs/utils/special-columns.js');

function clickStops(onClick) {
    let stopped = false;
    onClick({ stopPropagation: () => { stopped = true; } });
    return stopped;
}

test('selection cell checkbox stops click propagation (a tick must not fire onRowClick)', () => {
    const col = createSelectionColumn({ multiSelect: true });
    let toggled = false;
    const table = {
        getIsRowSelected: () => false,
        canSelectRow: () => true,
        toggleRowSelected: () => { toggled = true; },
    };
    const el = col.cell({ row: { id: '1' }, table });
    assert.equal(typeof el.props.onClick, 'function', 'checkbox has an onClick handler');
    assert.ok(clickStops(el.props.onClick), 'onClick calls stopPropagation');
    el.props.onChange(); // onChange still toggles selection
    assert.ok(toggled, 'onChange still toggles the row selection');
});

test('select-all header checkbox stops click propagation', () => {
    const col = createSelectionColumn({ multiSelect: true });
    const table = {
        getIsAllRowsSelected: () => false,
        getIsSomeRowsSelected: () => false,
        toggleAllRowsSelected: () => {},
    };
    const el = col.header({ table });
    assert.ok(el, 'header renders a checkbox when multiSelect');
    assert.ok(clickStops(el.props.onClick), 'header onClick calls stopPropagation');
});

test('row-expansion button stops propagation AND still toggles', () => {
    const col = createExpandingColumn({});
    let toggled = false;
    const row = {
        getCanExpand: () => true,
        getIsExpanded: () => false,
        getToggleExpandedHandler: () => () => { toggled = true; },
    };
    const el = col.cell({ row });
    assert.ok(clickStops(el.props.onClick), 'expander onClick calls stopPropagation');
    assert.ok(toggled, 'expander still toggles the row expansion');
});

// ── disableRowClick: the WHOLE cell is out of the row click ─────────────────
// The guards above only cover the control itself. A near-miss beside the checkbox
// (or chevron, or an in-cell dropdown) used to land on the cell and fire onRowClick —
// e.g. open the row's page and lose the selection. A column with `disableRowClick`
// stops the click at the cell; the built-in columns set it by default.

test('built-in selection / expand / actions columns opt out of the row click by default', () => {
    assert.equal(createSelectionColumn({}).disableRowClick, true);
    assert.equal(createExpandingColumn({}).disableRowClick, true);
    assert.equal(createActionsColumn({ getRowActions: () => [] }).disableRowClick, true);
});

test('the default can be turned back off per column (slotProps.<x>Column)', () => {
    assert.equal(createSelectionColumn({ disableRowClick: false }).disableRowClick, false);
    assert.equal(createExpandingColumn({ disableRowClick: false }).disableRowClick, false);
    assert.equal(createActionsColumn({ getRowActions: () => [], disableRowClick: false }).disableRowClick, false);
});

// An opted-out cell drops the row's pointer cursor (inline `cursor:default`) — the
// server-renderable trace of the same flag that attaches the cell's click guard.
const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'role', header: 'Role', disableRowClick: true },
];
const data = [{ id: 1, name: 'Alice', role: 'admin' }];
const render = (props) =>
    renderToStaticMarkup(React.createElement(DataTable, { columns, data, onRowClick: () => {}, ...props }));
const cellTag = (html, colId) => (html.match(new RegExp(`<div[^>]*role="gridcell"[^>]*data-col-id="${colId}"[^>]*>`)) || [''])[0];
const optedOut = (html, colId) => {
    const tag = cellTag(html, colId);
    assert.ok(tag, `cell ${colId} rendered`);
    return /cursor:default/.test(tag);
};

test('cells of a disableRowClick column are opted out; ordinary cells are not', () => {
    const html = render({});
    assert.ok(optedOut(html, 'role'), 'the custom disableRowClick column is opted out');
    assert.ok(!optedOut(html, 'name'), 'an ordinary column still takes the row click');
});

test('the checkbox and expander cells are opted out when a row click is set', () => {
    const html = render({ enableRowSelection: true, enableRowExpansion: true, renderDetailPanel: () => null });
    assert.ok(optedOut(html, '_selection'), 'selection cell');
    assert.ok(optedOut(html, '_expanding'), 'expander cell');
});

test('selectOnRowClick keeps the checkbox cell in the row click (it IS the selection gesture)', () => {
    const html = render({ enableRowSelection: true, selectOnRowClick: true, enableRowExpansion: true, renderDetailPanel: () => null });
    assert.ok(!optedOut(html, '_selection'), 'clicking beside the checkbox still selects the row');
    assert.ok(optedOut(html, '_expanding'), 'the expander cell stays opted out');
});

test('slotProps.selectionColumn can restore the old behaviour', () => {
    const html = render({ enableRowSelection: true, slotProps: { selectionColumn: { disableRowClick: false } } });
    assert.ok(!optedOut(html, '_selection'));
});
