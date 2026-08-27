/**
 * CORS (Cross-Origin Resource Sharing) library for Enonic XP.
 *
 * Provides utilities for handling CORS headers in XP controllers and filters,
 * plus an origin validator for WebSocket upgrades based on the same allowlist.
 * Targets XP 8+.
 *
 * Configuration via app .cfg file:
 * - cors.origin        — allowed origin(s): '*' to allow all, comma-separated list of
 *                         literal origins or '~'-prefixed regex patterns
 *                         (e.g. 'https://a.com, ~https://.*\.b\.com').
 *                         Use '~.*' to reflect any origin (supports credentials).
 *                         When omitted, CORS is disabled (no headers are added)
 * - cors.credentials   — 'true' to allow credentials (incompatible with '*' origin)
 * - cors.allowedHeaders — comma-separated. When omitted and
 *                         Access-Control-Request-Headers is present, that value
 *                         is reflected back. When configured, preflight requests
 *                         for disallowed headers are rejected (403)
 * - cors.methods       — comma-separated (default: 'GET, HEAD, POST').
 *                         Preflight requests for disallowed methods
 *                         are rejected (403)
 * - cors.exposedHeaders — comma-separated (headers the browser may access)
 * - cors.maxAge        — preflight cache seconds
 *
 * Usage in an XP controller:
 * ```js
 * var corsLib = require('/lib/enonic/cors');
 *
 * // Option A: use app.config automatically
 * exports.options = function(req) {
 *     return corsLib.respondOptions(req);
 * };
 *
 * exports.post = function(req) {
 *     return {
 *         contentType: 'application/json',
 *         headers: corsLib.getHeaders(req),
 *         body: { result: 'ok' },
 *     };
 * };
 *
 * // Option B: pass config explicitly
 * exports.post = function(req) {
 *     return {
 *         contentType: 'application/json',
 *         headers: corsLib.resolveHeaders(app.config, req),
 *         body: { result: 'ok' },
 *     };
 * };
 *
 * // WebSocket upgrade — validate the Origin header against cors.origin
 * exports.get = function(req) {
 *     return {
 *         webSocket: {
 *             data: {},
 *             checkOrigin: corsLib.getWebSocketOriginValidator(req),
 *         },
 *     };
 * };
 * ```
 */

import { matchOrigin, parseCommaSeparatedList } from '../util';

type CorsConfig = Record<string, string | undefined>;

type CorsRequest = {
    getHeader(name: string): string | null;
};

type CorsHeaders = Record<string, string>;

type CorsResponse = {
    status: number;
    headers: CorsHeaders;
};

type OriginRequest = {
    scheme?: string;
    host?: string;
    port?: number | string;
};

type OriginValidator = (origin?: string | null) => boolean;

const DEFAULT_METHODS = 'GET, HEAD, POST';

/**
 * Resolves CORS headers based on configuration and request.
 *
 * Origin matching (`cors.origin`):
 * - `'*'` — responds with `Access-Control-Allow-Origin: *`.
 * - Comma-separated list — each value is either a literal origin or a
 *   `~`-prefixed regex (full match). The request origin is reflected back
 *   on match; `{ vary: 'Origin' }` is returned on mismatch.
 * - `'~.*'` — reflects any origin (unlike `'*'`, supports credentials).
 * - Not set — CORS is disabled; returns `{}`.
 *
 * Credentials (`cors.credentials`):
 * - Set to `'true'` only when the resolved `Access-Control-Allow-Origin`
 *   is not `'*'`.
 *
 * Allowed request headers (`cors.allowedHeaders`):
 * - When configured, the configured value is sent as
 *   `Access-Control-Allow-Headers`. Validation of requested headers against
 *   the allowed set is done at the preflight level (`resolveOptionsResponse`).
 * - When omitted and `Access-Control-Request-Headers` is present, that value
 *   is reflected back.
 * - Otherwise `Access-Control-Allow-Headers` is not set.
 *
 * @param config - Key-value config map (typically `app.config`).
 * @param req - Incoming request with a `getHeader` method.
 * @returns CORS headers to merge into the response.
 */
