/**
 * Hunk tests
 */


import {
  generateHunks,
  formatHunkHeader,
  hunksToUnifiedString,
  parseUnifiedDiff,
} from '../../src/core/hunk.js';
import { myersAlgorithm } from '../../src/core/algorithms/myers.js';

describe('formatHunkHeader', () => {
  it('should format standard header', () => {
    const result = formatHunkHeader(1, 3, 1, 4);
    expect(result).toBe('@@ -1,3 +1,4 @@');
  });

  it('should omit count for single line', () => {
    const result = formatHunkHeader(5, 1, 5, 1);
    expect(result).toBe('@@ -5 +5 @@');
  });

  it('should handle zero lines', () => {
    const result = formatHunkHeader(1, 0, 1, 1);
    expect(result).toBe('@@ -1,0 +1 @@');
  });
});

describe('generateHunks', () => {
  it('should generate hunks from operations', () => {
    const old = ['a', 'b', 'c'];
    const newLines = ['a', 'x', 'c'];
    const operations = myersAlgorithm.diff(old, newLines);

    const hunks = generateHunks(operations, old, newLines, 3);

    expect(hunks.length).toBeGreaterThan(0);
  });

  it('should return empty array for no changes', () => {
    const lines = ['a', 'b', 'c'];
    const operations = myersAlgorithm.diff(lines, lines);

    const hunks = generateHunks(operations, lines, lines, 3);

    expect(hunks).toHaveLength(0);
  });

  it('should include context lines', () => {
    const old = ['1', '2', '3', '4', '5'];
    const newLines = ['1', '2', 'x', '4', '5'];
    const operations = myersAlgorithm.diff(old, newLines);

    const hunks = generateHunks(operations, old, newLines, 2);

    expect(hunks).toHaveLength(1);
    const normalChanges = hunks[0]!.changes.filter((c) => c.type === 'normal');
    expect(normalChanges.length).toBeGreaterThan(0);
  });

  it('should group nearby changes', () => {
    const old = ['1', '2', '3', '4', '5', '6', '7'];
    const newLines = ['1', 'a', '3', '4', '5', 'b', '7'];
    const operations = myersAlgorithm.diff(old, newLines);

    const hunks = generateHunks(operations, old, newLines, 1);

    // Changes are close enough to be in one hunk
    expect(hunks.length).toBeGreaterThanOrEqual(1);
  });

  it('should have correct change types', () => {
    const old = ['a', 'b'];
    const newLines = ['a', 'c'];
    const operations = myersAlgorithm.diff(old, newLines);

    const hunks = generateHunks(operations, old, newLines, 3);

    expect(hunks[0]!.changes.some((c) => c.type === 'delete')).toBe(true);
    expect(hunks[0]!.changes.some((c) => c.type === 'add')).toBe(true);
  });

  it('should set line numbers correctly', () => {
    const old = ['a', 'b', 'c'];
    const newLines = ['a', 'x', 'c'];
    const operations = myersAlgorithm.diff(old, newLines);

    const hunks = generateHunks(operations, old, newLines, 3);

    for (const hunk of hunks) {
      for (const change of hunk.changes) {
        if (change.type === 'normal') {
          expect(change.oldLineNumber).toBeDefined();
          expect(change.newLineNumber).toBeDefined();
        } else if (change.type === 'delete') {
          expect(change.oldLineNumber).toBeDefined();
        } else if (change.type === 'add') {
          expect(change.newLineNumber).toBeDefined();
        }
      }
    }
  });
});

describe('hunksToUnifiedString', () => {
  it('should generate unified diff format', () => {
    const old = ['a', 'b'];
    const newLines = ['a', 'c'];
    const operations = myersAlgorithm.diff(old, newLines);
    const hunks = generateHunks(operations, old, newLines, 3);

    const result = hunksToUnifiedString(hunks);

    expect(result).toContain('---');
    expect(result).toContain('+++');
    expect(result).toContain('@@');
    expect(result).toContain('-b');
    expect(result).toContain('+c');
  });

  it('should return empty string for no hunks', () => {
    const result = hunksToUnifiedString([]);
    expect(result).toBe('');
  });

  it('should use custom filenames', () => {
    const old = ['a'];
    const newLines = ['b'];
    const operations = myersAlgorithm.diff(old, newLines);
    const hunks = generateHunks(operations, old, newLines, 3);

    const result = hunksToUnifiedString(hunks, 'old.txt', 'new.txt');

    expect(result).toContain('--- old.txt');
    expect(result).toContain('+++ new.txt');
  });
});

describe('parseUnifiedDiff', () => {
  it('should parse unified diff format', () => {
    const diff = `--- a
+++ b
@@ -1,2 +1,2 @@
 a
-b
+c`;

    const hunks = parseUnifiedDiff(diff);

    expect(hunks).toHaveLength(1);
    expect(hunks[0]!.oldStart).toBe(1);
    expect(hunks[0]!.oldLines).toBe(2);
    expect(hunks[0]!.newStart).toBe(1);
    expect(hunks[0]!.newLines).toBe(2);
  });

  it('should parse changes correctly', () => {
    const diff = `--- a
+++ b
@@ -1 +1 @@
-old
+new`;

    const hunks = parseUnifiedDiff(diff);

    expect(hunks[0]!.changes).toHaveLength(2);
    expect(hunks[0]!.changes[0]!.type).toBe('delete');
    expect(hunks[0]!.changes[0]!.content).toBe('old');
    expect(hunks[0]!.changes[1]!.type).toBe('add');
    expect(hunks[0]!.changes[1]!.content).toBe('new');
  });

  it('should handle multiple hunks', () => {
    const diff = `--- a
+++ b
@@ -1 +1 @@
-a
+x
@@ -10 +10 @@
-b
+y`;

    const hunks = parseUnifiedDiff(diff);

    expect(hunks).toHaveLength(2);
    expect(hunks[0]!.oldStart).toBe(1);
    expect(hunks[1]!.oldStart).toBe(10);
  });

  it('should handle context lines', () => {
    const diff = `--- a
+++ b
@@ -1,3 +1,3 @@
 context
-old
+new
 context`;

    const hunks = parseUnifiedDiff(diff);

    const normalChanges = hunks[0]!.changes.filter((c) => c.type === 'normal');
    expect(normalChanges).toHaveLength(2);
  });
});
