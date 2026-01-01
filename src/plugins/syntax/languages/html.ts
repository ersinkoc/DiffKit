/**
 * HTML tokenizer
 */

import type { Token } from '../../types.js';
import { createTokenizer, type TokenPattern } from '../tokenizer.js';

const patterns: TokenPattern[] = [
  // Comments
  { type: 'comment', pattern: /<!--[\s\S]*?-->/ },

  // DOCTYPE
  { type: 'keyword', pattern: /<!DOCTYPE[^>]*>/i },

  // CDATA
  { type: 'comment', pattern: /<!\[CDATA\[[\s\S]*?\]\]>/ },

  // Script content (simplified - just treat as string)
  { type: 'string', pattern: /<script[^>]*>[\s\S]*?<\/script>/i },

  // Style content (simplified - just treat as string)
  { type: 'string', pattern: /<style[^>]*>[\s\S]*?<\/style>/i },

  // Closing tags
  { type: 'tag', pattern: /<\/[a-zA-Z][a-zA-Z0-9-]*>/ },

  // Self-closing tags
  { type: 'tag', pattern: /<[a-zA-Z][a-zA-Z0-9-]*[^>]*\/>/ },

  // Opening tags with attributes
  { type: 'tag', pattern: /<[a-zA-Z][a-zA-Z0-9-]*/ },

  // Attribute values
  { type: 'string', pattern: /="[^"]*"/ },
  { type: 'string', pattern: /='[^']*'/ },

  // Attribute names
  { type: 'attribute', pattern: /\b[a-zA-Z][a-zA-Z0-9-]*(?=\s*=)/ },

  // Boolean attributes
  { type: 'attribute', pattern: /\b(?:disabled|checked|readonly|required|autofocus|autoplay|controls|loop|muted|multiple|selected|hidden|async|defer)\b/ },

  // Close bracket
  { type: 'punctuation', pattern: /\/>|>/ },

  // Entities
  { type: 'keyword', pattern: /&[a-zA-Z0-9#]+;/ },

  // Text content
  { type: 'variable', pattern: /[^<>&]+/ },
];

const tokenize = createTokenizer(patterns);

/**
 * Tokenize HTML code
 */
export function tokenizeHTML(content: string): Token[] {
  return tokenize(content);
}

export default tokenizeHTML;
