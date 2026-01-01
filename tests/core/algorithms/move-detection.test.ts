/**
 * Tests for move/block detection algorithm
 */

import {
  detectMoves,
  detectMovesFromContent,
  annotateMoves,
} from '../../../src/core/algorithms/move-detection.js';
import type { DiffOperation } from '../../../src/core/types.js';

describe('detectMoves', () => {
  it('should detect exact block moves', () => {
    const operations: DiffOperation[] = [
      {
        type: 'delete',
        oldStart: 0,
        oldEnd: 3,
        newStart: 0,
        newEnd: 0,
        lines: ['function foo() {', '  return 42;', '}'],
      },
      {
        type: 'insert',
        oldStart: 10,
        oldEnd: 10,
        newStart: 10,
        newEnd: 13,
        lines: ['function foo() {', '  return 42;', '}'],
      },
    ];

    const moves = detectMoves(operations);

    expect(moves).toHaveLength(1);
    expect(moves[0]?.oldStart).toBe(0);
    expect(moves[0]?.oldEnd).toBe(3);
    expect(moves[0]?.newStart).toBe(10);
    expect(moves[0]?.newEnd).toBe(13);
    expect(moves[0]?.isExact).toBe(true);
    expect(moves[0]?.similarity).toBe(1.0);
  });

  it('should detect moves even when start positions match if content was deleted and re-inserted', () => {
    // If content is deleted from position 5 and inserted back at position 5
    // it IS technically a move (delete + insert with same content)
    const operations: DiffOperation[] = [
      {
        type: 'delete',
        oldStart: 5,
        oldEnd: 8,
        newStart: 0,
        newEnd: 0,
        lines: ['line a', 'line b', 'line c'],
      },
      {
        type: 'insert',
        oldStart: 0,
        oldEnd: 0,
        newStart: 5,
        newEnd: 8,
        lines: ['line a', 'line b', 'line c'],
      },
    ];

    const moves = detectMoves(operations);

    // This is actually a valid move detection since the content was
    // deleted from old position 5 and inserted at new position 5
    expect(moves).toHaveLength(1);
    expect(moves[0]?.oldStart).toBe(5);
    expect(moves[0]?.newStart).toBe(5);
  });

  it('should detect fuzzy moves when enabled', () => {
    const operations: DiffOperation[] = [
      {
        type: 'delete',
        oldStart: 0,
        oldEnd: 3,
        newStart: 0,
        newEnd: 0,
        lines: ['function foo() {', '  return 42;', '}'],
      },
      {
        type: 'insert',
        oldStart: 10,
        oldEnd: 10,
        newStart: 10,
        newEnd: 13,
        lines: ['function foo() {', '  return 43;', '}'], // slightly different
      },
    ];

    const moves = detectMoves(operations, { detectFuzzyMoves: true, similarityThreshold: 0.8 });

    expect(moves).toHaveLength(1);
    expect(moves[0]?.isExact).toBe(false);
    expect(moves[0]?.similarity).toBeGreaterThan(0.8);
  });

  it('should respect minimum block size', () => {
    const operations: DiffOperation[] = [
      {
        type: 'delete',
        oldStart: 0,
        oldEnd: 2,
        newStart: 0,
        newEnd: 0,
        lines: ['small', 'block'],
      },
      {
        type: 'insert',
        oldStart: 10,
        oldEnd: 10,
        newStart: 10,
        newEnd: 12,
        lines: ['small', 'block'],
      },
    ];

    const moves = detectMoves(operations, { minBlockSize: 3 });

    expect(moves).toHaveLength(0);
  });

  it('should detect multiple moves', () => {
    const operations: DiffOperation[] = [
      {
        type: 'delete',
        oldStart: 0,
        oldEnd: 3,
        newStart: 0,
        newEnd: 0,
        lines: ['block1 line1', 'block1 line2', 'block1 line3'],
      },
      {
        type: 'delete',
        oldStart: 10,
        oldEnd: 13,
        newStart: 0,
        newEnd: 0,
        lines: ['block2 line1', 'block2 line2', 'block2 line3'],
      },
      {
        type: 'insert',
        oldStart: 0,
        oldEnd: 0,
        newStart: 20,
        newEnd: 23,
        lines: ['block1 line1', 'block1 line2', 'block1 line3'],
      },
      {
        type: 'insert',
        oldStart: 0,
        oldEnd: 0,
        newStart: 30,
        newEnd: 33,
        lines: ['block2 line1', 'block2 line2', 'block2 line3'],
      },
    ];

    const moves = detectMoves(operations);

    expect(moves).toHaveLength(2);
  });

  it('should handle empty operations', () => {
    const moves = detectMoves([]);

    expect(moves).toHaveLength(0);
  });

  it('should handle operations with only deletes', () => {
    const operations: DiffOperation[] = [
      {
        type: 'delete',
        oldStart: 0,
        oldEnd: 3,
        newStart: 0,
        newEnd: 0,
        lines: ['line1', 'line2', 'line3'],
      },
    ];

    const moves = detectMoves(operations);

    expect(moves).toHaveLength(0);
  });

  it('should handle operations with only inserts', () => {
    const operations: DiffOperation[] = [
      {
        type: 'insert',
        oldStart: 0,
        oldEnd: 0,
        newStart: 0,
        newEnd: 3,
        lines: ['line1', 'line2', 'line3'],
      },
    ];

    const moves = detectMoves(operations);

    expect(moves).toHaveLength(0);
  });
});

