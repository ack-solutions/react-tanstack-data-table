// footerFilter: a custom node rendered on the LEFT of the footer (opposite pagination).
// Regression guard — it was a declared-but-never-rendered dead prop through 1.20.0.
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { DataTable } = require('../dist/cjs/index.js');

const columns = [{ accessorKey: 'name', header: 'Name' }];
const data = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
const marker = React.createElement('button', { 'data-footer-filter': 'SHOW_DELETED' }, 'Show deleted');
const render = (props) => renderToStaticMarkup(React.createElement(DataTable, { columns, data, ...props }));

// "Rows per page" is the pagination label — it only appears when a real TablePagination
// renders (the `.MuiTablePagination-*` class names are always in the footer's CSS).
const hasPagination = (html) => html.includes('Rows per page');

test('footerFilter renders in the footer (the reported dead prop is now live)', () => {
    const html = render({ footerFilter: marker, enablePagination: true });
    assert.ok(html.includes('data-footer-filter="SHOW_DELETED"'), 'the footerFilter node renders');
    assert.ok(hasPagination(html), 'pagination still renders alongside it');
});

test('footerFilter shows the footer even without pagination', () => {
    const html = render({ footerFilter: marker });
    assert.ok(html.includes('data-footer-filter="SHOW_DELETED"'), 'footer appears for footerFilter alone');
    assert.ok(!hasPagination(html), 'no pagination when it is not enabled');
});

test('no footer chrome when neither footerFilter nor pagination is set', () => {
    const html = render({});
    assert.ok(!html.includes('data-footer-filter'), 'nothing renders without footerFilter');
    assert.ok(!hasPagination(html), 'no pagination either');
});

// ── Narrow-screen layout (the reported overlap) ─────────────────────────────
// With a footerFilter the footer is one row (filter left, pager right), but the pager
// cannot shrink below its own controls — so below `sm` the footer wraps and the pager
// takes the next line instead of painting over "Show deleted".

const cssOf = (html) => [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('');
const footerClass = (html) => (cssOf(html).match(/\.(css-[a-z0-9]+-MuiTanstackDataGrid-footer)/) || [])[1];
const rulesFor = (html, selector) => cssOf(html).split('}').filter((r) => r.includes(selector));

test('the footer is marked when a footerFilter shares the row (so the CSS can target it)', () => {
    // The attribute is on the element; the same token also appears in the CSS rule, so match the tag.
    const attr = /data-has-footer-filter=""/;
    assert.ok(attr.test(render({ footerFilter: marker, enablePagination: true })), 'footer carries the marker attribute');
    assert.ok(!attr.test(render({ enablePagination: true })), 'pagination alone leaves it off');
});

test('footer wraps below sm and stays a single row from sm up', () => {
    const html = render({ footerFilter: marker, enablePagination: true });
    const cls = footerClass(html);
    const wrapRules = rulesFor(html, cls).filter((r) => /flex-wrap/.test(r));
    assert.ok(wrapRules.some((r) => /min-width:\s*0px/.test(r) && /flex-wrap:\s*wrap/.test(r)), 'below sm the footer wraps');
    assert.ok(wrapRules.some((r) => /min-width:\s*600px/.test(r) && /flex-wrap:\s*nowrap/.test(r)), 'from sm up it is one row');
});

test('the pager takes its own full-width line below sm, and hugs the right from sm up', () => {
    const html = render({ footerFilter: marker, enablePagination: true });
    const paginationRules = rulesFor(html, 'MuiTanstackDataGrid-pagination').filter((r) => /flex:/.test(r));
    assert.ok(paginationRules.some((r) => /min-width:\s*0px/.test(r) && /flex:\s*1 1 100%/.test(r)), 'own line below sm');
    assert.ok(paginationRules.some((r) => /min-width:\s*600px/.test(r) && /flex:\s*0 0 auto/.test(r)), 'content-sized from sm up');
    assert.ok(rulesFor(html, 'MuiTanstackDataGrid-pagination').some((r) => /max-width:\s*100%/.test(r)), 'never wider than the footer');
});

test('the pagination root is not forced to 100% while a footerFilter sibling is present', () => {
    const html = render({ footerFilter: marker, enablePagination: true });
    const scoped = rulesFor(html, '[data-has-footer-filter] .MuiTablePagination-root');
    assert.ok(scoped.some((r) => /width:\s*auto/.test(r)), 'it sizes to its wrapper instead of the whole footer');
    // The default (no footerFilter) full-width rule is untouched.
    assert.ok(rulesFor(html, 'MuiTanstackDataGrid-footer .MuiTablePagination-root').some((r) => /width:\s*100%/.test(r)));
});

test('the pagination toolbar can grow when its controls wrap (no fixed height overflow)', () => {
    const html = render({ footerFilter: marker, enablePagination: true });
    const toolbar = rulesFor(html, 'MuiTanstackDataGrid-footer .MuiTablePagination-toolbar');
    assert.ok(toolbar.some((r) => /height:\s*auto/.test(r) && /min-height:\s*48px/.test(r)), 'height auto with a 48px floor');
    assert.ok(toolbar.some((r) => /flex-wrap:\s*wrap/.test(r) && /justify-content:\s*flex-end/.test(r)), 'wraps, right-aligned');
});
