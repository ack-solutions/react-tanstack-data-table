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

test('generateRowId namespaces the positional fallback under a parent (tree sub-rows do not collide)', () => {
    // Without a usable idKey, sibling sub-rows of DIFFERENT parents would both be "row-0";
    // the parentId prefix keeps them unique.
    assert.equal(generateRowId({}, 0, 'id', 'A'), 'A.0');
    assert.equal(generateRowId({}, 0, 'id', 'B'), 'B.0');
    assert.notEqual(generateRowId({}, 0, 'id', 'A'), generateRowId({}, 0, 'id', 'B'));
    // a real id is globally unique → used as-is even under a parent (no double-namespacing)
    assert.equal(generateRowId({ id: 9 }, 0, 'id', 'A'), '9');
    // no parent → unchanged positional fallback
    assert.equal(generateRowId({}, 3, 'id'), 'row-3');
});

test('formatCellValue by type', () => {
    assert.equal(formatCellValue(null, 'text'), '-');
    assert.equal(formatCellValue(undefined, 'number'), '-');
    assert.equal(formatCellValue(true, 'boolean'), 'Yes');
    assert.equal(formatCellValue(false, 'boolean'), 'No');
    assert.equal(formatCellValue(1234.5, 'number'), (1234.5).toLocaleString());
    assert.equal(formatCellValue('hello', 'text'), 'hello');
});
