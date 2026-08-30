# @enonic-types/lib-cors

TypeScript declarations for [lib-cors](https://github.com/enonic/lib-cors), the Enonic XP CORS
library. They are generated from the library source on every release, so the version matches the
jar.

## Setup

```bash
npm install --save-dev @enonic-types/lib-cors
```

The package is types-only, so it belongs in `devDependencies`. Add it to both `types` and `paths` in
`tsconfig.json`:

```json
{
    "compilerOptions": {
        "types": ["@enonic-types/global", "@enonic-types/lib-cors"],
        "paths": {
            "/lib/enonic/cors": ["./node_modules/@enonic-types/lib-cors"]
        }
    }
}
```

Both entries are needed, one per module style. The `types` entry — next to
[`@enonic-types/global`](https://www.npmjs.com/package/@enonic-types/global) — loads the package's
`XpLibraries` augmentation, which is what types `require('/lib/enonic/cors')`; `paths` alone does
not type `require()` in a file that never imports the module. The `paths` entry is what resolves
`import ... from '/lib/enonic/cors'`, and needs no `baseUrl` on modern TypeScript.

## Usage

```js
const corsLib = require('/lib/enonic/cors');

exports.options = (req) => corsLib.respondOptions(req);
```

```ts
import { getHeaders, respondOptions } from '/lib/enonic/cors';
import type { Request } from '@enonic-types/core';

export function options(req: Request) {
    return respondOptions(req);
}

export function get(req: Request) {
    return { headers: getHeaders(req), body: 'ok' };
}
```

Configuration keys and runtime behavior are documented in the
[lib-cors README](https://github.com/enonic/lib-cors).
