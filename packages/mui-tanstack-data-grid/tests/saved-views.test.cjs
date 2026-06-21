// Saved-views storage helpers — round-trip + resilience under a mock Storage.
const test = require('node:test');
const assert = require('node:assert/strict');

const { readPersistedViews, writePersistedViews, clearPersistedViews } = require('../dist/cjs/utils/persistence.js');
const { buildViewSnapshot, stableStringify } = require('../dist/cjs/utils/view-snapshot.js');

function mockStorage(seed = {}) {
    const map = new Map(Object.entries(seed));
    return {
        getItem: (k) => (map.has(k) ? map.get(k) : null),
        setItem: (k, v) => map.set(k, v),
        removeItem: (k) => map.delete(k),
        _map: map,
    };
}

const sampleFile = {
    version: 1,
    activeViewId: 'v1',
    views: [{ id: 'v1', name: 'Admins', state: { columnVisibility: { email: false }, sorting: [{ id: 'name', desc: false }] } }],
};

test('writePersistedViews → readPersistedViews round-trips under dt:<key>:views', () => {
    const s = mockStorage();
    writePersistedViews(s, 'grid', sampleFile);
    assert.ok(s._map.has('dt:grid:views'), 'writes the namespaced views key');
    assert.deepEqual(readPersistedViews(s, 'grid'), sampleFile);
});

test('readPersistedViews — default file on missing / malformed / non-array views', () => {
    const empty = { version: 1, activeViewId: null, views: [] };
    assert.deepEqual(readPersistedViews(mockStorage(), 'grid'), empty, 'missing → empty file');
    assert.deepEqual(readPersistedViews(mockStorage({ 'dt:grid:views': '{not json' }), 'grid'), empty, 'malformed → empty file');
    assert.deepEqual(readPersistedViews(mockStorage({ 'dt:grid:views': '{"version":1,"views":"nope"}' }), 'grid'), empty, 'non-array views → empty file');
});

test('readPersistedViews — defaults activeViewId to null when absent', () => {
    const s = mockStorage({ 'dt:grid:views': JSON.stringify({ version: 1, views: [{ id: 'a', name: 'A', state: {} }] }) });
    const out = readPersistedViews(s, 'grid');
    assert.equal(out.activeViewId, null);
    assert.equal(out.views.length, 1);
});

test('read/write/clear — SSR-safe no-ops without storage or key', () => {
    const empty = { version: 1, activeViewId: null, views: [] };
    assert.deepEqual(readPersistedViews(null, 'grid'), empty);
    assert.deepEqual(readPersistedViews(mockStorage(), undefined), empty);
    assert.doesNotThrow(() => writePersistedViews(null, 'grid', sampleFile));
    assert.doesNotThrow(() => writePersistedViews(mockStorage(), undefined, sampleFile));
    assert.doesNotThrow(() => clearPersistedViews(undefined));
});

test('writePersistedViews — swallows a throwing (quota-exceeded) storage', () => {
    const bad = { getItem: () => null, setItem: () => { throw new Error('quota'); }, removeItem: () => {} };
    assert.doesNotThrow(() => writePersistedViews(bad, 'grid', sampleFile));
});

test('buildViewSnapshot — drops the pending column-filter staging buffer (only applied filters)', () => {
    const snap = buildViewSnapshot({
        columnFilter: {
            filters: [{ id: 'f1', columnId: 'status', operator: 'equals', value: 'active' }],
            logic: 'OR',
            pendingFilters: [{ id: 'p1', columnId: 'role', operator: 'equals', value: '' }],
            pendingLogic: 'AND',
        },
    });
    assert.deepEqual(snap.columnFilter.filters, [{ id: 'f1', columnId: 'status', operator: 'equals', value: 'active' }]);
    assert.equal(snap.columnFilter.logic, 'OR');
    assert.deepEqual(snap.columnFilter.pendingFilters, [], 'pending buffer is normalized away');
    assert.equal(snap.columnFilter.pendingLogic, 'OR');
});

test('buildViewSnapshot — opening the filter panel (adds a pending row) does NOT change the snapshot', () => {
    const applied = { columnFilter: { filters: [], logic: 'AND', pendingFilters: [], pendingLogic: 'AND' } };
    const withPending = { columnFilter: { filters: [], logic: 'AND', pendingFilters: [{ id: 'x', columnId: 'a', operator: 'contains', value: '' }], pendingLogic: 'AND' } };
    assert.equal(stableStringify(buildViewSnapshot(applied)), stableStringify(buildViewSnapshot(withPending)), 'pending changes are invisible to the dirty check');
});

test('buildViewSnapshot — density included only when provided (omitted when controlled)', () => {
    assert.equal(buildViewSnapshot({}).density, undefined, 'omitted when not passed (controlled)');
    assert.equal(buildViewSnapshot({}, 'compact').density, 'compact');
});

test('stableStringify — key-insertion order does not affect the result', () => {
    const a = { columnVisibility: { email: false, role: true }, sorting: [{ id: 'name', desc: false }] };
    const b = { sorting: [{ id: 'name', desc: false }], columnVisibility: { role: true, email: false } };
    assert.equal(stableStringify(a), stableStringify(b), 'same layout, different toggle order → equal');
    // arrays stay ordered (order is meaningful for sorting/columnOrder)
    assert.notEqual(stableStringify({ sorting: [{ id: 'a' }, { id: 'b' }] }), stableStringify({ sorting: [{ id: 'b' }, { id: 'a' }] }));
});
