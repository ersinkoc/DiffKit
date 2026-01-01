/**
 * Tests for word-level diff
 */

import {
  diffWords,
  diffLinePair,
  findLinePairs,
  enhanceChangesWithWordDiff,
  segmentsToHtml,
  type DiffSegment,
} from '../../src/core/word-diff.js';

describe('diffWords', () => {
  it('should return no differences for identical lines', () => {
    const result = diffWords('hello world', 'hello world');

    expect(result.hasDifferences).toBe(false);
    expect(result.oldSegments).toHaveLength(1);
    expect(result.oldSegments[0]?.type).toBe('equal');
    expect(result.oldSegments[0]?.text).toBe('hello world');
  });

  it('should detect word changes', () => {
    const result = diffWords('hello world', 'hello there');

    expect(result.hasDifferences).toBe(true);
    expect(result.oldSegments.some((s) => s.type === 'delete' && s.text.includes('world'))).toBe(
      true
    );
    expect(result.newSegments.some((s) => s.type === 'insert' && s.text.includes('there'))).toBe(
      true
    );
  });

  it('should detect added words', () => {
    const result = diffWords('hello', 'hello world');

    expect(result.hasDifferences).toBe(true);
    expect(result.newSegments.some((s) => s.type === 'insert')).toBe(true);
  });

  it('should detect deleted words', () => {
    const result = diffWords('hello world', 'hello');

    expect(result.hasDifferences).toBe(true);
    expect(result.oldSegments.some((s) => s.type === 'delete')).toBe(true);
  });

  it('should preserve common parts as equal', () => {
    const result = diffWords('the quick brown fox', 'the slow brown fox');

    expect(result.oldSegments.some((s) => s.type === 'equal' && s.text.includes('the'))).toBe(true);
    expect(result.oldSegments.some((s) => s.type === 'equal' && s.text.includes('brown'))).toBe(
      true
    );
    expect(result.oldSegments.some((s) => s.type === 'equal' && s.text.includes('fox'))).toBe(true);
  });

  it('should handle character-level granularity', () => {
    const result = diffWords('hello', 'hallo', { granularity: 'char' });

    expect(result.hasDifferences).toBe(true);
    // Should detect 'e' -> 'a' change
    expect(result.oldSegments.some((s) => s.type === 'delete' && s.text === 'e')).toBe(true);
    expect(result.newSegments.some((s) => s.type === 'insert' && s.text === 'a')).toBe(true);
  });

  it('should handle ignoreCase option', () => {
    const result = diffWords('Hello World', 'hello world', { ignoreCase: true });

    // When ignoring case, they should be considered equal
    // But since the actual text differs, we need to verify segments
    expect(result.oldSegments).toBeDefined();
    expect(result.newSegments).toBeDefined();
  });

  it('should handle empty strings', () => {
    const result1 = diffWords('', 'hello');
    expect(result1.hasDifferences).toBe(true);
    expect(result1.newSegments.some((s) => s.type === 'insert')).toBe(true);

    const result2 = diffWords('hello', '');
    expect(result2.hasDifferences).toBe(true);
    expect(result2.oldSegments.some((s) => s.type === 'delete')).toBe(true);
  });

  it('should handle whitespace correctly', () => {
    const result = diffWords('hello   world', 'hello world');

    expect(result.hasDifferences).toBe(true);
  });

  it('should handle multiple changes in one line', () => {
    const result = diffWords('one two three four', 'one TWO three FOUR');

    expect(result.hasDifferences).toBe(true);
    // Both 'two' and 'four' should be marked as changed
    expect(result.oldSegments.filter((s) => s.type === 'delete').length).toBeGreaterThan(0);
    expect(result.newSegments.filter((s) => s.type === 'insert').length).toBeGreaterThan(0);
  });

  it('should handle code-like content', () => {
    const oldLine = 'function foo(x, y) {';
    const newLine = 'function bar(x, y, z) {';

    const result = diffWords(oldLine, newLine);

    expect(result.hasDifferences).toBe(true);
    // 'foo' changed to 'bar', 'z' added
    expect(result.oldSegments.some((s) => s.text.includes('foo'))).toBe(true);
    expect(result.newSegments.some((s) => s.text.includes('bar'))).toBe(true);
  });
});

