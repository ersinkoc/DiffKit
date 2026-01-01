/**
 * Language-agnostic tokenizer for syntax highlighting
 */

import type { Token } from '../types.js';

/**
 * Token pattern definition
 */
export interface TokenPattern {
  type: string;
  pattern: RegExp;
}

/**
 * Create a tokenizer for a set of patterns
 */
export function createTokenizer(patterns: TokenPattern[]): (content: string) => Token[] {
  // Combine all patterns into a single regex with named groups
  const combinedPattern = patterns
    .map((p, i) => `(?<g${i}>${p.pattern.source})`)
    .join('|');

  const regex = new RegExp(combinedPattern, 'gm');

  return (content: string): Token[] => {
    const tokens: Token[] = [];
    const lines = content.split('\n');

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum]!;
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      // Reset regex state
      regex.lastIndex = 0;

      while ((match = regex.exec(line)) !== null) {
        // Add plain text before match
        if (match.index > lastIndex) {
          tokens.push({
            value: line.slice(lastIndex, match.index),
            line: lineNum + 1,
            column: lastIndex + 1,
            type: 'plain',
          });
        }

        // Find which group matched
        let matchedType = 'plain';
        if (match.groups) {
          for (let i = 0; i < patterns.length; i++) {
            if (match.groups[`g${i}`] !== undefined) {
              matchedType = patterns[i]!.type;
              break;
            }
          }
        }

        tokens.push({
          value: match[0],
          line: lineNum + 1,
          column: match.index + 1,
          type: matchedType,
        });

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < line.length) {
        tokens.push({
          value: line.slice(lastIndex),
          line: lineNum + 1,
          column: lastIndex + 1,
          type: 'plain',
        });
      }

      // Add newline token (except for last line)
      if (lineNum < lines.length - 1) {
        tokens.push({
          value: '\n',
          line: lineNum + 1,
          column: line.length + 1,
          type: 'newline',
        });
      }
    }

    return tokens;
  };
}

/**
 * Simple tokenizer that splits by whitespace
 */
export function simpleTokenize(content: string): Token[] {
  const tokens: Token[] = [];
  const lines = content.split('\n');

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum]!;
    let column = 1;

    // Split by word boundaries
    const parts = line.split(/(\s+)/);

    for (const part of parts) {
      if (part.length > 0) {
        tokens.push({
          value: part,
          line: lineNum + 1,
          column,
          type: /^\s+$/.test(part) ? 'whitespace' : 'text',
        });
        column += part.length;
      }
    }

    // Add newline
    if (lineNum < lines.length - 1) {
      tokens.push({
        value: '\n',
        line: lineNum + 1,
        column,
        type: 'newline',
      });
    }
  }

  return tokens;
}

/**
 * Merge adjacent tokens of the same type
 */
export function mergeTokens(tokens: Token[]): Token[] {
  if (tokens.length === 0) return [];

  const merged: Token[] = [];
  let current = { ...tokens[0]! };

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i]!;

    if (token.type === current.type && token.line === current.line) {
      current.value += token.value;
    } else {
      merged.push(current);
      current = { ...token };
    }
  }

  merged.push(current);
  return merged;
}

/**
 * Get tokens for a specific line
 */
export function getLineTokens(tokens: Token[], lineNumber: number): Token[] {
  return tokens.filter((t) => t.line === lineNumber && t.type !== 'newline');
}
