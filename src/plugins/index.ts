/**
 * Plugin exports for DiffKit
 */

export * from './types.js';
export * from './registry.js';

// Syntax plugin
export { syntaxPlugin, defaultSyntaxPlugin } from './syntax/index.js';
export {
  getTokenizer,
  detectLanguage,
  isLanguageSupported,
  listLanguages,
} from './syntax/languages/index.js';

// HTML DOM plugin
export { htmlDomPlugin, parseHTML, serializeHTML, diffDOM } from './html-dom/index.js';

// HTML text plugin
export {
  htmlTextPlugin,
  stripHtmlTags,
  decodeHtmlEntities,
  encodeHtmlEntities,
  extractTextContent,
  containsHtml,
  getVisibleText,
} from './html-text/index.js';

// Markdown plugin
export {
  markdownPlugin,
  parseMarkdown,
  serializeMarkdown,
  getPlainText,
} from './markdown/index.js';