export function resolveHeaders(config: CorsConfig, req: CorsRequest): CorsHeaders {
    if (!config['cors.origin']) return {};

    const headers: CorsHeaders = {};

    const origin = req.getHeader('Origin');
    if (config['cors.origin'] === '*') {
        headers['access-control-allow-origin'] = '*';
    } else {
        const allowedOrigins = parseCommaSeparatedList(config['cors.origin']);
        if (origin == null) {
            return { vary: 'Origin' };
        }
        let matched = false;
        for (let i = 0; i < allowedOrigins.length; i++) {
            if (matchOrigin(allowedOrigins[i], origin)) {
                matched = true;
                break;
            }
        }
        if (!matched) {
            return { vary: 'Origin' };
        }
        headers['access-control-allow-origin'] = origin;
        headers['vary'] = 'Origin';
    }

    if ((config['cors.credentials'] || '') === 'true' && headers['access-control-allow-origin'] !== '*') {
        headers['access-control-allow-credentials'] = 'true';
    }

    const allowHeaders = config['cors.allowedHeaders'] || req.getHeader('Access-Control-Request-Headers');
    if (allowHeaders) {
        headers['access-control-allow-headers'] = allowHeaders;
    }
    const methods = config['cors.methods'] || DEFAULT_METHODS;
    headers['access-control-allow-methods'] =
        methods.trim() === '*'
            ? '*'
            : parseCommaSeparatedList(methods)
                  .map((m) => m.toUpperCase())
                  .join(', ');

    const exposedHeaders = parseCommaSeparatedList(config['cors.exposedHeaders']);
    if (exposedHeaders.length > 0) {
        headers['access-control-expose-headers'] = exposedHeaders.join(', ');
    }

    if (config['cors.maxAge']) {
        headers['access-control-max-age'] = config['cors.maxAge'];
    }

    return headers;
}

/**
 * Convenience wrapper that resolves CORS headers using `app.config`.
 *
 * @param req - Incoming request with a `getHeader` method.
 * @returns CORS headers to merge into the response.
 */
export function getHeaders(req: CorsRequest): CorsHeaders {
    return resolveHeaders(app.config, req);
}

/**
 * Checks whether the headers listed in `Access-Control-Request-Headers`
 * are all present in the configured `cors.allowedHeaders`.
 *
 * Returns `true` (allowed) when:
 * - `cors.allowedHeaders` is not configured (reflection mode), or
 * - `Access-Control-Request-Headers` is absent, or
 * - every requested header appears in the allowed set (case-insensitive).
 */
function isPreflightHeadersAllowed(config: CorsConfig, req: CorsRequest): boolean {
    const allowedHeaders = config['cors.allowedHeaders'];
    const requestedHeaders = req.getHeader('Access-Control-Request-Headers');
    if (!(allowedHeaders && requestedHeaders)) return true;
    if (allowedHeaders.trim() === '*') return true;

    const allowed = parseCommaSeparatedList(allowedHeaders);
    const requested = parseCommaSeparatedList(requestedHeaders);

    for (let i = 0; i < requested.length; i++) {
        let found = false;
        for (let j = 0; j < allowed.length; j++) {
            if (requested[i].toLowerCase() === allowed[j].toLowerCase()) {
                found = true;
                break;
            }
        }
        if (!found) return false;
    }
    return true;
}

/**
 * Checks whether the method in `Access-Control-Request-Method` is present
 * in the configured `cors.methods` (or the default method list).
 *
 * Returns `true` (allowed) when:
 * - `Access-Control-Request-Method` is absent, or
 * - `cors.methods` is `'*'`, or
 * - the requested method appears in the allowed set (case-insensitive).
 */
function isPreflightMethodAllowed(config: CorsConfig, req: CorsRequest): boolean {
    const requestedMethod = req.getHeader('Access-Control-Request-Method');
    if (!requestedMethod) return true;

    const methods = config['cors.methods'] || DEFAULT_METHODS;
    if (methods.trim() === '*') return true;

    const allowed = parseCommaSeparatedList(methods);
    const method = requestedMethod.trim().toUpperCase();

    for (let i = 0; i < allowed.length; i++) {
        if (allowed[i].toUpperCase() === method) return true;
    }
    return false;
}

/**
 * Resolves a preflight response based on configuration and request.
 *
 * Rejects with 403 (no CORS headers) when:
 * - `cors.allowedHeaders` is configured and the request asks for
 *   headers not in that list, or
 * - `Access-Control-Request-Method` names a method not in the allowed set.
 *
 * @param config - Key-value config map (typically `app.config`).
 * @param req - Incoming request with a `getHeader` method.
 * @returns Object with `status: 204` and resolved CORS headers,
 *          or `status: 403` with empty headers on rejection.
 */
