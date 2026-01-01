/**
 * LCS utility tests
 */

import { describe, it, expect } from 'vitest';
import {
  computeLCS,
  findUniqueLines,
  patienceLCS,
  countOccurrences,
  findLowOccurrenceLines,
} from '../../../src/core/algorithms/lcs.js';

describe('computeLCS', () => {
  it('should find LCS of two identical arrays', () => {
    const arr = ['a', 'b', 'c'];
    const result = computeLCS(arr, arr);

    expect(result).toHaveLength(3);
    expect(result.map((r) => r.oldIndex)).toEqual([0, 1, 2]);
    expect(result.map((r) => r.newIndex)).toEqual([0, 1, 2]);
  });

  it('should find LCS of two different arrays', () => {
    const old = ['a', 'b', 'c', 'd'];
    const newArr = ['a', 'x', 'c', 'y'];
    const result = computeLCS(old, newArr);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ oldIndex: 0, newIndex: 0 });
    expect(result[1]).toEqual({ oldIndex: 2, newIndex: 2 });
  });

  it('should handle empty arrays', () => {
    expect(computeLCS([], ['a'])).toHaveLength(0);
    expect(computeLCS(['a'], [])).toHaveLength(0);
    expect(computeLCS([], [])).toHaveLength(0);
  });

  it('should handle no common elements', () => {
    const result = computeLCS(['a', 'b'], ['x', 'y']);
    expect(result).toHaveLength(0);
  });

  it('should handle single element arrays', () => {
    expect(computeLCS(['a'], ['a'])).toEqual([{ oldIndex: 0, newIndex: 0 }]);
    expect(computeLCS(['a'], ['b'])).toEqual([]);
  });

  it('should use custom equality function', () => {
    const old = [{ id: 1 }, { id: 2 }];
    const newArr = [{ id: 1 }, { id: 3 }];
    const result = computeLCS(old, newArr, (a, b) => a.id === b.id);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ oldIndex: 0, newIndex: 0 });
  });
});

describe('findUniqueLines', () => {
  it('should find unique lines in both arrays', () => {
    const old = ['a', 'b', 'c', 'a'];
    const newLines = ['a', 'b', 'd', 'a'];
    const result = findUniqueLines(old, newLines);

    expect(result.size).toBe(1);
    expect(result.get('b')).toEqual({ oldIndex: 1, newIndex: 1 });
  });

  it('should handle no unique lines', () => {
    const old = ['a', 'a', 'b', 'b'];
    const newLines = ['a', 'a', 'b', 'b'];
    const result = findUniqueLines(old, newLines);

    expect(result.size).toBe(0);
  });

  it('should handle all unique lines', () => {
    const old = ['a', 'b', 'c'];
    const newLines = ['a', 'b', 'c'];
    const result = findUniqueLines(old, newLines);

    expect(result.size).toBe(3);
  });

  it('should handle empty arrays', () => {
    expect(findUniqueLines([], ['a'])).toEqual(new Map());
    expect(findUniqueLines(['a'], [])).toEqual(new Map());
  });
});

describe('patienceLCS', () => {
  it('should find LIS of unique matches', () => {
    const matches = [
      { oldIndex: 0, newIndex: 0 },
      { oldIndex: 1, newIndex: 2 },
      { oldIndex: 2, newIndex: 1 },
      { oldIndex: 3, newIndex: 3 },
    ];
    const result = patienceLCS(matches);

    // Should find increasing subsequence
    expect(result.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle empty input', () => {
    expect(patienceLCS([])).toEqual([]);
  });

  it('should handle single match', () => {
    const matches = [{ oldIndex: 5, newIndex: 3 }];
    const result = patienceLCS(matches);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ oldIndex: 5, newIndex: 3 });
  });

  it('should handle already sorted matches', () => {
    const matches = [
      { oldIndex: 0, newIndex: 0 },
      { oldIndex: 1, newIndex: 1 },
      { oldIndex: 2, newIndex: 2 },
    ];
    const result = patienceLCS(matches);

    expect(result).toHaveLength(3);
  });
});

describe('countOccurrences', () => {
  it('should count occurrences correctly', () => {
    const lines = ['a', 'b', 'a', 'c', 'a'];
    const result = countOccurrences(lines);

    expect(result.get('a')).toBe(3);
    expect(result.get('b')).toBe(1);
    expect(result.get('c')).toBe(1);
  });

  it('should handle empty array', () => {
    expect(countOccurrences([])).toEqual(new Map());
  });

  it('should handle all same values', () => {
    const result = countOccurrences(['x', 'x', 'x']);
    expect(result.get('x')).toBe(3);
    expect(result.size).toBe(1);
  });
});

describe('findLowOccurrenceLines', () => {
  it('should find lines with low occurrence', () => {
    const old = ['a', 'a', 'b', 'c'];
    const newLines = ['a', 'b', 'c', 'c'];
    const result = findLowOccurrenceLines(old, newLines);

    // 'b' appears once in each (total 2)
    // 'a' appears twice in old, once in new (total 3)
    // 'c' appears once in old, twice in new (total 3)
    expect(result).toContain('b');
  });

  it('should sort by occurrence count', () => {
    const old = ['a', 'b', 'b', 'c', 'c', 'c'];
    const newLines = ['a', 'b', 'c'];
    const result = findLowOccurrenceLines(old, newLines);

    // 'a' has lowest total (2), should be first
    expect(result[0]).toBe('a');
  });

  it('should handle empty arrays', () => {
    expect(findLowOccurrenceLines([], ['a'])).toEqual([]);
    expect(findLowOccurrenceLines(['a'], [])).toEqual([]);
  });

  it('should respect maxOccurrences', () => {
    const old = ['a', 'a', 'a', 'a', 'a', 'b'];
    const newLines = ['a', 'a', 'a', 'a', 'a', 'b'];
    const result = findLowOccurrenceLines(old, newLines, 3);

    // 'a' has 10 total, above threshold
    // 'b' has 2 total, within threshold
    expect(result).toContain('b');
    expect(result).not.toContain('a');
  });
});
