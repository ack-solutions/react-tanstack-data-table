const test = require('node:test');
const assert = require('node:assert/strict');

const { generateRowId, formatCellValue } = require('../dist/cjs/utils/table-helpers.js');

test('generateRowId honours id=0 and guards empty/missing ids', () => {
    assert.equal(generateRowId({ id: 0 }, 5, 'id'), '0'); // numeric 0 must not fall back
    assert.equal(generateRowId({ id: 42 }, 5, 'id'), '42');
    assert.equal(generateRowId({ id: 'abc' }, 5, 'id'), 'abc');
    assert.equal(generateRowId({ id: '' }, 5, 'id'), 'row-5'); // empty string → positional (collision-safe)
    assert.equal(generateRowId({ id: null }, 5, 'id'), 'row-5');
    assert.equal(generateRowId({}, 5, 'id'), 'row-5'); // missing key → positional
    assert.equal(generateRowId({ name: 'x' }, 7), 'row-7'); // no idKey → positional
});

test('formatCellValue by type', () => {
    assert.equal(formatCellValue(null, 'text'), '-');
    assert.equal(formatCellValue(undefined, 'number'), '-');
    assert.equal(formatCellValue(true, 'boolean'), 'Yes');
    assert.equal(formatCellValue(false, 'boolean'), 'No');
    assert.equal(formatCellValue(1234.5, 'number'), (1234.5).toLocaleString());
    assert.equal(formatCellValue('hello', 'text'), 'hello');
});
