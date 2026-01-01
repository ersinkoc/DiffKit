/**
 * Java tokenizer
 */

import type { Token } from '../../types.js';
import { createTokenizer, type TokenPattern } from '../tokenizer.js';

const patterns: TokenPattern[] = [
  // Comments
  { type: 'comment', pattern: /\/\/.*$/ },
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },

  // Strings
  { type: 'string', pattern: /"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /'(?:[^'\\]|\\.)'/ },
  { type: 'string', pattern: /"""[\s\S]*?"""/ },

  // Annotations
  { type: 'annotation', pattern: /@[A-Za-z_][A-Za-z0-9_]*/ },

  // Numbers
  { type: 'number', pattern: /\b0x[a-fA-F0-9_]+[lLfFdD]?\b/ },
  { type: 'number', pattern: /\b0b[01_]+[lL]?\b/ },
  { type: 'number', pattern: /\b0[0-7_]+[lL]?\b/ },
  { type: 'number', pattern: /\b\d[\d_]*\.[\d_]*(?:e[+-]?\d+)?[fFdD]?\b/i },
  { type: 'number', pattern: /\b\d[\d_]*[lLfFdD]?\b/ },

  // Keywords
  {
    type: 'keyword',
    pattern:
      /\b(?:abstract|assert|break|case|catch|class|const|continue|default|do|else|enum|exports|extends|final|finally|for|goto|if|implements|import|instanceof|interface|module|native|new|open|opens|package|private|protected|provides|public|requires|return|static|strictfp|super|switch|synchronized|this|throw|throws|to|transient|transitive|try|uses|var|void|volatile|while|with|yield)\b/,
  },

  // Primitive types
  {
    type: 'type',
    pattern: /\b(?:boolean|byte|char|double|float|int|long|short)\b/,
  },

  // Built-in values
  { type: 'keyword', pattern: /\b(?:true|false|null)\b/ },

  // Common classes
  {
    type: 'className',
    pattern: /\b(?:String|Object|Integer|Long|Double|Float|Boolean|Character|Byte|Short|Class|System|Exception|Error|Thread|Runnable|List|Map|Set|Collection|ArrayList|HashMap|HashSet)\b/,
  },

  // Type names (capitalized)
  { type: 'className', pattern: /\b[A-Z][a-zA-Z0-9_]*\b/ },

  // Function calls
  { type: 'function', pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/ },

  // Operators
  { type: 'operator', pattern: /[+\-*/%=<>!&|^~?:]+|->|::/ },

  // Punctuation
  { type: 'punctuation', pattern: /[{}[\]();,.<>]/ },

  // Variables/identifiers
  { type: 'variable', pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*\b/ },
];

const tokenize = createTokenizer(patterns);

/**
 * Tokenize Java code
 */
export function tokenizeJava(content: string): Token[] {
  return tokenize(content);
}

export default tokenizeJava;
