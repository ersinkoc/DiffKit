/**
 * Fast string hashing utilities
 */

/**
 * Simple and fast hash function for strings
 * Uses djb2 algorithm
 */
export function hash(str: string): number {
  let hash = 5381;

  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }

  return hash >>> 0; // Convert to unsigned 32-bit integer
}

/**
 * Hash a string to a hex string
 */
export function hashToHex(str: string): string {
  return hash(str).toString(16).padStart(8, '0');
}

/**
 * Hash multiple strings together
 */
export function hashMultiple(...strings: string[]): number {
  return hash(strings.join('\0'));
}

/**
 * FNV-1a hash (alternative algorithm)
 * Good for hash tables
 */
export function fnv1a(str: string): number {
  let hash = 2166136261;

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

/**
 * Create a hash map for an array of strings
 * Used for fast lookups in diff algorithms
 */
export function createHashMap<T>(
  items: T[],
  keyFn: (item: T) => string
): Map<number, T[]> {
  const map = new Map<number, T[]>();

  for (const item of items) {
    const key = hash(keyFn(item));
    const existing = map.get(key);

    if (existing) {
      existing.push(item);
    } else {
      map.set(key, [item]);
    }
  }

  return map;
}

/**
 * Check if two strings are likely equal using hash
 * Note: Hash collisions are possible, so this is not definitive
 */
export function likelyEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return hash(a) === hash(b);
}
