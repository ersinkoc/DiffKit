/**
 * Go tokenizer
 */

import type { Token } from '../../types.js';
import { createTokenizer, type TokenPattern } from '../tokenizer.js';

const patterns: TokenPattern[] = [
  // Comments
  { type: 'comment', pattern: /\/\/.*$/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },

  // Strings
  { type: 'string', pattern: /"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /`[^`]*`/ },
  { type: 'string', pattern: /'(?:[^'\\]|\\.)'/ },

  // Numbers
  { type: 'number', pattern: /\b0x[a-fA-F0-9]+\b/ },
  { type: 'number', pattern: /\b0o[0-7]+\b/ },
  { type: 'number', pattern: /\b0b[01]+\b/ },
  { type: 'number', pattern: /\b\d+\.?\d*(?:e[+-]?\d+)?\b/i },
  { type: 'number', pattern: /\b\d+i\b/ },

  // Keywords
  {
    type: 'keyword',
    pattern:
      /\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/,
  },

  // Built-in types
  {
    type: 'type',
    pattern:
      /\b(?:bool|byte|complex64|complex128|error|float32|float64|int|int8|int16|int32|int64|rune|string|uint|uint8|uint16|uint32|uint64|uintptr)\b/,
  },

  // Built-in functions
  {
    type: 'builtin',
    pattern:
      /\b(?:append|cap|close|complex|copy|delete|imag|len|make|new|panic|print|println|real|recover)\b/,
  },

  // Built-in values
  { type: 'keyword', pattern: /\b(?:true|false|nil|iota)\b/ },

  // Type names (capitalized)
  { type: 'className', pattern: /\b[A-Z][a-zA-Z0-9_]*\b/ },

  // Function calls
  { type: 'function', pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/ },

  // Operators
  { type: 'operator', pattern: /[+\-*/%=<>!&|^~:]+|<-|\.\.\.|&&|\|\|/ },

  // Punctuation
  { type: 'punctuation', pattern: /[{}[\]();,.]/ },

  // Variables/identifiers
  { type: 'variable', pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
];

const tokenize = createTokenizer(patterns);

/**
 * Tokenize Go code
 */
export function tokenizeGo(content: string): Token[] {
  return tokenize(content);
}

export default tokenizeGo;
