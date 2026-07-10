// toolbarVariant: 'icon' (default) renders icon-only buttons with an aria-label/tooltip;
// 'text' renders icon + a visible text label. Same controls, same overrides — just the shell.
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { DataTable } = require('../dist/cjs/index.js');

const columns = [{ accessorKey: 'name', header: 'Name' }];
const data = [{ id: 1, name: 'Alice' }];
const toolbarProps = { enableColumnVisibility: true, enableExport: true, enableDensitySelector: true, enableReset: true };
const render = (props) => renderToStaticMarkup(React.createElement(DataTable, { columns, data, ...toolbarProps, ...props }));

test("default variant is icon-only (label in aria-label/tooltip, not visible text)", () => {
    const html = render({});
    assert.ok(html.includes('aria-label="Columns"'), 'Columns is an icon button with an aria-label');
    assert.ok(!/>Columns</.test(html), 'no visible "Columns" text label in icon mode');
});

test("toolbarVariant='text' renders a visible label for each control", () => {
    const html = render({ toolbarVariant: 'text' });
    for (const label of ['Columns', 'Density', 'Export', 'Reset layout']) {
        assert.ok(html.includes(`>${label}</span>`) || html.includes(`>${label}<`), `"${label}" renders as a visible label`);
    }
});

test("controls still carry their icon in text mode", () => {
    const html = render({ toolbarVariant: 'text' });
    // MUI Button startIcon wrapper is present
    assert.ok(html.includes('MuiButton-startIcon'), 'text buttons keep their leading icon');
});
