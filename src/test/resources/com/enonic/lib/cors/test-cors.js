var testingLib = require('/lib/xp/testing');
var corsLib = require('/lib/cors');

exports.testResolveWhenCorsHeadersDisabled = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({}, headers);
};

exports.testResolveDefaultCorsHeaders = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'Content-Type',
        'access-control-allow-methods': 'POST, OPTIONS',
    }, headers);
};

exports.testResolveCorsHeaders = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': 'http://test-cors.com:3000',
        'vary': 'Origin',
        'access-control-allow-credentials': 'true',
        'access-control-allow-headers': 'Content-Type, Authorization',
        'access-control-allow-methods': 'POST, OPTIONS, GET',
        'access-control-max-age': '1200',
    }, headers);
};

exports.testResolveCorsHeadersWithOriginFromRequest = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': 'http://test-cors.com:3000',
        'vary': 'Origin',
        'access-control-allow-headers': 'Content-Type, Authorization',
        'access-control-allow-methods': 'POST, OPTIONS',
        'access-control-max-age': '600',
    }, headers);
};

exports.testResolveMultiOriginMatch = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': 'http://b.com',
        'vary': 'Origin',
        'access-control-allow-headers': 'Content-Type',
        'access-control-allow-methods': 'POST, OPTIONS',
    }, headers);
};

exports.testResolveOriginMismatch = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({}, headers);
};

exports.testResolveCredentialsSkippedForWildcard = function (config, req) {
    var headers = corsLib.resolveHeaders(config, req);
    testingLib.assertJsonEquals({
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'Content-Type',
        'access-control-allow-methods': 'POST, OPTIONS',
    }, headers);
};
