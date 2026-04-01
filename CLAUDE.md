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
pnpm test                   # test TS utility functions only
```

## Git & GitHub

**`gh` CLI:** Do not assume `gh` is available. Use raw `git` commands if missing.

### Commits

- **With issue**: `<Issue Title> #<number>` — e.g. `Add preflight handling #12`
- **Without issue**: plain text description — e.g. `Fix origin matching for trailing slashes`

### Pull Requests

- No emojis. Be concise — list only the changes.
- At the very bottom of the description, add: `<sub>*Drafted with AI assistance*</sub>`
