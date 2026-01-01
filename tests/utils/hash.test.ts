/**
 * Tests for hash utilities
 */

import { describe, it, expect } from 'vitest';
import {
  hash,
  hashToHex,
  hashMultiple,
  fnv1a,
  createHashMap,
  likelyEqual,
} from '../../src/utils/hash.js';

describe('hash', () => {
  it('should produce consistent hash for same input', () => {
    const str = 'hello world';
    expect(hash(str)).toBe(hash(str));
  });

  it('should produce different hash for different inputs', () => {
    expect(hash('hello')).not.toBe(hash('world'));
  });

  it('should handle empty string', () => {
    expect(hash('')).toBe(5381);
  });

  it('should handle unicode characters', () => {
    const h = hash('你好世界');
    expect(h).toBeGreaterThan(0);
  });

  it('should handle emoji', () => {
    const h = hash('Hello 👋');
    expect(h).toBeGreaterThan(0);
  });

  it('should return unsigned 32-bit integer', () => {
    const h = hash('test string');
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });
});

describe('hashToHex', () => {
  it('should return 8 character hex string', () => {
    const hex = hashToHex('test');
    expect(hex).toHaveLength(8);
  });

  it('should return valid hex characters', () => {
    const hex = hashToHex('test');
    expect(/^[0-9a-f]+$/.test(hex)).toBe(true);
  });

  it('should produce consistent hex for same input', () => {
    expect(hashToHex('hello')).toBe(hashToHex('hello'));
  });

  it('should pad with zeros if needed', () => {
    const hex = hashToHex('');
    expect(hex).toBe('00001505');
  });
});

describe('hashMultiple', () => {
  it('should combine multiple strings', () => {
    const h = hashMultiple('a', 'b', 'c');
    expect(h).toBeGreaterThan(0);
  });

  it('should produce different hash for different order', () => {
    expect(hashMultiple('a', 'b')).not.toBe(hashMultiple('b', 'a'));
  });

  it('should handle single string', () => {
    expect(hashMultiple('test')).toBe(hash('test'));
  });

  it('should handle empty strings', () => {
    const h = hashMultiple('', '', '');
    expect(h).toBeGreaterThan(0);
  });
});

describe('fnv1a', () => {
  it('should produce consistent hash for same input', () => {
    const str = 'hello world';
    expect(fnv1a(str)).toBe(fnv1a(str));
  });

  it('should produce different hash for different inputs', () => {
    expect(fnv1a('hello')).not.toBe(fnv1a('world'));
  });

  it('should handle empty string', () => {
    expect(fnv1a('')).toBe(2166136261);
  });

  it('should return unsigned 32-bit integer', () => {
    const h = fnv1a('test string');
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(0xffffffff);
  });

  it('should differ from djb2 hash', () => {
    const str = 'test';
    expect(fnv1a(str)).not.toBe(hash(str));
  });
});

describe('createHashMap', () => {
  it('should create a map from array', () => {
    const items = ['apple', 'banana', 'cherry'];
    const map = createHashMap(items, (item) => item);

    expect(map.size).toBeGreaterThan(0);
  });

  it('should group items with same key', () => {
    const items = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 30 },
      { name: 'Charlie', age: 25 },
    ];
    const map = createHashMap(items, (item) => String(item.age));

    // Items with age 30 should be grouped
    let foundGroup = false;
    for (const group of map.values()) {
      if (group.length === 2) {
        foundGroup = true;
        break;
      }
    }
    expect(foundGroup).toBe(true);
  });

  it('should handle empty array', () => {
    const map = createHashMap<string>([], (item) => item);
    expect(map.size).toBe(0);
  });

  it('should handle objects as items', () => {
    const items = [{ id: 1 }, { id: 2 }];
    const map = createHashMap(items, (item) => String(item.id));
    expect(map.size).toBe(2);
  });
});

describe('likelyEqual', () => {
  it('should return true for equal strings', () => {
    expect(likelyEqual('hello', 'hello')).toBe(true);
  });

  it('should return false for different length strings', () => {
    expect(likelyEqual('hello', 'hello!')).toBe(false);
  });

  it('should return false for different strings of same length', () => {
    expect(likelyEqual('hello', 'world')).toBe(false);
  });

  it('should handle empty strings', () => {
    expect(likelyEqual('', '')).toBe(true);
  });

  it('should handle single character strings', () => {
    expect(likelyEqual('a', 'a')).toBe(true);
    expect(likelyEqual('a', 'b')).toBe(false);
  });
});
