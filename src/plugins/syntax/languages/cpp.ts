/**
 * C/C++ tokenizer
 */

import type { Token } from '../../types.js';
import { createTokenizer, type TokenPattern } from '../tokenizer.js';

const patterns: TokenPattern[] = [
  // Comments
  { type: 'comment', pattern: /\/\/.*$/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },

  // Preprocessor
  { type: 'preprocessor', pattern: /#\s*(?:include|define|undef|ifdef|ifndef|if|elif|else|endif|error|pragma|warning|line)\b.*$/ },

  // Strings
  { type: 'string', pattern: /"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /L"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /u8?"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /U"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /R"[^(]*\([\s\S]*?\)[^"]*"/ },

  // Characters
  { type: 'string', pattern: /'(?:[^'\\]|\\.)'/ },
  { type: 'string', pattern: /L'(?:[^'\\]|\\.)'/ },

  // Numbers
  { type: 'number', pattern: /\b0x[a-fA-F0-9']+(?:u|ul|ull|l|ll|lu|llu)?/i },
  { type: 'number', pattern: /\b0b[01']+(?:u|ul|ull|l|ll|lu|llu)?/i },
  { type: 'number', pattern: /\b0[0-7']+(?:u|ul|ull|l|ll|lu|llu)?/i },
  { type: 'number', pattern: /\b\d[\d']*\.[\d']*(?:e[+-]?\d+)?[fFlL]?\b/i },
  { type: 'number', pattern: /\b\d[\d']*(?:u|ul|ull|l|ll|lu|llu|f|l)?/i },

  // Keywords
  {
    type: 'keyword',
    pattern:
      /\b(?:alignas|alignof|and|and_eq|asm|auto|bitand|bitor|break|case|catch|class|compl|concept|const|consteval|constexpr|constinit|const_cast|continue|co_await|co_return|co_yield|decltype|default|delete|do|dynamic_cast|else|enum|explicit|export|extern|final|for|friend|goto|if|inline|mutable|namespace|new|noexcept|not|not_eq|nullptr|operator|or|or_eq|override|private|protected|public|register|reinterpret_cast|requires|return|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|union|using|virtual|volatile|while|xor|xor_eq)\b/,
  },

  // Primitive types
  {
    type: 'type',
    pattern:
      /\b(?:bool|char|char8_t|char16_t|char32_t|double|float|int|long|short|signed|unsigned|void|wchar_t|size_t|ptrdiff_t|int8_t|int16_t|int32_t|int64_t|uint8_t|uint16_t|uint32_t|uint64_t)\b/,
  },

  // Built-in values
  { type: 'keyword', pattern: /\b(?:true|false|nullptr|NULL)\b/ },

  // STL common types
  {
    type: 'className',
    pattern: /\b(?:string|wstring|vector|list|map|set|unordered_map|unordered_set|array|deque|queue|stack|pair|tuple|optional|variant|any|shared_ptr|unique_ptr|weak_ptr)\b/,
  },

  // Type names (capitalized or with _t suffix)
  { type: 'className', pattern: /\b[A-Z][a-zA-Z0-9_]*\b/ },
  { type: 'type', pattern: /\b[a-z][a-zA-Z0-9]*_t\b/ },

  // Function calls
  { type: 'function', pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/ },

  // Operators
  { type: 'operator', pattern: /[+\-*/%=<>!&|^~?:]+|->|\.\*|::|<=>/ },

  // Punctuation
  { type: 'punctuation', pattern: /[{}[\]();,.<>]/ },

  // Variables/identifiers
  { type: 'variable', pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
];

const tokenize = createTokenizer(patterns);

/**
 * Tokenize C/C++ code
 */
export function tokenizeCpp(content: string): Token[] {
  return tokenize(content);
}

export default tokenizeCpp;
