export interface KeywordResult {
  word: string;
  score: number;
  sources: string[];
  frequency: number;
}

export interface Sections {
  [key: string]: string[];
}

export interface KeyscanOptions {
  maxTags?: number;
  lang?: string;
  extraStopwords?: string[];
}

export interface KeyscanResult {
  keywords: KeywordResult[];
  totalWords: number;
  title: string;
  description: string;
  language: string;
  url?: string;
  author?: string;
  contentMarkdown?: string;
}

export const WEIGHTS: Record<string, number> = {
  title: 25, og_title: 20, description: 5, og_description: 4,
  h1: 15, h2: 10, h3: 6, h4: 3, h5: 2, h6: 1,
  strong: 4, mark: 4, em: 2, anchor: 3, img_alt: 3, figcaption: 4,
  url_slug: 8, first_para: 6, body: 1,
};
