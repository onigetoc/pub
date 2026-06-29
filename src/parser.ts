import { parseHTML } from 'linkedom';
import type { Sections } from './elements/types.js';

function qsa(doc: Document | Element, sel: string): Element[] {
  return Array.from(doc.querySelectorAll(sel));
}

function getTextNodes(doc: Document, sel: string): string[] {
  return qsa(doc, sel).map(el => el.textContent?.trim() || '').filter(Boolean);
}

function getMetaContent(doc: Document, selector: string): string[] {
  const el = doc.querySelector(selector);
  if (!el) return [];
  return [el.getAttribute('content') || ''].filter(Boolean);
}

function extractAnchorTexts(root: Document | Element): string[] {
  return qsa(root, 'a')
    .map(a => a.textContent?.trim() || '')
    .filter(t => t.length > 2 && t.length < 80);
}

function extractSectionsFromDoc(doc: Document): Sections {
  const sections: Sections = {
    title: [doc.title || ''].filter(Boolean),
    description:
      getMetaContent(doc, 'meta[name="description"]') ||
      getMetaContent(doc, 'meta[property="og:description"]'),
    og_title: getMetaContent(doc, 'meta[property="og:title"]'),
    og_description: getMetaContent(doc, 'meta[property="og:description"]'),
    h1: getTextNodes(doc, 'h1'),
    h2: getTextNodes(doc, 'h2'),
    h3: getTextNodes(doc, 'h3'),
    h4: getTextNodes(doc, 'h4'),
    h5: getTextNodes(doc, 'h5'),
    h6: getTextNodes(doc, 'h6'),
    strong: getTextNodes(doc, 'strong, b'),
    mark: getTextNodes(doc, 'mark'),
    em: getTextNodes(doc, 'em, i'),
    anchor: extractAnchorTexts(doc),
  };

  if (sections.description.length === 0) {
    sections.description = getMetaContent(doc, 'meta[property="og:description"]');
  }

  return sections;
}

function extractFirstParagraph(doc: Document): string[] {
  const paragraphs = qsa(doc, 'p');
  for (const p of paragraphs) {
    const text = p.textContent?.trim() || '';
    if (text.split(/\s+/).length >= 8) {
      return [text.split(/\s+/).slice(0, 150).join(' ')];
    }
  }
  return [];
}

function cleanBodyText(raw: string): string {
  return raw
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, (_m: string, alt: string) => {
      const words = alt.trim().split(/\s+/);
      return words.length >= 3 ? alt.trim() : '';
    })
    .replace(/<img[^>]*>/gi, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\\[a-zA-Z]+\{[^}]*\}/g, ' ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\$[^$]*\$/g, ' ')
    .replace(/\\\[[\s\S]*?\\\]/g, ' ')
    .replace(/\\\([\s\S]*?\\\)/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export interface ParsedPage {
  sections: Sections;
  bodyText: string;
}

export function parseHtml(rawHtml: string, defuddleContent?: string): ParsedPage {
  const { document: doc } = parseHTML(rawHtml);

  const sections = extractSectionsFromDoc(doc);

  const boilerplate = qsa(doc, 'nav,footer,header,aside,script,style,[role="navigation"],[role="banner"]');
  for (const el of boilerplate) {
    try { el.remove(); } catch { /* some DOMs may not support remove() */ }
  }

  sections.first_para = extractFirstParagraph(doc);

  const imgAlts = qsa(doc, 'img[alt]')
    .map(img => img.getAttribute('alt')?.trim() || '')
    .filter(t => t.length > 2 && t.length < 200);
  if (imgAlts.length > 0) sections.img_alt = imgAlts;

  const figcaptions = qsa(doc, 'figcaption')
    .map(el => el.textContent?.trim() || '')
    .filter(Boolean);
  if (figcaptions.length > 0) sections.figcaption = figcaptions;

  const contentEl = doc.querySelector('article,[role="main"],main,.post-content,.entry-content,.article-body') ?? (doc as any).body;
  const rawText = contentEl?.textContent || '';
  const bodyText = cleanBodyText(rawText);

  return { sections, bodyText };
}
