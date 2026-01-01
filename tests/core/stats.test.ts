/**
 * Stats tests
 */


import {
  calculateStats,
  calculateStatsFromHunks,
  calculateHunkStats,
  calculateWordStats,
  calculateSimilarity,
  formatStats,
  formatDetailedStats,
} from '../../src/core/stats.js';
import { myersAlgorithm } from '../../src/core/algorithms/myers.js';
import { generateHunks } from '../../src/core/hunk.js';
import type { Hunk, Change } from '../../src/core/types.js';

describe('calculateStats', () => {
  it('should count additions and deletions', () => {
    const old = ['a', 'b', 'c'];
    const newLines = ['a', 'x', 'y', 'c'];
    const operations = myersAlgorithm.diff(old, newLines);

    const stats = calculateStats(operations, old, newLines);

    expect(stats.deletions).toBe(1); // 'b' deleted
    expect(stats.additions).toBe(2); // 'x', 'y' added
  });

  it('should calculate total changes', () => {
    const old = ['a', 'b'];
    const newLines = ['a', 'c'];
    const operations = myersAlgorithm.diff(old, newLines);

    const stats = calculateStats(operations, old, newLines);

    expect(stats.changes).toBe(stats.additions + stats.deletions);
  });

  it('should include line counts', () => {
    const old = ['a', 'b', 'c'];
    const newLines = ['x', 'y'];
    const operations = myersAlgorithm.diff(old, newLines);

    const stats = calculateStats(operations, old, newLines);

    expect(stats.oldLineCount).toBe(3);
    expect(stats.newLineCount).toBe(2);
  });

  it('should handle no changes', () => {
    const lines = ['a', 'b', 'c'];
    const operations = myersAlgorithm.diff(lines, lines);

    const stats = calculateStats(operations, lines, lines);

    expect(stats.additions).toBe(0);
    expect(stats.deletions).toBe(0);
    expect(stats.changes).toBe(0);
  });

  it('should handle empty old content', () => {
    const operations = myersAlgorithm.diff([], ['a', 'b']);

    const stats = calculateStats(operations, [], ['a', 'b']);

    expect(stats.additions).toBe(2);
    expect(stats.deletions).toBe(0);
  });

  it('should handle empty new content', () => {
    const operations = myersAlgorithm.diff(['a', 'b'], []);

    const stats = calculateStats(operations, ['a', 'b'], []);

    expect(stats.additions).toBe(0);
    expect(stats.deletions).toBe(2);
  });
});

describe('calculateStatsFromHunks', () => {
  it('should calculate stats from hunks', () => {
    const old = ['a', 'b', 'c'];
    const newLines = ['a', 'x', 'c'];
    const operations = myersAlgorithm.diff(old, newLines);
    const hunks = generateHunks(operations, old, newLines, 3);

    const stats = calculateStatsFromHunks(hunks);

    expect(stats.additions).toBeGreaterThanOrEqual(1);
    expect(stats.deletions).toBeGreaterThanOrEqual(1);
  });

  it('should handle empty hunks', () => {
    const stats = calculateStatsFromHunks([]);

    expect(stats.additions).toBe(0);
    expect(stats.deletions).toBe(0);
  });
});

describe('calculateHunkStats', () => {
  it('should count additions and deletions in a hunk', () => {
    const hunk: Hunk = {
      oldStart: 1,
      oldLines: 2,
      newStart: 1,
      newLines: 2,
      header: '@@ -1,2 +1,2 @@',
      changes: [
        { type: 'normal', content: 'a', oldLineNumber: 1, newLineNumber: 1 },
        { type: 'delete', content: 'b', oldLineNumber: 2 },
        { type: 'add', content: 'c', newLineNumber: 2 },
      ],
    };

    const stats = calculateHunkStats(hunk);

    expect(stats.additions).toBe(1);
    expect(stats.deletions).toBe(1);
  });
});

describe('calculateWordStats', () => {
  it('should count words in changes', () => {
    const changes: Change[] = [
      { type: 'normal', content: 'hello world' },
      { type: 'add', content: 'new text here' },
      { type: 'delete', content: 'old text' },
    ];

    const stats = calculateWordStats(changes);

    expect(stats.addedWords).toBe(3); // 'new text here'
    expect(stats.deletedWords).toBe(2); // 'old text'
    expect(stats.totalWords).toBe(7);
  });

  it('should handle empty content', () => {
    const changes: Change[] = [{ type: 'normal', content: '' }];

    const stats = calculateWordStats(changes);

    expect(stats.totalWords).toBe(0);
  });
});

describe('calculateSimilarity', () => {
  it('should return 100 for identical content', () => {
    const stats = {
      additions: 0,
      deletions: 0,
      changes: 0,
      oldLineCount: 10,
      newLineCount: 10,
    };

    expect(calculateSimilarity(stats)).toBe(100);
  });

  it('should return lower value for changes', () => {
    const stats = {
      additions: 5,
      deletions: 5,
      changes: 10,
      oldLineCount: 10,
      newLineCount: 10,
    };

    expect(calculateSimilarity(stats)).toBeLessThan(100);
  });

  it('should handle empty files', () => {
    const stats = {
      additions: 0,
      deletions: 0,
      changes: 0,
      oldLineCount: 0,
      newLineCount: 0,
    };

    expect(calculateSimilarity(stats)).toBe(100);
  });
});

describe('formatStats', () => {
  it('should format additions and deletions', () => {
    const stats = {
      additions: 5,
      deletions: 3,
      changes: 8,
      oldLineCount: 10,
      newLineCount: 12,
    };

    const result = formatStats(stats);

    expect(result).toContain('+5');
    expect(result).toContain('-3');
  });

  it('should handle no changes', () => {
    const stats = {
      additions: 0,
      deletions: 0,
      changes: 0,
      oldLineCount: 10,
      newLineCount: 10,
    };

    expect(formatStats(stats)).toBe('No changes');
  });

  it('should handle only additions', () => {
    const stats = {
      additions: 5,
      deletions: 0,
      changes: 5,
      oldLineCount: 10,
      newLineCount: 15,
    };

    const result = formatStats(stats);

    expect(result).toContain('+5');
    expect(result).not.toContain('-0');
  });
});

describe('formatDetailedStats', () => {
  it('should include all information', () => {
    const stats = {
      additions: 5,
      deletions: 3,
      changes: 8,
      oldLineCount: 10,
      newLineCount: 12,
    };

    const result = formatDetailedStats(stats);

    expect(result).toContain('10 lines');
    expect(result).toContain('12 lines');
    expect(result).toContain('Additions: 5');
    expect(result).toContain('Deletions: 3');
    expect(result).toContain('Similarity:');
  });
});
