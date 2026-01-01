/**
 * JSON Semantic Differ
 *
 * Provides semantic diffing for JSON content by comparing
 * the structure and values rather than raw text.
 */

/**
 * Represents a semantic change in JSON
 */
export interface JsonChange {
  /** Path to the changed value (e.g., "users[0].name") */
  path: string;
  /** Type of change */
  type: 'add' | 'delete' | 'modify' | 'move' | 'type-change';
  /** Old value (for modify/delete) */
  oldValue?: unknown;
  /** New value (for modify/add) */
  newValue?: unknown;
  /** Old type (for type-change) */
  oldType?: string;
  /** New type (for type-change) */
  newType?: string;
}

/**
 * Result of JSON semantic diff
 */
export interface JsonDiffResult {
  /** List of changes */
  changes: JsonChange[];
  /** Whether the JSON is structurally identical */
  isEqual: boolean;
  /** Statistics about the diff */
  stats: {
    additions: number;
    deletions: number;
    modifications: number;
    typeChanges: number;
    moves: number;
  };
}

/**
 * Options for JSON differ
 */
export interface JsonDiffOptions {
  /** Ignore array ordering (treat arrays as sets) */
  ignoreArrayOrder?: boolean;
  /** Ignore specific paths (glob patterns) */
  ignorePaths?: string[];
  /** Detect moved array elements */
  detectMoves?: boolean;
  /** Maximum depth to compare (-1 for unlimited) */
  maxDepth?: number;
  /** Treat null and undefined as equal */
  nullEqualsUndefined?: boolean;
}

/**
 * Get the type of a value
 */
function getType(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Format a path segment
 */
function formatPathSegment(key: string | number): string {
  if (typeof key === 'number') {
    return `[${key}]`;
  }
  // Use dot notation for simple keys, bracket notation for complex ones
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) {
    return `.${key}`;
  }
  return `["${key}"]`;
}

/**
 * Build a path string
 */
function buildPath(basePath: string, key: string | number): string {
  const segment = formatPathSegment(key);
  if (basePath === '') {
    return segment.startsWith('.') ? segment.slice(1) : segment;
  }
  return basePath + segment;
}

/**
 * Check if a path matches any of the ignore patterns
 */
function shouldIgnorePath(path: string, patterns: string[]): boolean {
  for (const pattern of patterns) {
    // Simple glob matching
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    if (regex.test(path)) {
      return true;
    }
  }
  return false;
}

/**
 * Deep compare two values
 */
function deepEqual(a: unknown, b: unknown, nullEqualsUndefined: boolean): boolean {
  if (a === b) return true;
  if (nullEqualsUndefined && a == null && b == null) return true;

  const typeA = getType(a);
  const typeB = getType(b);

  if (typeA !== typeB) return false;

  if (typeA === 'object' && a !== null && b !== null) {
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(objA[key], objB[key], nullEqualsUndefined)) return false;
    }
    return true;
  }

  if (typeA === 'array') {
    const arrA = a as unknown[];
    const arrB = b as unknown[];

    if (arrA.length !== arrB.length) return false;

    for (let i = 0; i < arrA.length; i++) {
      if (!deepEqual(arrA[i], arrB[i], nullEqualsUndefined)) return false;
    }
    return true;
  }

  return false;
}

/**
 * Find matching element in array (for move detection)
 */
function findMatchingElement(
  element: unknown,
  array: unknown[],
  usedIndices: Set<number>,
  nullEqualsUndefined: boolean
): number {
  for (let i = 0; i < array.length; i++) {
    if (usedIndices.has(i)) continue;
    if (deepEqual(element, array[i], nullEqualsUndefined)) {
      return i;
    }
  }
  return -1;
}

/**
 * Compare two JSON values and return changes
 */
