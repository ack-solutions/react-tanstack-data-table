// State-persistence (`stateKey` / `persist`) — the pure read/write/storage logic.
const test = require('node:test');
const assert = require('node:assert/strict');
const {
    readPersistedState,
    writePersistedState,
    clearPersistedState,
    resolveStorage,
    DEFAULT_PERSIST_KEYS,
} = require('../dist/cjs/utils/persistence.js');

function memStorage() {
    const m = new Map();
    return {
        getItem: (k) => (m.has(k) ? m.get(k) : null),
        setItem: (k, v) => m.set(k, v),
        removeItem: (k) => m.delete(k),
        _map: m,
    };
}

test('write → read round-trips the whitelisted slices, excludes selection/expansion by default', () => {
    const s = memStorage();
    const state = {
        sorting: [{ id: 'name', desc: false }],
        pagination: { pageIndex: 2, pageSize: 25 },
        columnPinning: { left: ['_selection', 'name'], right: ['actions'] },
        density: 'compact',
        selectionState: { ids: [1], type: 'include' },
        expanded: { a: true },
    };
    writePersistedState(s, 'grid1', state, DEFAULT_PERSIST_KEYS);
    const back = readPersistedState(s, 'grid1');
    assert.deepEqual(back.sorting, state.sorting);
    assert.deepEqual(back.pagination, state.pagination);
    assert.deepEqual(back.columnPinning, state.columnPinning);
    assert.equal(back.density, 'compact');
    assert.equal(back.selectionState, undefined, 'selection excluded by default');
    assert.equal(back.expanded, undefined, 'expansion excluded by default');
});

test('tree expansion is persistable when opted into via include (opt-in, not default)', () => {
    const s = memStorage();
    writePersistedState(s, 'tree', { expanded: { '1': true, '1.0': true }, density: 'compact' }, ['expanded']);
    const back = readPersistedState(s, 'tree');
    assert.deepEqual(back.expanded, { '1': true, '1.0': true });
    assert.equal(back.density, undefined, 'only included keys are written');
    assert.ok(!DEFAULT_PERSIST_KEYS.includes('expanded'), 'expanded stays opt-in (not in DEFAULT_PERSIST_KEYS)');
    // expand-all sentinel (true) must survive a round-trip, not collapse to {}
    const s2 = memStorage();
    writePersistedState(s2, 'all', { expanded: true }, ['expanded']);
    assert.equal(readPersistedState(s2, 'all').expanded, true, 'expanded:true (expand-all) round-trips faithfully');
});

test('include whitelist limits what is written', () => {
    const s = memStorage();
    writePersistedState(s, 'g', { sorting: [{ id: 'x', desc: true }], globalFilter: 'hi', density: 'comfortable' }, ['sorting']);
    const back = readPersistedState(s, 'g');
    assert.deepEqual(back.sorting, [{ id: 'x', desc: true }]);
    assert.equal(back.globalFilter, undefined);
    assert.equal(back.density, undefined);
});

test('storage key is namespaced; missing key / storage are safe no-ops', () => {
    const s = memStorage();
    writePersistedState(s, 'k', { density: 'compact' }, DEFAULT_PERSIST_KEYS);
    assert.ok(s._map.has('dt:k'), 'key is namespaced under dt:');
    assert.deepEqual(readPersistedState(s, undefined), {});
    assert.deepEqual(readPersistedState(null, 'k'), {});
    assert.doesNotThrow(() => writePersistedState(null, 'k', { density: 'compact' }, DEFAULT_PERSIST_KEYS));
});

test('read tolerates corrupt JSON', () => {
    const s = memStorage();
    s.setItem('dt:bad', '{not valid json');
    assert.deepEqual(readPersistedState(s, 'bad'), {});
});

test('resolveStorage: built-ins null under SSR, custom Storage-like always honored', () => {
    assert.equal(typeof window, 'undefined', 'node:test has no window');
    assert.equal(resolveStorage(), null, 'default local → null under SSR');
    assert.equal(resolveStorage({ storage: 'session' }), null, 'session → null under SSR');
    const custom = memStorage();
    assert.equal(resolveStorage({ storage: custom }), custom, 'custom storage works under SSR');
});

test('clearPersistedState removes the saved snapshot', () => {
    const s = memStorage();
    writePersistedState(s, 'gone', { density: 'compact' }, DEFAULT_PERSIST_KEYS);
    assert.ok(s._map.has('dt:gone'));
    clearPersistedState('gone', { storage: s });
    assert.ok(!s._map.has('dt:gone'), 'snapshot removed');
    assert.doesNotThrow(() => clearPersistedState(undefined, { storage: s }), 'no key → no-op');
    assert.doesNotThrow(() => clearPersistedState('x'), 'default storage under SSR → no-op, no throw');
});

test('DEFAULT_PERSIST_KEYS covers layout + view, not selection/expansion', () => {
    assert.ok(DEFAULT_PERSIST_KEYS.includes('columnPinning'));
    assert.ok(DEFAULT_PERSIST_KEYS.includes('density'));
    assert.ok(!DEFAULT_PERSIST_KEYS.includes('selectionState'));
    assert.ok(!DEFAULT_PERSIST_KEYS.includes('expanded'));
});
