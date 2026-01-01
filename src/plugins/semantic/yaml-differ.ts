/**
 * YAML Semantic Differ
 *
 * Provides semantic diffing for YAML content.
 * Note: This is a simple YAML parser for common cases.
 * For complex YAML, consider using a full parser library.
 */

import {
  diffJson,
  type JsonDiffResult,
  type JsonDiffOptions,
  type JsonChange,
} from './json-differ.js';

/**
 * Options for YAML differ
 */
export interface YamlDiffOptions extends JsonDiffOptions {
  /** Preserve comments in output (not in diff) */
  preserveComments?: boolean;
}

/**
 * Parse a YAML string to a JavaScript object
 * This is a simplified parser for common YAML patterns
 */
export function parseYaml(yaml: string): unknown {
  const lines = yaml.split('\n');
  return parseYamlLines(lines, 0, 0).value;
}

interface ParseResult {
  value: unknown;
  endIndex: number;
}

/**
 * Get the indentation level of a line
 */
function getIndent(line: string): number {
  const match = line.match(/^(\s*)/);
  return match ? match[1]!.length : 0;
}

/**
 * Check if a line is empty or a comment
 */
function isEmptyOrComment(line: string): boolean {
  const trimmed = line.trim();
  return trimmed === '' || trimmed.startsWith('#');
}

/**
 * Parse a YAML value
 */
function parseValue(value: string): unknown {
  const trimmed = value.trim();

  // Empty or null
  if (trimmed === '' || trimmed === '~' || trimmed === 'null' || trimmed === 'Null' || trimmed === 'NULL') {
    return null;
  }

  // Boolean
  if (trimmed === 'true' || trimmed === 'True' || trimmed === 'TRUE' || trimmed === 'yes' || trimmed === 'Yes' || trimmed === 'YES') {
    return true;
  }
  if (trimmed === 'false' || trimmed === 'False' || trimmed === 'FALSE' || trimmed === 'no' || trimmed === 'No' || trimmed === 'NO') {
    return false;
  }

  // Number
  if (/^-?\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  if (/^-?\d+\.\d+$/.test(trimmed)) {
    return parseFloat(trimmed);
  }
  if (/^-?\d+\.?\d*e[+-]?\d+$/i.test(trimmed)) {
    return parseFloat(trimmed);
  }

  // Quoted string
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  // Inline array
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1);
    if (inner.trim() === '') return [];
    return inner.split(',').map(v => parseValue(v.trim()));
  }

  // Inline object
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    const inner = trimmed.slice(1, -1);
    if (inner.trim() === '') return {};
    const obj: Record<string, unknown> = {};
    const pairs = inner.split(',');
    for (const pair of pairs) {
      const colonIdx = pair.indexOf(':');
      if (colonIdx > 0) {
        const key = pair.slice(0, colonIdx).trim();
        const val = pair.slice(colonIdx + 1).trim();
        obj[key] = parseValue(val);
      }
    }
    return obj;
  }

  // Plain string
  return trimmed;
}

/**
 * Parse YAML lines starting from a given index
 */
function parseYamlLines(
  lines: string[],
  startIndex: number,
  _baseIndent: number
): ParseResult {
  // Skip empty lines and comments at the start
  let i = startIndex;
  while (i < lines.length && isEmptyOrComment(lines[i]!)) {
    i++;
  }

  if (i >= lines.length) {
    return { value: null, endIndex: i };
  }

  const firstLine = lines[i]!;
  const firstIndent = getIndent(firstLine);

  // Check if this is an array item
  const trimmed = firstLine.trim();
  if (trimmed.startsWith('- ')) {
    return parseYamlArray(lines, i, firstIndent);
  }

  // Check if this is an object
  if (trimmed.includes(':')) {
    return parseYamlObject(lines, i, firstIndent);
  }

  // Single value
  return { value: parseValue(trimmed), endIndex: i + 1 };
}

/**
 * Parse a YAML array
 */
