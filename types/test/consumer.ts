// Import-style consumer of the built package: tsconfig.json here resolves '/lib/enonic/cors' through
// build/types/package.json#types and checks the shipped .d.ts itself (skipLibCheck: false).
// require()-only consumption is a separate program, require-only.ts.

import type { Request } from '@enonic-types/core';
import {
    type CorsConfig,
    type CorsHeaders,
    type CorsRequest,
    type CorsResponse,
    getHeaders,
    getRequestOrigin,
    getWebSocketOriginValidator,
    type OriginRequest,
    type OriginValidator,
    resolveHeaders,
    resolveOptionsResponse,
    resolveWebSocketOriginValidator,
    respondOptions,
} from '/lib/enonic/cors';

// XP's real Request, not a stub: a stub would not notice getHeader() losing `null` or port losing `number`
declare const req: Request;

export const headers: CorsHeaders = getHeaders(req);
export const response: CorsResponse = respondOptions(req);
export const origin: string | undefined = getRequestOrigin(req);
export const validator: OriginValidator | undefined = getWebSocketOriginValidator(req);

export const config: CorsConfig = app.config;
export const configured: CorsHeaders = resolveHeaders(app.config, req);
export const preflight: CorsResponse = resolveOptionsResponse({ 'cors.origin': '*' }, req);
export const wsValidator: OriginValidator | undefined = resolveWebSocketOriginValidator(app.config, req);

export const minimalRequest: CorsRequest = { getHeader: () => null };
export const minimalOrigin: OriginRequest = { scheme: 'https', host: 'example.com', port: '443' };

// Pins the exact key set of CorsConfig
type ConfigKey = keyof { [K in keyof CorsConfig as string extends K ? never : K]: 0 };
export const configKeys: Record<ConfigKey, true> = {
    'cors.origin': true,
    'cors.credentials': true,
    'cors.allowedHeaders': true,
    'cors.methods': true,
    'cors.exposedHeaders': true,
    'cors.maxAge': true,
};

export const status: 204 | 403 = response.status;
export const headerValue: string = headers['access-control-allow-origin'];

if (validator) {
    const accepted: boolean = validator(req.getHeader('Origin'));
    validator(undefined);
    validator(null);
    void accepted;
}

// Each rejection can fail for one reason only, so its directive cannot be satisfied by an unrelated error

// @ts-expect-error preflight status is 204 or 403
export const otherStatus: 200 | 500 = response.status;

// @ts-expect-error undefined when cors.origin is not set
export const originAlways: string = getRequestOrigin(req);

// @ts-expect-error undefined when cors.origin is not set
export const validatorAlways: OriginValidator = getWebSocketOriginValidator(req);

// @ts-expect-error undefined when cors.origin is not set
export const wsValidatorAlways: OriginValidator = resolveWebSocketOriginValidator(app.config, req);

// @ts-expect-error the validator returns a boolean
export const notString: string | undefined = validator?.();

// @ts-expect-error config values are strings
resolveHeaders({ 'cors.origin': 1 }, req);

// @ts-expect-error a misspelt cors.* key is rejected
resolveHeaders({ 'cors.orgin': '*' }, req);

// @ts-expect-error a request must expose getHeader
getHeaders({});

// @ts-expect-error a request must expose getHeader
respondOptions({});

// @ts-expect-error a request must expose getHeader
resolveOptionsResponse(app.config, {});

// @ts-expect-error scheme is a string
getRequestOrigin({ scheme: 1 });

// @ts-expect-error port is a number or a string
resolveWebSocketOriginValidator(app.config, { port: true });
