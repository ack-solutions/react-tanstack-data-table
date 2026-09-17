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
    { id: 1, name: 'Ann', age: 1 },
    { id: 2, name: 'Ben', age: 2 },
    { id: 3, name: 'Cal', age: 3 },
    { id: 4, name: 'Dee', age: 4 },
    { id: 5, name: 'Eve', age: 5 },
];

function mockTable(onInMemoryRead, options) {
    return {
        options,
        getVisibleLeafColumns: () => COLUMNS,
        getAllLeafColumns: () => COLUMNS,
        getFilteredRowModel: () => {
            onInMemoryRead?.();
            return { rows: [{ original: { name: 'Loaded', age: 0 }, getValue: (id) => ({ name: 'Loaded', age: 0 })[id] }] };
        },
    };
}

async function exportCsv(table, extra) {
    const events = { error: null, complete: null, progress: [] };
    const before = downloads.length;
    await runExport(table, {
        mode: 'client',
        request: { format: 'csv', filename: 'users' },
        sink: 'blob',
        signal: new AbortController().signal,
        onError: (e) => (events.error = e),
        onProgress: (p) => events.progress.push(p),
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

// ── scope: 'selected' over paged onFetchData ────────────────────────────────
// onFetchData returns every matching row, so the paged branch must filter by the selection.

/** A pager over ROWS that records each call (page index + the export context it received). */
function recordingPager() {
    const calls = [];
    const fetchPage = async (pageIndex, pageSize, _signal, context) => {
        calls.push({ pageIndex, context });
        return { data: ROWS.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize), total: ROWS.length };
    };
    return { calls, fetchPage };
}

const selectedRequest = (selection) => ({ format: 'csv', filename: 'users', onlySelectedRows: true, selection });

test('include selection: only the selected rows are exported, and paging stops once all are found', async () => {
    const pager = recordingPager();
    const { error, csv, complete, progress } = await exportCsv(mockTable(), {
        dataMode: 'server',
        chunkSize: 2,
        request: selectedRequest({ ids: ['2', '4'], type: 'include' }),
        fetchPage: pager.fetchPage,
    });
    assert.equal(error, null);
    assert.equal(csv, 'Name,Age\nBen,2\nDee,4\n');
    assert.equal(complete.totalRows, 2);
    assert.deepEqual(pager.calls.map((c) => c.pageIndex), [0, 1], 'page 2 is never fetched — both ids were already found');
    const last = progress[progress.length - 1];
    assert.equal(last.totalRows, 2, 'progress total is the selected count, not the server total');
    assert.equal(last.percentage, 100);
});

test('the fetcher receives the export scope + selection, so a server can filter itself', async () => {
    const pager = recordingPager();
    const selection = { ids: ['3'], type: 'include' };
    await exportCsv(mockTable(), { dataMode: 'server', request: selectedRequest(selection), fetchPage: pager.fetchPage });
    assert.deepEqual(pager.calls[0].context, { scope: 'selected', selection });

    const all = recordingPager();
    await exportCsv(mockTable(), { dataMode: 'server', fetchPage: all.fetchPage });
    assert.equal(all.calls[0].context.scope, 'all');
    assert.equal(all.calls[0].context.selection, undefined);
});

test('a server that already filtered by selection is not double-filtered away', async () => {
    const { error, csv } = await exportCsv(mockTable(), {
        dataMode: 'server',
        request: selectedRequest({ ids: ['5', '1'], type: 'include' }),
        fetchPage: async () => ({ data: [ROWS[0], ROWS[4]], total: 2 }),
    });
    assert.equal(error, null);
    assert.equal(csv, 'Name,Age\nAnn,1\nEve,5\n', 'rows keep server order');
});

test('exclude selection ("all except"): excluded ids are dropped across every page', async () => {
    const pager = recordingPager();
    const { error, csv, progress } = await exportCsv(mockTable(), {
        dataMode: 'server',
        chunkSize: 2,
        request: selectedRequest({ ids: ['1', '5'], type: 'exclude' }),
        fetchPage: pager.fetchPage,
    });
    assert.equal(error, null);
    assert.equal(csv, 'Name,Age\nBen,2\nCal,3\nDee,4\n');
    assert.deepEqual(pager.calls.map((c) => c.pageIndex), [0, 1, 2], 'exclude must walk every page');
    assert.equal(progress[progress.length - 1].totalRows, 3, 'progress total = server total − excluded');
});

test("row ids resolve through the table's getRowId, like the grid", async () => {
    const pager = recordingPager();
    const { csv } = await exportCsv(mockTable(undefined, { getRowId: (row) => `user-${row.id}` }), {
        dataMode: 'server',
        request: selectedRequest({ ids: ['user-3'], type: 'include' }),
        fetchPage: pager.fetchPage,
    });
    assert.equal(csv, 'Name,Age\nCal,3\n');
});

test('strictTotalCheck does not reject an include export that stopped paging early', async () => {
    const pager = recordingPager();
    const { error, csv } = await exportCsv(mockTable(), {
        dataMode: 'server',
        chunkSize: 2,
        strictTotalCheck: true,
        request: selectedRequest({ ids: ['1'], type: 'include' }),
        fetchPage: pager.fetchPage,
    });
    assert.equal(error, null);
    assert.equal(csv, 'Name,Age\nAnn,1\n');
    assert.equal(pager.calls.length, 1);
});

test('selected ids missing from the results: the whole result set is walked and nothing extra is written', async () => {
    const pager = recordingPager();
    const { error, csv } = await exportCsv(mockTable(), {
        dataMode: 'server',
        chunkSize: 2,
        request: selectedRequest({ ids: ['4', '99'], type: 'include' }),
        fetchPage: pager.fetchPage,
    });
    assert.equal(error, null);
    assert.equal(csv, 'Name,Age\nDee,4\n');
    assert.deepEqual(pager.calls.map((c) => c.pageIndex), [0, 1, 2]);
});
