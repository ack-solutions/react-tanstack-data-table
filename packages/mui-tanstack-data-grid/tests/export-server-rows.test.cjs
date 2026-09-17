'use strict';

// runExport row sourcing for `client` / `server-data` with server data. The reported bug:
// an always-present `onFetchData` pager shadowed a one-shot `onServerExport` → `{ data, total }`
// handler, so grids without `onFetchData` could not export at all.
const test = require('node:test');
const assert = require('node:assert/strict');

const { runExport } = require('../dist/cjs/utils/export/modes.js');

// Minimal browser download stubs: capture the Blob the blob sink hands to the anchor download.
const downloads = [];
globalThis.document = {
    createElement: () => ({ style: {}, click() {} }),
    body: { appendChild() {}, removeChild() {} },
};
URL.createObjectURL = (blob) => {
    downloads.push(blob);
    return 'blob:test';
};
URL.revokeObjectURL = () => {};

const COLUMNS = [
    { id: 'name', accessorFn: (r) => r.name, columnDef: { header: 'Name' } },
    { id: 'age', accessorFn: (r) => r.age, columnDef: { header: 'Age' } },
];
const ROWS = [
    { name: 'Ann', age: 1 },
    { name: 'Ben', age: 2 },
    { name: 'Cal', age: 3 },
    { name: 'Dee', age: 4 },
    { name: 'Eve', age: 5 },
];

function mockTable(onInMemoryRead) {
    return {
        getVisibleLeafColumns: () => COLUMNS,
        getAllLeafColumns: () => COLUMNS,
        getFilteredRowModel: () => {
            onInMemoryRead?.();
            return { rows: [{ original: { name: 'Loaded', age: 0 }, getValue: (id) => ({ name: 'Loaded', age: 0 })[id] }] };
        },
    };
}

async function exportCsv(table, extra) {
    const events = { error: null, complete: null };
    const before = downloads.length;
    await runExport(table, {
        mode: 'client',
        request: { format: 'csv', filename: 'users' },
        sink: 'blob',
        signal: new AbortController().signal,
        onError: (e) => (events.error = e),
        onComplete: (r) => (events.complete = r),
        ...extra,
    });
    const blob = downloads.length > before ? downloads[downloads.length - 1] : null;
    events.csv = blob ? await blob.text() : null;
    return events;
}

test('server data without onFetchData: one-shot onServerExport → { data, total } exports every row, in batches', async () => {
    let request;
    const { error, complete, csv } = await exportCsv(mockTable(), {
        dataMode: 'server',
        chunkSize: 2, // 5 rows → 3 batches
        onServerExport: async (req) => {
            request = req;
            return { data: ROWS, total: ROWS.length };
        },
    });
    assert.equal(error, null);
    assert.deepEqual(request.columns.map((c) => c.id), ['name', 'age'], 'the handler receives the ExportRequest');
    assert.equal(csv, 'Name,Age\nAnn,1\nBen,2\nCal,3\nDee,4\nEve,5\n');
    assert.equal(complete.totalRows, 5);
});

test('onFetchData paging takes precedence over onServerExport (keeps per-call server-file handlers working)', async () => {
    let serverExportCalls = 0;
    const { error, csv } = await exportCsv(mockTable(), {
        dataMode: 'server',
        fetchPage: async (pageIndex, pageSize) => ({ data: ROWS.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize), total: ROWS.length }),
        onServerExport: async () => {
            serverExportCalls += 1;
            return { fileUrl: 'https://example.com/file.csv' };
        },
    });
    assert.equal(error, null);
    assert.equal(serverExportCalls, 0);
    assert.equal(csv.split('\n').filter(Boolean).length, 6, 'header + 5 paged rows');
});

test('server data with no row source errors instead of silently exporting only the loaded page', async () => {
    let inMemoryRead = false;
    const { error, csv } = await exportCsv(mockTable(() => (inMemoryRead = true)), { dataMode: 'server' });
    assert.match(error.message, /onFetchData|onServerExport/);
    assert.equal(inMemoryRead, false);
    assert.equal(csv, null, 'no file is written');
});

test('a blob/fileUrl result in client mode gives an actionable error', async () => {
    const { error } = await exportCsv(mockTable(), {
        dataMode: 'server',
        onServerExport: async () => ({ fileUrl: 'https://example.com/file.csv' }),
    });
    assert.match(error.message, /server-file/);
});

test('strictTotalCheck rejects a partial one-shot result; without it the rows received are written', async () => {
    const partial = async () => ({ data: ROWS.slice(0, 3), total: 10 });

    const strict = await exportCsv(mockTable(), { dataMode: 'server', strictTotalCheck: true, onServerExport: partial });
    assert.match(strict.error.message, /3 of 10/);
    assert.equal(strict.csv, null);

    const lenient = await exportCsv(mockTable(), { dataMode: 'server', onServerExport: partial });
    assert.equal(lenient.error, null);
    assert.equal(lenient.complete.totalRows, 3);
});

test('client data ignores onServerExport and exports the in-memory rows', async () => {
    let serverExportCalls = 0;
    const { error, csv } = await exportCsv(mockTable(), {
        dataMode: 'client',
        onServerExport: async () => {
            serverExportCalls += 1;
            return { data: ROWS };
        },
    });
    assert.equal(error, null);
    assert.equal(serverExportCalls, 0);
    assert.equal(csv, 'Name,Age\nLoaded,0\n');
});
