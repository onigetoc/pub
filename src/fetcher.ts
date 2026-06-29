import { JSDOM } from 'jsdom';
import { Defuddle } from 'defuddle/node';

export interface FetchedPage {
  rawHtml: string;
  title: string;
  description: string;
  language: string;
  author: string;
  defuddleContent: string;
  defuddleMarkdown: string;
  defuddleSuccess: boolean;
}

function extractAuthorFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const parts = u.pathname.split('/').filter(Boolean);

    if (host === 'github.com' && parts.length >= 1) {
      return parts[0];
    }
    if (host.includes('wikipedia')) {
      return 'Wikipedia';
    }
    if (host.includes('medium.com') && parts.length >= 1) {
      return `@${parts[0]}`;
    }
    return host;
  } catch {
    return '';
  }
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
  let defuddleAuthor = '';
  let defuddleContent = '';
  let defuddleMarkdown = '';

  try {
    const origError = console.error;
    console.error = () => {};
    try {
      const dom = new JSDOM(rawHtml, { url });
      const result = await Defuddle(dom.window.document, url, { separateMarkdown: true });
      defuddleContent = result.content ?? '';
      defuddleMarkdown = (result as { contentMarkdown?: string }).contentMarkdown ?? '';
      defuddleTitle = result.title ?? '';
      defuddleDescription = result.description ?? '';
      defuddleLanguage = result.language ?? 'en';
      defuddleAuthor = result.author ?? '';
    } finally {
      console.error = origError;
    }
  } catch {
    // defuddle may fail on some pages (e.g. :has() unsupported by jsdom)
  }

  const defuddleSuccess = !!(defuddleContent && defuddleContent.length < rawHtml.length * 0.6);

  if (!defuddleAuthor) {
    defuddleAuthor = extractAuthorFromUrl(url);
  }

  return {
    rawHtml,
    title: defuddleTitle,
    description: defuddleDescription,
    language: defuddleLanguage,
    author: defuddleAuthor,
    defuddleContent,
    defuddleMarkdown,
    defuddleSuccess,
  };
}
