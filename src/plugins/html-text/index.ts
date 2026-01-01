/**
 * HTML text diff plugin
 * Simple text-based HTML diffing with optional tag stripping
 */

import type { DiffPlugin, HTMLTextPluginOptions } from '../types.js';

export { };

/**
 * HTML entities map
 */
const htmlEntities: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#039;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&mdash;': '—',
  '&ndash;': '–',
  '&hellip;': '…',
  '&lsquo;': '\u2018',
  '&rsquo;': '\u2019',
  '&ldquo;': '\u201C',
  '&rdquo;': '\u201D',
  '&bull;': '•',
  '&middot;': '·',
  '&deg;': '°',
  '&plusmn;': '±',
  '&times;': '×',
  '&divide;': '÷',
  '&frac12;': '½',
  '&frac14;': '¼',
  '&frac34;': '¾',
};

/**
 * Create HTML text plugin
 */
export function htmlTextPlugin(options: HTMLTextPluginOptions = {}): DiffPlugin {
  const { stripTags = false, decodeEntities = true } = options;

  return {
    name: 'html-text',
    version: '1.0.0',

    onBeforeDiff(content: string): string {
      let result = content;

      if (stripTags) {
        result = stripHtmlTags(result);
      }

      if (decodeEntities) {
        result = decodeHtmlEntities(result);
      }

      return result;
    },
  };
}

/**
 * Strip HTML tags from content
 */
export function stripHtmlTags(html: string): string {
  // Remove script and style content
  let result = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  result = result.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  // Remove comments
  result = result.replace(/<!--[\s\S]*?-->/g, '');

  // Remove all tags
  result = result.replace(/<[^>]+>/g, '');

  // Normalize whitespace
  result = result.replace(/\s+/g, ' ').trim();

  return result;
}

/**
 * Decode HTML entities
 */
export function decodeHtmlEntities(html: string): string {
  let result = html;

  // Replace named entities
  for (const [entity, char] of Object.entries(htmlEntities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }

  // Replace numeric entities
  result = result.replace(/&#(\d+);/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 10));
  });

  // Replace hex entities
  result = result.replace(/&#x([a-fA-F0-9]+);/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 16));
  });

  return result;
}

/**
 * Encode special characters as HTML entities
 */
export function encodeHtmlEntities(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Extract text content from HTML
 */
export function extractTextContent(html: string): string {
  const stripped = stripHtmlTags(html);
  return decodeHtmlEntities(stripped);
}

/**
 * Check if string contains HTML
 */
export function containsHtml(text: string): boolean {
  return /<[a-zA-Z][^>]*>/.test(text);
}

/**
 * Get visible text from HTML preserving some structure
 */
export function getVisibleText(html: string): string {
  let result = html;

  // Add line breaks for block elements
  result = result.replace(/<\/(p|div|h[1-6]|li|tr|br)[^>]*>/gi, '\n');
  result = result.replace(/<br\s*\/?>/gi, '\n');

  // Add spaces for inline elements
  result = result.replace(/<\/(span|a|em|strong|b|i)[^>]*>/gi, ' ');

  // Strip remaining tags
  result = stripHtmlTags(result);

  // Decode entities
  result = decodeHtmlEntities(result);

  // Clean up whitespace
  result = result.replace(/[ \t]+/g, ' ');
  result = result.replace(/\n\s*\n/g, '\n\n');
  result = result.trim();

  return result;
}

export default htmlTextPlugin;
