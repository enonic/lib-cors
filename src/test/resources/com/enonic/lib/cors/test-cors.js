var testingLib = require('/lib/xp/testing');
var corsLib = require('/lib/enonic/cors');

exports.testResolveWhenCorsOriginNotSet = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({}, headers);
};

exports.testResolveCorsHeaders = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': 'http://test-cors.com:3000',
        'vary': 'Origin',
        'access-control-allow-credentials': 'true',
        'access-control-allow-headers': 'Content-Type, Authorization',
        'access-control-allow-methods': 'POST, OPTIONS, GET',
        'access-control-expose-headers': 'X-Custom-Header, X-Request-Id',
        'access-control-max-age': '1200',
    }, headers);
};

exports.testResolveCorsHeadersWithOriginFromRequest = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': 'http://test-cors.com:3000',
        'vary': 'Origin',
        'access-control-allow-credentials': 'true',
        'access-control-allow-headers': 'Content-Type, Authorization',
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-max-age': '600',
    }, headers);
};

exports.testResolveCorsHeadersReflectsRequestedHeadersWhenAllowedHeadersMissing = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': 'http://test-cors.com:3000',
        'vary': 'Origin',
        'access-control-allow-headers': 'Content-Type, X-Trace-Id',
        'access-control-allow-methods': 'GET, HEAD, POST',
    }, headers);
};

exports.testResolveMultiOriginMatch = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': 'http://b.com',
        'vary': 'Origin',
        'access-control-allow-methods': 'GET, HEAD, POST',
    }, headers);
};

exports.testResolveOriginMismatch = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'vary': 'Origin',
    }, headers);
};

exports.testResolveExposedHeadersNormalized = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, HEAD, POST',
        'access-control-expose-headers': 'X-Custom-Header, X-Request-Id',
    }, headers);
};

exports.testResolveExposedHeadersWildcardPreserved = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': 'http://test-cors.com:3000',
        'vary': 'Origin',
        'access-control-allow-credentials': 'true',
        'access-control-allow-methods': 'GET, HEAD, POST',
        'access-control-expose-headers': '*',
    }, headers);
};

exports.testResolveWildcardOrigin = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, HEAD, POST',
    }, headers);
};

exports.testResolveWildcardOriginNoRequestOrigin = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, HEAD, POST',
    }, headers);
};

exports.testResolveWildcardOriginWithCredentials = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': '*',
        'access-control-allow-methods': 'GET, HEAD, POST',
    }, headers);
};

exports.testResolveRegexOriginMatch = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': 'https://sub.example.com',
        'vary': 'Origin',
        'access-control-allow-methods': 'GET, HEAD, POST',
    }, headers);
};

exports.testResolveRegexOriginMismatch = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'vary': 'Origin',
    }, headers);
};

exports.testResolveOptionsWhenCorsOriginNotSet = function (config, req) {
    var response = corsLib.resolveOptionsResponse(config, req);
    testingLib.assertJsonEquals({
        status: 204,
        headers: {},
    }, response);
};

exports.testResolveOptionsRejectsDisallowedHeaders = function (config, req) {
    var response = corsLib.resolveOptionsResponse(config, req);
    testingLib.assertJsonEquals({
        status: 403,
        headers: {},
    }, response);
};

exports.testResolveOptionsAllowsConfiguredHeaders = function (config, req) {
    var response = corsLib.resolveOptionsResponse(config, req);
    testingLib.assertJsonEquals({
        status: 204,
        headers: {
            'access-control-allow-origin': 'http://test-cors.com:3000',
            'vary': 'Origin',
            'access-control-allow-headers': 'Content-Type, Authorization',
            'access-control-allow-methods': 'GET, HEAD, POST',
        },
    }, response);
};

exports.testResolveOptionsRejectsDisallowedMethod = function (config, req) {
    var response = corsLib.resolveOptionsResponse(config, req);
    testingLib.assertJsonEquals({
        status: 403,
        headers: {},
    }, response);
};

exports.testResolveOptionsAllowsWildcardMethod = function (config, req) {
    var response = corsLib.resolveOptionsResponse(config, req);
    testingLib.assertEquals(204, response.status);
};

