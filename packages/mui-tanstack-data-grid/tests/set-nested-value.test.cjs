// setNestedValue — the write counterpart to dot-path accessorKeys used by inline editing.
const test = require('node:test');
const assert = require('node:assert/strict');

const { setNestedValue, coerceEditValue } = require('../dist/cjs/utils/table-helpers.js');

test('setNestedValue — plain key behaves like a shallow spread', () => {
    const row = { id: 1, name: 'Liam' };
    const out = setNestedValue(row, 'name', 'Olivia');
    assert.deepEqual(out, { id: 1, name: 'Olivia' });
    assert.notEqual(out, row, 'returns a new object (immutable)');
});

test('setNestedValue — deep-sets a dot-nested path and clones only along it', () => {
    const row = { id: 1, address: { city: 'NYC', zip: '10001' }, profile: { age: 30 } };
    const out = setNestedValue(row, 'address.city', 'Boston');
    assert.equal(out.address.city, 'Boston');
    assert.equal(out.address.zip, '10001', 'siblings preserved');
    assert.notEqual(out, row);
    assert.notEqual(out.address, row.address, 'path is cloned');
    assert.equal(out.profile, row.profile, 'untouched branches keep identity (no needless clone)');
    assert.equal(row.address.city, 'NYC', 'original is not mutated');
});

test('setNestedValue — creates intermediate objects when missing', () => {
    assert.deepEqual(setNestedValue({ id: 1 }, 'meta.flags.active', true), { id: 1, meta: { flags: { active: true } } });
});

test('setNestedValue — replaces a non-object intermediate rather than crashing', () => {
    assert.deepEqual(setNestedValue({ a: 5 }, 'a.b', 9), { a: { b: 9 } });
});

test('coerceEditValue — an untouched Date coerces to an EQUAL-but-new Date (so commit must compare by value, not ===)', () => {
    const original = new Date('2026-06-12');
    const coerced = coerceEditValue(original, 'date', original);
    assert.ok(coerced instanceof Date);
    assert.notEqual(coerced, original, 'a fresh Date object — reference compare would wrongly read as changed');
    assert.equal(coerced.getTime(), original.getTime(), 'value is equal — commitRow skips it via getTime()');
});

test('coerceEditValue — number/date/empty/text coercion (shared by cell + row commit)', () => {
    assert.equal(coerceEditValue('42', 'number', 0), 42, 'number string → Number');
    assert.equal(coerceEditValue('', 'number', 5), null, 'empty number → null');
    assert.equal(coerceEditValue('', 'date', new Date()), null, 'empty date → null');
    assert.equal(coerceEditValue('', 'text', 'x'), '', 'empty text → empty string');
    assert.equal(coerceEditValue('abc', 'text', 'x'), 'abc', 'text passes through');
    assert.equal(coerceEditValue('a', undefined, 'x'), 'a', 'no type passes through');
    // date stays a Date only when the original was a Date
    const out = coerceEditValue('2026-06-12', 'date', new Date('2020-01-01'));
    assert.ok(out instanceof Date, 'date with Date original → Date');
    assert.equal(coerceEditValue('2026-06-12', 'date', '2020-01-01'), '2026-06-12', 'date with string original → string');
});

test('setNestedValue — preserves arrays in the path (index segment stays an array)', () => {
    const row = { id: 1, items: [{ n: 1 }, { n: 2 }] };
    const out = setNestedValue(row, 'items.0.n', 99);
    assert.ok(Array.isArray(out.items), 'items is still an array, not an object');
    assert.equal(out.items.length, 2);
    assert.equal(out.items[0].n, 99);
    assert.equal(out.items[1].n, 2, 'sibling element preserved');
    assert.equal(row.items[0].n, 1, 'original not mutated');
});
