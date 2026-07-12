// The grid's spacing + typography must follow the MUI theme, not hardcoded values.
// Padding derives from theme.spacing() and font-size from theme.typography.body2 —
// both surface as --dt-* tokens on the root's inline style. These tests assert the
// DERIVATION (token === theme.spacing(preset units), font === scaled body2), so they
// stay correct when the density presets are tuned.
const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { ThemeProvider, createTheme } = require('@mui/material/styles');
const { DataTable } = require('../dist/cjs/index.js');
const { DENSITY_PRESETS } = require('../dist/cjs/theme/tokens.js');

const columns = [{ accessorKey: 'name', header: 'Name' }];
const data = [{ id: 1, name: 'Alice' }];
const DENSITIES = ['compact', 'standard', 'comfortable'];

function tokens(theme, density) {
    const html = renderToStaticMarkup(
        React.createElement(ThemeProvider, { theme }, React.createElement(DataTable, { columns, data, density })),
    );
    const m = html.match(/style="([^"]*--dt-cell-padding-x[^"]*)"/);
    const style = m ? m[1] : '';
    const get = (k) => {
        const mm = style.match(new RegExp(k.replace(/-/g, '\\-') + ':\\s*([^;"]+)'));
        return mm ? mm[1].trim() : null;
    };
    return {
        padX: get('--dt-cell-padding-x'), padY: get('--dt-cell-padding-y'), font: get('--dt-font-size'),
        bulkbarBg: get('--dt-bulkbar-bg'), bulkbarFg: get('--dt-bulkbar-fg'),
    };
}

test('cell padding at every density === theme.spacing(preset units)', () => {
    const t = createTheme();
    for (const density of DENSITIES) {
        const preset = DENSITY_PRESETS[density];
        const got = tokens(t, density);
        assert.equal(got.padX, t.spacing(preset.cellPaddingX), `${density} padX = theme.spacing(${preset.cellPaddingX})`);
        assert.equal(got.padY, t.spacing(preset.cellPaddingY), `${density} padY = theme.spacing(${preset.cellPaddingY})`);
    }
});

test('cell padding scales with a custom theme.spacing (not hardcoded px)', () => {
    const custom = createTheme({ spacing: 10 });
    const preset = DENSITY_PRESETS.standard;
    const got = tokens(custom, 'standard');
    assert.equal(got.padX, custom.spacing(preset.cellPaddingX), 'padX tracks the custom spacing factor');
    assert.equal(got.padY, custom.spacing(preset.cellPaddingY));
    assert.notEqual(got.padX, createTheme().spacing(preset.cellPaddingX), 'and it actually differs from the default spacing');
});

test('font-size derives from theme.typography.body2, scaled by the density factor', () => {
    // body2 = 1rem → standard (scale 1) is 1rem verbatim; other densities are a calc().
    const t = createTheme({ typography: { body2: { fontSize: '1rem' } } });
    assert.equal(tokens(t, 'standard').font, '1rem', 'standard uses body2 size verbatim (scale 1)');
    const compactScale = DENSITY_PRESETS.compact.fontScale;
    const expected = compactScale === 1 ? '1rem' : `calc(1rem * ${compactScale})`;
    assert.equal(tokens(t, 'compact').font, expected, 'other densities scale the theme size');
});

test('a numeric body2 fontSize is normalised to px', () => {
    const t = createTheme({ typography: { body2: { fontSize: 15 } } });
    assert.equal(tokens(t, 'standard').font, '15px');
});

test('bulk-actions bar tokens default from the theme primary palette (not hardcoded)', () => {
    const t = createTheme();
    const got = tokens(t, 'standard');
    assert.equal(got.bulkbarBg, t.palette.primary.main, '--dt-bulkbar-bg === palette.primary.main');
    assert.equal(got.bulkbarFg, t.palette.primary.contrastText, '--dt-bulkbar-fg === palette.primary.contrastText');
    // and it actually tracks a custom primary (proves it's derived, not a hardcoded blue)
    const custom = createTheme({ palette: { primary: { main: '#ff0000' } } });
    assert.equal(tokens(custom, 'standard').bulkbarBg, custom.palette.primary.main);
    assert.notEqual(tokens(custom, 'standard').bulkbarBg, t.palette.primary.main);
});
