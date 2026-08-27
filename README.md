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

## Building

```bash
./gradlew build
```