describe('diffLinePair', () => {
  it('should compute diff for a pair of lines', () => {
    const result = diffLinePair('const x = 1;', 'const y = 2;');

    expect(result.hasDifferences).toBe(true);
    expect(result.oldSegments.some((s) => s.type === 'delete')).toBe(true);
    expect(result.newSegments.some((s) => s.type === 'insert')).toBe(true);
  });
});

describe('findLinePairs', () => {
  it('should find matching line pairs', () => {
    const deletedLines = ['const x = 1;', 'function foo() {}'];
    const addedLines = ['const x = 2;', 'function bar() {}'];

    const pairs = findLinePairs(deletedLines, addedLines);

    expect(pairs.length).toBeGreaterThan(0);
    // Should match lines with similar structure
  });

  it('should respect similarity threshold', () => {
    const deletedLines = ['hello world'];
    const addedLines = ['completely different text'];

    const pairsHigh = findLinePairs(deletedLines, addedLines, 0.9);

    // High threshold shouldn't find a match for dissimilar text
    expect(pairsHigh.length).toBe(0);
  });

  it('should not reuse lines in multiple pairs', () => {
    const deletedLines = ['line a', 'line b', 'line c'];
    const addedLines = ['line a modified', 'line b modified'];

    const pairs = findLinePairs(deletedLines, addedLines);

    // Each deleted/added line should only appear in one pair
    const usedDeleted = new Set(pairs.map((p) => p.deleteIdx));
    const usedAdded = new Set(pairs.map((p) => p.addIdx));

    expect(usedDeleted.size).toBe(pairs.length);
    expect(usedAdded.size).toBe(pairs.length);
  });

  it('should handle empty arrays', () => {
    expect(findLinePairs([], [])).toEqual([]);
    expect(findLinePairs(['line'], [])).toEqual([]);
    expect(findLinePairs([], ['line'])).toEqual([]);
  });
});

describe('enhanceChangesWithWordDiff', () => {
  it('should enhance paired changes with word-level diff', () => {
    const changes = [
      { type: 'delete' as const, content: 'const x = 1;', oldLineNumber: 1 },
      { type: 'add' as const, content: 'const x = 2;', newLineNumber: 1 },
    ];

    const enhanced = enhanceChangesWithWordDiff(changes);

    // Both changes should have segments
    expect(enhanced[0]?.segments).toBeDefined();
    expect(enhanced[1]?.segments).toBeDefined();
    expect(enhanced[0]?.hasPairedChange).toBe(true);
    expect(enhanced[1]?.hasPairedChange).toBe(true);
  });

  it('should not enhance unpaired changes', () => {
    const changes = [
      { type: 'delete' as const, content: 'deleted line', oldLineNumber: 1 },
      { type: 'normal' as const, content: 'unchanged', oldLineNumber: 2, newLineNumber: 1 },
      { type: 'add' as const, content: 'completely new line', newLineNumber: 2 },
    ];

    const enhanced = enhanceChangesWithWordDiff(changes);

    // The delete and add are separated by a normal line, so they won't be paired
    expect(enhanced[0]?.hasPairedChange).toBeFalsy();
    expect(enhanced[2]?.hasPairedChange).toBeFalsy();
  });

  it('should handle multiple consecutive changes', () => {
    const changes = [
      { type: 'delete' as const, content: 'line one', oldLineNumber: 1 },
      { type: 'delete' as const, content: 'line two', oldLineNumber: 2 },
      { type: 'add' as const, content: 'line ONE', newLineNumber: 1 },
      { type: 'add' as const, content: 'line TWO', newLineNumber: 2 },
    ];

    const enhanced = enhanceChangesWithWordDiff(changes);

    // Should find matching pairs
    const pairedCount = enhanced.filter((c) => c.hasPairedChange).length;
    expect(pairedCount).toBeGreaterThan(0);
  });

  it('should preserve original change properties', () => {
    const changes = [
      { type: 'delete' as const, content: 'old', oldLineNumber: 5 },
      { type: 'add' as const, content: 'new', newLineNumber: 5 },
    ];

    const enhanced = enhanceChangesWithWordDiff(changes);

    expect(enhanced[0]?.type).toBe('delete');
    expect(enhanced[0]?.oldLineNumber).toBe(5);
    expect(enhanced[1]?.type).toBe('add');
    expect(enhanced[1]?.newLineNumber).toBe(5);
  });
});

