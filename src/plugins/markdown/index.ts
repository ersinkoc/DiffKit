/**
 * Markdown diff plugin
 * Provides structure-aware diffing for Markdown documents
 */

import type { DiffPlugin, MarkdownPluginOptions } from '../types.js';
import { parseMarkdown, serializeMarkdown, getPlainText } from './md-parser.js';

export { parseMarkdown, serializeMarkdown, getPlainText } from './md-parser.js';

/**
 * Create markdown plugin
 */
export function markdownPlugin(options: MarkdownPluginOptions = {}): DiffPlugin {
  const { preserveStructure = true, ignoreFormatting = false } = options;

  return {
    name: 'markdown',
    version: '1.0.0',

    onBeforeDiff(content: string): string {
      if (!preserveStructure && ignoreFormatting) {
        // Return plain text only
        const blocks = parseMarkdown(content);
        return getPlainText(blocks);
      }

      if (ignoreFormatting) {
        // Parse and re-serialize to normalize
        const blocks = parseMarkdown(content);
        return serializeMarkdown(blocks);
      }

      return content;
    },

    parse(content: string) {
      const tokens: { value: string; line: number; column: number; type: string }[] = [];
      const lineMap = new Map<number, typeof tokens>();
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        const lineTokens = tokenizeLine(line, i + 1);
        tokens.push(...lineTokens);
        lineMap.set(i + 1, lineTokens);
      }

      return { tokens, lineMap };
    },
  };
}

/**
 * Tokenize a markdown line
 */
function tokenizeLine(line: string, lineNum: number) {
  const tokens: { value: string; line: number; column: number; type: string }[] = [];
  let col = 1;

  // Heading
  const headingMatch = line.match(/^(#{1,6})\s/);
  if (headingMatch) {
    tokens.push({
      value: headingMatch[1]!,
      line: lineNum,
      column: col,
      type: 'keyword',
    });
    col += headingMatch[0].length;
    tokens.push({
      value: line.slice(headingMatch[0].length),
      line: lineNum,
      column: col,
      type: 'variable',
    });
    return tokens;
  }

  // Code fence
  if (/^(`{3,}|~{3,})/.test(line)) {
    tokens.push({
      value: line,
      line: lineNum,
      column: col,
      type: 'string',
    });
    return tokens;
  }

  // Blockquote
  if (line.startsWith('>')) {
    tokens.push({
      value: '>',
      line: lineNum,
      column: col,
      type: 'comment',
    });
    col += 1;
    if (line.length > 1) {
      tokens.push({
        value: line.slice(1),
        line: lineNum,
        column: col,
        type: 'variable',
      });
    }
    return tokens;
  }

  // List item
  const listMatch = line.match(/^([\t ]*)([-*+]|\d+\.)\s/);
  if (listMatch) {
    if (listMatch[1]) {
      tokens.push({
        value: listMatch[1],
        line: lineNum,
        column: col,
        type: 'plain',
      });
      col += listMatch[1].length;
    }
    tokens.push({
      value: listMatch[2]!,
      line: lineNum,
      column: col,
      type: 'punctuation',
    });
    col += listMatch[2]!.length + 1;
    tokens.push({
      value: line.slice(listMatch[0].length),
      line: lineNum,
      column: col,
      type: 'variable',
    });
    return tokens;
  }

  // Horizontal rule
  if (/^(?:---+|\*\*\*+|___+)\s*$/.test(line)) {
    tokens.push({
      value: line,
      line: lineNum,
      column: col,
      type: 'punctuation',
    });
    return tokens;
  }

  // Default: parse inline elements
  return parseInline(line, lineNum);
}

/**
 * Parse inline markdown elements
 */
function parseInline(line: string, lineNum: number) {
  const tokens: { value: string; line: number; column: number; type: string }[] = [];
  let pos = 0;

  const patterns = [
    { regex: /\*\*[^*]+\*\*/, type: 'keyword' }, // Bold
    { regex: /__[^_]+__/, type: 'keyword' },
    { regex: /\*[^*]+\*/, type: 'keyword' }, // Italic
    { regex: /_[^_]+_/, type: 'keyword' },
    { regex: /~~[^~]+~~/, type: 'keyword' }, // Strikethrough
    { regex: /`[^`]+`/, type: 'string' }, // Inline code
    { regex: /\[[^\]]+\]\([^)]+\)/, type: 'function' }, // Link
    { regex: /!\[[^\]]*\]\([^)]+\)/, type: 'function' }, // Image
  ];

  while (pos < line.length) {
    let matched = false;

    for (const { regex, type } of patterns) {
      const remaining = line.slice(pos);
      const match = remaining.match(regex);

      if (match && match.index === 0) {
        tokens.push({
          value: match[0],
          line: lineNum,
          column: pos + 1,
          type,
        });
        pos += match[0].length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Find next special character or end of line
      let nextSpecial = line.length;
      for (const { regex } of patterns) {
        const remaining = line.slice(pos);
        const match = remaining.match(regex);
        if (match && match.index !== undefined && match.index < nextSpecial - pos) {
          nextSpecial = pos + match.index;
        }
      }

      if (nextSpecial > pos) {
        tokens.push({
          value: line.slice(pos, nextSpecial),
          line: lineNum,
          column: pos + 1,
          type: 'variable',
        });
        pos = nextSpecial;
      } else {
        tokens.push({
          value: line.slice(pos),
          line: lineNum,
          column: pos + 1,
          type: 'variable',
        });
        break;
      }
    }
  }

  return tokens;
}

export default markdownPlugin;
