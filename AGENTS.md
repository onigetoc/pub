# keyscan-cli — agent instructions

## What this is

CLI-only Node.js TypeScript package. Input HTML → output scored, deduplicated keyword tags.
Single source file: `keyscan.ts` (580 lines). Exports `analyzeHtml(html, options?)`.

## Dev commands

| Action | Command |
|--------|---------|
| Run CLI | `npm run keyscan < input.html` or `npx tsx keyscan.ts < input.html` |
| Test | `npm test` (vitest) |
| Watch tests | `npm run test:watch` |
| Typecheck | `npm run typecheck` |

## Key facts

- **ESM only** — `"type": "module"` in package.json. `import`/`export` syntax required.
- **No React, no Vite.** Pure CLI. `PROJECT_STRUCTURE.md` describes a planned React app that is NOT built yet.
- **Scoring pipeline** (in order): section scoring → body scoring → entity detection → diversity bonus → plural collapse → coverage filter → top N tags.
- **Entity detection** finds capitalized multi-word combos + acronyms in body text. 2-word entities removed if a 3+-word superset exists.
- **Coverage filter**: multi-word keywords (e.g. `empire-state-building`) block constituent single words from the final output.
- **Defuddle** (`defuddle/node`) extracts article content from HTML via `Defuddle(document, url, options)`. Import from `defuddle/node`, not `defuddle`.
- **jsdom** provides DOM for extraction. Already a dependency.
- CLI entry uses `import.meta.url` check — runs when executed directly, not when imported.
- Input from stdin only; first arg parsing done via `process.argv`.

## Dependencies

- Runtime: `jsdom`, `defuddle`
- Dev: `typescript`, `tsx`, `vitest`, `@types/jsdom`

## Important files

- `keyscan.ts` — the whole app (exports + CLI stub)
- `defuddle.md` — upstream defuddle reference (API, bundles, options)
- `PROJECT_STRUCTURE.md` — aspirational directory layout (src/elements/*.ts), not yet built

## also read
@instruction/build-policy.md
@karpathy-guidelines.md
@rule.md