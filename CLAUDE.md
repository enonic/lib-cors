# CLAUDE.md

## Project

**lib-cors** (`com.enonic.lib.cors`) is an Enonic XP library providing CORS header handling for controllers and filters. Targets XP 7+ (Nashorn).

## Commands

```bash
./gradlew build             # full build (production by default)
./gradlew build -Penv=dev   # dev build
pnpm build                  # dev build (TypeScript only)
pnpm check                  # lint + type-check
pnpm fix                    # auto-fix lint + formatting
```

## Architecture

**Build pipeline:** TypeScript → esbuild (CJS, ES5 target with `const`/`let` and arrow support) → `build/resources/main/`.

- **Source:** `src/main/resources/lib/cors.ts` — single entry point, imported via `require('/lib/cors')`
- **Linting & formatting:** Biome (`biome.json`). Enforces `const`/`let` over `var`, single quotes.
- **Type checking:** `tsc --noEmit` (TypeScript 5, ES5 lib)
- **Tests:** Java (JUnit 5 + Mockito) via `ScriptTestSupport`. Test JS at `src/test/resources/`.

**Exported API:**
- `resolveHeaders(config, req)` — resolves CORS headers from config + request
- `getHeaders(req)` — convenience wrapper using `app.config`
- `respondOptions(req)` — returns `{ status: 204, headers }` preflight response

**Config keys** (read from `app.config` or passed explicitly):
- `cors.enabled` — `'true'` (default) or `'false'`
- `cors.origin` — allowed origin(s), comma-separated
- `cors.credentials` — `'true'` to allow credentials (requires `cors.origin`)
- `cors.allowedHeaders` — comma-separated (default: `'Content-Type'`)
- `cors.methods` — comma-separated (default: `'POST, OPTIONS'`)
- `cors.exposedHeaders` — comma-separated (headers the browser may access)
- `cors.maxAge` — preflight cache duration in seconds

## Git & GitHub

**`gh` CLI:** Do not assume `gh` is available. Use raw `git` commands if missing.

### Commits

- **With issue**: `<Issue Title> #<number>` — e.g. `Add preflight handling #12`
- **Without issue**: plain text description — e.g. `Fix origin matching for trailing slashes`

### Pull Requests

- No emojis. Be concise — list only the changes.
- At the very bottom of the description, add: `<sub>*Drafted with AI assistance*</sub>`