function parseYamlArray(
  lines: string[],
  startIndex: number,
  baseIndent: number
): ParseResult {
  const result: unknown[] = [];
  let i = startIndex;

  while (i < lines.length) {
    // Skip empty lines and comments
    while (i < lines.length && isEmptyOrComment(lines[i]!)) {
      i++;
    }

    if (i >= lines.length) break;

    const line = lines[i]!;
    const indent = getIndent(line);

    // Check if we're still in the array
    if (indent < baseIndent) break;
    if (indent > baseIndent) break; // Nested content handled below

    const trimmed = line.trim();

    if (!trimmed.startsWith('- ')) {
      // Not an array item, we're done
      break;
    }

    // Get the content after "- "
    const content = trimmed.slice(2);

    if (content === '') {
      // Empty item or nested content on next line
      const nextNonEmpty = findNextNonEmpty(lines, i + 1);
      if (nextNonEmpty < lines.length) {
        const nextIndent = getIndent(lines[nextNonEmpty]!);
        if (nextIndent > baseIndent) {
          const nested = parseYamlLines(lines, i + 1, nextIndent);
          result.push(nested.value);
          i = nested.endIndex;
          continue;
        }
      }
      result.push(null);
      i++;
    } else if (content.includes(':')) {
      // Inline object or key-value on same line
      // Create a temp array with this content and parse as object
      const tempLines = [' '.repeat(baseIndent + 2) + content];
      // Collect any nested lines
      let j = i + 1;
      while (j < lines.length) {
        if (isEmptyOrComment(lines[j]!)) {
          j++;
          continue;
        }
        const nextIndent = getIndent(lines[j]!);
        if (nextIndent <= baseIndent) break;
        tempLines.push(lines[j]!);
        j++;
      }
      const parsed = parseYamlLines(tempLines, 0, baseIndent + 2);
      result.push(parsed.value);
      i = j;
    } else {
      // Simple value
      result.push(parseValue(content));
      i++;
    }
  }

  return { value: result, endIndex: i };
}

/**
 * Parse a YAML object
 */
function parseYamlObject(
  lines: string[],
  startIndex: number,
  baseIndent: number
): ParseResult {
  const result: Record<string, unknown> = {};
  let i = startIndex;

  while (i < lines.length) {
    // Skip empty lines and comments
    while (i < lines.length && isEmptyOrComment(lines[i]!)) {
      i++;
    }

    if (i >= lines.length) break;

    const line = lines[i]!;
    const indent = getIndent(line);

    // Check if we're still in the object
    if (indent < baseIndent) break;
    if (indent > baseIndent) {
      i++;
      continue;
    }

    const trimmed = line.trim();
    const colonIdx = trimmed.indexOf(':');

    if (colonIdx <= 0) {
      // Not a key-value pair
      break;
    }

    const key = trimmed.slice(0, colonIdx).trim();
    const afterColon = trimmed.slice(colonIdx + 1).trim();

    if (afterColon === '') {
      // Value on next line(s)
      const nextNonEmpty = findNextNonEmpty(lines, i + 1);
      if (nextNonEmpty < lines.length) {
        const nextIndent = getIndent(lines[nextNonEmpty]!);
        if (nextIndent > indent) {
          const nested = parseYamlLines(lines, nextNonEmpty, nextIndent);
          result[key] = nested.value;
          i = nested.endIndex;
          continue;
        }
      }
      result[key] = null;
      i++;
    } else {
      // Value on same line
      result[key] = parseValue(afterColon);
      i++;
    }
  }

  return { value: result, endIndex: i };
}

/**
 * Find the next non-empty line index
 */
function findNextNonEmpty(lines: string[], startIndex: number): number {
  for (let i = startIndex; i < lines.length; i++) {
    if (!isEmptyOrComment(lines[i]!)) {
      return i;
    }
  }
  return lines.length;
}

/**
 * Perform semantic diff on two YAML strings
 */
export function diffYaml(
  oldYaml: string,
  newYaml: string,
  options: YamlDiffOptions = {}
): JsonDiffResult {
  const oldValue = parseYaml(oldYaml);
  const newValue = parseYaml(newYaml);
  return diffJson(oldValue, newValue, options);
}

/**
 * Format YAML changes as human-readable text
 */
export function formatYamlChanges(result: JsonDiffResult): string {
  if (result.isEqual) {
    return 'No changes detected';
  }

  const lines: string[] = [];

  for (const change of result.changes) {
    switch (change.type) {
      case 'add':
        lines.push(`+ ${change.path}: ${formatYamlValue(change.newValue)}`);
        break;
      case 'delete':
        lines.push(`- ${change.path}: ${formatYamlValue(change.oldValue)}`);
        break;
      case 'modify':
        lines.push(
          `~ ${change.path}: ${formatYamlValue(change.oldValue)} → ${formatYamlValue(change.newValue)}`
        );
        break;
      case 'type-change':
        lines.push(
          `! ${change.path}: type changed from ${change.oldType} to ${change.newType}`
        );
        break;
      case 'move':
        lines.push(`↔ ${change.path}: moved from index ${change.oldValue} to ${change.newValue}`);
        break;
    }
  }

  return lines.join('\n');
}

/**
 * Format a value for YAML display
 */
function formatYamlValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return '~';
  if (typeof value === 'string') {
    // Quote if needed
    if (value.includes('\n') || value.includes(':') || value.includes('#')) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  // For objects and arrays, use compact JSON-like format
  return JSON.stringify(value);
}

// Re-export types from JSON differ
export type { JsonDiffResult, JsonChange, JsonDiffOptions };

export default diffYaml;
