import { parseHTML } from 'linkedom';
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

function stripDomain(host: string): string {
  const parts = host.split('.');
  if (parts.length > 2) return parts[parts.length - 2];
  return parts[0];
}

function extractAuthorFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    const parts = u.pathname.split('/').filter(Boolean);

    if (host === 'github.com' && parts.length >= 1) return parts[0];
    if (host.endsWith('wikipedia.org')) return 'Wikipedia';
    if (host.includes('medium.com') && parts.length >= 1) return `@${parts[0]}`;

    return stripDomain(host);
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
    const { document } = parseHTML(rawHtml);
    const result = await Defuddle(document, url, { separateMarkdown: true });
    defuddleContent = result.content ?? '';
    defuddleMarkdown = (result as { contentMarkdown?: string }).contentMarkdown ?? '';
    defuddleTitle = result.title ?? '';
    defuddleDescription = result.description ?? '';
    defuddleLanguage = result.language ?? 'en';
    defuddleAuthor = result.author ?? '';
  } catch {
    // defuddle may fail on some pages
  }

  const defuddleSuccess = !!(defuddleContent && defuddleContent.length < rawHtml.length * 0.6);

  if (!defuddleAuthor) {
    defuddleAuthor = extractAuthorFromUrl(url);
  } else if (defuddleAuthor.includes('.')) {
    defuddleAuthor = stripDomain(defuddleAuthor);
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
