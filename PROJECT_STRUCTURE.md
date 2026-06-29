# keyscan — Project Architecture for LLMs

## Overview

keyscan = keyword density analyzer. Input HTML → output scored, deduplicated tags.

Pipeline: extract sections → tokenize → score by source weight → detect entities → diversity bonus → plural collapse → coverage filter → top N tags.

## Directory Structure

```
src/
├── assets/              Static assets (icons, images)
├── elements/            Core scoring modules (each is a self-contained piece)
│   ├── types.ts         Shared types + weight constants
│   ├── stopwords.ts     Filtered-word lists per language
│   ├── entities.ts      Multi-word named entity detection + scoring
│   ├── frontmatter.ts   YAML frontmatter builder (export only, not scoring)
├── App.tsx              React UI + full pipeline orchestrator
├── index.css            Tailwind CSS + custom styles
├── main.tsx             React entry point (mounts <App />)
```

## File Roles

### `src/elements/types.ts`

Types + constants that every module imports.

| Export | Purpose |
|---|---|
| `WEIGHTS` | Point values per HTML source: `title: 25`, `h1: 15`, `body: 1` |
| `Sections` | `Record<string, string[]>` — source key → array of text strings |
| `KeywordResult` | `{ word, score, sources[], frequency }` — final tag shape |
| `LEGEND_COLORS` | UI colors per source (not used by scoring) |

### `src/elements/stopwords.ts`

Language-specific + universal filtered word lists. Every word that passes stopwords check enters scoring; everything else is silently dropped.

| Export | Purpose |
|---|---|
| `getStopwords(lang)` | Merges lang-specific set (`en`/`fr`) + `STOPWORDS_COMMON` |
| `STOPWORDS_EN` / `STOPWORDS_FR` | Function words, common verbs, adjectives per language |
| `STOPWORDS_COMMON` | HTML/tech junk (`nbsp`, `href`, `div`, `readme`) + universal EN function words — always filtered regardless of detected language |
| `FILLER_WORDS` | Edge-trim words for entity detection (articles, prepositions) |
| `COMMON_WORDS` | Words that aren't named entities even when capitalized |
| `ACRONYM_BLACKLIST` | Noise acronyms excluded from entity detection (`isbn`, `html`, `url`) |

### `src/elements/entities.ts`

Detects multi-word proper nouns + acronyms from body text and scores them as combined keywords.

| Function | Role |
|---|---|
| `detectAllEntities(bodyText)` | Scans body text for consecutive capitalized words (`Empire State Building`) + acronyms (`NASA`). Returns `{ entities, originalForms }`. |
| `scoreEntities(...)` | Injects entity scores into main `scores` map. Formula: `count * 3 * log(1+count)`. Single-occurrence entities skipped unless found in high-value sections (title, h1, h2, strong, em). |
| `dedupEntities()` | Removes 2-word entities when a 3+-word form containing them exists. E.g. `empire-state` removed if `empire-state-building` exists. |

### `src/elements/frontmatter.ts`

Builds YAML frontmatter from extracted metadata + top keywords. Not part of scoring pipeline; used only for Markdown export. Imports types from `types.ts`.

### `src/App.tsx`

React UI + full analysis orchestrator. Orchestration flow:

1. **Input**: User provides URL (fetched via `/api/fetch`) or raw text
2. **Sanitize**: DOMPurify strips XSS/bad tags, preserves YouTube embeds as anchor placeholders
3. **Extract**: Readability isolates main article content from boilerplate (nav, footer, aside)
4. **Section scoring**: Title, meta, headings, strong/em, anchors, img alts, figcaptions → each weighted by `WEIGHTS` × `log(1+count)`
5. **Body scoring**: Base frequency × body weight × `log(1+count)` + density bonus capped at 20
6. **Entity scoring**: Multi-word named entities injected as combined keywords
7. **Diversity bonus**: Words in multiple non-body sources get extra points
8. **Plural collapse**: If both `workflow` and `workflows` exist, keep only `workflows`
9. **Coverage filter**: Multi-word entities block their constituent single words (e.g. `empire-state-building` blocks `empire`, `state`, `building`)
10. **Display**: Keyword table with score bars + content tabs (Markdown/HTML/Plain/JSON/YAML/Meta metadata)

### `src/main.tsx`

Standard React 18 entry. `createRoot` mounts `<App />` on `#root`.

### `src/index.css`

Tailwind directives (`@tailwind base/components/utilities`) + project custom styles, fonts, animations.

## The Score Pipeline (detailed)

```
scoreKeywords(sections, bodyText, lang)
├── scoreSections()      → tokenize each section text → filter stopwords → accumulate [WEIGHT * log(1+count)]
├── scoreBody()          → tokenize body → count frequencies → base [count * bodyWeight * log(1+count)] + density bonus
├── detectAllEntities()  → find capitalized multi-word combos + acronyms in body
├── scoreEntities()      → inject entity scores + sources into main maps
├── applyDiversityBonus() → reward words found in multiple non-body sources
├── sort + slice(0, maxTags)
├── plural collapse       → if `workflow` + `workflows`, keep `workflows`
└── applyCoverageFilter() → multi-word keywords block their sub-expressions
```

## Deduplication Rules (in order)

1. **Entity sub-expression** (`entities.ts`): 2-word entity removed if 3+-word form exists
2. **Plural collapse** (`analyzer.ts`): singular removed if `word + "s"` exists; keeps plural only
3. **Coverage filter** (`analyzer.ts`): each hyphenated keyword blocks all its contiguous sub-expressions

## Config Files

| File | Role |
|---|---|
| `package.json` | Dependencies (React, DOMPurify, Readability, jsdom), Vite scripts |
| `vite.config.ts` | Vite bundler config + React plugin |
| `tsconfig.json` | Root TS config (references app/node configs) |
| `tsconfig.app.json` | App-specific TS config (strict mode, paths) |
| `tsconfig.node.json` | Node-side TS config (Vite config) |
| `eslint.config.js` | ESLint flat config |
| `.gitignore` | Ignored files |
| `README.md` | Project docs |