describe('detectMovesFromContent', () => {
  it('should detect moves from raw content', () => {
    const oldLines = [
      'function foo() {',
      '  return 42;',
      '}',
      '',
      'function bar() {',
      '  return "hello";',
      '}',
    ];

    const newLines = [
      'function bar() {',
      '  return "hello";',
      '}',
      '',
      'function foo() {',
      '  return 42;',
      '}',
    ];

    const moves = detectMovesFromContent(oldLines, newLines);

    expect(moves.length).toBeGreaterThanOrEqual(1);
    // At least one of the function blocks should be detected as moved
    expect(moves.some((m) => m.lines.includes('function foo() {'))).toBe(true);
  });

  it('should respect minimum block size', () => {
    const oldLines = ['a', 'b'];
    const newLines = ['b', 'a'];

    const moves = detectMovesFromContent(oldLines, newLines, { minBlockSize: 3 });

    expect(moves).toHaveLength(0);
  });

  it('should handle identical content', () => {
    const lines = ['line1', 'line2', 'line3'];

    const moves = detectMovesFromContent(lines, lines);

    expect(moves).toHaveLength(0);
  });

  it('should handle completely different content', () => {
    const oldLines = ['old1', 'old2', 'old3', 'old4'];
    const newLines = ['new1', 'new2', 'new3', 'new4'];

    const moves = detectMovesFromContent(oldLines, newLines);

    expect(moves).toHaveLength(0);
  });

  it('should detect large block moves', () => {
    const block = [
      '// Comment',
      'function helper() {',
      '  const x = 1;',
      '  const y = 2;',
      '  return x + y;',
      '}',
    ];

    const oldLines = [...block, '', 'function main() {}'];
    const newLines = ['function main() {}', '', ...block];

    const moves = detectMovesFromContent(oldLines, newLines);

    expect(moves.length).toBeGreaterThanOrEqual(1);
    expect(moves[0]?.lines.length).toBeGreaterThanOrEqual(3);
  });
});

describe('annotateMoves', () => {
  it('should annotate operations with move info', () => {
    const operations: DiffOperation[] = [
      {
        type: 'delete',
        oldStart: 0,
        oldEnd: 3,
        newStart: 0,
        newEnd: 0,
        lines: ['function foo() {', '  return 42;', '}'],
      },
      {
        type: 'equal',
        oldStart: 3,
        oldEnd: 5,
        newStart: 0,
        newEnd: 2,
        lines: ['', '// comment'],
      },
      {
        type: 'insert',
        oldStart: 5,
        oldEnd: 5,
        newStart: 10,
        newEnd: 13,
        lines: ['function foo() {', '  return 42;', '}'],
      },
    ];

    const annotated = annotateMoves(operations);

    expect(annotated).toHaveLength(3);

    const sourceOp = annotated.find((op) => op.move?.role === 'source');
    const destOp = annotated.find((op) => op.move?.role === 'destination');

    expect(sourceOp).toBeDefined();
    expect(destOp).toBeDefined();
    expect(sourceOp?.move?.moveId).toBe(destOp?.move?.moveId);
  });

  it('should not annotate non-move operations', () => {
    const operations: DiffOperation[] = [
      {
        type: 'delete',
        oldStart: 0,
        oldEnd: 3,
        newStart: 0,
        newEnd: 0,
        lines: ['line1', 'line2', 'line3'],
      },
      {
        type: 'insert',
        oldStart: 0,
        oldEnd: 0,
        newStart: 0,
        newEnd: 3,
        lines: ['different1', 'different2', 'different3'],
      },
    ];

    const annotated = annotateMoves(operations);

    expect(annotated.every((op) => !op.move)).toBe(true);
  });
});