function compareValues(
  oldValue: unknown,
  newValue: unknown,
  path: string,
  options: Required<JsonDiffOptions>,
  depth: number,
  changes: JsonChange[]
): void {
  // Check max depth
  if (options.maxDepth >= 0 && depth > options.maxDepth) {
    if (!deepEqual(oldValue, newValue, options.nullEqualsUndefined)) {
      changes.push({
        path,
        type: 'modify',
        oldValue,
        newValue,
      });
    }
    return;
  }

  // Check if path should be ignored
  if (shouldIgnorePath(path, options.ignorePaths)) {
    return;
  }

  const oldType = getType(oldValue);
  const newType = getType(newValue);

  // Type change
  if (oldType !== newType) {
    // Handle null/undefined equivalence
    if (options.nullEqualsUndefined && oldValue == null && newValue == null) {
      return;
    }
    changes.push({
      path,
      type: 'type-change',
      oldValue,
      newValue,
      oldType,
      newType,
    });
    return;
  }

  // Both are objects
  if (oldType === 'object' && oldValue !== null && newValue !== null) {
    const oldObj = oldValue as Record<string, unknown>;
    const newObj = newValue as Record<string, unknown>;
    const oldKeys = new Set(Object.keys(oldObj));
    const newKeys = new Set(Object.keys(newObj));

    // Check for deleted keys
    for (const key of oldKeys) {
      if (!newKeys.has(key)) {
        const keyPath = buildPath(path, key);
        if (!shouldIgnorePath(keyPath, options.ignorePaths)) {
          changes.push({
            path: keyPath,
            type: 'delete',
            oldValue: oldObj[key],
          });
        }
      }
    }

    // Check for added keys
    for (const key of newKeys) {
      if (!oldKeys.has(key)) {
        const keyPath = buildPath(path, key);
        if (!shouldIgnorePath(keyPath, options.ignorePaths)) {
          changes.push({
            path: keyPath,
            type: 'add',
            newValue: newObj[key],
          });
        }
      }
    }

    // Compare common keys
    for (const key of oldKeys) {
      if (newKeys.has(key)) {
        compareValues(
          oldObj[key],
          newObj[key],
          buildPath(path, key),
          options,
          depth + 1,
          changes
        );
      }
    }
    return;
  }

  // Both are arrays
  if (oldType === 'array') {
    const oldArr = oldValue as unknown[];
    const newArr = newValue as unknown[];

    if (options.ignoreArrayOrder) {
      // Treat as sets - find additions and deletions
      const usedOldIndices = new Set<number>();
      const usedNewIndices = new Set<number>();

      // Find matches
      for (let i = 0; i < oldArr.length; i++) {
        const matchIdx = findMatchingElement(
          oldArr[i],
          newArr,
          usedNewIndices,
          options.nullEqualsUndefined
        );
        if (matchIdx >= 0) {
          usedOldIndices.add(i);
          usedNewIndices.add(matchIdx);
        }
      }

      // Report deletions
      for (let i = 0; i < oldArr.length; i++) {
        if (!usedOldIndices.has(i)) {
          const itemPath = buildPath(path, i);
          if (!shouldIgnorePath(itemPath, options.ignorePaths)) {
            changes.push({
              path: itemPath,
              type: 'delete',
              oldValue: oldArr[i],
            });
          }
        }
      }

      // Report additions
      for (let i = 0; i < newArr.length; i++) {
        if (!usedNewIndices.has(i)) {
          const itemPath = buildPath(path, i);
          if (!shouldIgnorePath(itemPath, options.ignorePaths)) {
            changes.push({
              path: itemPath,
              type: 'add',
              newValue: newArr[i],
            });
          }
        }
      }
    } else if (options.detectMoves) {
      // Detect moves within arrays
      const usedOldIndices = new Set<number>();
      const usedNewIndices = new Set<number>();

      // First pass: find exact position matches
      for (let i = 0; i < Math.min(oldArr.length, newArr.length); i++) {
        if (deepEqual(oldArr[i], newArr[i], options.nullEqualsUndefined)) {
          usedOldIndices.add(i);
          usedNewIndices.add(i);
        }
      }

      // Second pass: find moved elements
      for (let oldIdx = 0; oldIdx < oldArr.length; oldIdx++) {
        if (usedOldIndices.has(oldIdx)) continue;

        const newIdx = findMatchingElement(
          oldArr[oldIdx],
          newArr,
          usedNewIndices,
          options.nullEqualsUndefined
        );

        if (newIdx >= 0) {
          usedOldIndices.add(oldIdx);
          usedNewIndices.add(newIdx);
          const itemPath = buildPath(path, oldIdx);
          if (!shouldIgnorePath(itemPath, options.ignorePaths)) {
            changes.push({
              path: itemPath,
              type: 'move',
              oldValue: oldIdx,
              newValue: newIdx,
            });
          }
        }
      }

      // Report remaining as deletions/additions
      for (let i = 0; i < oldArr.length; i++) {
        if (!usedOldIndices.has(i)) {
          const itemPath = buildPath(path, i);
          if (!shouldIgnorePath(itemPath, options.ignorePaths)) {
            changes.push({
              path: itemPath,
              type: 'delete',
              oldValue: oldArr[i],
            });
          }
        }
      }

      for (let i = 0; i < newArr.length; i++) {
        if (!usedNewIndices.has(i)) {
          const itemPath = buildPath(path, i);
          if (!shouldIgnorePath(itemPath, options.ignorePaths)) {
            changes.push({
              path: itemPath,
              type: 'add',
              newValue: newArr[i],
            });
          }
        }
      }
    } else {
      // Standard array comparison by index
      const maxLen = Math.max(oldArr.length, newArr.length);
      for (let i = 0; i < maxLen; i++) {
        const itemPath = buildPath(path, i);
        if (shouldIgnorePath(itemPath, options.ignorePaths)) continue;

        if (i >= oldArr.length) {
          changes.push({
            path: itemPath,
            type: 'add',
            newValue: newArr[i],
          });
        } else if (i >= newArr.length) {
          changes.push({
            path: itemPath,
            type: 'delete',
            oldValue: oldArr[i],
          });
        } else {
          compareValues(
            oldArr[i],
            newArr[i],
            itemPath,
            options,
            depth + 1,
            changes
          );
        }
      }
    }
    return;
  }

  // Primitive values
  if (oldValue !== newValue) {
    // Handle null/undefined equivalence
    if (options.nullEqualsUndefined && oldValue == null && newValue == null) {
      return;
    }
    changes.push({
      path,
      type: 'modify',
      oldValue,
      newValue,
    });
  }
}

