/**
 * Markdown tokenizer
 */

import type { Token } from '../../types.js';
import { createTokenizer, type TokenPattern } from '../tokenizer.js';

const patterns: TokenPattern[] = [
  // Code blocks with language
  { type: 'string', pattern: /```[\s\S]*?```/ },

  // Inline code
  { type: 'string', pattern: /`[^`\n]+`/ },

  // Headings
  { type: 'keyword', pattern: /^#{1,6}\s+.*$/m },

  // Bold
  { type: 'keyword', pattern: /\*\*[^*]+\*\*/ },
  { type: 'keyword', pattern: /__[^_]+__/ },

  // Italic
  { type: 'keyword', pattern: /\*[^*]+\*/ },
  { type: 'keyword', pattern: /_[^_]+_/ },

  // Strikethrough
  { type: 'keyword', pattern: /~~[^~]+~~/ },

  // Links
  { type: 'function', pattern: /\[[^\]]+\]\([^)]+\)/ },

  // Images
  { type: 'function', pattern: /!\[[^\]]*\]\([^)]+\)/ },

  // Reference links
  { type: 'function', pattern: /\[[^\]]+\]\[[^\]]*\]/ },
  { type: 'comment', pattern: /^\[[^\]]+\]:\s+.*$/m },

  // Blockquotes
  { type: 'comment', pattern: /^>\s+.*$/m },

  // Horizontal rules
  { type: 'punctuation', pattern: /^(?:---+|\*\*\*+|___+)$/m },

  // Unordered list items
  { type: 'punctuation', pattern: /^[\t ]*[-*+]\s/m },

  // Ordered list items
  { type: 'punctuation', pattern: /^[\t ]*\d+\.\s/m },

  // Task list items
  { type: 'keyword', pattern: /\[[ x]\]/i },

  // Tables (simplified)
  { type: 'punctuation', pattern: /\|/ },

  // HTML entities
  { type: 'keyword', pattern: /&[a-zA-Z0-9#]+;/ },

  // Plain text
  { type: 'variable', pattern: /[^\n`*_~\[\]()!#>|\-+\d\\]+/ },
];

const tokenize = createTokenizer(patterns);

/**
 * Tokenize Markdown code
 */
export function tokenizeMarkdown(content: string): Token[] {
  return tokenize(content);
}

export default tokenizeMarkdown;
