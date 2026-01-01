/**
 * Rust tokenizer
 */

import type { Token } from '../../types.js';
import { createTokenizer, type TokenPattern } from '../tokenizer.js';

const patterns: TokenPattern[] = [
  // Comments
  { type: 'comment', pattern: /\/\/.*$/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },

  // Strings
  { type: 'string', pattern: /"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /r#*"[^"]*"#*/ },
  { type: 'string', pattern: /'(?:[^'\\]|\\.)'/ },
  { type: 'string', pattern: /b"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /b'(?:[^'\\]|\\.)'/ },

  // Lifetimes
  { type: 'lifetime', pattern: /'[a-zA-Z_][a-zA-Z0-9_]*/ },

  // Numbers
  { type: 'number', pattern: /\b0x[a-fA-F0-9_]+(?:u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize)?\b/ },
  { type: 'number', pattern: /\b0o[0-7_]+(?:u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize)?\b/ },
  { type: 'number', pattern: /\b0b[01_]+(?:u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize)?\b/ },
  { type: 'number', pattern: /\b\d[\d_]*\.[\d_]*(?:e[+-]?[\d_]+)?(?:f32|f64)?\b/i },
  { type: 'number', pattern: /\b\d[\d_]*(?:u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize|f32|f64)?\b/ },

  // Keywords
  {
    type: 'keyword',
    pattern:
      /\b(?:as|async|await|break|const|continue|crate|dyn|else|enum|extern|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|type|unsafe|use|where|while)\b/,
  },

  // Built-in types
  {
    type: 'type',
    pattern:
      /\b(?:bool|char|str|u8|u16|u32|u64|u128|usize|i8|i16|i32|i64|i128|isize|f32|f64|String|Vec|Box|Option|Result|Some|None|Ok|Err)\b/,
  },

  // Built-in macros
  {
    type: 'macro',
    pattern: /\b(?:println|print|format|panic|assert|assert_eq|assert_ne|debug_assert|vec|todo|unimplemented|unreachable)!/,
  },

  // Built-in values
  { type: 'keyword', pattern: /\b(?:true|false)\b/ },

  // Attributes
  { type: 'attribute', pattern: /#!?\[[\s\S]*?\]/ },

  // Type names (capitalized)
  { type: 'className', pattern: /\b[A-Z][a-zA-Z0-9_]*\b/ },

  // Function/macro calls
  { type: 'function', pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*[!(])/ },

  // Operators
  { type: 'operator', pattern: /[+\-*/%=<>!&|^~?:]+|\.{2,3}|->|=>/ },

  // Punctuation
  { type: 'punctuation', pattern: /[{}[\]();,.:@#]/ },

  // Variables/identifiers
  { type: 'variable', pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
];

const tokenize = createTokenizer(patterns);

/**
 * Tokenize Rust code
 */
export function tokenizeRust(content: string): Token[] {
  return tokenize(content);
}

export default tokenizeRust;
