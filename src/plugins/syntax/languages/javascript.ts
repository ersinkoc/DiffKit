/**
 * JavaScript/TypeScript tokenizer
 */

import type { Token } from '../../types.js';
import { createTokenizer, type TokenPattern } from '../tokenizer.js';

const patterns: TokenPattern[] = [
  // Comments
  { type: 'comment', pattern: /\/\/.*$/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },

  // Strings
  { type: 'string', pattern: /"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /'(?:[^'\\]|\\.)*'/ },
  { type: 'string', pattern: /`(?:[^`\\]|\\.)*`/ },

  // RegExp
  { type: 'regexp', pattern: /\/(?:[^/\\]|\\.)+\/[gimsuy]*/ },

  // Numbers
  { type: 'number', pattern: /\b0x[a-fA-F0-9]+\b/ },
  { type: 'number', pattern: /\b0b[01]+\b/ },
  { type: 'number', pattern: /\b0o[0-7]+\b/ },
  { type: 'number', pattern: /\b\d+\.?\d*(?:e[+-]?\d+)?\b/i },

  // Keywords
  {
    type: 'keyword',
    pattern:
      /\b(?:async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|function|if|import|in|instanceof|interface|let|new|of|return|static|super|switch|this|throw|try|type|typeof|var|void|while|with|yield)\b/,
  },

  // Built-in values
  { type: 'keyword', pattern: /\b(?:true|false|null|undefined|NaN|Infinity)\b/ },

  // Class names (capitalized identifiers)
  { type: 'className', pattern: /\b[A-Z][a-zA-Z0-9_]*\b/ },

  // Function calls
  { type: 'function', pattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/ },

  // Properties
  { type: 'property', pattern: /(?<=\.)[a-zA-Z_$][a-zA-Z0-9_$]*/ },

  // Operators
  {
    type: 'operator',
    pattern: /[+\-*/%=<>!&|^~?:]+|\.{3}/,
  },

  // Punctuation
  { type: 'punctuation', pattern: /[{}[\]();,.]/ },

  // Variables/identifiers
  { type: 'variable', pattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/ },
];

const tokenize = createTokenizer(patterns);

/**
 * Tokenize JavaScript/TypeScript code
 */
export function tokenizeJavaScript(content: string): Token[] {
  return tokenize(content);
}

export default tokenizeJavaScript;
