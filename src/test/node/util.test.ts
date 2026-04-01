import { deepStrictEqual, strictEqual, throws } from 'node:assert';
import { describe, it } from 'node:test';
import { matchOrigin, parseCommaSeparatedList } from '../../main/resources/lib/util.ts';

describe('parseCommaSeparatedList', () => {
    it('returns empty array for undefined', () => {
        deepStrictEqual(parseCommaSeparatedList(undefined), []);
    });

    it('returns empty array for empty string', () => {
        deepStrictEqual(parseCommaSeparatedList(''), []);
    });

    it('parses single value', () => {
        deepStrictEqual(parseCommaSeparatedList('http://a.com'), ['http://a.com']);
    });

    it('trims whitespace', () => {
        deepStrictEqual(parseCommaSeparatedList(' http://a.com , http://b.com '), ['http://a.com', 'http://b.com']);
    });

    it('deduplicates values', () => {
        deepStrictEqual(parseCommaSeparatedList('http://a.com, http://b.com, http://a.com'), [
            'http://a.com',
            'http://b.com',
        ]);
    });

    it('skips empty parts', () => {
        deepStrictEqual(parseCommaSeparatedList('http://a.com,,http://b.com, ,http://c.com'), [
            'http://a.com',
            'http://b.com',
            'http://c.com',
        ]);
    });
});

describe('matchOrigin', () => {
    it('matches exact literal', () => {
        strictEqual(matchOrigin('http://a.com', 'http://a.com'), true);
    });

    it('rejects literal mismatch', () => {
        strictEqual(matchOrigin('http://a.com', 'http://b.com'), false);
    });

    it('matches regex pattern', () => {
        strictEqual(matchOrigin('~https://.*\\.example\\.com', 'https://sub.example.com'), true);
    });

    it('rejects regex mismatch', () => {
        strictEqual(matchOrigin('~https://.*\\.example\\.com', 'https://evil.com'), false);
    });

    it('anchors regex to full string (no partial match)', () => {
        strictEqual(matchOrigin('~http://a', 'http://a.com'), false);
    });

    it('handles regex alternation correctly', () => {
        strictEqual(matchOrigin('~http://a\\.com|http://b\\.com', 'http://b.com'), true);
        strictEqual(matchOrigin('~http://a\\.com|http://b\\.com', 'http://c.com'), false);
    });

    it('is case-sensitive', () => {
        strictEqual(matchOrigin('~https://Example\\.com', 'https://example.com'), false);
    });

    it('throws on invalid regex', () => {
        throws(() => matchOrigin('~[invalid', 'http://a.com'));
    });

    it('treats literal tilde-less patterns as plain strings', () => {
        strictEqual(matchOrigin('http://~special.com', 'http://~special.com'), true);
    });
});
