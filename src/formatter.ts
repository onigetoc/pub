import type { KeyscanResult } from './elements/types.js';

export function formatJson(result: KeyscanResult): string {
  return JSON.stringify(result, null, 2);
}

export function formatText(result: KeyscanResult): string {
  return result.keywords.map(k => k.word).join(' ');
}
