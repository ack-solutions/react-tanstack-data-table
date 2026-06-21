// sanitizeRowPinning — drops pinned ids missing from the current data so TanStack's
// getRow(id, true) never throws on a stale initialState / persisted-then-deleted pin.
const test = require('node:test');
const assert = require('node:assert/strict');

const { sanitizeRowPinning } = require('../dist/cjs/utils/row-pin-action.js');

test('sanitizeRowPinning — drops unknown ids from both bands', () => {
    const valid = new Set(['1', '2', '3']);
    assert.deepEqual(
        sanitizeRowPinning({ top: ['1', '99'], bottom: ['3', 'gone'] }, valid),
        { top: ['1'], bottom: ['3'] },
    );
});

test('sanitizeRowPinning — keeps order and all valid ids', () => {
    const valid = new Set(['a', 'b', 'c']);
    assert.deepEqual(
        sanitizeRowPinning({ top: ['c', 'a'], bottom: ['b'] }, valid),
        { top: ['c', 'a'], bottom: ['b'] },
    );
});

test('sanitizeRowPinning — returns the SAME object identity when nothing is pruned', () => {
    const valid = new Set(['1', '2']);
    const input = { top: ['1'], bottom: ['2'] };
    assert.equal(sanitizeRowPinning(input, valid), input, 'unchanged → stable identity (no needless re-render)');
});

test('sanitizeRowPinning — tolerates empty/undefined bands', () => {
    const valid = new Set(['1']);
    assert.deepEqual(sanitizeRowPinning({ top: undefined, bottom: undefined }, valid), { top: undefined, bottom: undefined });
    assert.deepEqual(sanitizeRowPinning({ top: ['x'], bottom: [] }, valid), { top: [], bottom: [] });
    // all-invalid → both empty
    assert.deepEqual(sanitizeRowPinning({ top: ['x'], bottom: ['y'] }, valid), { top: [], bottom: [] });
});
