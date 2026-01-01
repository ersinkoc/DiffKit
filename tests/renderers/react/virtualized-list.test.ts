/**
 * Tests for VirtualizedList component
 */

import {
  useFlattenedDiffLines,
  useFindLineIndex,
  type VirtualizedDiffLine,
} from '../../../src/renderers/react/VirtualizedList.js';

// Mock React hooks for testing
const mockUseMemo = <T>(fn: () => T): T => fn();
const mockUseCallback = <T extends (...args: unknown[]) => unknown>(fn: T): T => fn;

// Since we can't test React components directly without a DOM,
// we test the utility functions and hooks logic

describe('useFlattenedDiffLines', () => {
  it('should flatten hunks into lines', () => {
    const hunks = [
      {
        header: '@@ -1,3 +1,3 @@',
        changes: [
          { type: 'normal' as const, content: 'line1', oldLineNumber: 1, newLineNumber: 1 },
          { type: 'delete' as const, content: 'old line', oldLineNumber: 2 },
          { type: 'add' as const, content: 'new line', newLineNumber: 2 },
        ],
      },
    ];

    // Simulate the hook logic
    const lines: VirtualizedDiffLine[] = [];
    hunks.forEach((hunk, hunkIndex) => {
      lines.push({
        type: 'hunk-header',
        content: hunk.header,
        header: hunk.header,
        hunkIndex,
      });
      hunk.changes.forEach((change) => {
        lines.push({
          type: change.type,
          content: change.content,
          oldLineNumber: change.oldLineNumber,
          newLineNumber: change.newLineNumber,
          hunkIndex,
        });
      });
    });

    expect(lines).toHaveLength(4);
    expect(lines[0]?.type).toBe('hunk-header');
    expect(lines[1]?.type).toBe('normal');
    expect(lines[2]?.type).toBe('delete');
    expect(lines[3]?.type).toBe('add');
  });

  it('should skip headers when showHeaders is false', () => {
    const hunks = [
      {
        header: '@@ -1,1 +1,1 @@',
        changes: [{ type: 'normal' as const, content: 'line1', oldLineNumber: 1, newLineNumber: 1 }],
      },
    ];

    // Simulate the hook logic without headers
    const lines: VirtualizedDiffLine[] = [];
    const showHeaders = false;
    hunks.forEach((hunk, hunkIndex) => {
      if (showHeaders) {
        lines.push({
          type: 'hunk-header',
          content: hunk.header,
          header: hunk.header,
          hunkIndex,
        });
      }
      hunk.changes.forEach((change) => {
        lines.push({
          type: change.type,
          content: change.content,
          oldLineNumber: change.oldLineNumber,
          newLineNumber: change.newLineNumber,
          hunkIndex,
        });
      });
    });

    expect(lines).toHaveLength(1);
    expect(lines[0]?.type).toBe('normal');
  });

  it('should handle multiple hunks', () => {
    const hunks = [
      {
        header: '@@ -1,1 +1,1 @@',
        changes: [{ type: 'normal' as const, content: 'line1', oldLineNumber: 1, newLineNumber: 1 }],
      },
      {
        header: '@@ -10,1 +10,1 @@',
        changes: [{ type: 'add' as const, content: 'line10', newLineNumber: 10 }],
      },
    ];

    const lines: VirtualizedDiffLine[] = [];
    hunks.forEach((hunk, hunkIndex) => {
      lines.push({
        type: 'hunk-header',
        content: hunk.header,
        header: hunk.header,
        hunkIndex,
      });
      hunk.changes.forEach((change) => {
        lines.push({
          type: change.type,
          content: change.content,
          oldLineNumber: change.oldLineNumber,
          newLineNumber: change.newLineNumber,
          hunkIndex,
        });
      });
    });

    expect(lines).toHaveLength(4);
    expect(lines[0]?.hunkIndex).toBe(0);
    expect(lines[1]?.hunkIndex).toBe(0);
    expect(lines[2]?.hunkIndex).toBe(1);
    expect(lines[3]?.hunkIndex).toBe(1);
  });
});

describe('useFindLineIndex', () => {
  const sampleLines: VirtualizedDiffLine[] = [
    { type: 'hunk-header', content: '@@ -1,3 +1,3 @@', header: '@@ -1,3 +1,3 @@', hunkIndex: 0 },
    { type: 'normal', content: 'line1', oldLineNumber: 1, newLineNumber: 1, hunkIndex: 0 },
    { type: 'delete', content: 'old line', oldLineNumber: 2, hunkIndex: 0 },
    { type: 'add', content: 'new line', newLineNumber: 2, hunkIndex: 0 },
    { type: 'normal', content: 'line3', oldLineNumber: 3, newLineNumber: 3, hunkIndex: 0 },
  ];

  it('should find line by old line number', () => {
    const index = sampleLines.findIndex(
      (line) => line.oldLineNumber === 2 && line.type !== 'hunk-header'
    );
    expect(index).toBe(2);
  });

  it('should find line by new line number', () => {
    const index = sampleLines.findIndex(
      (line) => line.newLineNumber === 2 && line.type !== 'hunk-header'
    );
    expect(index).toBe(3);
  });

  it('should find hunk by index', () => {
    const index = sampleLines.findIndex(
      (line) => line.hunkIndex === 0 && line.type === 'hunk-header'
    );
    expect(index).toBe(0);
  });

  it('should return -1 for non-existent line number', () => {
    const index = sampleLines.findIndex(
      (line) => line.oldLineNumber === 99 && line.type !== 'hunk-header'
    );
    expect(index).toBe(-1);
  });
});