exports.testResolveOptionsAllowsDefaultMethod = function (config, req) {
    var response = corsLib.resolveOptionsResponse(config, req);
    testingLib.assertEquals(204, response.status);
};

exports.testResolveOptionsAllowsWildcardHeaders = function (config, req) {
    var response = corsLib.resolveOptionsResponse(config, req);
    testingLib.assertEquals(204, response.status);
};

exports.testResolveMethodsNormalizedToUppercase = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertEquals('GET, POST', headers['access-control-allow-methods']);
};

exports.testResolveMixedLiteralAndRegex = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': 'https://sub.example.com',
        'vary': 'Origin',
        'access-control-allow-methods': 'GET, HEAD, POST',
    }, headers);
};

exports.testWebSocketValidatorNotConfigured = function (config, scheme, host, port) {
    var validator = corsLib.resolveWebSocketOriginValidator(config, { scheme: scheme, host: host, port: port });
    testingLib.assertNull(validator, 'expected undefined so XP keeps its own same-origin check');
};

exports.testWebSocketValidatorWildcard = function (config, scheme, host, port) {
    var validator = corsLib.resolveWebSocketOriginValidator(config, { scheme: scheme, host: host, port: port });
    testingLib.assertTrue(typeof validator === 'function', 'expected a validator function');
    testingLib.assertTrue(validator('https://anything.example.com'), 'wildcard should accept any origin');
    testingLib.assertTrue(validator('null'), 'wildcard should accept an opaque origin');
    testingLib.assertTrue(validator(null), 'wildcard should accept an absent origin');
};

exports.testWebSocketValidatorExactMatch = function (config, scheme, host, port) {
    var validator = corsLib.resolveWebSocketOriginValidator(config, { scheme: scheme, host: host, port: port });
    testingLib.assertTrue(validator('https://console.example.com'), 'configured origin should be accepted');
    testingLib.assertFalse(validator('https://evil.com'), 'unlisted origin should be rejected');
    testingLib.assertFalse(validator('https://console.example.com:8443'), 'port difference should be rejected');
};

exports.testWebSocketValidatorCommaList = function (config, scheme, host, port) {
    var validator = corsLib.resolveWebSocketOriginValidator(config, { scheme: scheme, host: host, port: port });
    testingLib.assertTrue(validator('http://a.com'), 'first list entry should be accepted');
    testingLib.assertTrue(validator('http://b.com'), 'second list entry should be accepted');
    testingLib.assertTrue(validator('http://c.com'), 'third list entry should be accepted');
    testingLib.assertFalse(validator('http://d.com'), 'unlisted origin should be rejected');
};

exports.testWebSocketValidatorRegex = function (config, scheme, host, port) {
    var validator = corsLib.resolveWebSocketOriginValidator(config, { scheme: scheme, host: host, port: port });
    testingLib.assertTrue(validator('https://sub.example.com'), 'regex should match a subdomain');
    testingLib.assertFalse(validator('https://evil.com'), 'regex should not match another domain');
    testingLib.assertFalse(validator('https://sub.example.com.evil.com'), 'regex should be anchored to the full origin');
};

exports.testWebSocketValidatorAcceptsOwnOrigin = function (config, scheme, host, port) {
    var validator = corsLib.resolveWebSocketOriginValidator(config, { scheme: scheme, host: host, port: port });
    testingLib.assertTrue(validator('https://api.example.com'), 'the app own origin should stay accepted');
    testingLib.assertTrue(validator('https://console.example.com'), 'configured origin should be accepted');
    testingLib.assertFalse(validator('https://evil.com'), 'unlisted origin should be rejected');
};

exports.testWebSocketValidatorOwnOriginKeepsNonDefaultPort = function (config, scheme, host, port) {
    var validator = corsLib.resolveWebSocketOriginValidator(config, { scheme: scheme, host: host, port: port });
    testingLib.assertTrue(validator('http://localhost:8080'), 'own origin should carry a non-default port');
    testingLib.assertFalse(validator('http://localhost'), 'own origin without its port should be rejected');
};

