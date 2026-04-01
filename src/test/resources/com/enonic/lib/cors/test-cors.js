var testingLib = require('/lib/xp/testing');
var corsLib = require('/lib/cors');

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
