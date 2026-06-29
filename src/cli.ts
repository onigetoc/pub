#!/usr/bin/env node

import { writeFileSync } from 'fs';
import { fetchPage } from './fetcher.js';
import { parseHtml } from './parser.js';
import { scoreKeywords } from './scorer.js';
import { formatJson, formatText, formatMarkdown, formatFrontmatter } from './formatter.js';
import type { KeyscanResult } from './elements/types.js';

type Format = 'text' | 'json' | 'markdown' | 'frontmatter';

function parseArgs() {
  const args = process.argv.slice(2);
  let url = '';
  let maxTags = 10;
  let format: Format = 'text';
  let outputFile = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '-j' || arg === '--json') {
      format = 'json';
    } else if (arg === '-m' || arg === '--markdown') {
      format = 'markdown';
    } else if (arg === '-f' || arg === '--frontmatter') {
      format = 'frontmatter';
    } else if (arg === '--tag') {
      format = 'text';
    } else if (arg === '-t' || arg === '--tags') {
      i++;
      const val = parseInt(args[i], 10);
      if (!isNaN(val) && val > 0) maxTags = val;
    } else if (arg === '-o' || arg === '--output') {
      i++;
      if (args[i] && !args[i].startsWith('-')) outputFile = args[i];
    } else if (!arg.startsWith('-')) {
      url = arg;
    }
  }

  if (!url) {
    console.error('Usage: keyscan <url> [format] [options]');
    process.exit(1);
  }

  return { url, maxTags, format, outputFile };
}

function printHelp() {
  console.log(`
keyscan — keyword density analyzer

Usage:
  keyscan <url>                         Space-separated tags (default)
  keyscan <url> -j                      JSON with scores and metadata
  keyscan <url> -m                      Markdown body
  keyscan <url> -f                      Full .md (frontmatter + body)
  keyscan <url> --tags 20               Top 20 tags (default: 10)
  keyscan <url> -j --tags 20            Top 20 as JSON
  keyscan <url> -f -o article.md        Write .md to file

Format flags (mutually exclusive):
  -j, --json        JSON output
  -m, --markdown    Markdown body (from defuddle)
  -f, --frontmatter Full .md with YAML frontmatter + body
  --tag             Tags (space-separated, default)

Options:
  --tags <N>        Number of tags (default: 10)
  -o, --output <f>  Write to file instead of stdout
  -h, --help        Show this help
`);
}

async function main() {
  const { url, maxTags, format, outputFile } = parseArgs();

  try {
    const page = await fetchPage(url);
    const { sections, bodyText } = parseHtml(page.rawHtml, page.defuddleContent);
    const { keywords, totalWords } = scoreKeywords(sections, bodyText, page.language, maxTags);

    const result: KeyscanResult = {
      keywords,
      totalWords,
      title: page.title,
      description: page.description,
      language: page.language,
      url,
      author: page.author || undefined,
      contentMarkdown: page.defuddleSuccess ? page.defuddleMarkdown || undefined : undefined,
    };

    let output: string;
    switch (format) {
      case 'json': output = formatJson(result); break;
      case 'markdown': output = formatMarkdown(result); break;
      case 'frontmatter': output = formatFrontmatter(result); break;
      default: output = formatText(result);
    }

    if (outputFile) {
      writeFileSync(outputFile, output, 'utf-8');
      console.error(`Written to ${outputFile}`);
    } else {
      console.log(output);
    }
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();
