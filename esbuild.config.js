import { build } from 'esbuild';

const isProduction = process.env.NODE_ENV === 'production';

const SRC = 'src/main/resources';
const OUT = 'build/resources/main';

await build({
    entryPoints: [`${SRC}/lib/enonic/cors.ts`],
    outdir: OUT,
    outbase: SRC,
    bundle: true,
    format: 'cjs',
    target: 'es5',
    supported: {
        'const-and-let': true,
        arrow: true,
    },
    platform: 'neutral',
    mainFields: ['module', 'main'],
    sourcemap: !isProduction,
    minify: false,
    ...(isProduction && {
        legalComments: 'none',
        drop: ['debugger'],
    }),
});
