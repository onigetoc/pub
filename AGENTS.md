# keyscan-cli — agent instructions

## What this is

CLI-only Node.js TypeScript package. Fetch URL → defuddle extract → score keywords → output tags.
Multi-file structure in `src/`: elements (types, stopwords, entities), fetcher, parser, scorer, formatter, cli.

## Dev commands

| Action | Command |
|--------|---------|
| Install | `bun install` (or `npm install`) |
| Run CLI | `bun run start:dev -- <url> -t 20` |
| JSON | `bun run start:dev -- <url> -j` |
| Full .md | `bun run start:dev -- <url> -f -o article.md` |
| Test | `bun test` (vitest) |
| Watch tests | `bun run test:watch` |
| Typecheck | `bun run typecheck` |

## Key facts

- **ESM only** — `"type": "module"` in package.json.
- **linkedom** provides DOM (supports `:has()`, unlike jsdom/nwsapi).
- **defuddle** (`defuddle/node`) extracts article content + metadata. `separateMarkdown: true` for .md body.
- **Scoring pipeline**: section scoring → body scoring → entity detection → diversity bonus → plural collapse → coverage filter → top N tags.
- **Author fallback**: extracted from URL (GitHub username, Wikipedia, medium @user, domain).
- **defuddleSuccess** heuristic: rejects defuddle output when content > 60% of raw HTML length.

## Output formats (mutually exclusive)

| Flag | Format |
|------|--------|
| *(none)* | Space-separated tags |
| `-j` / `--json` | JSON with scores, sources, metadata |
| `-m` / `--markdown` | Markdown body (from defuddle) |
| `-f` / `--frontmatter` | Full .md (YAML frontmatter + body) |

## Dependencies  

- Runtime: `defuddle`, `linkedom`
- Dev: `typescript`, `tsx`, `vitest`, `@types/node`

## Important files

- `src/cli.ts` — entry point
- `src/fetcher.ts` — fetch + defuddle
- `src/parser.ts` — HTML → sections + bodyText
- `src/scorer.ts` — scoring pipeline
- `src/elements/*.ts` — types, stopwords, entities

## also read
@instruction/build-policy.md
@karpathy-guidelines.md
@rule.md
