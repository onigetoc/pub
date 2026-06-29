import { FILLER_WORDS, COMMON_WORDS, ACRONYM_BLACKLIST } from './stopwords.js';
import { WEIGHTS } from './types.js';
import type { Sections } from './types.js';

function dedupEntities(entities: Record<string, number>, originalForms: Record<string, string>): void {
  const threePlus = new Set(Object.keys(entities).filter(k => k.split('-').length >= 3));
  for (const key of Object.keys(entities)) {
    if (key.split('-').length === 2) {
      for (const longer of threePlus) {
        if (longer.startsWith(key + '-')) {
          delete entities[key];
          delete originalForms[key];
          break;
        }
      }
    }
  }
}

export function detectAllEntities(bodyText: string): { entities: Record<string, number>; originalForms: Record<string, string> } {
  const entities: Record<string, number> = {};
  const originalForms: Record<string, string> = {};
  const multiWordRegex = /\b((?:[A-Z\u00C0-\u024F][\p{L}0-9\-']+)(?:\s+[A-Z\u00C0-\u024F][\p{L}0-9\-']+){1,2})\b/gu;
  let match: RegExpExecArray | null;
  while ((match = multiWordRegex.exec(bodyText)) !== null) {
    let entity = match[1].trim();
    entity = entity.replace(/\b[A-Za-z\u00C0-\u024F]{1,2}[''\u2019]/g, '');
    const leadingWord = entity.split(/\s+/)[0].toLowerCase();
    if (FILLER_WORDS.has(leadingWord)) entity = entity.replace(/^\S+\s+/, '');
    const words = entity.split(/\s+/);
    if (FILLER_WORDS.has(words[words.length - 1]?.toLowerCase() ?? '')) {
      words.pop();
      entity = words.join(' ');
    }
    const remaining = entity.split(/\s+/);
    if (remaining.length < 2) continue;
    if (!remaining.every(w => /^[A-Z\u00C0-\u024F]/.test(w))) continue;
    if (remaining.every(w => {
      const parts = w.toLowerCase().split('-');
      return parts.every(p => COMMON_WORDS.has(p) || FILLER_WORDS.has(p));
    })) continue;
    const key = entity.toLowerCase().replace(/\s+/g, '-');
    entities[key] = (entities[key] || 0) + 1;
    if (!originalForms[key]) originalForms[key] = entity.toLowerCase();
  }
  const acronymRegex = /\b([A-Z]{3,})\b/g;
  while ((match = acronymRegex.exec(bodyText)) !== null) {
    const key = match[1].toLowerCase();
    if (!ACRONYM_BLACKLIST.has(key)) entities[key] = (entities[key] || 0) + 1;
  }
  for (const key of Object.keys(entities)) {
    const original = originalForms[key];
    if (!original) continue;
    let count = 0, idx = 0;
    while ((idx = bodyText.toLowerCase().indexOf(original, idx)) !== -1) {
      count++;
      idx += original.length;
    }
    if (count > entities[key]) entities[key] = count;
  }
  dedupEntities(entities, originalForms);
  return { entities, originalForms };
}

export function scoreEntities(
  entities: Record<string, number>,
  originalForms: Record<string, string>,
  sections: Sections,
  scores: Record<string, number>,
  sources: Record<string, Set<string>>,
  freq: Record<string, number>,
): void {
  const sectionTexts: Record<string, string> = {};
  for (const [key, texts] of Object.entries(sections)) {
    sectionTexts[key] = texts.join(' ').toLowerCase();
  }
  for (const [entity, count] of Object.entries(entities)) {
    if (count < 2) {
      const originalForm = originalForms[entity] || entity.replace(/-/g, ' ');
      const inHighValue = ['title', 'h1', 'h2', 'strong', 'em'].some(s => sectionTexts[s]?.includes(originalForm));
      if (!inHighValue) continue;
    }
    const originalForm = originalForms[entity] || entity.replace(/-/g, ' ');
    let score = Math.round(count * 3 * Math.log(1 + count));
    const entitySources: Set<string> = new Set(['entity']);
    for (const [section, text] of Object.entries(sectionTexts)) {
      if (WEIGHTS[section] && text.includes(originalForm)) {
        score += WEIGHTS[section];
        entitySources.add(section);
      }
    }
    scores[entity] = (scores[entity] || 0) + score;
    sources[entity] = entitySources;
    freq[entity] = count;
  }
}
