// Interactive controls inside a clickable row must stop click propagation, so ticking
// the selection checkbox or toggling the row expander does NOT also fire the row's
// onRowClick (e.g. navigate to a detail page). Regression guard — these had no
// stopPropagation through 1.20.2. The column factories return React elements, so we can
// invoke their onClick with a fake event and assert stopPropagation (no DOM needed).
const test = require('node:test');
const assert = require('node:assert/strict');
const { createSelectionColumn, createExpandingColumn } = require('../dist/cjs/utils/special-columns.js');

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
