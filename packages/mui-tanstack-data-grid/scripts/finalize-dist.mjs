// Post-build finalize step. Two jobs:
//
// 1. Add explicit .js / index.js extensions to every relative import/export in
//    dist/esm. TypeScript (module: ES2020) emits extensionless specifiers like
//    `export * from './components'`. Lenient bundlers (Vite, esbuild) cope, but
//    strict ESM resolvers — webpack 5 / Rspack / Next.js, and Node's native ESM
//    loader — require "fully specified" paths once a file is ESM, and otherwise
//    fail with "Can't resolve './components'". So we rewrite them here.
//
// 2. Drop a tiny package.json into each format dir so the .js files are read with
//    the right module system regardless of the root package's "type":
//      dist/cjs -> { type: commonjs }   dist/esm -> { type: module }
//    Both MUST repeat "sideEffects": false — bundlers resolve sideEffects from the
//    *closest* package.json to a module, so a nested marker without it shadows the
//    root flag and silently disables tree-shaking. (CommonJS resolution is not
//    "fully specified", so dist/cjs needs no extension rewrite.)
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const pkgDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const esmDir = join(pkgDir, 'dist/esm');

/** All .js files under a directory, recursively. */
function jsFiles(dir) {
    const out = [];
    for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) out.push(...jsFiles(full));
        else if (name.endsWith('.js')) out.push(full);
    }
    return out;
}

/** Resolve an extensionless relative specifier to a fully-specified one, or null to leave it. */
function withExtension(fromFile, spec) {
    if (!spec.startsWith('.')) return null;        // bare specifier (react, @mui, xlsx) — leave it
    if (/\.(js|mjs|cjs|json|css)$/i.test(spec)) return null; // already specified
    const target = resolve(dirname(fromFile), spec);
    if (existsSync(`${target}.js`)) return `${spec}.js`;
    if (existsSync(join(target, 'index.js'))) return `${spec}/index.js`;
    return null;
}

// Matches the module specifier in: `… from '…'`, `import('…')`, and bare `import '…'`.
const SPECIFIER = /(from\s*|import\s*\(\s*|import\s+)(["'])(\.[^"']+)\2/g;

let rewritten = 0;
for (const file of jsFiles(esmDir)) {
    const src = readFileSync(file, 'utf8');
    const next = src.replace(SPECIFIER, (match, lead, quote, spec) => {
        const fixed = withExtension(file, spec);
        return fixed ? `${lead}${quote}${fixed}${quote}` : match;
    });
    if (next !== src) {
        writeFileSync(file, next);
        rewritten += 1;
    }
}

writeFileSync(
    join(pkgDir, 'dist/cjs/package.json'),
    `${JSON.stringify({ type: 'commonjs', sideEffects: false }, null, 2)}\n`,
);
writeFileSync(
    join(pkgDir, 'dist/esm/package.json'),
    `${JSON.stringify({ type: 'module', sideEffects: false }, null, 2)}\n`,
);

console.log(
    `finalize-dist: added ESM extensions in ${rewritten} file(s); wrote dist/{cjs,esm}/package.json (sideEffects:false)`,
);
