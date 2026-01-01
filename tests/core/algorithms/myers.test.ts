/**
 * Myers algorithm tests
 */


import { myersAlgorithm } from '../../../src/core/algorithms/myers.js';

describe('myersAlgorithm', () => {
  it('should have correct name', () => {
    expect(myersAlgorithm.name).toBe('myers');
  });

  it('should handle identical content', () => {
    const lines = ['a', 'b', 'c'];
    const result = myersAlgorithm.diff(lines, lines);

    const equalOps = result.filter((op) => op.type === 'equal');
    expect(equalOps.length).toBeGreaterThan(0);

    const changes = result.filter((op) => op.type !== 'equal');
    expect(changes).toHaveLength(0);
  });

  it('should handle empty old content', () => {
    const result = myersAlgorithm.diff([], ['a', 'b']);

    expect(result).toHaveLength(1);
    expect(result[0]!.type).toBe('insert');
    expect(result[0]!.lines).toEqual(['a', 'b']);
  });

  it('should handle empty new content', () => {
    const result = myersAlgorithm.diff(['a', 'b'], []);

    expect(result).toHaveLength(1);
    expect(result[0]!.type).toBe('delete');
    expect(result[0]!.lines).toEqual(['a', 'b']);
  });

  it('should handle both empty', () => {
    const result = myersAlgorithm.diff([], []);
    expect(result).toHaveLength(0);
  });

  it('should detect single insertion', () => {
    const old = ['a', 'c'];
    const newLines = ['a', 'b', 'c'];
    const result = myersAlgorithm.diff(old, newLines);

    const inserts = result.filter((op) => op.type === 'insert');
    expect(inserts.length).toBeGreaterThan(0);

    const insertedLines = inserts.flatMap((op) => op.lines);
    expect(insertedLines).toContain('b');
  });

  it('should detect single deletion', () => {
    const old = ['a', 'b', 'c'];
    const newLines = ['a', 'c'];
    const result = myersAlgorithm.diff(old, newLines);

    const deletes = result.filter((op) => op.type === 'delete');
    expect(deletes.length).toBeGreaterThan(0);

    const deletedLines = deletes.flatMap((op) => op.lines);
    expect(deletedLines).toContain('b');
  });

  it('should detect modification', () => {
    const old = ['a', 'b', 'c'];
    const newLines = ['a', 'x', 'c'];
    const result = myersAlgorithm.diff(old, newLines);

    const deletes = result.filter((op) => op.type === 'delete');
    const inserts = result.filter((op) => op.type === 'insert');

    const deletedLines = deletes.flatMap((op) => op.lines);
    const insertedLines = inserts.flatMap((op) => op.lines);

    expect(deletedLines).toContain('b');
    expect(insertedLines).toContain('x');
  });

  it('should handle complete replacement', () => {
    const old = ['a', 'b'];
    const newLines = ['x', 'y'];
    const result = myersAlgorithm.diff(old, newLines);

    const deletes = result.filter((op) => op.type === 'delete');
    const inserts = result.filter((op) => op.type === 'insert');

    expect(deletes.length).toBeGreaterThan(0);
    expect(inserts.length).toBeGreaterThan(0);
  });

  it('should produce minimal edit distance', () => {
    const old = ['a', 'b', 'c', 'd'];
    const newLines = ['a', 'x', 'c', 'y'];
    const result = myersAlgorithm.diff(old, newLines);

    // Should have equal ops for 'a' and 'c'
    const equalOps = result.filter((op) => op.type === 'equal');
    const equalLines = equalOps.flatMap((op) => op.lines);

    expect(equalLines).toContain('a');
    expect(equalLines).toContain('c');
  });

  it('should handle long sequences', () => {
    const old = Array.from({ length: 100 }, (_, i) => `line${i}`);
    const newLines = [...old];
    newLines[50] = 'modified';

    const result = myersAlgorithm.diff(old, newLines);

    const changes = result.filter((op) => op.type !== 'equal');
    expect(changes.length).toBeGreaterThan(0);
  });

  it('should set correct indices', () => {
    const old = ['a', 'b', 'c'];
    const newLines = ['a', 'x', 'c'];
    const result = myersAlgorithm.diff(old, newLines);

    for (const op of result) {
      expect(op.oldStart).toBeGreaterThanOrEqual(0);
      expect(op.oldEnd).toBeGreaterThanOrEqual(op.oldStart);
      expect(op.newStart).toBeGreaterThanOrEqual(0);
      expect(op.newEnd).toBeGreaterThanOrEqual(op.newStart);
    }
  });
});
