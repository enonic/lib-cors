---
paths:
  - "**/*.ts"
---
# Commenting Rules

## 1. Special Single-Line Prefixes

- `// ! ` — Critical issues demanding immediate attention (bugs, security risks)
- `// ? ` — Questions, uncertainties, rationale for unusual patterns
- `// * ` — Logical block separators in large files (surround with blank comment lines)
- `// TODO: ` — Actionable future work. Start with imperative verb, reference issue if possible.

> Never combine prefixes (e.g. `// ! TODO`).

## 2. Comment Placement & Density

- Comment only non-obvious logic: algorithms, work-arounds, edge-cases.
- Avoid commenting trivial code.
- Prefer function-level JSDoc for public APIs instead of inline prose.
- Keep comments inside function bodies to a minimum.

## 3. Maintenance

- Update or delete comments when code changes; stale comments are worse than none.
- Promote resolved `// TODO:` items to commits and remove the tag.
