// Theme: createDataTableTheme emits per-scheme colorSchemes (no flat palette),
// and the palette resolver prefers `theme.vars` so colours follow `colorSchemes`
// under MUI `cssVariables: true`.
const test = require('node:test');
const assert = require('node:assert/strict');
const { createDataTableTheme } = require('../dist/cjs/theme/create-data-table-theme.js');
const { resolveDataGridPalette } = require('../dist/cjs/theme/palette.js');

test('createDataTableTheme emits colorSchemes overrides, never a flat top-level palette', () => {
    const t = createDataTableTheme({ palette: { headerBg: '#abc' } });
    assert.equal(t.palette, undefined, 'no flat top-level palette leaked onto a cssVariables theme');
    assert.equal(t.colorSchemes.light.palette.tanstackDataGrid.headerBg, '#abc');
    assert.equal(t.colorSchemes.dark.palette.tanstackDataGrid.headerBg, '#abc', 'dark defaults to palette when no darkPalette');
});

test('createDataTableTheme honors a separate darkPalette', () => {
    const t = createDataTableTheme({ palette: { headerBg: '#fff' }, darkPalette: { headerBg: '#111' } });
    assert.equal(t.colorSchemes.light.palette.tanstackDataGrid.headerBg, '#fff');
    assert.equal(t.colorSchemes.dark.palette.tanstackDataGrid.headerBg, '#111');
});

test('createDataTableTheme with no palette only registers the component', () => {
    const t = createDataTableTheme({ defaultProps: { density: 'compact' } });
    assert.equal(t.colorSchemes, undefined);
    assert.equal(t.palette, undefined);
    assert.equal(t.components.MuiTanstackDataGrid.defaultProps.density, 'compact');
});

const mkPalette = (tag, mode = 'light') => ({
    mode,
    divider: `${tag}_divider`,
    grey: { 50: `${tag}_g50`, 900: `${tag}_g900` },
    text: { secondary: `${tag}_ts` },
    background: { paper: `${tag}_bp` },
    action: { hover: `${tag}_ah`, selected: `${tag}_as` },
    primary: { main: `${tag}_pm` },
});

test('resolveDataGridPalette prefers theme.vars (cssVariables) over resolved palette', () => {
    const theme = { vars: { palette: mkPalette('VAR') }, palette: mkPalette('RES') };
    const pal = resolveDataGridPalette(theme);
    assert.equal(pal.borderColor, 'VAR_divider', 'reads divider from theme.vars, not theme.palette');
    assert.equal(pal.pinnedBg, 'VAR_bp');
    assert.equal(pal.rowHoverBg, 'VAR_ah');
    assert.equal(pal.selectedBg, 'VAR_as');
    assert.equal(pal.headerColor, 'VAR_ts');
});

test('resolveDataGridPalette falls back to resolved palette for classic themes (no vars)', () => {
    const pal = resolveDataGridPalette({ palette: mkPalette('C', 'dark') });
    assert.equal(pal.borderColor, 'C_divider');
    assert.equal(pal.pinnedBg, 'C_bp');
});

test('explicit palette.tanstackDataGrid overrides win', () => {
    const palette = { ...mkPalette('RES'), tanstackDataGrid: { borderColor: '#custom' } };
    const pal = resolveDataGridPalette({ palette });
    assert.equal(pal.borderColor, '#custom');
});
