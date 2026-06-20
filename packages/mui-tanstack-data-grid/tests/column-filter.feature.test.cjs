const test = require('node:test');
const assert = require('node:assert/strict');

const { matchesCustomColumnFilters } = require('../dist/cjs/features/column-filter.feature.js');

function createMockRow(original, columnTypes = {}) {
    const cells = Object.keys(original).map((key) => ({
        column: { id: key, columnDef: { type: columnTypes[key] } },
        getValue: () => original[key],
    }));
    return { original, getAllCells: () => cells };
}

const matches = (row, rules, logic) => matchesCustomColumnFilters(row, rules, logic);
const rule = (columnId, operator, value, columnType) => ({ id: `${columnId}:${operator}`, columnId, operator, value, columnType });

test('text operators', () => {
    const row = createMockRow({ name: 'Alice Smith' }, { name: 'text' });
    assert.equal(matches(row, [rule('name', 'equals', 'Alice Smith', 'text')]), true);
    assert.equal(matches(row, [rule('name', 'notEquals', 'Bob', 'text')]), true);
    assert.equal(matches(row, [rule('name', 'contains', 'lice', 'text')]), true);
    assert.equal(matches(row, [rule('name', 'notContains', 'xyz', 'text')]), true);
    assert.equal(matches(row, [rule('name', 'startsWith', 'Alice', 'text')]), true);
    assert.equal(matches(row, [rule('name', 'endsWith', 'Smith', 'text')]), true);
    assert.equal(matches(row, [rule('name', 'startsWith', 'Smith', 'text')]), false);
    assert.equal(matches(createMockRow({ name: '' }, { name: 'text' }), [rule('name', 'isEmpty', '', 'text')]), true);
    assert.equal(matches(row, [rule('name', 'isNotEmpty', '', 'text')]), true);
});

test('number operators', () => {
    const row = createMockRow({ salary: 1000 }, { salary: 'number' });
    assert.equal(matches(row, [rule('salary', 'equals', 1000, 'number')]), true);
    assert.equal(matches(row, [rule('salary', 'notEquals', 999, 'number')]), true);
    assert.equal(matches(row, [rule('salary', 'greaterThan', 999, 'number')]), true);
    assert.equal(matches(row, [rule('salary', 'greaterThanOrEqual', 1000, 'number')]), true);
    assert.equal(matches(row, [rule('salary', 'lessThan', 1001, 'number')]), true);
    assert.equal(matches(row, [rule('salary', 'lessThanOrEqual', 1000, 'number')]), true);
    assert.equal(matches(row, [rule('salary', 'greaterThan', 1000, 'number')]), false);
    // string-numeric coercion
    assert.equal(matches(createMockRow({ salary: '1000' }, { salary: 'number' }), [rule('salary', 'equals', 1000, 'number')]), true);
});

test('date operators (dayjs replaces moment — must behave identically)', () => {
    const row = createMockRow({ d: '2026-06-12' }, { d: 'date' });
    assert.equal(matches(row, [rule('d', 'equals', '2026-06-12', 'date')]), true);
    assert.equal(matches(row, [rule('d', 'equals', '2026-06-13', 'date')]), false);
    assert.equal(matches(row, [rule('d', 'notEquals', '2026-06-13', 'date')]), true);
    assert.equal(matches(row, [rule('d', 'after', '2026-06-11', 'date')]), true);
    assert.equal(matches(row, [rule('d', 'before', '2026-06-13', 'date')]), true);
    assert.equal(matches(row, [rule('d', 'after', '2026-06-12', 'date')]), false); // same day is not "after"
    assert.equal(matches(row, [rule('d', 'before', '2026-06-12', 'date')]), false);
    // same calendar day, different time → equals true
    assert.equal(matches(createMockRow({ d: '2026-06-12T23:00' }, { d: 'date' }), [rule('d', 'equals', '2026-06-12T01:00', 'date')]), true);
    // empties
    assert.equal(matches(createMockRow({ d: '' }, { d: 'date' }), [rule('d', 'isEmpty', '', 'date')]), true);
    assert.equal(matches(row, [rule('d', 'isNotEmpty', '', 'date')]), true);
});

test('boolean operator "is"', () => {
    const tRow = createMockRow({ active: true }, { active: 'boolean' });
    const fRow = createMockRow({ active: false }, { active: 'boolean' });
    assert.equal(matches(tRow, [rule('active', 'is', 'true', 'boolean')]), true);
    assert.equal(matches(tRow, [rule('active', 'is', 'false', 'boolean')]), false);
    assert.equal(matches(fRow, [rule('active', 'is', 'false', 'boolean')]), true);
    assert.equal(matches(tRow, [rule('active', 'is', 'any', 'boolean')]), true);
    // truthy string coercion
    assert.equal(matches(createMockRow({ active: 'Yes' }, { active: 'boolean' }), [rule('active', 'is', 'true', 'boolean')]), true);
});

