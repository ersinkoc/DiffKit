/**
 * Content parser for DiffKit
 * Handles line/word/char granularity parsing
 */

import type { Token, ParsedContent, ParserOptions, GranularityType } from './types.js';

/**
 * Default parser options
 */
const defaultOptions: ParserOptions = {
  granularity: 'line',
  ignoreWhitespace: false,
  ignoreCase: false,
  trimLines: false,
};

/**
 * Parse content into tokens based on granularity
 */
export function parse(content: string, options: Partial<ParserOptions> = {}): ParsedContent {
  const opts = { ...defaultOptions, ...options };
  const tokens: Token[] = [];
  const lineMap = new Map<number, Token[]>();

  if (content.length === 0) {
    return { tokens, lineMap };
  }

  const lines = splitLines(content);

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    let line = lines[lineNum] ?? '';

    if (opts.trimLines) {
      line = line.trim();
    }

    if (opts.ignoreCase) {
      line = line.toLowerCase();
    }

    const lineTokens: Token[] = [];

    switch (opts.granularity) {
      case 'char':
        for (let col = 0; col < line.length; col++) {
          const char = line[col]!;
          if (opts.ignoreWhitespace && /\s/.test(char)) {
            continue;
          }
          const token: Token = {
            value: char,
            line: lineNum + 1,
            column: col + 1,
          };
          tokens.push(token);
          lineTokens.push(token);
        }
        break;

      case 'word': {
        const words = tokenizeWords(line);
        for (const word of words) {
          if (opts.ignoreWhitespace && /^\s+$/.test(word.value)) {
            continue;
          }
          const token: Token = {
            value: word.value,
            line: lineNum + 1,
            column: word.column,
          };
          tokens.push(token);
          lineTokens.push(token);
        }
        break;
      }

      case 'line':
      default:
        if (!opts.ignoreWhitespace || line.trim().length > 0) {
          const token: Token = {
            value: line,
            line: lineNum + 1,
            column: 1,
          };
          tokens.push(token);
          lineTokens.push(token);
        }
        break;
    }

    lineMap.set(lineNum + 1, lineTokens);
  }

  return { tokens, lineMap };
}

/**
 * Split content into lines preserving line endings info
 */
export function splitLines(content: string): string[] {
  if (content.length === 0) {
    return [];
  }

  // Split by line endings, but don't include the endings in the result
  const lines = content.split(/\r\n|\r|\n/);

  // Handle trailing newline - if content ends with newline, last element is empty
  // We keep it to preserve the fact that there was a trailing newline
  return lines;
}

/**
 * Tokenize a line into words (including whitespace as separate tokens)
 */
function tokenizeWords(line: string): { value: string; column: number }[] {
  const words: { value: string; column: number }[] = [];
  let current = '';
  let currentColumn = 1;
  let isWhitespace = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i]!;
    const charIsWhitespace = /\s/.test(char);

    if (current.length === 0) {
      current = char;
      currentColumn = i + 1;
      isWhitespace = charIsWhitespace;
    } else if (charIsWhitespace === isWhitespace) {
      current += char;
    } else {
      words.push({ value: current, column: currentColumn });
      current = char;
      currentColumn = i + 1;
      isWhitespace = charIsWhitespace;
    }
  }

  if (current.length > 0) {
    words.push({ value: current, column: currentColumn });
  }

  return words;
}

/**
 * Normalize content based on options
 */
export function normalizeContent(content: string, options: Partial<ParserOptions> = {}): string {
  let result = content;

  if (options.ignoreCase) {
    result = result.toLowerCase();
  }

  if (options.trimLines) {
    result = result
      .split(/\r\n|\r|\n/)
      .map((line) => line.trim())
      .join('\n');
  }

  if (options.ignoreWhitespace) {
    result = result.replace(/\s+/g, ' ');
  }

  return result;
}

/**
 * Get lines from content for diff algorithms
 */
export function getLines(content: string, options: Partial<ParserOptions> = {}): string[] {
  if (content.length === 0) {
    return [];
  }

  let lines = splitLines(content);

  // Remove empty last element if content doesn't end with newline
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines = lines.slice(0, -1);
  }

  if (options.trimLines) {
    lines = lines.map((line) => line.trim());
  }

  if (options.ignoreCase) {
    lines = lines.map((line) => line.toLowerCase());
  }

  if (options.ignoreWhitespace) {
    lines = lines.map((line) => line.replace(/\s+/g, ' ').trim());
  }

  return lines;
}

/**
 * Get granularity-based units for comparison
 */
export function getUnits(content: string, granularity: GranularityType): string[] {
  switch (granularity) {
    case 'char':
      return content.split('');

    case 'word':
      return content.split(/(\s+)/).filter((w) => w.length > 0);

    case 'line':
    default:
      return getLines(content);
  }
}

/**
 * Join units back to content
 */
export function joinUnits(units: string[], granularity: GranularityType): string {
  switch (granularity) {
    case 'char':
      return units.join('');

    case 'word':
      return units.join('');

    case 'line':
    default:
      return units.join('\n');
  }
}
