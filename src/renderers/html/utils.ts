/**
 * HTML utilities for renderers
 */

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

/**
 * Create HTML element string
 */
export function createElement(
  tag: string,
  attributes: Record<string, string | number | boolean | undefined> = {},
  content: string = ''
): string {
  const attrs = Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== false)
    .map(([key, value]) => {
      if (value === true) {
        return key;
      }
      return `${key}="${escapeHtml(String(value))}"`;
    })
    .join(' ');

  const opening = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;

  // Self-closing tags
  const selfClosing = ['br', 'hr', 'img', 'input', 'meta', 'link'];
  if (selfClosing.includes(tag)) {
    return attrs ? `<${tag} ${attrs} />` : `<${tag} />`;
  }

  return `${opening}${content}</${tag}>`;
}

/**
 * Create a div element
 */
export function div(
  className: string,
  content: string = '',
  attributes: Record<string, string | number | boolean | undefined> = {}
): string {
  return createElement('div', { class: className, ...attributes }, content);
}

/**
 * Create a span element
 */
export function span(
  className: string,
  content: string = '',
  attributes: Record<string, string | number | boolean | undefined> = {}
): string {
  return createElement('span', { class: className, ...attributes }, content);
}

/**
 * Join classes conditionally
 */
export function classNames(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generate inline styles from object
 */
export function inlineStyles(styles: Record<string, string | number | undefined>): string {
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      return `${cssKey}: ${value}`;
    })
    .join('; ');
}

/**
 * Wrap text at specified width
 */
export function wrapText(text: string, width: number): string[] {
  if (text.length <= width) {
    return [text];
  }

  const lines: string[] = [];
  let remaining = text;

  while (remaining.length > width) {
    // Find last space within width
    let breakPoint = remaining.lastIndexOf(' ', width);

    if (breakPoint === -1 || breakPoint === 0) {
      // No space found, break at width
      breakPoint = width;
    }

    lines.push(remaining.slice(0, breakPoint));
    remaining = remaining.slice(breakPoint).trimStart();
  }

  if (remaining) {
    lines.push(remaining);
  }

  return lines;
}

/**
 * Highlight matching text
 */
export function highlightMatch(text: string, match: string, className: string): string {
  if (!match) return escapeHtml(text);

  const escaped = escapeHtml(text);
  const regex = new RegExp(`(${escapeRegExp(match)})`, 'gi');

  return escaped.replace(regex, `<span class="${className}">$1</span>`);
}

/**
 * Escape special regex characters
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Convert tabs to spaces
 */
export function tabsToSpaces(text: string, tabSize: number = 4): string {
  return text.replace(/\t/g, ' '.repeat(tabSize));
}

/**
 * Make whitespace visible
 */
export function showWhitespace(text: string): string {
  return text
    .replace(/ /g, '<span class="diffkit-space">·</span>')
    .replace(/\t/g, '<span class="diffkit-tab">→</span>');
}
