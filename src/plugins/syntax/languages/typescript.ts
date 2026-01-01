/**
 * TypeScript tokenizer (extends JavaScript with type annotations)
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

  // TypeScript-specific keywords
  {
    type: 'keyword',
    pattern:
      /\b(?:abstract|as|asserts|async|await|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|infer|instanceof|interface|is|keyof|let|module|namespace|never|new|of|override|private|protected|public|readonly|return|satisfies|set|static|super|switch|this|throw|try|type|typeof|unique|unknown|var|void|while|with|yield)\b/,
  },

  // Built-in types
  {
    type: 'keyword',
    pattern:
      /\b(?:any|boolean|bigint|never|null|number|object|string|symbol|undefined|unknown|void)\b/,
  },

  // Built-in values
  { type: 'keyword', pattern: /\b(?:true|false|null|undefined|NaN|Infinity)\b/ },

  // Decorators
  { type: 'function', pattern: /@[a-zA-Z_$][a-zA-Z0-9_$]*/ },

  // Generic type parameters
  { type: 'className', pattern: /<[A-Z][a-zA-Z0-9_,\s]*>/ },

  // Class names and types (capitalized identifiers)
  { type: 'className', pattern: /\b[A-Z][a-zA-Z0-9_]*\b/ },

  // Function calls
  { type: 'function', pattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/ },

  // Properties
  { type: 'property', pattern: /(?<=\.)[a-zA-Z_$][a-zA-Z0-9_$]*/ },

  // Type annotations
  { type: 'operator', pattern: /:\s*/ },

  // Operators
  {
    type: 'operator',
    pattern: /[+\-*/%=<>!&|^~?]+|\.{3}/,
  },

  // Punctuation
  { type: 'punctuation', pattern: /[{}[\]();,.<>]/ },

  // Variables/identifiers
  { type: 'variable', pattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/ },
];

const tokenize = createTokenizer(patterns);

/**
 * Tokenize TypeScript code
 */
export function tokenizeTypeScript(content: string): Token[] {
  return tokenize(content);
}

export default tokenizeTypeScript;
