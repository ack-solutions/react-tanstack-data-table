// slot-utils: the shared slot-wiring helpers that make slots/slotProps/sx honest.
// resolveSlotProps splits a slotProps entry into managed channels + a rest bag;
// mergeSx flattens (MUI does not); joinClassNames drops falsy and never emits "".
const test = require('node:test');
const assert = require('node:assert/strict');
const { resolveSlotProps, mergeSx, joinClassNames } = require('../dist/cjs/components/grid/slot-utils.js');

test('resolveSlotProps splits sx/className/style out and keeps the rest', () => {
    const onClick = () => {};
    const r = resolveSlotProps({ cell: { sx: { color: 'red' }, className: 'x', style: { top: 1 }, 'data-foo': 'bar', onClick } }, 'cell');
    assert.deepEqual(r.sx, { color: 'red' });
    assert.equal(r.className, 'x');
    assert.deepEqual(r.style, { top: 1 });
    assert.deepEqual(r.rest, { 'data-foo': 'bar', onClick });
});

test('resolveSlotProps returns a stable frozen EMPTY when the key is unset', () => {
    const a = resolveSlotProps(undefined, 'row');
    const b = resolveSlotProps({}, 'row');
    const c = resolveSlotProps({ cell: { sx: {} } }, 'row');
    assert.equal(a, b, 'same frozen singleton so per-row spreads cost ~nothing');
    assert.equal(a, c);
    assert.equal(a.sx, undefined);
    assert.equal(a.className, undefined);
    assert.equal(a.style, undefined);
    assert.deepEqual(a.rest, {});
    assert.ok(Object.isFrozen(a), 'EMPTY is frozen so a stray mutation cannot leak across cells');
});

test('resolveSlotProps does not treat a present-but-empty entry as EMPTY', () => {
    // {} is falsy-safe but truthy — it must still parse to an (own) empty result.
    const r = resolveSlotProps({ cell: {} }, 'cell');
    assert.deepEqual(r.rest, {});
    assert.equal(r.sx, undefined);
});

test('mergeSx flattens nested arrays (MUI would not) and drops nullish', () => {
    assert.deepEqual(mergeSx({ a: 1 }, [{ b: 2 }, { c: 3 }]), [{ a: 1 }, { b: 2 }, { c: 3 }]);
    assert.deepEqual(mergeSx(undefined, { a: 1 }, null), [{ a: 1 }]);
});

test('mergeSx returns undefined when nothing survives (so the sx prop can be omitted)', () => {
    assert.equal(mergeSx(), undefined);
    assert.equal(mergeSx(undefined, null), undefined);
    assert.equal(mergeSx([]), undefined, 'an empty array contributes nothing');
});

test('mergeSx preserves order — later entries win downstream', () => {
    // Internal sx first, slot sx last, so the caller overrides per-property.
    const internal = { color: 'blue' };
    const slot = { color: 'red' };
    assert.deepEqual(mergeSx(internal, slot), [{ color: 'blue' }, { color: 'red' }]);
});

test('joinClassNames drops falsy and returns undefined when empty (never class="")', () => {
    assert.equal(joinClassNames('a', 'b'), 'a b');
    assert.equal(joinClassNames('a', undefined, false, null, 'b'), 'a b');
    assert.equal(joinClassNames(), undefined);
    assert.equal(joinClassNames(undefined, false, ''), undefined);
});
