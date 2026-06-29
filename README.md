# keyscan-cli

CLI keyword density analyzer. Input HTML → output scored, deduplicated keyword tags.

## Install

```bash
bun install
```

## Usage

```bash
# From stdin
bun run keyscan < input.html
cat page.html | bun run keyscan

# Or directly with tsx
npx tsx keyscan.ts < input.html
```

### As a library

```ts
import { analyzeHtml } from './keyscan';

const result = analyzeHtml('<html>...</html>', { maxTags: 20 });
console.log(result.keywords);
// → [{ word: 'keyword', score: 145, sources: ['h1', 'body'], frequency: 3 }, ...]
```

## API

### `analyzeHtml(html, options?)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxTags` | `number` | `20` | Max keywords in output |
| `lang` | `string` | `'en'` | Language for stopword filtering (`'en'` or `'fr'`) |
| `extraStopwords` | `string[]` | — | Additional words to exclude |

Returns `{ keywords: KeywordResult[], totalWords, title, description }`.

### `KeywordResult`

```ts
{ word: string; score: number; sources: string[]; frequency: number }
```

## Scoring pipeline

1. **Section scoring** — title (25pts), h1 (15), h2 (10), strong (4), etc. × `log(1+count)`
2. **Body scoring** — frequency × body weight (1) × `log(1+count)` + density bonus (capped at 20)
3. **Entity detection** — capitalized multi-word combos (`New York Stock Exchange`) + acronyms (`NASA`)
4. **Entity scoring** — `count × 3 × log(1+count)` + section weights. Single-occurrence skipped unless in high-value sections.
5. **Diversity bonus** — words in multiple non-body sources get extra points
6. **Plural collapse** — if both `workflow` and `workflows` exist, keeps `workflows`
7. **Coverage filter** — multi-word keywords block their sub-expressions (`empire-state-building` blocks `empire`, `state`, `building`)

## Dev

```bash
bun test              # vitest
bun run typecheck     # tsc --noEmit
bun run keyscan       # CLI mode
```

## Dependencies

- **Runtime:** `jsdom`, `defuddle`
- **Dev:** `typescript`, `tsx`, `vitest`, `@types/jsdom`

## Files

| File | Role |
|------|------|
| `keyscan.ts` | Main source: exports + CLI stub |
| `defuddle.md` | defuddle library reference |
| `PROJECT_STRUCTURE.md` | Aspirational directory layout (not yet built) |