exports.testWebSocketValidatorOwnOriginFromWebSocketScheme = function (config, scheme, host, port) {
    var validator = corsLib.resolveWebSocketOriginValidator(config, { scheme: scheme, host: host, port: port });
    testingLib.assertTrue(validator('https://api.example.com'), 'a wss request should match the https origin a browser sends');
    testingLib.assertFalse(validator('wss://api.example.com'), 'a wss origin is never sent by a browser');
    testingLib.assertFalse(validator('http://api.example.com'), 'scheme must still match');
};

exports.testWebSocketValidatorWithoutOwnOrigin = function (config, scheme, host, port) {
    var validator = corsLib.resolveWebSocketOriginValidator(config, { scheme: scheme, host: host, port: port });
    testingLib.assertTrue(validator('https://console.example.com'), 'configured origin should be accepted');
    testingLib.assertFalse(validator('https://evil.com'), 'unlisted origin should be rejected');
};

exports.testWebSocketValidatorAbsentOrigin = function (config, scheme, host, port) {
    var validator = corsLib.resolveWebSocketOriginValidator(config, { scheme: scheme, host: host, port: port });
    testingLib.assertTrue(validator(null), 'a null Origin comes from a non-browser client');
    testingLib.assertTrue(validator(undefined), 'an undefined Origin comes from a non-browser client');
    testingLib.assertFalse(validator(''), 'an empty Origin is a present header, not an absent one');
};

exports.testWebSocketValidatorOpaqueOrigin = function (config, scheme, host, port) {
    var validator = corsLib.resolveWebSocketOriginValidator(config, { scheme: scheme, host: host, port: port });
    testingLib.assertFalse(validator('null'), 'the opaque origin string should not be mistaken for an absent Origin');
};

exports.testWebSocketValidatorOpaqueOriginOptIn = function (config, scheme, host, port) {
    var validator = corsLib.resolveWebSocketOriginValidator(config, { scheme: scheme, host: host, port: port });
    testingLib.assertTrue(validator('null'), 'an explicit allowlist entry should accept the opaque origin');
};

exports.testWebSocketValidatorInvalidRegexFailsClosed = function (config, scheme, host, port) {
    var validator = corsLib.resolveWebSocketOriginValidator(config, { scheme: scheme, host: host, port: port });
    // XP catches a throwing checkOrigin and rejects the upgrade, so a broken pattern fails closed.
    testingLib.assertThrows(function () {
        validator('https://evil.com');
    });
    testingLib.assertTrue(validator('https://api.example.com'), 'own origin is matched before any pattern');
};

exports.testGetRequestOrigin = function () {
    testingLib.assertEquals('https://example.com', corsLib.getRequestOrigin({ scheme: 'https', host: 'example.com', port: 443 }));
    testingLib.assertEquals('http://example.com', corsLib.getRequestOrigin({ scheme: 'http', host: 'example.com', port: 80 }));
    testingLib.assertEquals('https://example.com:8443', corsLib.getRequestOrigin({ scheme: 'https', host: 'example.com', port: 8443 }));
    testingLib.assertEquals('http://localhost:8080', corsLib.getRequestOrigin({ scheme: 'http', host: 'localhost', port: '8080' }));
    testingLib.assertEquals('https://example.com', corsLib.getRequestOrigin({ scheme: 'https', host: 'example.com' }));
    testingLib.assertEquals('http://example.com:443', corsLib.getRequestOrigin({ scheme: 'http', host: 'example.com', port: 443 }));
    testingLib.assertEquals('https://example.com', corsLib.getRequestOrigin({ scheme: 'wss', host: 'example.com', port: 443 }));
    testingLib.assertEquals('http://example.com', corsLib.getRequestOrigin({ scheme: 'ws', host: 'example.com', port: 80 }));
    testingLib.assertEquals('https://example.com:8443', corsLib.getRequestOrigin({ scheme: 'wss', host: 'example.com', port: 8443 }));
    testingLib.assertEquals('https://example.com', corsLib.getRequestOrigin({ scheme: 'HTTPS', host: 'Example.COM', port: 443 }));
    testingLib.assertNull(corsLib.getRequestOrigin({ host: 'example.com', port: 443 }));
    testingLib.assertNull(corsLib.getRequestOrigin({ scheme: 'https', port: 443 }));
};
