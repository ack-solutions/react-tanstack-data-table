// valueGetter / valueFormatter / type-default cell normalization (display vs data).
const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeUserColumn, makeTypeCellFormatter } = require('../dist/cjs/utils/column-helpers.js');

const ctx = (value, original = {}) => ({ getValue: () => value, row: { original } });

test('makeTypeCellFormatter — number uses locale grouping, passes through empties/non-numeric', () => {
    const f = makeTypeCellFormatter({ type: 'number' });
    assert.equal(f(1000), (1000).toLocaleString());
    assert.equal(f(1234.5), (1234.5).toLocaleString());
    assert.equal(f(''), '');
    assert.equal(f(null), null);
    assert.equal(f('abc'), 'abc', 'unparseable passes through');
});

test('makeTypeCellFormatter — date via dayjs (no UTC shift), invalid/empty pass through', () => {
    const f = makeTypeCellFormatter({ type: 'date' });
    assert.equal(f('2026-06-12'), 'Jun 12, 2026');
    assert.equal(f('not-a-date'), 'not-a-date');
    assert.equal(f(''), '');
    assert.equal(f(undefined), undefined);
});

test('makeTypeCellFormatter — boolean Yes/No, select → option label', () => {
    const b = makeTypeCellFormatter({ type: 'boolean' });
    assert.equal(b(true), 'Yes');
    assert.equal(b(false), 'No');
    assert.equal(b(null), null);
    const s = makeTypeCellFormatter({ type: 'select', options: [{ value: 'a', label: 'Apple' }, { value: 'b', label: 'Banana' }] });
    assert.equal(s('a'), 'Apple');
    assert.equal(s('z'), 'z', 'unknown value passes through');
});

test('normalizeUserColumn — valueGetter compiles to accessorFn (only when no accessorKey)', () => {
    const col = normalizeUserColumn({ id: 'full', valueGetter: ({ row }) => `${row.first} ${row.last}` });
    assert.equal(typeof col.accessorFn, 'function');
    assert.equal(col.accessorFn({ first: 'Ada', last: 'Lovelace' }), 'Ada Lovelace');

    const keyed = normalizeUserColumn({ id: 'name', accessorKey: 'name', valueGetter: () => 'IGNORED' });
    assert.equal(keyed.accessorFn, undefined, 'accessorKey wins — valueGetter not compiled');
});

test('normalizeUserColumn — default cell precedence: explicit cell > valueFormatter > type default > raw', () => {
    // explicit cell preserved
    const explicit = () => 'X';
    assert.equal(normalizeUserColumn({ id: 'a', type: 'number', cell: explicit }).cell, explicit);

    // valueFormatter beats type default
    const vf = normalizeUserColumn({ id: 'b', type: 'number', valueFormatter: ({ value }) => `$${value}` });
    assert.equal(vf.cell(ctx(5)), '$5');

    // type default when no cell/formatter
    const td = normalizeUserColumn({ id: 'c', type: 'number' });
    assert.equal(td.cell(ctx(1000)), (1000).toLocaleString());

    // text type → no synthesized cell (raw value path)
    assert.equal(normalizeUserColumn({ id: 'd', type: 'text' }).cell, undefined);
    assert.equal(normalizeUserColumn({ id: 'e' }).cell, undefined);
});

test('normalizeUserColumn — valueFormatter receives the row original', () => {
    const col = normalizeUserColumn({ id: 'f', accessorKey: 'amt', valueFormatter: ({ value, row }) => `${row.cur}${value}` });
    assert.equal(col.cell(ctx(9, { cur: '€' })), '€9');
});
