/**
 * String escaping utilities
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
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

/**
 * Escape special characters for use in regular expressions
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Escape string for use in JSON
 */
export function escapeJson(str: string): string {
  return JSON.stringify(str).slice(1, -1);
}

/**
 * Escape string for use in CSS content
 */
export function escapeCss(str: string): string {
  return str.replace(/[\\"']/g, '\\$&');
}

/**
 * Escape string for shell command
 */
export function escapeShell(str: string): string {
  return `'${str.replace(/'/g, "'\\''")}'`;
}

/**
 * Convert special characters to their escaped form for display
 */
export function escapeForDisplay(str: string): string {
  return str
    .replace(/\t/g, '→')
    .replace(/\r/g, '↵')
    .replace(/\n/g, '↲')
    .replace(/ /g, '·');
}

/**
 * Strip ANSI escape codes from a string
 */
export function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\u001B\[[0-9;]*m/g, '');
}
