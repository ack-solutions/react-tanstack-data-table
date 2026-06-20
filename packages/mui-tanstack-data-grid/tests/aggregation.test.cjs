// Footer aggregation math.
const test = require('node:test');
const assert = require('node:assert/strict');

const { computeAggregation, formatAggregation } = require('../dist/cjs/utils/aggregation.js');

test('computeAggregation — sum/avg/min/max over numeric values, count over all', () => {
    const v = [10, 20, 30];
    assert.equal(computeAggregation('sum', v), 60);
    assert.equal(computeAggregation('avg', v), 20);
    assert.equal(computeAggregation('min', v), 10);
    assert.equal(computeAggregation('max', v), 30);
    assert.equal(computeAggregation('count', v), 3);
});

test('computeAggregation — numeric strings coerced; empty/null/non-numeric skipped (count keeps all)', () => {
    const v = ['10', '', null, 'abc', 20, undefined];
    assert.equal(computeAggregation('sum', v), 30, 'only 10 + 20');
    assert.equal(computeAggregation('avg', v), 15);
    assert.equal(computeAggregation('count', v), 6, 'count includes every row');
    assert.equal(computeAggregation('min', v), 10);
    assert.equal(computeAggregation('max', v), 20);
});

test('computeAggregation — empty numeric set: sum 0, avg/min/max null; count 0', () => {
    const v = ['', null, 'x'];
    assert.equal(computeAggregation('sum', v), 0);
    assert.equal(computeAggregation('avg', v), null);
    assert.equal(computeAggregation('min', v), null);
    assert.equal(computeAggregation('max', v), null);
    assert.equal(computeAggregation('count', []), 0);
});

test('computeAggregation — min/max survive large inputs (reduce, not Math.min(...spread))', () => {
    const big = Array.from({ length: 200000 }, (_, i) => i);
    assert.equal(computeAggregation('min', big), 0);
    assert.equal(computeAggregation('max', big), 199999);
    assert.equal(computeAggregation('sum', [1, 2, 3, 4]), 10);
});

test('formatAggregation — avg rounds to 2dp, locale grouping, null → empty, custom passthrough', () => {
    assert.equal(formatAggregation('avg', 3.14159), (3.14).toLocaleString());
    assert.equal(formatAggregation('sum', 1234567), (1234567).toLocaleString());
    assert.equal(formatAggregation('min', null), '');
    assert.equal(formatAggregation('custom', 'N/A'), 'N/A');
});
