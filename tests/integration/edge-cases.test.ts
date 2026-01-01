/**
 * Edge cases integration tests
 */

import { describe, it, expect } from 'vitest';
import { createDiff } from '../../src/index.js';

describe('Whitespace handling', () => {
  it('should detect trailing whitespace changes', () => {
    const diff = createDiff('line ', 'line');

    expect(diff.stats.changes).toBeGreaterThan(0);
  });

  it('should detect leading whitespace changes', () => {
    const diff = createDiff('  line', 'line');

    expect(diff.stats.changes).toBeGreaterThan(0);
  });

  it('should handle tabs vs spaces', () => {
    const diff = createDiff('\tindent', '    indent');

    expect(diff.stats.changes).toBeGreaterThan(0);
  });

  it('should handle mixed line endings', () => {
    const diff = createDiff('a\r\nb\r\nc', 'a\nb\nc');

    // Line endings are normalized, so this should be equal
    expect(diff.stats.additions + diff.stats.deletions).toBe(0);
  });
});

describe('Line ending edge cases', () => {
  it('should handle no trailing newline', () => {
    const diff = createDiff('line1\nline2', 'line1\nline2');

    expect(diff.hunks).toHaveLength(0);
  });

  it('should handle added trailing newline', () => {
    const diff = createDiff('line', 'line\n');

    // Trailing newline creates empty last line
    expect(diff).toBeDefined();
  });

  it('should handle removed trailing newline', () => {
    const diff = createDiff('line\n', 'line');

    expect(diff).toBeDefined();
  });
});

describe('Special characters', () => {
  it('should handle null bytes', () => {
    const diff = createDiff('a\x00b', 'a\x00c');

    expect(diff.stats.changes).toBeGreaterThan(0);
  });

  it('should handle control characters', () => {
    const diff = createDiff('a\x1bb', 'a\x1bc');

    expect(diff.stats.changes).toBeGreaterThan(0);
  });

  it('should handle surrogate pairs', () => {
    const diff = createDiff('Hello 👋', 'Hello 👍');

    expect(diff.stats.changes).toBeGreaterThan(0);
  });

  it('should handle RTL text', () => {
    const diff = createDiff('مرحبا', 'مرحبا بالعالم');

    expect(diff.stats.additions).toBeGreaterThan(0);
  });

  it('should handle combining characters', () => {
    const diff = createDiff('e\u0301', 'é');

    expect(diff).toBeDefined();
  });
});

describe('Content patterns', () => {
  it('should handle repeated identical lines', () => {
    const old = 'same\nsame\nsame\nsame';
    const newContent = 'same\nsame\ndifferent\nsame';

    const diff = createDiff(old, newContent);

    expect(diff.stats.changes).toBeGreaterThan(0);
  });

  it('should handle single character lines', () => {
    const diff = createDiff('a\nb\nc', 'a\nx\nc');

    expect(diff.stats.additions).toBe(1);
    expect(diff.stats.deletions).toBe(1);
  });

  it('should handle very long single line', () => {
    const long = 'x'.repeat(10000);
    const diff = createDiff(long, long.slice(0, -1));

    expect(diff.stats.changes).toBeGreaterThan(0);
  });

  it('should handle many short lines', () => {
    const old = Array(1000).fill('x').join('\n');
    const newContent = old.replace(/x/g, 'y');

    const diff = createDiff(old, newContent);

    expect(diff.stats.deletions).toBe(1000);
    expect(diff.stats.additions).toBe(1000);
  });
});

describe('Context handling', () => {
  it('should respect context option', () => {
    const old = 'a\nb\nc\nd\ne\nf\ng\nh\ni\nj';
    const newContent = 'a\nb\nc\nd\nX\nf\ng\nh\ni\nj';

    const diff0 = createDiff(old, newContent, { context: 0 });
    const diff3 = createDiff(old, newContent, { context: 3 });

    // More context means more lines in hunks
    const lines0 = diff0.hunks.reduce((sum, h) => sum + h.changes.length, 0);
    const lines3 = diff3.hunks.reduce((sum, h) => sum + h.changes.length, 0);

    expect(lines3).toBeGreaterThanOrEqual(lines0);
  });

  it('should handle context larger than file', () => {
    const diff = createDiff('a\nb', 'a\nc', { context: 100 });

    expect(diff.hunks.length).toBe(1);
  });
});

describe('Algorithm-specific edge cases', () => {
  it('should handle completely different content', () => {
    const diff = createDiff('abcdef', 'ghijkl');

    expect(diff.stats.additions).toBeGreaterThan(0);
    expect(diff.stats.deletions).toBeGreaterThan(0);
  });

  it('should handle insertion at start', () => {
    const diff = createDiff('b\nc', 'a\nb\nc');

    expect(diff.stats.additions).toBe(1);
  });

  it('should handle insertion at end', () => {
    const diff = createDiff('a\nb', 'a\nb\nc');

    expect(diff.stats.additions).toBe(1);
  });

  it('should handle deletion from start', () => {
    const diff = createDiff('a\nb\nc', 'b\nc');

    expect(diff.stats.deletions).toBe(1);
  });

  it('should handle deletion from end', () => {
    const diff = createDiff('a\nb\nc', 'a\nb');

    expect(diff.stats.deletions).toBe(1);
  });

  it('should handle swap', () => {
    const diff = createDiff('a\nb', 'b\na');

    expect(diff.stats.changes).toBeGreaterThan(0);
  });
});

describe('Performance edge cases', () => {
  it('should handle pathological Myers case', () => {
    // Alternating pattern that creates many diagonals
    const old = Array(100).fill('a').map((_, i) => i % 2 === 0 ? 'a' : 'b').join('\n');
    const newContent = Array(100).fill('b').map((_, i) => i % 2 === 0 ? 'b' : 'a').join('\n');

    const start = Date.now();
    const diff = createDiff(old, newContent);
    const elapsed = Date.now() - start;

    expect(diff).toBeDefined();
    expect(elapsed).toBeLessThan(5000); // Should complete in reasonable time
  });

  it('should handle large identical files', () => {
    const content = Array(1000).fill('same line').join('\n');

    const start = Date.now();
    const diff = createDiff(content, content);
    const elapsed = Date.now() - start;

    expect(diff.hunks).toHaveLength(0);
    expect(elapsed).toBeLessThan(3000); // Allow more time for slower systems
  });
});
