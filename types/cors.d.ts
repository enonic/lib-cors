/**
 * CORS (Cross-Origin Resource Sharing) library for Enonic XP.
 *
 * Provides utilities for handling CORS headers in XP controllers and filters.
 * Targets XP 7+ (Nashorn).
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
 * ```
 */
declare global {
    interface XpLibraries {
        '/lib/enonic/cors': typeof import('./cors');
    }
}
export type CorsConfig = Record<string, string | undefined>;
export type CorsRequest = {
    getHeader(name: string): string | null;
};
export type CorsHeaders = Record<string, string>;
export type CorsResponse = {
    status: number;
    headers: CorsHeaders;
};
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
export declare function resolveHeaders(config: CorsConfig, req: CorsRequest): CorsHeaders;
/**
 * Convenience wrapper that resolves CORS headers using `app.config`.
 *
 * @param req - Incoming request with a `getHeader` method.
 * @returns CORS headers to merge into the response.
 */
export declare function getHeaders(req: CorsRequest): CorsHeaders;
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
export declare function resolveOptionsResponse(config: CorsConfig, req: CorsRequest): CorsResponse;
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
export declare function respondOptions(req: CorsRequest): CorsResponse;
