import type { KeyscanResult } from './elements/types.js';

export function formatJson(result: KeyscanResult): string {
  return JSON.stringify(result, null, 2);
}

export function formatText(result: KeyscanResult): string {
  return result.keywords.map(k => k.word).join(' ');
}

export function formatMarkdown(result: KeyscanResult): string {
  if (result.contentMarkdown) {
    return result.contentMarkdown;
  }
  const lines = [`# ${result.title}`, '', ...result.keywords.map(k => `- ${k.word}`), ''];
  return lines.join('\n');
}

function buildFrontmatter(result: KeyscanResult): string {
  const now = new Date().toISOString().split('T')[0];
  const lines: string[] = ['---'];
  if (result.title) lines.push(`title: "${result.title.replace(/"/g, '\\"')}"`);
  if (result.url) lines.push(`source: ${result.url}`);
  if (result.author) lines.push(`author:`);
  if (result.author) lines.push(`  - "${result.author}"`);
  if (result.description) lines.push(`description: "${result.description.replace(/"/g, '\\"')}"`);
  if (result.language) lines.push(`language: "${result.language}"`);
  lines.push(`scanned: ${now}`);
  lines.push('tags:');
  for (const kw of result.keywords) {
    lines.push(`  - "${kw.word}"`);
  }
  lines.push(`word_count: ${result.totalWords}`);
  lines.push('---');
  return lines.join('\n');
}

export function formatFrontmatter(result: KeyscanResult): string {
  const fm = buildFrontmatter(result);
  if (result.contentMarkdown) {
    return fm + '\n\n' + result.contentMarkdown;
  }
  return fm;
}
