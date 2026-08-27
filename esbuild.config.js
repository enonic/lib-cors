import { readFile } from 'node:fs/promises';
import { build } from 'esbuild';

const isProduction = process.env.NODE_ENV === 'production';

const SRC = 'src/main/resources';
const OUT = 'build/esbuild';

const result = await build({
    entryPoints: [`${SRC}/lib/enonic/cors.ts`],
    outdir: OUT,
    outbase: SRC,
    bundle: true,
    format: 'cjs',
    target: 'es5',
    // Nashorn breaks `this` inside arrows and loses `for (let k of …)` bindings in closures, so
    // both stay lowered; see .claude/rules/typescript.md for the measured matrix
    supported: {
        'const-and-let': true,
    },
    platform: 'neutral',
    mainFields: ['module', 'main'],
    sourcemap: !isProduction,
    minify: false,
    metafile: true,
    ...(isProduction && {
        legalComments: 'none',
        drop: ['debugger'],
    }),
});

// esbuild emits these as runtime `new RegExp(...)`, which Nashorn rejects past both tsc and esbuild
const UNSUPPORTED_REGEX = [
    {
        name: 'regex flag u/y/s',
        pattern: /new RegExp\((?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'),\s*["'][gim]*[suy][gimsuy]*["']\)/g,
    },
    { name: 'regex lookbehind', pattern: /\(\?<[=!]/g },
];

const violations = [];
for (const file of Object.keys(result.metafile.outputs).filter((f) => f.endsWith('.js'))) {
    const source = await readFile(file, 'utf8');
    for (const { name, pattern } of UNSUPPORTED_REGEX) {
        for (const match of source.matchAll(pattern)) {
            violations.push(`${file}: ${name} — ${match[0]}`);
        }
    }
}

if (violations.length > 0) {
    console.error(`Nashorn cannot run the following constructs:\n  ${violations.join('\n  ')}`);
    process.exit(1);
}
