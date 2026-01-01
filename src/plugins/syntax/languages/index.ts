/**
 * Language tokenizers index
 */

import type { Token } from '../../types.js';
import { tokenizeJavaScript } from './javascript.js';
import { tokenizeTypeScript } from './typescript.js';
import { tokenizePython } from './python.js';
import { tokenizeCSS } from './css.js';
import { tokenizeHTML } from './html.js';
import { tokenizeJSON } from './json.js';
import { tokenizeMarkdown } from './markdown.js';
import { simpleTokenize } from '../tokenizer.js';

export {
  tokenizeJavaScript,
  tokenizeTypeScript,
  tokenizePython,
  tokenizeCSS,
  tokenizeHTML,
  tokenizeJSON,
  tokenizeMarkdown,
};

/**
 * Language tokenizer registry
 */
type Tokenizer = (content: string) => Token[];

const languageTokenizers: Record<string, Tokenizer> = {
  javascript: tokenizeJavaScript,
  js: tokenizeJavaScript,
  jsx: tokenizeJavaScript,
  typescript: tokenizeTypeScript,
  ts: tokenizeTypeScript,
  tsx: tokenizeTypeScript,
  python: tokenizePython,
  py: tokenizePython,
  css: tokenizeCSS,
  scss: tokenizeCSS,
  sass: tokenizeCSS,
  less: tokenizeCSS,
  html: tokenizeHTML,
  htm: tokenizeHTML,
  xml: tokenizeHTML,
  svg: tokenizeHTML,
  json: tokenizeJSON,
  jsonc: tokenizeJSON,
  markdown: tokenizeMarkdown,
  md: tokenizeMarkdown,
};

/**
 * Get tokenizer for a language
 */
export function getTokenizer(language: string): Tokenizer {
  const normalized = language.toLowerCase();
  return languageTokenizers[normalized] ?? simpleTokenize;
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(language: string): boolean {
  return language.toLowerCase() in languageTokenizers;
}

/**
 * List all supported languages
 */
export function listLanguages(): string[] {
  return Object.keys(languageTokenizers);
}

/**
 * Detect language from file extension
 */
export function detectLanguage(filename: string): string | undefined {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return undefined;

  const extensionMap: Record<string, string> = {
    js: 'javascript',
    mjs: 'javascript',
    cjs: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    mts: 'typescript',
    cts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    pyw: 'python',
    css: 'css',
    scss: 'css',
    sass: 'css',
    less: 'css',
    html: 'html',
    htm: 'html',
    xhtml: 'html',
    xml: 'html',
    svg: 'html',
    json: 'json',
    jsonc: 'json',
    md: 'markdown',
    markdown: 'markdown',
  };

  return extensionMap[ext];
}
