# Enonic XP CORS Library

[![License](https://img.shields.io/github/license/enonic/lib-cors)](https://github.com/enonic/lib-cors/blob/master/LICENSE)

CORS (Cross-Origin Resource Sharing) header handling for Enonic XP controllers and filters, plus an origin validator for WebSocket upgrades. Targets XP 8+.

## Usage

Add the dependency to `build.gradle`:

```gradle
dependencies {
    include 'com.enonic.lib:lib-cors:2.0.0'
}
```

Use in a controller:

```js
var corsLib = require('/lib/enonic/cors');

// Preflight (OPTIONS)
exports.options = function(req) {
    return corsLib.respondOptions(req);
};

// Regular request — attach CORS headers
exports.post = function(req) {
    return {
        contentType: 'application/json',
        headers: corsLib.getHeaders(req),
        body: { result: 'ok' },
    };
};
```

`getHeaders(req)` and `respondOptions(req)` read from `app.config` automatically.
For explicit config, use `resolveHeaders(config, req)` instead.

### WebSocket upgrades

XP checks the `Origin` header of a WebSocket upgrade against the app's own origin and
rejects other origins with `403`. To accept the origins listed in `cors.origin`, return
a `checkOrigin` predicate in the `webSocket` response:

```js
exports.get = function(req) {
    return {
        webSocket: {
            data: {},
            checkOrigin: corsLib.getWebSocketOriginValidator(req),
        },
    };
};
```

XP applies the predicate instead of its own check, so the predicate accepts the app's
own origin as well as the configured ones. When `cors.origin` is not set, it is
`undefined` and XP's own check stays in place. For explicit config, use
`resolveWebSocketOriginValidator(config, req)`.

## Configuration

Add to the consuming app's `.cfg` file (e.g. `com.example.myapp.cfg`):

```properties
cors.origin = https://example.com, https://admin.example.com
cors.credentials = true
cors.allowedHeaders = Content-Type, Authorization
cors.methods = POST, GET
cors.exposedHeaders = X-Request-Id, X-Custom-Header
cors.maxAge = 3600
```

| Key                  | Default          | Description                                                  |
|----------------------|------------------|--------------------------------------------------------------|
| `cors.origin`        | _(not set)_      | Allowed origin(s), comma-separated. Omit to disable CORS     |
| `cors.credentials`   | `false`          | Allow credentials (incompatible with `*` origin)             |
| `cors.allowedHeaders`| _(not set)_      | `Access-Control-Allow-Headers` value                         |
| `cors.methods`       | `GET, HEAD, POST`| `Access-Control-Allow-Methods` value                         |
| `cors.exposedHeaders`| _(not set)_      | Extra response headers to expose beyond the CORS safelist    |
| `cors.maxAge`        | _(not set)_      | Preflight cache duration in seconds                          |

`cors.origin` supports `*` (allow all origins), literal origins, and `~`-prefixed regex patterns for dynamic matching (e.g. `~https://.*\.example\.com`). Can use `~.*` to reflect all. Multiple values are comma-separated.

If `cors.allowedHeaders` is not configured and a request includes `Access-Control-Request-Headers`, that value is reflected in `Access-Control-Allow-Headers`.

`cors.exposedHeaders` is a comma-separated list of header names. The library normalizes whitespace and removes duplicates before sending `Access-Control-Expose-Headers`.

If you configure `cors.exposedHeaders = *`, browsers only treat `*` as a wildcard for non-credentialed requests.

The WebSocket predicate returned by `getWebSocketOriginValidator(req)` uses the same `cors.origin`
list. A request without an `Origin` header is accepted, as in XP's own check.

## Development

TypeScript is type-checked with `tsc` (TypeScript 7) and bundled by esbuild into a single
`lib/enonic/cors.js` in `build/esbuild`, which Gradle folds into the jar resources. Only the
bundle ships: `lib/util.ts` is inlined, so the jar never adds files to a consuming app's `lib/`
namespace beyond `lib/enonic/cors.js`.

```
pnpm build       # esbuild -> build/esbuild (dev, with source maps)
pnpm check       # types + lint + format
pnpm test        # Node tests for the TS utilities
./gradlew build  # everything above plus the Java tests and the jar
```

A few constraints follow from that:

- **The output must stay Nashorn-compatible.** A library's JS runs under the consuming app's
  script engine, and XP 8 still defaults to Nashorn 15.7 (`--language=es6`): ES5.1 plus a partial
  ES2015 subset. esbuild targets ES5 and keeps only `let`/`const` native; arrows are lowered because
  Nashorn gets `this` wrong inside them, and `for…of` because Nashorn loses the loop binding in
  closures. Syntax esbuild cannot lower (classes, destructuring, spread, …) fails the build, and
  `esbuild.config.js` also rejects regex flags and lookbehind that Nashorn cannot parse.
  `tsconfig.json` pins `lib` to `ES5` so ES2015+ built-ins (`Promise`, `Map`, `Object.assign`, …)
  are not even typed. `target` is `ES2015` only because TypeScript 7 removed `ES5` as a target;
  with `noEmit` it has no effect on the output.
- **The Java tests run the bundle under Nashorn.** `CorsHeadersTest` loads the emitted
  `lib/enonic/cors.js` through XP's `ScriptTestSupport`, so an emit Nashorn cannot parse fails
  the build.
- **Server code cannot import npm packages.** esbuild would inline them into the bundle, and
  anything not ES5-safe breaks at runtime. `@enonic-types/*` is fine through `import type`,
  which is elided.
