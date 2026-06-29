import type { Sections, KeywordResult } from './elements/types.js';
import { WEIGHTS } from './elements/types.js';
import { getStopwords, tokenize, filterTokens } from './elements/stopwords.js';
import { detectAllEntities, scoreEntities } from './elements/entities.js';

const DIVERSITY_MULTIPLIER = 20;

function accumulate(
  word: string, points: number, source: string,
  scores: Record<string, number>,
  sources: Record<string, Set<string>>,
): void {
  scores[word] = (scores[word] || 0) + points;
  if (!Object.hasOwn(sources, word)) sources[word] = new Set();
  sources[word].add(source);
}

function scoreSection(
  key: string, texts: string[], stopwords: Set<string>,
  scores: Record<string, number>,
  sources: Record<string, Set<string>>,
): void {
  const sectionFreq: Record<string, number> = {};
  for (const text of texts) {
    for (const word of filterTokens(tokenize(text), stopwords)) {
      sectionFreq[word] = (sectionFreq[word] || 0) + 1;
    }
  }
  for (const [word, count] of Object.entries(sectionFreq)) {
    const freqBonus = Math.log(1 + count);
    accumulate(word, Math.round(WEIGHTS[key] * freqBonus), key, scores, sources);
  }
}

function scoreSections(
  sections: Sections, stopwords: Set<string>,
  scores: Record<string, number>,
  sources: Record<string, Set<string>>,
): void {
  for (const [key, texts] of Object.entries(sections)) {
    if (!WEIGHTS[key]) continue;
    scoreSection(key, texts, stopwords, scores, sources);
  }
}

function countFrequencies(tokens: string[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const w of tokens) freq[w] = (freq[w] || 0) + 1;
  return freq;
}

function scoreBody(
  bodyText: string, stopwords: Set<string>,
  scores: Record<string, number>,
  sources: Record<string, Set<string>>,
): { freq: Record<string, number>; total: number } {
  const bodyTokens = filterTokens(tokenize(bodyText), stopwords);
  const freq = countFrequencies(bodyTokens);
  const total = bodyTokens.length || 1;
  for (const [w, count] of Object.entries(freq)) {
    const freqBonus = Math.log(1 + count);
    const baseScore = Math.round(count * WEIGHTS.body * freqBonus);
    const densityBonus = Math.min(Math.round((count / total) * 100 * 8), 20);
    accumulate(w, baseScore + densityBonus, 'body', scores, sources);
  }
  return { freq, total };
}

function applyDiversityBonus(
  scores: Record<string, number>,
  sources: Record<string, Set<string>>,
): void {
  for (const [word, wordSources] of Object.entries(sources)) {
    let bonus = 0;
    for (const src of wordSources) {
      if (src !== 'body' && src !== 'entity') {
        bonus += (WEIGHTS[src] || 0) * DIVERSITY_MULTIPLIER;
      }
    }
    if (bonus > 0) scores[word] = (scores[word] || 0) + bonus;
  }
}

function subExpressions(word: string): string[] {
  const parts = word.split('-');
  if (parts.length < 2) return [];
  const subs: string[] = [];
  for (let len = 1; len < parts.length; len++) {
    for (let start = 0; start + len <= parts.length; start++) {
      subs.push(parts.slice(start, start + len).join('-'));
    }
  }
  return subs;
}

function applyCoverageFilter(keywords: KeywordResult[]): KeywordResult[] {
  const blocked = new Set<string>();
  for (const kw of keywords) {
    if (kw.word.includes('-')) {
      for (const sub of subExpressions(kw.word)) {
        blocked.add(sub);
      }
    }
  }
  return keywords.filter(kw => !blocked.has(kw.word));
}

export function scoreKeywords(
  sections: Sections,
  bodyText: string,
  lang: string,
  maxTags: number,
  extraStopwords?: Set<string>,
): { keywords: KeywordResult[]; totalWords: number } {
  const stopwords = getStopwords(lang);
  const scores: Record<string, number> = {};
  const sources: Record<string, Set<string>> = {};

  scoreSections(sections, stopwords, scores, sources);
  const { freq, total } = scoreBody(bodyText, stopwords, scores, sources);

  const { entities, originalForms } = detectAllEntities(bodyText);
  scoreEntities(entities, originalForms, sections, scores, sources, freq);

  applyDiversityBonus(scores, sources);

  const keywords: KeywordResult[] = Object.entries(scores)
    .filter(([word]) => !extraStopwords?.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTags)
    .map(([word, score]) => ({
      word,
      score,
      sources: [...(sources[word] || [])],
      frequency: freq[word] || 0,
    }));

  const tagSet = new Set(keywords.map(k => k.word));
  const collapsed = keywords.filter(kw => kw.word.length <= 2 || !tagSet.has(kw.word + "s"));

  const filtered = applyCoverageFilter(collapsed);

  return { keywords: filtered, totalWords: total };
}
