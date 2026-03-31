/**
 * CORS (Cross-Origin Resource Sharing) library for Enonic XP.
 *
 * Provides utilities for handling CORS headers in XP controllers and filters.
 * Targets XP 7+ (Nashorn).
 *
 * Configuration via app .cfg file:
 * - cors.enabled       — 'true' (default) or 'false'
 * - cors.origin        — allowed origin(s): '*' to allow all, comma-separated list of
 *                         literal origins or '~'-prefixed regex patterns
 *                         (e.g. 'https://a.com, ~https://.*\.b\.com')
 * - cors.credentials   — 'true' to allow credentials (incompatible with '*' origin)
 * - cors.allowedHeaders — comma-separated. When omitted and
 *                         Access-Control-Request-Headers is present, that value
 *                         is reflected back. When configured, preflight requests
 *                         for disallowed headers are rejected (403)
 * - cors.methods       — comma-separated (default: 'POST, OPTIONS')
 * - cors.exposedHeaders — comma-separated (headers the browser may access)
 * - cors.maxAge        — preflight cache seconds
 *
 * Usage in an XP controller:
 * ```js
 * var corsLib = require('/lib/cors');
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
 * ```
 */

import { matchOrigin, parseCommaSeparatedList } from './util';

type CorsConfig = Record<string, string | undefined>;

type CorsRequest = {
    getHeader(name: string): string | null;
};

type CorsHeaders = Record<string, string>;

type CorsResponse = {
    status: number;
    headers: CorsHeaders;
};

const DEFAULT_METHODS = 'POST, OPTIONS';

/**
 * Resolves CORS headers based on configuration and request.
 *
 * Origin matching (`cors.origin`):
 * - `'*'` — responds with `Access-Control-Allow-Origin: *`.
 * - Comma-separated list — each value is either a literal origin or a
 *   `~`-prefixed regex (full match). The request origin is reflected back
 *   on match; `{ vary: 'Origin' }` is returned on mismatch.
 * - Not set — the request origin is echoed back, or `*` when absent.
 *
 * Credentials (`cors.credentials`):
 * - Set to `'true'` only when `cors.origin` is explicitly configured and
 *   the resolved `Access-Control-Allow-Origin` is not `'*'`.
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
    if (config['cors.enabled'] === 'false') return {};

    const headers: CorsHeaders = {};

    const origin = req.getHeader('Origin');
    if (config['cors.origin']) {
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
    } else if (origin) {
        headers['access-control-allow-origin'] = origin;
        headers['vary'] = 'Origin';
    } else {
        headers['access-control-allow-origin'] = '*';
    }

    if (
        (config['cors.credentials'] || '') === 'true' &&
        config['cors.origin'] &&
        headers['access-control-allow-origin'] !== '*'
    ) {
        headers['access-control-allow-credentials'] = 'true';
    }

    const allowHeaders = config['cors.allowedHeaders'] || req.getHeader('Access-Control-Request-Headers');
    if (allowHeaders) {
        headers['access-control-allow-headers'] = allowHeaders;
    }
    headers['access-control-allow-methods'] = config['cors.methods'] || DEFAULT_METHODS;

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
 * Resolves a preflight response based on configuration and request.
 *
 * If `cors.allowedHeaders` is configured and the request asks for headers
 * not in that list, responds with 403 and no CORS headers.
 *
 * @param config - Key-value config map (typically `app.config`).
 * @param req - Incoming request with a `getHeader` method.
 * @returns Object with `status: 204` and resolved CORS headers,
 *          or `status: 403` with empty headers on rejection.
 */
export function resolveOptionsResponse(config: CorsConfig, req: CorsRequest): CorsResponse {
    if (config['cors.enabled'] === 'false') {
        return { status: 204, headers: {} };
    }
    if (!isPreflightHeadersAllowed(config, req)) {
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
 * If `cors.allowedHeaders` is configured and the request asks for headers
 * not in that list, responds with 403 and no CORS headers.
 *
 * @param req - Incoming request with a `getHeader` method.
 * @returns Object with `status: 204` and resolved CORS headers,
 *          or `status: 403` with empty headers on rejection.
 */
export function respondOptions(req: CorsRequest): CorsResponse {
    return resolveOptionsResponse(app.config, req);
}