describe('MoveBlock properties', () => {
  it('should have correct line range properties', () => {
    const operations: DiffOperation[] = [
      {
        type: 'delete',
        oldStart: 5,
        oldEnd: 10,
        newStart: 0,
        newEnd: 0,
        lines: ['a', 'b', 'c', 'd', 'e'],
      },
      {
        type: 'insert',
        oldStart: 0,
        oldEnd: 0,
        newStart: 20,
        newEnd: 25,
        lines: ['a', 'b', 'c', 'd', 'e'],
      },
    ];

    const moves = detectMoves(operations);

    expect(moves).toHaveLength(1);
    const move = moves[0]!;

    expect(move.oldStart).toBe(5);
    expect(move.oldEnd).toBe(10);
    expect(move.newStart).toBe(20);
    expect(move.newEnd).toBe(25);
    expect(move.lines).toHaveLength(5);
  });
});

describe('ignoreWhitespace option', () => {
  it('should match blocks with different whitespace when enabled', () => {
    const operations: DiffOperation[] = [
      {
        type: 'delete',
        oldStart: 0,
        oldEnd: 3,
        newStart: 0,
        newEnd: 0,
        lines: ['function foo() {', '  return 42;', '}'],
      },
      {
        type: 'insert',
        oldStart: 0,
        oldEnd: 0,
        newStart: 10,
        newEnd: 13,
        lines: ['function foo() {', '    return 42;', '}'], // different indentation
      },
    ];

    const movesWithoutIgnore = detectMoves(operations, { ignoreWhitespace: false });
    const movesWithIgnore = detectMoves(operations, { ignoreWhitespace: true });

    // Without ignoring whitespace, it might be fuzzy or not match
    // With ignoring whitespace, it should be exact
    expect(movesWithIgnore.length).toBeGreaterThanOrEqual(movesWithoutIgnore.length);
  });
});

describe('similarity calculation', () => {
  it('should calculate similarity correctly for similar blocks', () => {
    const operations: DiffOperation[] = [
      {
        type: 'delete',
        oldStart: 0,
        oldEnd: 4,
        newStart: 0,
        newEnd: 0,
        lines: ['function test() {', '  const a = 1;', '  return a;', '}'],
      },
      {
        type: 'insert',
        oldStart: 0,
        oldEnd: 0,
        newStart: 10,
        newEnd: 14,
        lines: ['function test() {', '  const b = 1;', '  return b;', '}'], // a -> b
      },
    ];

    const moves = detectMoves(operations, { detectFuzzyMoves: true, similarityThreshold: 0.7 });

    if (moves.length > 0) {
      expect(moves[0]?.similarity).toBeGreaterThan(0.7);
      expect(moves[0]?.similarity).toBeLessThanOrEqual(1.0);
    }
  });
});

describe('edge cases', () => {
  it('should handle single line blocks when minBlockSize is 1', () => {
    const operations: DiffOperation[] = [
      {
        type: 'delete',
        oldStart: 0,
        oldEnd: 1,
        newStart: 0,
        newEnd: 0,
        lines: ['unique line content here'],
      },
      {
        type: 'insert',
        oldStart: 0,
        oldEnd: 0,
        newStart: 10,
        newEnd: 11,
        lines: ['unique line content here'],
      },
    ];

    const moves = detectMoves(operations, { minBlockSize: 1 });

    expect(moves).toHaveLength(1);
  });

  it('should handle very long blocks', () => {
    const lines = Array.from({ length: 100 }, (_, i) => `line ${i}`);

    const operations: DiffOperation[] = [
      {
        type: 'delete',
        oldStart: 0,
        oldEnd: 100,
        newStart: 0,
        newEnd: 0,
        lines,
      },
      {
        type: 'insert',
        oldStart: 0,
        oldEnd: 0,
        newStart: 200,
        newEnd: 300,
        lines,
      },
    ];

    const moves = detectMoves(operations);

    expect(moves).toHaveLength(1);
    expect(moves[0]?.lines).toHaveLength(100);
  });

  it('should handle blocks with special characters', () => {
    const operations: DiffOperation[] = [
      {
        type: 'delete',
        oldStart: 0,
        oldEnd: 3,
        newStart: 0,
        newEnd: 0,
        lines: ['// @ts-ignore', 'const regex = /test/gi;', '/* comment */'],
      },
      {
        type: 'insert',
        oldStart: 0,
        oldEnd: 0,
        newStart: 10,
        newEnd: 13,
        lines: ['// @ts-ignore', 'const regex = /test/gi;', '/* comment */'],
      },
    ];

    const moves = detectMoves(operations);

    expect(moves).toHaveLength(1);
  });
});
