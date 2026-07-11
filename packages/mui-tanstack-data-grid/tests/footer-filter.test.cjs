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
