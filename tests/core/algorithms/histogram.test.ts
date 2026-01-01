/**
 * Histogram algorithm tests
 */


import { histogramAlgorithm } from '../../../src/core/algorithms/histogram.js';

describe('histogramAlgorithm', () => {
  it('should have correct name', () => {
    expect(histogramAlgorithm.name).toBe('histogram');
  });

  it('should handle identical content', () => {
    const lines = ['a', 'b', 'c'];
    const result = histogramAlgorithm.diff(lines, lines);

    const equalOps = result.filter((op) => op.type === 'equal');
    const totalEqualLines = equalOps.reduce((sum, op) => sum + op.lines.length, 0);
    expect(totalEqualLines).toBe(3);
  });

  it('should handle empty old content', () => {
    const result = histogramAlgorithm.diff([], ['a', 'b']);

    expect(result).toHaveLength(1);
    expect(result[0]!.type).toBe('insert');
    expect(result[0]!.lines).toEqual(['a', 'b']);
  });

  it('should handle empty new content', () => {
    const result = histogramAlgorithm.diff(['a', 'b'], []);

    expect(result).toHaveLength(1);
    expect(result[0]!.type).toBe('delete');
    expect(result[0]!.lines).toEqual(['a', 'b']);
  });

  it('should handle both empty', () => {
    const result = histogramAlgorithm.diff([], []);
    expect(result).toHaveLength(0);
  });

  it('should prefer low-occurrence lines as split points', () => {
    // 'unique' appears once, should be used as anchor
    const old = [
      'common',
      'common',
      'unique',
      'common',
      'common',
    ];
    const newLines = [
      'common',
      'changed',
      'unique',
      'changed',
      'common',
    ];

    const result = histogramAlgorithm.diff(old, newLines);

    const equalOps = result.filter((op) => op.type === 'equal');
    const equalLines = equalOps.flatMap((op) => op.lines);

    expect(equalLines).toContain('unique');
  });

  it('should handle repeated lines efficiently', () => {
    // Many repeated lines
    const old = Array(50).fill('repeat').concat(['unique']).concat(Array(50).fill('repeat'));
    const newLines = Array(50).fill('repeat').concat(['unique']).concat(Array(50).fill('repeat'));

    const result = histogramAlgorithm.diff(old, newLines);

    // All lines are equal
    const equalOps = result.filter((op) => op.type === 'equal');
    const totalEqualLines = equalOps.reduce((sum, op) => sum + op.lines.length, 0);
    expect(totalEqualLines).toBe(101);
  });

  it('should handle common prefix and suffix', () => {
    const old = ['prefix', 'a', 'b', 'suffix'];
    const newLines = ['prefix', 'x', 'y', 'suffix'];
    const result = histogramAlgorithm.diff(old, newLines);

    const equalOps = result.filter((op) => op.type === 'equal');
    const equalLines = equalOps.flatMap((op) => op.lines);

    expect(equalLines).toContain('prefix');
    expect(equalLines).toContain('suffix');
  });

  it('should detect changes in middle', () => {
    const old = ['a', 'b', 'c', 'd', 'e'];
    const newLines = ['a', 'b', 'x', 'd', 'e'];
    const result = histogramAlgorithm.diff(old, newLines);

    const deletes = result.filter((op) => op.type === 'delete');
    const inserts = result.filter((op) => op.type === 'insert');

    const deletedLines = deletes.flatMap((op) => op.lines);
    const insertedLines = inserts.flatMap((op) => op.lines);

    expect(deletedLines).toContain('c');
    expect(insertedLines).toContain('x');
  });

  it('should handle large files', () => {
    const old = Array.from({ length: 1000 }, (_, i) => `line${i}`);
    const newLines = [...old];
    newLines[500] = 'modified';

    const result = histogramAlgorithm.diff(old, newLines);

    const changes = result.filter((op) => op.type !== 'equal');
    expect(changes.length).toBeGreaterThan(0);
  });

  it('should set correct indices', () => {
    const old = ['a', 'b', 'c'];
    const newLines = ['a', 'x', 'c'];
    const result = histogramAlgorithm.diff(old, newLines);

    for (const op of result) {
      expect(op.oldStart).toBeGreaterThanOrEqual(0);
      expect(op.oldEnd).toBeGreaterThanOrEqual(op.oldStart);
      expect(op.newStart).toBeGreaterThanOrEqual(0);
      expect(op.newEnd).toBeGreaterThanOrEqual(op.newStart);
    }
  });

  it('should limit recursion depth', () => {
    // Create deeply nested diff scenario
    const old = Array.from({ length: 200 }, (_, i) => `${i % 10}`);
    const newLines = Array.from({ length: 200 }, (_, i) => `${(i + 1) % 10}`);

    // Should complete without stack overflow
    const result = histogramAlgorithm.diff(old, newLines);
    expect(result.length).toBeGreaterThan(0);
  });
});
