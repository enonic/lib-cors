import type { RequestInterface } from "@enonic-types/core";

declare module "/lib/enonic/cors" {
    /**
     * Application configuration map, typically `app.config`.
     *
     * Recognized keys:
     * - `cors.origin` — allowed origin(s): `'*'` to allow all, or a comma-separated
     *   list of literal origins and/or `~`-prefixed regex patterns (full-match).
     *   Use `'~.*'` to reflect any origin (supports credentials). When omitted,
     *   CORS is disabled and no headers are added.
     * - `cors.credentials` — `'true'` to allow credentials (ignored when the
     *   resolved `Access-Control-Allow-Origin` is `'*'`).
     * - `cors.allowedHeaders` — comma-separated. When omitted and
     *   `Access-Control-Request-Headers` is present on the request, that value
     *   is reflected back. When configured, preflight requests for disallowed
     *   headers are rejected with `403`.
     * - `cors.methods` — comma-separated (default: `'GET, HEAD, POST'`).
     *   Preflight requests for disallowed methods are rejected with `403`.
     * - `cors.exposedHeaders` — comma-separated headers the browser may access.
     * - `cors.maxAge` — preflight cache seconds.
     */
    export type CorsConfig = Record<string, string | undefined>;

    /**
     * Minimal request shape used by this library — a `getHeader(name)` accessor
     * as provided by XP's controller/filter request object.
     */
    export type CorsRequest = Pick<RequestInterface, "getHeader">;

    /**
     * Map of CORS response headers (all keys and values are strings).
     */
    export type CorsHeaders = Record<string, string>;

    /**
     * Preflight response: HTTP status and CORS headers.
     */
    export type CorsResponse = {
        status: number;
        headers: CorsHeaders;
    };

    /**
     * Resolves CORS response headers for the given request based on configuration.
     *
     * Origin matching (`cors.origin`):
     * - `'*'` — responds with `Access-Control-Allow-Origin: *`.
     * - Comma-separated list — each value is either a literal origin or a
     *   `~`-prefixed regex (full match). The request origin is reflected back
     *   on match; `{ vary: 'Origin' }` is returned on mismatch.
     * - `'~.*'` — reflects any origin (unlike `'*'`, supports credentials).
     * - Not set — CORS is disabled; returns `{}`.
     *
     * @param config Configuration map (typically `app.config`).
     * @param req Incoming request with a `getHeader` method.
     * @returns CORS headers to merge into the response.
     */
    export function resolveHeaders(config: CorsConfig, req: CorsRequest): CorsHeaders;

    /**
     * Convenience wrapper around {@link resolveHeaders} that reads configuration
     * from `app.config`.
     *
     * @param req Incoming request with a `getHeader` method.
     * @returns CORS headers to merge into the response.
     */
    export function getHeaders(req: CorsRequest): CorsHeaders;

    /**
     * Resolves a preflight (`OPTIONS`) response based on configuration and request.
     *
     * Returns `{ status: 403, headers: {} }` when:
     * - `cors.allowedHeaders` is configured and the request asks for headers
     *   not in that list, or
     * - `Access-Control-Request-Method` names a method not in the allowed set.
     *
     * Returns `{ status: 204, headers: resolveHeaders(config, req) }` otherwise.
     * When `cors.origin` is not set, returns `{ status: 204, headers: {} }`.
     *
     * @param config Configuration map (typically `app.config`).
     * @param req Incoming request with a `getHeader` method.
     */
    export function resolveOptionsResponse(config: CorsConfig, req: CorsRequest): CorsResponse;

    /**
     * Convenience wrapper around {@link resolveOptionsResponse} that reads
     * configuration from `app.config`.
     *
     * @param req Incoming request with a `getHeader` method.
     */
    export function respondOptions(req: CorsRequest): CorsResponse;
}

export {};
