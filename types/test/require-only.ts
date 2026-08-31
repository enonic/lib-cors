// require()-only consumer: nothing here imports the module, so typing comes solely from the XpLibraries
// hook in the built package, which tsconfig.require.json pulls in the way a consumer's `types` entry does.
// XpRequire falls back to `unknown`, not `any`, so without the hook every line below fails, not passes.

const corsLib = require('/lib/enonic/cors');

const request = { getHeader: () => null };

export const headers: Record<string, string> = corsLib.getHeaders(request);
export const configured: Record<string, string> = corsLib.resolveHeaders(app.config, request);
export const response: { status: 204 | 403; headers: Record<string, string> } = corsLib.respondOptions(request);
export const origin: string | undefined = corsLib.getRequestOrigin({ scheme: 'https', host: 'example.com' });
export const validator = corsLib.getWebSocketOriginValidator({ scheme: 'https', host: 'example.com', port: 443 });

if (validator) {
    const accepted: boolean = validator('https://example.com');
    void accepted;
}

// @ts-expect-error the validator returns a boolean
export const notString: string | undefined = validator?.();

// @ts-expect-error a request must expose getHeader
corsLib.getHeaders({});
