/**
 * Tests for merge utilities
 */

import { describe, it, expect } from 'vitest';
import {
  deepMerge,
  deepMergeAll,
  shallowMerge,
  deepClone,
  pick,
  omit,
} from '../../src/utils/merge.js';

describe('deepMerge', () => {
  it('should merge flat objects', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should merge nested objects', () => {
    const target = { a: { x: 1, y: 2 } };
    const source = { a: { y: 3, z: 4 } };
    const result = deepMerge(target, source);

    expect(result).toEqual({ a: { x: 1, y: 3, z: 4 } });
  });

  it('should not mutate original objects', () => {
    const target = { a: 1 };
    const source = { b: 2 };
    deepMerge(target, source);

    expect(target).toEqual({ a: 1 });
    expect(source).toEqual({ b: 2 });
  });

  it('should handle empty source', () => {
    const target = { a: 1 };
    const result = deepMerge(target, {});

    expect(result).toEqual({ a: 1 });
  });

  it('should handle empty target', () => {
    const target = {} as { a?: number };
    const source = { a: 1 };
    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1 });
  });

  it('should skip undefined values', () => {
    const target = { a: 1, b: 2 };
    const source = { a: undefined, b: 3 };
    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 1, b: 3 });
  });

  it('should replace non-object values', () => {
    const target = { a: { x: 1 } } as Record<string, unknown>;
    const source = { a: 'string' };
    const result = deepMerge(target, source);

    expect(result).toEqual({ a: 'string' });
  });

  it('should handle arrays as values', () => {
    const target = { a: [1, 2] };
    const source = { a: [3, 4] };
    const result = deepMerge(target, source);

    expect(result).toEqual({ a: [3, 4] });
  });
});

describe('deepMergeAll', () => {
  it('should merge multiple objects', () => {
    const result = deepMergeAll({ a: 1 }, { b: 2 }, { c: 3 });

    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('should merge nested objects from multiple sources', () => {
    const result = deepMergeAll(
      { config: { a: 1 } },
      { config: { b: 2 } },
      { config: { c: 3 } }
    );

    expect(result).toEqual({ config: { a: 1, b: 2, c: 3 } });
  });

  it('should handle empty array', () => {
    const result = deepMergeAll();
    expect(result).toEqual({});
  });

  it('should handle single object', () => {
    const result = deepMergeAll({ a: 1 });
    expect(result).toEqual({ a: 1 });
  });
});

describe('shallowMerge', () => {
  it('should merge flat objects', () => {
    const target = { a: 1, b: 2 };
    const source = { b: 3, c: 4 };
    const result = shallowMerge(target, source);

    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });

  it('should not merge nested objects', () => {
    const target = { a: { x: 1, y: 2 } };
    const source = { a: { y: 3 } };
    const result = shallowMerge(target, source);

    expect(result).toEqual({ a: { y: 3 } });
  });

  it('should skip undefined values', () => {
    const target = { a: 1, b: 2 };
    const source = { a: undefined, b: 3 };
    const result = shallowMerge(target, source);

    expect(result).toEqual({ a: 1, b: 3 });
  });

  it('should not mutate original objects', () => {
    const target = { a: 1 };
    const source = { b: 2 };
    shallowMerge(target, source);

    expect(target).toEqual({ a: 1 });
  });
});

describe('deepClone', () => {
  it('should clone primitives', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(true)).toBe(true);
    expect(deepClone(null)).toBe(null);
  });

  it('should clone flat objects', () => {
    const original = { a: 1, b: 2 };
    const clone = deepClone(original);

    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
  });

  it('should clone nested objects', () => {
    const original = { a: { b: { c: 1 } } };
    const clone = deepClone(original);

    expect(clone).toEqual(original);
    expect(clone.a).not.toBe(original.a);
    expect(clone.a.b).not.toBe(original.a.b);
  });

  it('should clone arrays', () => {
    const original = [1, 2, [3, 4]];
    const clone = deepClone(original);

    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
    expect(clone[2]).not.toBe(original[2]);
  });

  it('should clone Date objects', () => {
    const original = new Date('2024-01-01');
    const clone = deepClone(original);

    expect(clone.getTime()).toBe(original.getTime());
    expect(clone).not.toBe(original);
  });

  it('should clone Map objects', () => {
    const original = new Map([
      ['a', 1],
      ['b', 2],
    ]);
    const clone = deepClone(original);

    expect(clone.get('a')).toBe(1);
    expect(clone.get('b')).toBe(2);
    expect(clone).not.toBe(original);
  });

  it('should clone Set objects', () => {
    const original = new Set([1, 2, 3]);
    const clone = deepClone(original);

    expect(clone.has(1)).toBe(true);
    expect(clone.has(2)).toBe(true);
    expect(clone.has(3)).toBe(true);
    expect(clone).not.toBe(original);
  });

  it('should handle undefined', () => {
    expect(deepClone(undefined)).toBe(undefined);
  });
});

describe('pick', () => {
  it('should pick specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = pick(obj, ['a', 'c']);

    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('should handle missing keys', () => {
    const obj = { a: 1, b: 2 } as { a: number; b: number; c?: number };
    const result = pick(obj, ['a', 'c']);

    expect(result).toEqual({ a: 1 });
  });

  it('should handle empty keys array', () => {
    const obj = { a: 1, b: 2 };
    const result = pick(obj, []);

    expect(result).toEqual({});
  });

  it('should not mutate original object', () => {
    const obj = { a: 1, b: 2 };
    pick(obj, ['a']);

    expect(obj).toEqual({ a: 1, b: 2 });
  });
});

describe('omit', () => {
  it('should omit specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = omit(obj, ['b']);

    expect(result).toEqual({ a: 1, c: 3 });
  });

  it('should handle non-existent keys', () => {
    const obj = { a: 1, b: 2 } as { a: number; b: number; c?: number };
    const result = omit(obj, ['c']);

    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should handle empty keys array', () => {
    const obj = { a: 1, b: 2 };
    const result = omit(obj, []);

    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should not mutate original object', () => {
    const obj = { a: 1, b: 2 };
    omit(obj, ['a']);

    expect(obj).toEqual({ a: 1, b: 2 });
  });

  it('should omit multiple keys', () => {
    const obj = { a: 1, b: 2, c: 3, d: 4 };
    const result = omit(obj, ['a', 'c']);

    expect(result).toEqual({ b: 2, d: 4 });
  });
});