export function resolveOptionsResponse(config: CorsConfig, req: CorsRequest): CorsResponse {
    if (!config['cors.origin']) {
        return { status: 204, headers: {} };
    }
    if (!(isPreflightMethodAllowed(config, req) && isPreflightHeadersAllowed(config, req))) {
        return { status: 403, headers: {} };
    }
    return {
        status: 204,
        headers: resolveHeaders(config, req),
    };
}

/**
 * Returns a 204 preflight response with CORS headers from `app.config`.
 *
 * Rejects with 403 (no CORS headers) when the preflight requests a
 * disallowed method or header.
 *
 * @param req - Incoming request with a `getHeader` method.
 * @returns Object with `status: 204` and resolved CORS headers,
 *          or `status: 403` with empty headers on rejection.
 */
export function respondOptions(req: CorsRequest): CorsResponse {
    return resolveOptionsResponse(app.config, req);
}

/**
 * Maps a request scheme to the one a browser sends in `Origin`: lower-case,
 * with `wss` written as `https` and `ws` as `http`.
 */
function toOriginScheme(scheme: string): string {
    const lower = scheme.toLowerCase();
    if (lower === 'wss') {
        return 'https';
    }
    if (lower === 'ws') {
        return 'http';
    }
    return lower;
}

/**
 * Builds the app's own origin from the request: `scheme://host`, with the port
 * appended only when it is not the default for the scheme. The schemes `ws`
 * and `wss` are written as `http` and `https`.
 *
 * @param req - Incoming request exposing `scheme`, `host` and `port`.
 * @returns The app's own origin, or `undefined` when scheme or host is missing.
 */
export function getRequestOrigin(req: OriginRequest): string | undefined {
    if (!(req.scheme && req.host)) {
        return undefined;
    }

    const scheme = toOriginScheme(req.scheme);
    const host = req.host.toLowerCase();
    const port = req.port;
    const defaultPort = scheme === 'https' ? 443 : 80;
    if (!port || Number(port) === defaultPort) {
        return `${scheme}://${host}`;
    }

    return `${scheme}://${host}:${port}`;
}

/**
 * Resolves a `checkOrigin` predicate for a WebSocket upgrade response from the
 * `cors.origin` allowlist.
 *
 * XP applies the predicate instead of its own same-origin check, so the
 * predicate also accepts the app's own origin.
 *
 * - `cors.origin` not set — returns `undefined`; XP's own check stays in place.
 * - `cors.origin` is `'*'` — accepts any origin.
 * - Otherwise — accepts the app's own origin and any origin matching an entry
 *   of the comma-separated list (literal or `~`-prefixed regex).
 * - A missing `Origin` header is accepted. `null` and an empty value are
 *   rejected unless an entry matches them.
 *
 * @param config - Key-value config map (typically `app.config`).
 * @param req - Incoming request exposing `scheme`, `host` and `port`.
 * @returns A `checkOrigin` predicate, or `undefined` when `cors.origin` is not set.
 */
export function resolveWebSocketOriginValidator(config: CorsConfig, req: OriginRequest): OriginValidator | undefined {
    const configuredOrigin = config['cors.origin'];
    if (!configuredOrigin) {
        return undefined;
    }

    if (configuredOrigin === '*') {
        return () => true;
    }

    const allowedOrigins = parseCommaSeparatedList(configuredOrigin);
    const ownOrigin = getRequestOrigin(req);

    return (origin?: string | null): boolean => {
        // A missing Origin header is accepted, as XP's own check accepts it.
        // An empty value is a header with an empty value and falls through.
        if (origin == null) {
            return true;
        }

        if (origin === ownOrigin) {
            return true;
        }

        for (let i = 0; i < allowedOrigins.length; i++) {
            if (matchOrigin(allowedOrigins[i], origin)) {
                return true;
            }
        }

        return false;
    };
}

/**
 * Convenience wrapper that resolves a WebSocket `checkOrigin` predicate using `app.config`.
 *
 * @param req - Incoming request exposing `scheme`, `host` and `port`.
 * @returns A `checkOrigin` predicate, or `undefined` when `cors.origin` is not set.
 */
export function getWebSocketOriginValidator(req: OriginRequest): OriginValidator | undefined {
    return resolveWebSocketOriginValidator(app.config, req);
}
