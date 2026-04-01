/**
 * Parses a comma-separated string into a trimmed, deduplicated array.
 * Empty parts are skipped.
 */
export function parseCommaSeparatedList(value?: string): string[] {
    if (!value) {
        return [];
    }

    const result: string[] = [];
    const parts = value.split(',');

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part || result.indexOf(part) !== -1) {
            continue;
        }

        result.push(part);
    }

    return result;
}

/**
 * Tests whether an origin matches a pattern.
 *
 * - If `pattern` starts with `~`, the remainder is treated as a regular
 *   expression anchored to the full string (match, not find).
 * - Otherwise the pattern must exactly equal the origin.
 */
export function matchOrigin(pattern: string, origin: string): boolean {
    if (pattern.charAt(0) === '~') {
        const regex = new RegExp(`^(?:${pattern.slice(1)})$`);
        return regex.test(origin);
    }

    return pattern === origin;
}
