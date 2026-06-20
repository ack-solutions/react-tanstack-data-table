// Localization: locale-text merge + operator label localization.
const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveLocaleText, DEFAULT_LOCALE_TEXT, enUS } = require('../dist/cjs/locale/default-locale.js');
const { getOperators } = require('../dist/cjs/components/filters/operators.js');

test('resolveLocaleText — undefined returns the English defaults; enUS is the defaults', () => {
    assert.equal(resolveLocaleText(), DEFAULT_LOCALE_TEXT);
    assert.deepEqual(enUS, DEFAULT_LOCALE_TEXT);
    assert.notEqual(enUS, DEFAULT_LOCALE_TEXT, 'enUS is an independent copy, not the same reference');
    assert.equal(DEFAULT_LOCALE_TEXT.filterApply, 'Apply');
    assert.equal(DEFAULT_LOCALE_TEXT.selectedRows(3), '3 selected');
});

test('resolveLocaleText — partial override merges over defaults (untouched keys kept)', () => {
    const fr = resolveLocaleText({ filterApply: 'Appliquer', selectedRows: (n) => `${n} sélectionné(s)` });
    assert.equal(fr.filterApply, 'Appliquer');
    assert.equal(fr.selectedRows(2), '2 sélectionné(s)');
    assert.equal(fr.filterClearAll, 'Clear all', 'untouched key falls back to English');
    assert.equal(fr.noRows, 'No rows');
});

test('resolveLocaleText — operators are deep-merged, not replaced', () => {
    const merged = resolveLocaleText({ operators: { contains: 'Contient' } });
    assert.equal(merged.operators.contains, 'Contient', 'override applied');
    assert.equal(merged.operators.equals, 'Equals', 'sibling operator kept from defaults');
});

test('getOperators — labels localize from the operator map; keyed value unchanged; fallback to default label', () => {
    const ops = getOperators({ contains: 'Contient', between: 'Entre' });
    const text = ops.text.find((o) => o.value === 'contains');
    assert.equal(text.value, 'contains', 'value (logic key) unchanged');
    assert.equal(text.label, 'Contient', 'label localized');
    const num = ops.number.find((o) => o.value === 'between');
    assert.equal(num.label, 'Entre');
    const eq = ops.text.find((o) => o.value === 'equals');
    assert.equal(eq.label, 'Equals', 'un-overridden operator keeps default label');
    // no map → all English defaults
    assert.equal(getOperators().text.find((o) => o.value === 'contains').label, 'Contains');
});