/**
 * Default options
 */
const defaultOptions: Required<JsonDiffOptions> = {
  ignoreArrayOrder: false,
  ignorePaths: [],
  detectMoves: true,
  maxDepth: -1,
  nullEqualsUndefined: false,
};

/**
 * Perform semantic diff on two JSON values
 */
export function diffJson(
  oldJson: unknown,
  newJson: unknown,
  options: JsonDiffOptions = {}
): JsonDiffResult {
  const opts = { ...defaultOptions, ...options };
  const changes: JsonChange[] = [];

  compareValues(oldJson, newJson, '', opts, 0, changes);

  // Calculate stats
  const stats = {
    additions: 0,
    deletions: 0,
    modifications: 0,
    typeChanges: 0,
    moves: 0,
  };

  for (const change of changes) {
    switch (change.type) {
      case 'add':
        stats.additions++;
        break;
      case 'delete':
        stats.deletions++;
        break;
      case 'modify':
        stats.modifications++;
        break;
      case 'type-change':
        stats.typeChanges++;
        break;
      case 'move':
        stats.moves++;
        break;
    }
  }

  return {
    changes,
    isEqual: changes.length === 0,
    stats,
  };
}

/**
 * Parse JSON string and diff
 */
export function diffJsonStrings(
  oldJsonStr: string,
  newJsonStr: string,
  options: JsonDiffOptions = {}
): JsonDiffResult {
  const oldJson = JSON.parse(oldJsonStr);
  const newJson = JSON.parse(newJsonStr);
  return diffJson(oldJson, newJson, options);
}

/**
 * Format changes as human-readable text
 */
export function formatJsonChanges(result: JsonDiffResult): string {
  if (result.isEqual) {
    return 'No changes detected';
  }

  const lines: string[] = [];

  for (const change of result.changes) {
    switch (change.type) {
      case 'add':
        lines.push(`+ ${change.path}: ${JSON.stringify(change.newValue)}`);
        break;
      case 'delete':
        lines.push(`- ${change.path}: ${JSON.stringify(change.oldValue)}`);
        break;
      case 'modify':
        lines.push(
          `~ ${change.path}: ${JSON.stringify(change.oldValue)} → ${JSON.stringify(change.newValue)}`
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

export default diffJson;
