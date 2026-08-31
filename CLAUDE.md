## Project

**lib-cors** (`com.enonic.lib.cors`) is an Enonic XP library providing CORS header handling for controllers and filters. Targets XP 8+. The emitted JS runs under the consuming app's script engine, which defaults to Nashorn in XP 8, so the output must stay ES5 plus the ES2015 subset listed in `.claude/rules/typescript.md`.

## Commands

```bash
./gradlew build             # full build (production by default): esbuild -> build/esbuild, jar, Java + Node tests
./gradlew build -Penv=dev   # dev build (source maps)
pnpm build                  # dev esbuild bundle only -> build/esbuild
pnpm check                  # type-check (tsc) + lint/format (biome)
pnpm fix                    # auto-fix lint + formatting
pnpm test                   # Node tests for the TS utilities
pnpm build:types            # @enonic-types/lib-cors package -> build/types (version from gradle.properties)
pnpm test:types             # build:types + packlist check + type-check types/test against the built package
```

`./gradlew build` runs `buildTypes` (into `assemble`) and `testTypes` (into `check`); CI publishes
`build/types` to npm right after the Maven publish on release versions only.

## Git & GitHub

**`gh` CLI:** Do not assume `gh` is available. Use raw `git` commands if missing.

### Commits

- **With issue**: `<Issue Title> #<number>` — e.g. `Add preflight handling #12`
- **Without issue**: plain text description — e.g. `Fix origin matching for trailing slashes`

### Pull Requests

- No emojis. Be concise — list only the changes.
- At the very bottom of the description, add: `<sub>*Drafted with AI assistance*</sub>`
