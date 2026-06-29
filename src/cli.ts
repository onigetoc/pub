#!/usr/bin/env node

import { fetchPage } from './fetcher.js';
import { parseHtml } from './parser.js';
import { scoreKeywords } from './scorer.js';
import { formatJson, formatText } from './formatter.js';
import type { KeyscanResult } from './elements/types.js';

function parseArgs() {
  const args = process.argv.slice(2);
  let url = '';
  let jsonMode = false;
  let maxTags = 10;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '-j' || arg === '--json') {
      jsonMode = true;
    } else if (arg === '--tags' || arg === '-t') {
      i++;
      const val = parseInt(args[i], 10);
      if (!isNaN(val) && val > 0) maxTags = val;
    } else if (!arg.startsWith('-')) {
      url = arg;
    }
  }

  if (!url) {
    console.error('Usage: keyscan <url> [-j] [--tags <N>|-t <N>]');
    process.exit(1);
  }

  return { url, jsonMode, maxTags };
}

function printHelp() {
  console.log(`
keyscan — keyword density analyzer

Usage:
  keyscan <url>                  Extract top 10 keywords (space-separated)
  keyscan <url> -j               Output JSON with scores and metadata
  keyscan <url> -t 20            Top 20 keywords
  keyscan <url> -j -t 20         Top 20 keywords as JSON

Options:
  -j, --json        JSON output (scores, sources, metadata)
  -t, --tags <N>    Number of tags (default: 10)
  -h, --help        Show this help
`);
}

async function main() {
  const { url, jsonMode, maxTags } = parseArgs();

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
    };

    if (jsonMode) {
      console.log(formatJson(result));
    } else {
      console.log(formatText(result));
    }
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();
