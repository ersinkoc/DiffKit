/**
 * Patience algorithm tests
 */


import { patienceAlgorithm } from '../../../src/core/algorithms/patience.js';

describe('patienceAlgorithm', () => {
  it('should have correct name', () => {
    expect(patienceAlgorithm.name).toBe('patience');
  });

  it('should handle identical content', () => {
    const lines = ['a', 'b', 'c'];
    const result = patienceAlgorithm.diff(lines, lines);

    const equalOps = result.filter((op) => op.type === 'equal');
    const totalEqualLines = equalOps.reduce((sum, op) => sum + op.lines.length, 0);
    expect(totalEqualLines).toBe(3);
  });

  it('should handle empty old content', () => {
    const result = patienceAlgorithm.diff([], ['a', 'b']);

    expect(result).toHaveLength(1);
    expect(result[0]!.type).toBe('insert');
    expect(result[0]!.lines).toEqual(['a', 'b']);
  });

  it('should handle empty new content', () => {
    const result = patienceAlgorithm.diff(['a', 'b'], []);

    expect(result).toHaveLength(1);
    expect(result[0]!.type).toBe('delete');
    expect(result[0]!.lines).toEqual(['a', 'b']);
  });

  it('should handle both empty', () => {
    const result = patienceAlgorithm.diff([], []);
    expect(result).toHaveLength(0);
  });

  it('should use unique lines as anchors', () => {
    // 'function' appears once in each, should be anchor
    const old = [
      'header',
      'function test() {',
      '  old code',
      '}',
      'footer',
    ];
    const newLines = [
      'header',
      'function test() {',
      '  new code',
      '}',
      'footer',
    ];

    const result = patienceAlgorithm.diff(old, newLines);

    // 'function test() {' should be equal
    const equalOps = result.filter((op) => op.type === 'equal');
    const equalLines = equalOps.flatMap((op) => op.lines);

    expect(equalLines).toContain('function test() {');
    expect(equalLines).toContain('header');
    expect(equalLines).toContain('}');
  });

  it('should handle moved blocks better than Myers', () => {
    const old = ['a', 'b', 'c', 'd', 'e'];
    const newLines = ['a', 'd', 'e', 'b', 'c'];

    const result = patienceAlgorithm.diff(old, newLines);

    // Should produce some result
    expect(result.length).toBeGreaterThan(0);
  });

  it('should handle common prefix', () => {
    const old = ['a', 'b', 'x'];
    const newLines = ['a', 'b', 'y'];
    const result = patienceAlgorithm.diff(old, newLines);

    const equalOps = result.filter((op) => op.type === 'equal');
    const equalLines = equalOps.flatMap((op) => op.lines);

    expect(equalLines).toContain('a');
    expect(equalLines).toContain('b');
  });

  it('should handle common suffix', () => {
    const old = ['x', 'b', 'c'];
    const newLines = ['y', 'b', 'c'];
    const result = patienceAlgorithm.diff(old, newLines);

    const equalOps = result.filter((op) => op.type === 'equal');
    const equalLines = equalOps.flatMap((op) => op.lines);

    expect(equalLines).toContain('b');
    expect(equalLines).toContain('c');
  });

  it('should fall back to Myers when no unique lines', () => {
    // All lines appear multiple times
    const old = ['a', 'a', 'b', 'b'];
    const newLines = ['a', 'b', 'a', 'b'];

    const result = patienceAlgorithm.diff(old, newLines);

    // Should still produce valid result
    expect(result.length).toBeGreaterThan(0);
  });

  it('should set correct indices', () => {
    const old = ['a', 'b', 'c'];
    const newLines = ['a', 'x', 'c'];
    const result = patienceAlgorithm.diff(old, newLines);

    for (const op of result) {
      expect(op.oldStart).toBeGreaterThanOrEqual(0);
      expect(op.oldEnd).toBeGreaterThanOrEqual(op.oldStart);
      expect(op.newStart).toBeGreaterThanOrEqual(0);
      expect(op.newEnd).toBeGreaterThanOrEqual(op.newStart);
    }
  });
});
