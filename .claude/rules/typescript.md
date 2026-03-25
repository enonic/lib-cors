---
paths:
  - "**/*.ts"
---
# TypeScript Coding Standards

## Nashorn / ES5 Constraints

This library targets Enonic XP 7 which runs on Nashorn. esbuild targets ES5 with `const-and-let` and `arrow` overrides enabled via `supported`, so:

- Do not use ES6+ standard library APIs (Promise, Map, Set, Symbol, etc.) — Nashorn does not polyfill them
- Do not use `async`/`await` — no Promise support in Nashorn
- Use `const`/`let` — Nashorn supports them; prefer `const`, use `let` only when reassignment is needed
- Arrow functions are fine — Nashorn supports them and esbuild keeps them
- The output format is CommonJS (`require`/`exports`)

## Code Style

```typescript
// Check for both null and undefined with `!= null`
if (response != null) {
  // safe to use response
}

// No nested ternaries - use if/else or object lookup
// Prefer single-line guard clauses (early return)
if (element == null) return;
if (!isSupported) return false;

// Insert exactly one blank line between logically distinct operations
const result = doSomething();

updateAnotherThing();
```

## Naming Standards

```typescript
// Standalone booleans use is/has/can/should/will prefixes
const isEnabled = true;
const hasOrigin = false;

// Arrays use plural forms
const allowedOrigins: string[] = [];

// Functions use verb prefixes
function getOrigin(request: Request): string {} // get/set/is/has
function isAllowedOrigin(origin: string): boolean {}

// Constants use UPPERCASE
const DEFAULT_MAX_AGE = 86400;
```

## Type Definitions

```typescript
// Prefer types for object shapes
type CorsOptions = {
    allowOrigin?: string;
    maxAge?: number;
};

// Use type aliases for unions/primitives
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PATCH';

// Use T[] syntax for arrays
type Methods = string[];

// Avoid `any` — use `unknown` and type guards
```

## Import/Export Standards

```typescript
// Named exports preferred; no default exports
export { cors, preflight };

// Use `import type` for type-only imports
import type { CorsOptions } from './types';
```
