/**
 * Plugin type definitions for DiffKit
 */

import type { DiffPlugin, Token, ParsedContent } from '../core/types.js';

export type { DiffPlugin, Token, ParsedContent };

/**
 * Syntax plugin options
 */
export interface SyntaxPluginOptions {
  language?: string | 'auto';
  theme?: string;
}

/**
 * HTML DOM plugin options
 */
export interface HTMLDOMPluginOptions {
  ignoreAttributes?: string[];
  ignoreComments?: boolean;
  preserveWhitespace?: boolean;
}

/**
 * HTML text plugin options
 */
export interface HTMLTextPluginOptions {
  stripTags?: boolean;
  decodeEntities?: boolean;
}

/**
 * Markdown plugin options
 */
export interface MarkdownPluginOptions {
  preserveStructure?: boolean;
  ignoreFormatting?: boolean;
}

/**
 * Language tokenizer interface
 */
export interface LanguageTokenizer {
  name: string;
  extensions: string[];
  tokenize(content: string): Token[];
}

/**
 * DOM node representation for HTML diffing
 */
export interface DOMNode {
  type: 'element' | 'text' | 'comment';
  tagName?: string;
  attributes?: Record<string, string>;
  children?: DOMNode[];
  content?: string;
}

/**
 * DOM diff result
 */
export interface DOMDiffResult {
  type: 'add' | 'delete' | 'modify' | 'equal';
  node: DOMNode;
  changes?: {
    type: 'attribute' | 'text' | 'children';
    oldValue?: string;
    newValue?: string;
  }[];
}

/**
 * Markdown block representation
 */
export interface MarkdownBlock {
  type:
    | 'heading'
    | 'paragraph'
    | 'code'
    | 'blockquote'
    | 'list'
    | 'listItem'
    | 'hr'
    | 'table'
    | 'html';
  level?: number;
  content: string;
  children?: MarkdownBlock[];
  language?: string;
  ordered?: boolean;
}

/**
 * Plugin factory function type
 */
export type PluginFactory<T> = (options?: T) => DiffPlugin;
