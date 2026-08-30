import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const DTS = 'build/types-dts/enonic/cors.d.ts';
const OUT = 'build/types';

// Same version source as Gradle and release-tools
const properties = await readFile('gradle.properties', 'utf8');
const version = properties.match(/^version=(.+)$/m)?.[1].trim();
if (!version) {
    console.error('gradle.properties has no version');
    process.exit(1);
}

if (!existsSync(DTS)) {
    console.error(`${DTS} is missing; run tsc -p tsconfig.types.json first`);
    process.exit(1);
}

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

await copyFile(DTS, `${OUT}/cors.d.ts`);
await copyFile('types/README.md', `${OUT}/README.md`);
await copyFile('LICENSE', `${OUT}/LICENSE`);

const pkg = JSON.parse(await readFile('types/package.json', 'utf8'));
pkg.version = version;
await writeFile(`${OUT}/package.json`, `${JSON.stringify(pkg, null, 4)}\n`);

console.log(`${pkg.name}@${version} -> ${OUT}`);
