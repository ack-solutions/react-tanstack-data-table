// Regression guard: @mui/icons-material must always be imported PER-PATH
// (`import X from '@mui/icons-material/X'`), never via the barrel
// (`import { X } from '@mui/icons-material'`). The barrel can't be tree-shaken
// in the CJS build, so a barrel import forces every consumer to bundle the full
// ~2,100-icon set — the exact bug that broke a downstream app and forced an icon
// shim. There's no ESLint guard in this repo, so this test enforces the rule.
//
// See README "Icon rule — don't regress".
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SRC = path.join(__dirname, '..', 'src');

/** Every .ts/.tsx file under src/. */
function sourceFiles(dir) {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...sourceFiles(full));
        else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
    }
    return out;
}

// Matches a barrel import/require of the package root (no trailing slash):
//   import ... from '@mui/icons-material'
//   require('@mui/icons-material')
// but NOT the allowed per-path form '@mui/icons-material/Foo'.
const BARREL = /(from|require\(\s*)\s*['"]@mui\/icons-material['"]/;

test('no barrel imports of @mui/icons-material in src (must be per-path)', () => {
    const offenders = [];
    for (const file of sourceFiles(SRC)) {
        const lines = fs.readFileSync(file, 'utf8').split('\n');
        lines.forEach((line, i) => {
            if (BARREL.test(line)) {
                offenders.push(`${path.relative(SRC, file)}:${i + 1}  ${line.trim()}`);
            }
        });
    }
    assert.equal(
        offenders.length,
        0,
        `Barrel import of @mui/icons-material found — use per-path imports ` +
            `(import X from '@mui/icons-material/X'):\n  ${offenders.join('\n  ')}`,
    );
});