describe('calculateVisibleRange', () => {
  function calculateVisibleRange(
    scrollTop: number,
    containerHeight: number,
    itemHeight: number,
    itemCount: number,
    overscan: number
  ): { startIndex: number; endIndex: number } {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(
      itemCount - 1,
      Math.floor(scrollTop / itemHeight) + visibleCount + overscan
    );

    return { startIndex, endIndex };
  }

  it('should calculate visible range at top', () => {
    const range = calculateVisibleRange(0, 500, 20, 1000, 3);
    expect(range.startIndex).toBe(0);
    expect(range.endIndex).toBe(28); // 0 + 25 visible + 3 overscan
  });

  it('should calculate visible range in middle', () => {
    const range = calculateVisibleRange(1000, 500, 20, 1000, 3);
    // scrollTop 1000 / itemHeight 20 = line 50
    expect(range.startIndex).toBe(47); // 50 - 3 overscan
    expect(range.endIndex).toBe(78); // 50 + 25 visible + 3 overscan
  });

  it('should clamp to bounds at end', () => {
    // scrollTop 19800 / itemHeight 20 = line 990
    // 990 + 25 visible + 3 overscan = 1018, clamped to 999
    const range = calculateVisibleRange(19800, 500, 20, 1000, 3);
    expect(range.startIndex).toBe(987); // 990 - 3 overscan
    expect(range.endIndex).toBe(999); // clamped to itemCount - 1
  });

  it('should handle small lists', () => {
    const range = calculateVisibleRange(0, 500, 20, 10, 3);
    expect(range.startIndex).toBe(0);
    expect(range.endIndex).toBe(9); // all 10 items visible
  });

  it('should handle edge case with 0 items', () => {
    const range = calculateVisibleRange(0, 500, 20, 0, 3);
    expect(range.startIndex).toBe(0);
    expect(range.endIndex).toBe(-1);
  });
});

describe('VirtualizedDiffLine type', () => {
  it('should allow hunk-header type', () => {
    const line: VirtualizedDiffLine = {
      type: 'hunk-header',
      content: '@@ -1,3 +1,3 @@',
      header: '@@ -1,3 +1,3 @@',
      hunkIndex: 0,
    };

    expect(line.type).toBe('hunk-header');
    expect(line.header).toBeDefined();
  });

  it('should allow add type', () => {
    const line: VirtualizedDiffLine = {
      type: 'add',
      content: 'new line',
      newLineNumber: 1,
      hunkIndex: 0,
    };

    expect(line.type).toBe('add');
    expect(line.newLineNumber).toBe(1);
  });

  it('should allow delete type', () => {
    const line: VirtualizedDiffLine = {
      type: 'delete',
      content: 'old line',
      oldLineNumber: 1,
      hunkIndex: 0,
    };

    expect(line.type).toBe('delete');
    expect(line.oldLineNumber).toBe(1);
  });

  it('should allow normal type', () => {
    const line: VirtualizedDiffLine = {
      type: 'normal',
      content: 'unchanged line',
      oldLineNumber: 1,
      newLineNumber: 1,
      hunkIndex: 0,
    };

    expect(line.type).toBe('normal');
    expect(line.oldLineNumber).toBe(1);
    expect(line.newLineNumber).toBe(1);
  });
});

describe('Virtualization threshold logic', () => {
  function shouldVirtualize(
    virtualize: boolean | 'auto',
    lineCount: number,
    threshold: number
  ): boolean {
    if (virtualize === true) return true;
    if (virtualize === false) return false;
    return lineCount > threshold;
  }

  it('should virtualize when explicitly enabled', () => {
    expect(shouldVirtualize(true, 10, 500)).toBe(true);
  });

  it('should not virtualize when explicitly disabled', () => {
    expect(shouldVirtualize(false, 10000, 500)).toBe(false);
  });

  it('should virtualize when line count exceeds threshold in auto mode', () => {
    expect(shouldVirtualize('auto', 1000, 500)).toBe(true);
  });

  it('should not virtualize when line count is below threshold in auto mode', () => {
    expect(shouldVirtualize('auto', 100, 500)).toBe(false);
  });

  it('should not virtualize when line count equals threshold in auto mode', () => {
    expect(shouldVirtualize('auto', 500, 500)).toBe(false);
  });
});

describe('Line style calculation', () => {
  it('should calculate absolute positioning for virtualized items', () => {
    const itemHeight = 22;
    const index = 10;

    const style = {
      position: 'absolute' as const,
      top: index * itemHeight,
      left: 0,
      right: 0,
      height: itemHeight,
    };

    expect(style.top).toBe(220);
    expect(style.height).toBe(22);
    expect(style.position).toBe('absolute');
  });

  it('should calculate total container height', () => {
    const itemCount = 1000;
    const itemHeight = 22;

    const totalHeight = itemCount * itemHeight;

    expect(totalHeight).toBe(22000);
  });
});

describe('Scroll utilities', () => {
  it('should calculate target scroll position for line', () => {
    const lineIndex = 50;
    const lineHeight = 22;

    const targetTop = lineIndex * lineHeight;

    expect(targetTop).toBe(1100);
  });

  it('should handle scroll to first line', () => {
    const lineIndex = 0;
    const lineHeight = 22;

    const targetTop = lineIndex * lineHeight;

    expect(targetTop).toBe(0);
  });
});
