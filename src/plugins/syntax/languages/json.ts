/**
 * JSON tokenizer
 */

import type { Token } from '../../types.js';
import { createTokenizer, type TokenPattern } from '../tokenizer.js';

const patterns: TokenPattern[] = [
  // Strings (property names and values)
  { type: 'string', pattern: /"(?:[^"\\]|\\.)*"/ },

  // Numbers
  { type: 'number', pattern: /-?\b\d+\.?\d*(?:e[+-]?\d+)?\b/i },

  // Boolean and null
  { type: 'keyword', pattern: /\b(?:true|false|null)\b/ },

  // Punctuation
  { type: 'punctuation', pattern: /[{}[\]:,]/ },
];

const tokenize = createTokenizer(patterns);

/**
 * Tokenize JSON code
 */
export function tokenizeJSON(content: string): Token[] {
  // Enhanced tokenization to distinguish property names from string values
  const tokens = tokenize(content);
  const enhanced: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]!;

    // Check if this string is followed by a colon (property name)
    if (token.type === 'string') {
      let isPropertyName = false;

      // Look ahead for colon
      for (let j = i + 1; j < tokens.length; j++) {
        const next = tokens[j]!;
        if (next.type === 'newline' || next.type === 'plain') {
          if (next.value.trim() === '') continue;
        }
        if (next.value === ':') {
          isPropertyName = true;
        }
        break;
      }

      if (isPropertyName) {
        enhanced.push({ ...token, type: 'property' });
      } else {
        enhanced.push(token);
      }
    } else {
      enhanced.push(token);
    }
  }

  return enhanced;
}

export default tokenizeJSON;
