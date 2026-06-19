// Height / scroll model (`stickyHeader` / `stickyFooter` / `maxHeight` / `height` / `minHeight`).
const test = require('node:test');
const assert = require('node:assert/strict');
const {
    resolveScrollLayout,
    DEFAULT_MAX_HEIGHT,
} = require('../dist/cjs/components/grid/scroll-layout.js');

test('auto height by default — no bound, no scroll viewport', () => {
    const r = resolveScrollLayout({});
    assert.equal(r.scrollable, false);
    assert.equal(r.rootStyle, undefined);
    assert.equal(r.scrollerStyle, undefined);
});

test('stickyHeader alone bounds the body at the default cap', () => {
    const r = resolveScrollLayout({ stickyHeader: true });
    assert.equal(r.scrollable, true);
    assert.deepEqual(r.scrollerStyle, { maxHeight: DEFAULT_MAX_HEIGHT });
    assert.equal(r.rootStyle, undefined);
});

test('stickyFooter alone also bounds the body (footer pins to bottom)', () => {
    const r = resolveScrollLayout({ stickyFooter: true });
    assert.equal(r.scrollable, true);
    assert.deepEqual(r.scrollerStyle, { maxHeight: DEFAULT_MAX_HEIGHT });
});

test('virtualization bounds the body so the virtualizer has a scroll parent', () => {
    const r = resolveScrollLayout({ enableVirtualization: true });
    assert.equal(r.scrollable, true);
    assert.deepEqual(r.scrollerStyle, { maxHeight: DEFAULT_MAX_HEIGHT });
});

test('maxHeight is active on its own (number and CSS string)', () => {
    assert.deepEqual(resolveScrollLayout({ maxHeight: 300 }).scrollerStyle, { maxHeight: 300 });
    assert.deepEqual(resolveScrollLayout({ maxHeight: '50vh' }).scrollerStyle, { maxHeight: '50vh' });
    assert.equal(resolveScrollLayout({ maxHeight: 300 }).scrollable, true);
});

test('explicit maxHeight beats the default cap when sticky is also set', () => {
    const r = resolveScrollLayout({ stickyHeader: true, maxHeight: 240 });
    assert.deepEqual(r.scrollerStyle, { maxHeight: 240 });
});

test('height fixes the grid and fills via flex — no scroller maxHeight', () => {
    const r = resolveScrollLayout({ height: 600 });
    assert.equal(r.scrollable, true);
    assert.deepEqual(r.rootStyle, { height: 600 });
    assert.equal(r.scrollerStyle, undefined, 'fixed height fills via flex, not a cap');
});

test("height:'100%' fills a sized parent", () => {
    assert.deepEqual(resolveScrollLayout({ height: '100%' }).rootStyle, { height: '100%' });
});

test('height wins over maxHeight (no competing cap)', () => {
    const r = resolveScrollLayout({ height: 500, maxHeight: 300 });
    assert.deepEqual(r.rootStyle, { height: 500 });
    assert.equal(r.scrollerStyle, undefined);
});

test('minHeight alone is only a floor — no scroll viewport', () => {
    const r = resolveScrollLayout({ minHeight: 200 });
    assert.equal(r.scrollable, false, 'a floor does not create a scroll viewport');
    assert.deepEqual(r.rootStyle, { minHeight: 200 });
    assert.equal(r.scrollerStyle, undefined);
});

test('height + minHeight both land on the root', () => {
    const r = resolveScrollLayout({ height: 600, minHeight: 300 });
    assert.deepEqual(r.rootStyle, { height: 600, minHeight: 300 });
});

test('empty-string values are treated as unset', () => {
    const r = resolveScrollLayout({ height: '', maxHeight: '', minHeight: '' });
    assert.equal(r.scrollable, false);
    assert.equal(r.rootStyle, undefined);
    assert.equal(r.scrollerStyle, undefined);
});