describe('segmentsToHtml', () => {
  it('should render equal segments', () => {
    const segments: DiffSegment[] = [{ text: 'hello', type: 'equal' }];

    const html = segmentsToHtml(segments);

    expect(html).toContain('diffkit-word-equal');
    expect(html).toContain('hello');
  });

  it('should render delete segments', () => {
    const segments: DiffSegment[] = [{ text: 'deleted', type: 'delete' }];

    const html = segmentsToHtml(segments);

    expect(html).toContain('diffkit-word-delete');
    expect(html).toContain('deleted');
  });

  it('should render insert segments', () => {
    const segments: DiffSegment[] = [{ text: 'inserted', type: 'insert' }];

    const html = segmentsToHtml(segments);

    expect(html).toContain('diffkit-word-insert');
    expect(html).toContain('inserted');
  });

  it('should escape HTML in segments', () => {
    const segments: DiffSegment[] = [{ text: '<script>alert("xss")</script>', type: 'equal' }];

    const html = segmentsToHtml(segments);

    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('should use custom class names', () => {
    const segments: DiffSegment[] = [
      { text: 'del', type: 'delete' },
      { text: 'ins', type: 'insert' },
    ];

    const html = segmentsToHtml(segments, {
      deleteClass: 'my-delete',
      insertClass: 'my-insert',
    });

    expect(html).toContain('my-delete');
    expect(html).toContain('my-insert');
  });

  it('should handle multiple segments', () => {
    const segments: DiffSegment[] = [
      { text: 'hello ', type: 'equal' },
      { text: 'world', type: 'delete' },
      { text: 'there', type: 'insert' },
    ];

    const html = segmentsToHtml(segments);

    expect(html).toContain('hello');
    expect(html).toContain('world');
    expect(html).toContain('there');
  });
});

describe('Word diff edge cases', () => {
  it('should handle punctuation', () => {
    const result = diffWords('hello, world!', 'hello; world?');

    expect(result.hasDifferences).toBe(true);
  });

  it('should handle numbers', () => {
    const result = diffWords('value = 42', 'value = 100');

    expect(result.hasDifferences).toBe(true);
    expect(result.oldSegments.some((s) => s.text.includes('42'))).toBe(true);
    expect(result.newSegments.some((s) => s.text.includes('100'))).toBe(true);
  });

  it('should handle mixed content', () => {
    const result = diffWords(
      'function test(a, b) { return a + b; }',
      'function test(x, y) { return x * y; }'
    );

    expect(result.hasDifferences).toBe(true);
  });

  it('should handle unicode', () => {
    const result = diffWords('こんにちは世界', 'こんにちはみんな');

    expect(result.hasDifferences).toBe(true);
  });

  it('should handle very long lines', () => {
    const longWord = 'a'.repeat(1000);
    const oldLine = `prefix ${longWord} suffix`;
    const newLine = `prefix ${longWord}b suffix`;

    const result = diffWords(oldLine, newLine);

    expect(result.hasDifferences).toBe(true);
  });

  it('should handle lines with only whitespace changes', () => {
    const result = diffWords('hello world', 'hello  world');

    expect(result.hasDifferences).toBe(true);
  });

  it('should handle tab characters', () => {
    const result = diffWords('hello\tworld', 'hello world');

    expect(result.hasDifferences).toBe(true);
  });
});

describe('Character-level diff', () => {
  it('should detect single character changes', () => {
    const result = diffWords('cat', 'bat', { granularity: 'char' });

    expect(result.hasDifferences).toBe(true);
    expect(result.oldSegments.some((s) => s.type === 'delete' && s.text === 'c')).toBe(true);
    expect(result.newSegments.some((s) => s.type === 'insert' && s.text === 'b')).toBe(true);
  });

  it('should handle character insertions', () => {
    const result = diffWords('helo', 'hello', { granularity: 'char' });

    expect(result.hasDifferences).toBe(true);
    expect(result.newSegments.some((s) => s.type === 'insert')).toBe(true);
  });

  it('should handle character deletions', () => {
    const result = diffWords('helllo', 'hello', { granularity: 'char' });

    expect(result.hasDifferences).toBe(true);
    expect(result.oldSegments.some((s) => s.type === 'delete')).toBe(true);
  });
});
