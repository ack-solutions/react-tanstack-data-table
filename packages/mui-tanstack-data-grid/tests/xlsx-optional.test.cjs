// `xlsx` is an OPTIONAL peer dependency (SheetJS abandoned the npm package at 0.18.5
// with unfixable parsing advisories). This grid only WRITES workbooks, and loads xlsx
// lazily on the Excel export path. Guard: Excel export works when xlsx is installed, and
// throws a clear, caught "install the peer" error when it is absent — never a raw
// module-resolution crash. CSV export never touches xlsx.
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const { buildXlsxBlob } = require('../dist/cjs/utils/export/serialize.js');
const { loadXlsx, XLSX_MISSING_MESSAGE } = require('../dist/cjs/utils/export/load-xlsx.js');

test('Excel export works when xlsx IS installed (writes a workbook blob)', async () => {
    const res = await buildXlsxBlob([{ unit: 'A-101', type: 'Flat' }, { unit: 'A-102', type: 'Shop' }], { sheetName: 'Units' });
    assert.ok(res.blob instanceof Blob, 'returns a Blob');
    assert.ok(res.blob.size > 0, 'the workbook has bytes');
    assert.equal(res.rows, 2);
    assert.equal(res.truncated, false);
});

test('the missing-peer message names xlsx and points at CSV', () => {
    assert.match(XLSX_MISSING_MESSAGE, /xlsx/);
    assert.match(XLSX_MISSING_MESSAGE, /CSV/i);
});

test('Excel export with xlsx ABSENT throws the clear peer error (not a module-resolution crash)', async () => {
    // Simulate the peer not being installed: make resolving 'xlsx' fail, and evict any cache.
    const originalResolve = Module._resolveFilename;
    for (const key of Object.keys(require.cache)) {
        if (key.includes(`${require('node:path').sep}xlsx${require('node:path').sep}`)) delete require.cache[key];
    }
    Module._resolveFilename = function (request, ...args) {
        if (request === 'xlsx') {
            const err = new Error("Cannot find module 'xlsx'");
            err.code = 'MODULE_NOT_FOUND';
            throw err;
        }
        return originalResolve.apply(this, [request, ...args]);
    };
    try {
        await assert.rejects(
            loadXlsx(),
            (err) => err instanceof Error && err.message === XLSX_MISSING_MESSAGE,
            'loadXlsx rejects with the actionable message, not a raw MODULE_NOT_FOUND',
        );
    } finally {
        Module._resolveFilename = originalResolve;
    }
});
