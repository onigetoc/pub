import { JSDOM } from 'jsdom';
import { Defuddle } from 'defuddle/node';

export interface FetchedPage {
  rawHtml: string;
  title: string;
  description: string;
  language: string;
  defuddleContent: string;
}

export async function fetchPage(url: string): Promise<FetchedPage> {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; keyscan-cli/0.1)' },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const rawHtml = await response.text();

  let defuddleTitle = '';
  let defuddleDescription = '';
  let defuddleLanguage = 'en';
  let defuddleContent = '';

  try {
    const origError = console.error;
    console.error = () => {};
    try {
      const dom = new JSDOM(rawHtml, { url });
      const result = await Defuddle(dom.window.document, url);
      defuddleContent = result.content ?? '';
      defuddleTitle = result.title ?? '';
      defuddleDescription = result.description ?? '';
      defuddleLanguage = result.language ?? 'en';
    } finally {
      console.error = origError;
    }
  } catch {
    // defuddle may fail on some pages (e.g. :has() unsupported by jsdom)
  }

  return {
    rawHtml,
    title: defuddleTitle,
    description: defuddleDescription,
    language: defuddleLanguage,
    defuddleContent,
  };
}
