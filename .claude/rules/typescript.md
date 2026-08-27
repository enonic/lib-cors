---
paths:
  - "**/*.ts"
---
# TypeScript Coding Standards

## Nashorn / ES5 Constraints

This library targets XP 8+, but its JS runs under the consuming app's script engine. XP 8 defaults
to Nashorn 15.7 with `--language=es6`: ES5.1 plus a partial ES2015 subset, nothing from ES2016 on.
The matrix below was measured through XP's `ScriptTestSupport` against 8.0.2.

Three gates keep the output runnable, and each is blind to what the others catch:

- `tsc` type-checks with `lib: ES5` — the only gate for **built-ins** (`Map`, `Promise`,
  `Object.assign`, `[].includes`, …). `target: ES2015` is there only because TypeScript 7 removed
  `ES5`; `noEmit` makes it irrelevant to the output.
- esbuild emits at `target: es5` — the only gate for **syntax**. It lowers what it can (template
  literals, `??`, `?.`, `**`, `{x}`, `{...o}`, arrows) and hard-errors on the rest (classes,
  destructuring, default/rest params, spread, `for…of`, generators, `async`). `supported`
  whitelists only `const-and-let`; whitelisting a feature also changes esbuild's own helpers.
- The Java tests load the bundle under Nashorn — the only gate for **runtime semantics**.

| Works in Nashorn | Does not |
| --- | --- |
| `let`/`const` (TDZ, per-iteration bindings) | classes, destructuring, default/rest params, spread |
| template literals, tagged templates | generators, `async`/`await`, `**`, `??`, `?.` |
| `for…of` over arrays, strings, `Map`, `Set` | computed method names `{ [k]() {} }` |
| shorthand properties, computed keys | `\u{…}` escapes, trailing comma in params |
| `Map`, `Set`, `WeakMap`, `Symbol` | `Promise`, `Proxy`, `Reflect` |
| `Object.setPrototypeOf` | `Object.assign/is/entries/values`, `Array.from/of/find/includes` |
| `String.prototype.startsWith/endsWith/repeat` | `Number.isInteger`, `Math.trunc/sign`, `.includes/.padStart` |
| | regex `u`/`y`/`s` flags, named groups, lookbehind |

Three things look like they work and do not:

- **Arrow functions do not capture `this`** — `this` is `undefined` inside any non-top-level arrow.
  esbuild lowers arrows to `function` for that reason; never add `arrow` to `supported`.
- **`for (let k of …)` loses `k` in closures under real conditions** — isolated probes pass, but
  with `for-of` whitelisted esbuild's `__copyProps` helper uses that shape for the export getters,
  and reading the exports from another module throws `ReferenceError: "key" is not defined`.
  Never add `for-of` to `supported`; `template-literal` is left out for the same class of reason.
- **String methods fall back to `java.lang.String`** — `"aXb".replaceAll(".", "-")` returns `"---"`
  (Java regex semantics). `lib: ES5` already blocks these; do not widen `lib` to get them.

Rules that follow:

- Do not use ES2015+ built-ins. `Map`/`Set` run in Nashorn but are left out of `lib` on purpose,
  since the consuming app may also run GraalJS and the library has to behave the same on both.
- Prefer `const`; use `let` only when reassigning.
- Write arrows and template literals freely — esbuild lowers them — but never rely on `this`
  inside an arrow. `for…of` is a build error at `target: es5`; use an index loop.
- Regex literals: no `u`/`y`/`s` flags, no lookbehind, no named groups. `esbuild.config.js` fails
  the build on the first two; `tsc` catches named groups.
- The output format is CommonJS (`require`/`exports`).

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
