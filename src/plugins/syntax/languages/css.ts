/**
 * CSS tokenizer
 */

import type { Token } from '../../types.js';
import { createTokenizer, type TokenPattern } from '../tokenizer.js';

const patterns: TokenPattern[] = [
  // Comments
  { type: 'comment', pattern: /\/\*[\s\S]*?\*\// },

  // Strings
  { type: 'string', pattern: /"(?:[^"\\]|\\.)*"/ },
  { type: 'string', pattern: /'(?:[^'\\]|\\.)*'/ },

  // URLs
  { type: 'string', pattern: /url\([^)]*\)/ },

  // At-rules
  {
    type: 'keyword',
    pattern:
      /@(?:charset|import|namespace|media|supports|document|page|font-face|keyframes|viewport|counter-style|font-feature-values|property|layer)\b/,
  },

  // Important
  { type: 'keyword', pattern: /!important\b/ },

  // Colors (hex)
  { type: 'number', pattern: /#[a-fA-F0-9]{3,8}\b/ },

  // Numbers with units
  {
    type: 'number',
    pattern: /\b\d+\.?\d*(?:px|em|rem|vh|vw|vmin|vmax|ch|ex|%|deg|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?\b/,
  },

  // Functions
  {
    type: 'function',
    pattern:
      /\b(?:calc|var|rgb|rgba|hsl|hsla|url|linear-gradient|radial-gradient|conic-gradient|repeat|minmax|clamp|min|max|attr|counter|counters|env|translate|rotate|scale|skew|matrix|perspective)\b/,
  },

  // Pseudo-classes
  {
    type: 'keyword',
    pattern:
      /:(?:hover|active|focus|focus-within|focus-visible|visited|link|first-child|last-child|nth-child|nth-last-child|first-of-type|last-of-type|only-child|only-of-type|empty|not|has|is|where|root|target|enabled|disabled|checked|indeterminate|valid|invalid|required|optional|read-only|read-write|placeholder-shown|default|lang|dir)\b/,
  },

  // Pseudo-elements
  { type: 'keyword', pattern: /::(?:before|after|first-line|first-letter|selection|placeholder|marker|backdrop)\b/ },

  // Properties
  { type: 'property', pattern: /\b[a-z-]+(?=\s*:)/ },

  // Selectors (class, id)
  { type: 'className', pattern: /\.[a-zA-Z_-][a-zA-Z0-9_-]*/ },
  { type: 'variable', pattern: /#[a-zA-Z_-][a-zA-Z0-9_-]*/ },

  // Element selectors
  { type: 'tag', pattern: /\b(?:html|body|div|span|a|p|h[1-6]|ul|ol|li|table|tr|td|th|form|input|button|label|img|video|audio|canvas|svg|section|article|header|footer|nav|main|aside)\b/ },

  // Operators
  { type: 'operator', pattern: /[>+~*]/ },

  // Punctuation
  { type: 'punctuation', pattern: /[{}[\]();:,.]/ },

  // Values
  { type: 'variable', pattern: /\b[a-zA-Z-]+\b/ },
];

const tokenize = createTokenizer(patterns);

/**
 * Tokenize CSS code
 */
export function tokenizeCSS(content: string): Token[] {
  return tokenize(content);
}

export default tokenizeCSS;
