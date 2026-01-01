/**
 * Python tokenizer
 */

import type { Token } from '../../types.js';
import { createTokenizer, type TokenPattern } from '../tokenizer.js';

const patterns: TokenPattern[] = [
  // Comments
  { type: 'comment', pattern: /#.*$/ },

  // Docstrings (triple quotes)
  { type: 'string', pattern: /"""[\s\S]*?"""/ },
  { type: 'string', pattern: /'''[\s\S]*?'''/ },

  // Strings
  { type: 'string', pattern: /f"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /f'(?:[^'\\]|\\.)*'/ },
  { type: 'string', pattern: /r"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /r'(?:[^'\\]|\\.)*'/ },
  { type: 'string', pattern: /b"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /b'(?:[^'\\]|\\.)*'/ },
  { type: 'string', pattern: /"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /'(?:[^'\\]|\\.)*'/ },

  // Numbers
  { type: 'number', pattern: /\b0x[a-fA-F0-9]+\b/ },
  { type: 'number', pattern: /\b0b[01]+\b/ },
  { type: 'number', pattern: /\b0o[0-7]+\b/ },
  { type: 'number', pattern: /\b\d+\.?\d*(?:e[+-]?\d+)?j?\b/i },

  // Keywords
  {
    type: 'keyword',
    pattern:
      /\b(?:and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield)\b/,
  },

  // Built-in values
  { type: 'keyword', pattern: /\b(?:True|False|None)\b/ },

  // Built-in functions
  {
    type: 'function',
    pattern:
      /\b(?:abs|all|any|ascii|bin|bool|breakpoint|bytearray|bytes|callable|chr|classmethod|compile|complex|delattr|dict|dir|divmod|enumerate|eval|exec|filter|float|format|frozenset|getattr|globals|hasattr|hash|help|hex|id|input|int|isinstance|issubclass|iter|len|list|locals|map|max|memoryview|min|next|object|oct|open|ord|pow|print|property|range|repr|reversed|round|set|setattr|slice|sorted|staticmethod|str|sum|super|tuple|type|vars|zip)\b/,
  },

  // Decorators
  { type: 'function', pattern: /@[a-zA-Z_][a-zA-Z0-9_]*/ },

  // Class names (capitalized identifiers)
  { type: 'className', pattern: /\b[A-Z][a-zA-Z0-9_]*\b/ },

  // Function definitions
  { type: 'function', pattern: /(?<=def\s+)[a-zA-Z_][a-zA-Z0-9_]*/ },

  // Function calls
  { type: 'function', pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/ },

  // Properties/attributes
  { type: 'property', pattern: /(?<=\.)[a-zA-Z_][a-zA-Z0-9_]*/ },

  // Operators
  {
    type: 'operator',
    pattern: /[+\-*/%=<>!&|^~@:]+|\/\/|\*\*/,
  },

  // Punctuation
  { type: 'punctuation', pattern: /[{}[\]();,.]/ },

  // Variables/identifiers
  { type: 'variable', pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
];

const tokenize = createTokenizer(patterns);

/**
 * Tokenize Python code
 */
export function tokenizePython(content: string): Token[] {
  return tokenize(content);
}

export default tokenizePython;
