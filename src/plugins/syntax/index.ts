/**
 * Syntax highlighting plugin for DiffKit
 */

import type { DiffPlugin, Token, SyntaxPluginOptions } from '../types.js';
import { getTokenizer, detectLanguage, isLanguageSupported, listLanguages } from './languages/index.js';

export { getTokenizer, detectLanguage, isLanguageSupported, listLanguages };
export * from './tokenizer.js';

/**
 * Create a syntax highlighting plugin
 */
export function syntaxPlugin(options: SyntaxPluginOptions = {}): DiffPlugin {
  const { language = 'auto' } = options;

  let detectedLanguage: string | undefined;
  let tokenizer: ((content: string) => Token[]) | undefined;

  return {
    name: 'syntax',
    version: '1.0.0',

    onInit() {
      if (language !== 'auto' && language) {
        tokenizer = getTokenizer(language);
        detectedLanguage = language;
      }
    },

    tokenize(content: string, lang?: string): Token[] {
      const targetLang = lang ?? detectedLanguage ?? 'auto';

      if (targetLang === 'auto') {
        // Try to detect from content
        const detected = detectFromContent(content);
        if (detected) {
          return getTokenizer(detected)(content);
        }
        // Fall back to simple tokenization
        return getTokenizer('text')(content);
      }

      if (tokenizer && targetLang === detectedLanguage) {
        return tokenizer(content);
      }

      return getTokenizer(targetLang)(content);
    },
  };
}

/**
 * Attempt to detect language from content
 */
function detectFromContent(content: string): string | undefined {
  const firstLine = content.split('\n')[0] ?? '';

  // Shebang detection
  if (firstLine.startsWith('#!')) {
    if (firstLine.includes('python')) return 'python';
    if (firstLine.includes('node')) return 'javascript';
    if (firstLine.includes('bash') || firstLine.includes('sh')) return 'bash';
  }

  // Check for common patterns
  if (content.includes('<!DOCTYPE html') || content.includes('<html')) {
    return 'html';
  }

  if (content.startsWith('{') && content.includes('"')) {
    try {
      JSON.parse(content);
      return 'json';
    } catch {
      // Not valid JSON
    }
  }

  if (content.includes('import ') && content.includes(' from ')) {
    if (content.includes(': ') || content.includes('interface ') || content.includes('type ')) {
      return 'typescript';
    }
    return 'javascript';
  }

  if (content.includes('def ') && content.includes(':')) {
    return 'python';
  }

  if (content.includes('# ') || content.includes('## ') || content.includes('```')) {
    return 'markdown';
  }

  return undefined;
}

/**
 * Default syntax plugin instance
 */
export const defaultSyntaxPlugin = syntaxPlugin();

export default syntaxPlugin;
