import { JSDOM } from 'jsdom';
import type { Sections } from './elements/types.js';

function getTextNodes(doc: Document, sel: string): string[] {
  return [...doc.querySelectorAll(sel)].map(el => el.textContent?.trim() || '').filter(Boolean);
}

function getMetaContent(doc: Document, selector: string): string[] {
  const el = doc.querySelector(selector);
  if (!el) return [];
  return [el.getAttribute('content') || ''].filter(Boolean);
}

function extractAnchorTexts(root: Document | Element): string[] {
  return [...root.querySelectorAll('a')]
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
  const paragraphs = doc.querySelectorAll('p');
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
  const dom = new JSDOM(rawHtml);
  const doc = dom.window.document;

  const sections = extractSectionsFromDoc(doc);

  doc.querySelectorAll('nav,footer,header,aside,script,style,[role="navigation"],[role="banner"]')
    .forEach(el => el.remove());

  sections.first_para = extractFirstParagraph(doc);

  const imgAlts = [...doc.querySelectorAll('img[alt]')]
    .map(img => img.getAttribute('alt')?.trim() || '')
    .filter(t => t.length > 2 && t.length < 200);
  if (imgAlts.length > 0) sections.img_alt = imgAlts;

  const figcaptions = [...doc.querySelectorAll('figcaption')]
    .map(el => el.textContent?.trim() || '')
    .filter(Boolean);
  if (figcaptions.length > 0) sections.figcaption = figcaptions;

  // Use defuddle content for body (cleaner article text), fall back to raw DOM body
  if (defuddleContent) {
    const defuddleDom = new JSDOM(defuddleContent);
    const defuddleDoc = defuddleDom.window.document;
    const contentEl = defuddleDoc.querySelector('article,[role="main"],main,.post-content,.entry-content,.article-body') ?? defuddleDoc.body;
    const rawText = contentEl.textContent || '';
    const bodyText = cleanBodyText(rawText);
    return { sections, bodyText };
  }

  const contentEl = doc.querySelector('article,[role="main"],main,.post-content,.entry-content,.article-body') ?? doc.body;
  const rawText = contentEl.textContent || '';
  const bodyText = cleanBodyText(rawText);

  return { sections, bodyText };
}
