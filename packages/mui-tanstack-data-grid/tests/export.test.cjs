'use strict';

const test = require('node:test');
const assert = require('node:assert');

// Require the specific compiled modules (no React/MUI/DOM pulled in).
const { sanitizeCSVCellValue, resolveExportHeader } = require('../dist/cjs/utils/export/format.js');
const { csvHeaderLine, csvRowLine, recordsToCSV, MAX_XLSX_ROWS } = require('../dist/cjs/utils/export/serialize.js');
const { buildExportRequest } = require('../dist/cjs/utils/export/request.js');

test('sanitizeCSVCellValue defuses every formula-injection lead, including TAB and CR', () => {
    assert.strictEqual(sanitizeCSVCellValue('=SUM(A1)'), "'=SUM(A1)");
    assert.strictEqual(sanitizeCSVCellValue('+1'), "'+1");
    assert.strictEqual(sanitizeCSVCellValue('-1'), "'-1");
    assert.strictEqual(sanitizeCSVCellValue('@cmd'), "'@cmd");
    assert.strictEqual(sanitizeCSVCellValue('\tinject'), "'\tinject"); // TAB — the gap the old code missed
    assert.strictEqual(sanitizeCSVCellValue('\rinject'), "'\rinject"); // CR  — also missed before
    assert.strictEqual(sanitizeCSVCellValue('normal'), 'normal');
    assert.strictEqual(sanitizeCSVCellValue(42), 42); // non-strings pass through
    assert.strictEqual(sanitizeCSVCellValue(''), '');
});

test('csvHeaderLine / csvRowLine quote and escape correctly', () => {
    assert.strictEqual(csvHeaderLine(['A', 'B']), 'A,B');
    assert.strictEqual(
        csvRowLine({ A: 'a,b', B: 'he"llo', C: 'x' }, ['A', 'B', 'C']),
        '"a,b","he""llo",x',
    );
    // newline forces quoting
    assert.strictEqual(csvRowLine({ A: 'line1\nline2' }, ['A']), '"line1\nline2"');
});

test('recordsToCSV builds a full table line-by-line', () => {
    const csv = recordsToCSV([{ Name: 'Liam', Age: 1 }, { Name: 'Mia', Age: 2 }]);
    assert.strictEqual(csv, 'Name,Age\nLiam,1\nMia,2');
    assert.strictEqual(recordsToCSV([]), '');
});

test('MAX_XLSX_ROWS is Excel’s exact ceiling', () => {
    assert.strictEqual(MAX_XLSX_ROWS, 1_048_575);
});

test('resolveExportHeader honors exportHeader (string + function) and falls back to header', () => {
    assert.strictEqual(resolveExportHeader({ header: 'Name' }, 'name'), 'Name');
    assert.strictEqual(resolveExportHeader({ header: 'Name', exportHeader: 'Full Name' }, 'name'), 'Full Name');
    assert.strictEqual(
        resolveExportHeader({ header: 'Name', exportHeader: (c) => `${c.defaultHeader}!` }, 'name'),
        'Name!',
    );
    assert.strictEqual(resolveExportHeader({}, 'fallback_id'), 'fallback_id');
});

function mockTable(columns) {
    return { getVisibleLeafColumns: () => columns, getAllLeafColumns: () => columns };
}

const COLUMNS = [
    { id: '_selection', columnDef: { header: '' } }, // special helper col — excluded
    { id: 'name', accessorFn: (r) => r.name, columnDef: { header: 'Name' } },
    { id: 'email', accessorFn: (r) => r.email, columnDef: { header: 'Email', exportHeader: 'E-mail Address' } },
    { id: 'secret', accessorFn: (r) => r.secret, columnDef: { header: 'Secret', hideInExport: true } }, // excluded
    { id: 'actions', columnDef: { header: 'Actions' } }, // accessorless display col — excluded
    { id: 'full', columnDef: { header: 'Full', exportValue: () => 'x' } }, // no accessor but opts in via exportValue — kept
];

test('buildExportRequest resolves visible columns, drops special + hideInExport + accessorless display, keeps order/headers', () => {
    const { request, columns } = buildExportRequest(mockTable(COLUMNS), {
        format: 'csv',
        filename: 'users',
        filters: {},
    });
    // _selection (special), secret (hideInExport), actions (no accessor) dropped; full kept via exportValue.
    assert.deepStrictEqual(request.columns.map((c) => c.id), ['name', 'email', 'full']);
    assert.deepStrictEqual(request.columns.map((c) => c.header), ['Name', 'E-mail Address', 'Full']);
    assert.strictEqual(columns.length, 3); // resolved (with column refs) matches
    assert.strictEqual(request.scope, 'all'); // no filters, no selection
});

test('buildExportRequest derives scope: selected > filtered > all', () => {
    const selected = buildExportRequest(mockTable(COLUMNS), {
        format: 'csv',
        filename: 'x',
        onlySelectedRows: true,
        selection: { ids: ['1', '2'], type: 'include' },
    });
    assert.strictEqual(selected.request.scope, 'selected');
    assert.ok(selected.request.selection, 'selection carried for selected scope');

    const filtered = buildExportRequest(mockTable(COLUMNS), {
        format: 'csv',
        filename: 'x',
        filters: { globalFilter: 'ada' },
    });
    assert.strictEqual(filtered.request.scope, 'filtered');

    const all = buildExportRequest(mockTable(COLUMNS), { format: 'csv', filename: 'x', filters: {} });
    assert.strictEqual(all.request.scope, 'all');
});

test('buildExportRequest honors an explicit column whitelist + order', () => {
    const { request } = buildExportRequest(mockTable(COLUMNS), {
        format: 'csv',
        filename: 'x',
        columns: ['email', 'name'], // reversed order
    });
    assert.deepStrictEqual(request.columns.map((c) => c.id), ['email', 'name']);
});