test('select operators in/notIn/equals', () => {
    const eng = createMockRow({ dept: 'Engineering' }, { dept: 'select' });
    const sales = createMockRow({ dept: 'Sales' }, { dept: 'select' });
    assert.equal(matches(eng, [rule('dept', 'in', ['Engineering', 'Sales'], 'select')]), true);
    assert.equal(matches(eng, [rule('dept', 'in', ['Sales'], 'select')]), false);
    assert.equal(matches(eng, [rule('dept', 'notIn', ['Sales'], 'select')]), true);
    assert.equal(matches(eng, [rule('dept', 'notIn', 'Sales', 'select')]), true);
    assert.equal(matches(sales, [rule('dept', 'notIn', ['Sales'], 'select')]), false);
    assert.equal(matches(eng, [rule('dept', 'equals', 'Engineering', 'select')]), true);
});

test('AND / OR logic across multiple filters', () => {
    const row = createMockRow({ name: 'Alice', age: 30 }, { name: 'text', age: 'number' });
    const both = [rule('name', 'equals', 'Alice', 'text'), rule('age', 'greaterThan', 25, 'number')];
    const oneFails = [rule('name', 'equals', 'Bob', 'text'), rule('age', 'greaterThan', 25, 'number')];
    assert.equal(matches(row, both, 'AND'), true);
    assert.equal(matches(row, oneFails, 'AND'), false);
    assert.equal(matches(row, oneFails, 'OR'), true);
    assert.equal(matches(row, [rule('name', 'equals', 'X', 'text'), rule('age', 'lessThan', 0, 'number')], 'OR'), false);
    // no filters → always matches
    assert.equal(matches(row, []), true);
});

test('number "between" — inclusive range, open-ended bounds, empty guard', () => {
    const at = (n) => createMockRow({ salary: n }, { salary: 'number' });
    const rng = (from, to) => [rule('salary', 'between', { from, to }, 'number')];
    assert.equal(matches(at(5), rng(1, 10)), true);
    assert.equal(matches(at(1), rng(1, 10)), true, 'lower bound inclusive');
    assert.equal(matches(at(10), rng(1, 10)), true, 'upper bound inclusive');
    assert.equal(matches(at(0), rng(1, 10)), false);
    assert.equal(matches(at(11), rng(1, 10)), false);
    // open-ended: only one bound supplied
    assert.equal(matches(at(50), rng(5, '')), true, 'from-only → n >= from');
    assert.equal(matches(at(2), rng(5, '')), false);
    assert.equal(matches(at(2), rng('', 5)), true, 'to-only → n <= to');
    assert.equal(matches(at(9), rng('', 5)), false);
    // no bounds at all → not ready, never matches
    assert.equal(matches(at(5), rng('', '')), false);
    assert.equal(matches(at(5), [rule('salary', 'between', {}, 'number')]), false);
    // string-numeric coercion
    assert.equal(matches(createMockRow({ salary: '7' }, { salary: 'number' }), rng(1, 10)), true);
    // adversarial: an unparseable / whitespace bound is treated as absent — a no-op,
    // NOT match-all (regression guard for the NaN-bound bug)
    assert.equal(matches(at(99999), rng('x', '')), false, 'NaN single bound → no-op, not match-all');
    assert.equal(matches(at(99999), rng('   ', '')), false, 'whitespace bound → no-op');
    assert.equal(matches(at(7), rng('x', 'y')), false, 'both bounds unparseable → no match');
    // inverted bounds (from > to) → empty set
    assert.equal(matches(at(50), rng(100, 1)), false, 'inverted range matches nothing');
    // null / empty column value is never "between"
    assert.equal(matches(at(null), rng(-5, 5)), false, 'null value → false even if 0 ∈ range');
    assert.equal(matches(createMockRow({ salary: '' }, { salary: 'number' }), rng(-5, 5)), false);
});

test('date "between" — inclusive day range, open-ended bounds', () => {
    const on = (d) => createMockRow({ d }, { d: 'date' });
    const rng = (from, to) => [rule('d', 'between', { from, to }, 'date')];
    assert.equal(matches(on('2026-06-12'), rng('2026-06-10', '2026-06-15')), true);
    assert.equal(matches(on('2026-06-10'), rng('2026-06-10', '2026-06-15')), true, 'from inclusive');
    assert.equal(matches(on('2026-06-15'), rng('2026-06-10', '2026-06-15')), true, 'to inclusive');
    assert.equal(matches(on('2026-06-09'), rng('2026-06-10', '2026-06-15')), false);
    assert.equal(matches(on('2026-06-16'), rng('2026-06-10', '2026-06-15')), false);
    // open-ended
    assert.equal(matches(on('2026-06-20'), rng('2026-06-10', '')), true, 'from-only');
    assert.equal(matches(on('2026-06-01'), rng('2026-06-10', '')), false);
    assert.equal(matches(on('2026-06-01'), rng('', '2026-06-10')), true, 'to-only');
    // no bounds → never matches
    assert.equal(matches(on('2026-06-12'), rng('', '')), false);
    // adversarial: an invalid date bound is treated as absent; here no usable bound → no-op
    assert.equal(matches(on('2026-06-12'), rng('not-a-date', '')), false, 'invalid bound → no-op, not match-all');
    // empty column value is never "between"
    assert.equal(matches(on(''), rng('2026-06-10', '2026-06-15')), false, 'empty value → false');
});
