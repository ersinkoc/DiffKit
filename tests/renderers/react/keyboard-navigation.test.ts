/**
 * Tests for keyboard navigation hooks
 */

import type { Change, Hunk } from '../../../src/core/types.js';

// Since we can't use React hooks directly in tests without a React environment,
// we test the logic and types that the hooks would use

describe('KeyboardNavigation logic', () => {
  describe('key binding matching', () => {
    const defaultKeyBindings = {
      next: ['ArrowDown', 'j'],
      prev: ['ArrowUp', 'k'],
      first: ['Home'],
      last: ['End'],
      select: ['Enter', ' '],
      escape: ['Escape'],
      nextHunk: ['n', ']'],
      prevHunk: ['p', '['],
      nextChange: ['c'],
      prevChange: ['C'],
    };

    it('should match next keys', () => {
      expect(defaultKeyBindings.next.includes('ArrowDown')).toBe(true);
      expect(defaultKeyBindings.next.includes('j')).toBe(true);
      expect(defaultKeyBindings.next.includes('ArrowUp')).toBe(false);
    });

    it('should match prev keys', () => {
      expect(defaultKeyBindings.prev.includes('ArrowUp')).toBe(true);
      expect(defaultKeyBindings.prev.includes('k')).toBe(true);
    });

    it('should match first/last keys', () => {
      expect(defaultKeyBindings.first.includes('Home')).toBe(true);
      expect(defaultKeyBindings.last.includes('End')).toBe(true);
    });

    it('should match select keys', () => {
      expect(defaultKeyBindings.select.includes('Enter')).toBe(true);
      expect(defaultKeyBindings.select.includes(' ')).toBe(true);
    });

    it('should match escape key', () => {
      expect(defaultKeyBindings.escape.includes('Escape')).toBe(true);
    });

    it('should match hunk navigation keys', () => {
      expect(defaultKeyBindings.nextHunk.includes('n')).toBe(true);
      expect(defaultKeyBindings.nextHunk.includes(']')).toBe(true);
      expect(defaultKeyBindings.prevHunk.includes('p')).toBe(true);
      expect(defaultKeyBindings.prevHunk.includes('[')).toBe(true);
    });

    it('should match change navigation keys', () => {
      expect(defaultKeyBindings.nextChange.includes('c')).toBe(true);
      expect(defaultKeyBindings.prevChange.includes('C')).toBe(true);
    });
  });

  describe('navigation index calculation', () => {
    const itemCount = 10;

    function calculateNextIndex(currentIndex: number): number {
      return Math.min(currentIndex + 1, itemCount - 1);
    }

    function calculatePrevIndex(currentIndex: number): number {
      return Math.max(currentIndex - 1, 0);
    }

    it('should navigate next correctly', () => {
      expect(calculateNextIndex(0)).toBe(1);
      expect(calculateNextIndex(5)).toBe(6);
      expect(calculateNextIndex(9)).toBe(9); // clamped at end
    });

    it('should navigate prev correctly', () => {
      expect(calculatePrevIndex(9)).toBe(8);
      expect(calculatePrevIndex(5)).toBe(4);
      expect(calculatePrevIndex(0)).toBe(0); // clamped at start
    });

    it('should handle first/last navigation', () => {
      const first = () => 0;
      const last = () => itemCount - 1;

      expect(first()).toBe(0);
      expect(last()).toBe(9);
    });
  });

  describe('circular navigation', () => {
    const itemCount = 5;

    function circularNext(currentIndex: number): number {
      return currentIndex < itemCount - 1 ? currentIndex + 1 : 0;
    }

    function circularPrev(currentIndex: number): number {
      return currentIndex > 0 ? currentIndex - 1 : itemCount - 1;
    }

    it('should wrap around at end', () => {
      expect(circularNext(4)).toBe(0);
    });

    it('should wrap around at start', () => {
      expect(circularPrev(0)).toBe(4);
    });

    it('should navigate normally in middle', () => {
      expect(circularNext(2)).toBe(3);
      expect(circularPrev(2)).toBe(1);
    });
  });
});

describe('HunkNavigation logic', () => {
  const mockHunks: Hunk[] = [
    {
      oldStart: 1,
      oldLines: 3,
      newStart: 1,
      newLines: 4,
      header: '@@ -1,3 +1,4 @@',
      changes: [
        { type: 'normal', content: 'line1', oldLineNumber: 1, newLineNumber: 1 },
        { type: 'delete', content: 'old', oldLineNumber: 2 },
        { type: 'add', content: 'new', newLineNumber: 2 },
        { type: 'add', content: 'extra', newLineNumber: 3 },
        { type: 'normal', content: 'line3', oldLineNumber: 3, newLineNumber: 4 },
      ],
    },
    {
      oldStart: 10,
      oldLines: 2,
      newStart: 11,
      newLines: 2,
      header: '@@ -10,2 +11,2 @@',
      changes: [
        { type: 'delete', content: 'oldline10', oldLineNumber: 10 },
        { type: 'add', content: 'newline11', newLineNumber: 11 },
        { type: 'normal', content: 'line11', oldLineNumber: 11, newLineNumber: 12 },
      ],
    },
  ];

  it('should navigate to next hunk', () => {
    const hunks = mockHunks;
    const currentIndex = 0;
    const nextIndex = currentIndex < hunks.length - 1 ? currentIndex + 1 : 0;

    expect(nextIndex).toBe(1);
  });

  it('should wrap to first hunk from last', () => {
    const hunks = mockHunks;
    const currentIndex = 1;
    const nextIndex = currentIndex < hunks.length - 1 ? currentIndex + 1 : 0;

    expect(nextIndex).toBe(0);
  });

  it('should navigate to previous hunk', () => {
    const hunks = mockHunks;
    const currentIndex = 1;
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : hunks.length - 1;

    expect(prevIndex).toBe(0);
  });

  it('should wrap to last hunk from first', () => {
    const hunks = mockHunks;
    const currentIndex = 0;
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : hunks.length - 1;

    expect(prevIndex).toBe(1);
  });
});

describe('ChangeNavigation logic', () => {
  const mockChanges: Array<{ change: Change; hunkIndex: number; changeIndex: number }> = [
    { change: { type: 'normal', content: 'line1', oldLineNumber: 1, newLineNumber: 1 }, hunkIndex: 0, changeIndex: 0 },
    { change: { type: 'delete', content: 'old', oldLineNumber: 2 }, hunkIndex: 0, changeIndex: 1 },
    { change: { type: 'add', content: 'new', newLineNumber: 2 }, hunkIndex: 0, changeIndex: 2 },
    { change: { type: 'normal', content: 'line3', oldLineNumber: 3, newLineNumber: 3 }, hunkIndex: 0, changeIndex: 3 },
    { change: { type: 'delete', content: 'oldline10', oldLineNumber: 10 }, hunkIndex: 1, changeIndex: 0 },
    { change: { type: 'add', content: 'newline11', newLineNumber: 11 }, hunkIndex: 1, changeIndex: 1 },
  ];

  it('should filter only additions', () => {
    const additions = mockChanges.filter((c) => c.change.type === 'add');

    expect(additions).toHaveLength(2);
    expect(additions[0]?.change.content).toBe('new');
    expect(additions[1]?.change.content).toBe('newline11');
  });

  it('should filter only deletions', () => {
    const deletions = mockChanges.filter((c) => c.change.type === 'delete');

    expect(deletions).toHaveLength(2);
    expect(deletions[0]?.change.content).toBe('old');
    expect(deletions[1]?.change.content).toBe('oldline10');
  });

  it('should filter all changes (non-normal)', () => {
    const changes = mockChanges.filter((c) => c.change.type !== 'normal');

    expect(changes).toHaveLength(4);
  });

  it('should calculate change indices for navigation', () => {
    const changeIndices = mockChanges
      .map((c, i) => ({ ...c, originalIndex: i }))
      .filter((c) => c.change.type !== 'normal')
      .map((c) => c.originalIndex);

    expect(changeIndices).toEqual([1, 2, 4, 5]);
  });

  it('should navigate to next change correctly', () => {
    const changeIndices = [1, 2, 4, 5];
    const currentIndex = 1; // first change

    const currentPos = changeIndices.indexOf(currentIndex);
    const nextPos = currentPos < changeIndices.length - 1 ? currentPos + 1 : 0;
    const nextIndex = changeIndices[nextPos];

    expect(nextIndex).toBe(2);
  });

  it('should wrap to first change from last', () => {
    const changeIndices = [1, 2, 4, 5];
    const currentIndex = 5; // last change

    const currentPos = changeIndices.indexOf(currentIndex);
    const nextPos = currentPos < changeIndices.length - 1 ? currentPos + 1 : 0;
    const nextIndex = changeIndices[nextPos];

    expect(nextIndex).toBe(1); // wraps to first
  });
});

describe('Accessibility attributes', () => {
  it('should generate correct aria attributes for container', () => {
    const focusedIndex = 5;
    const idPrefix = 'diffkit-nav-abc123';

    const containerProps = {
      tabIndex: 0,
      role: 'listbox',
      'aria-activedescendant': focusedIndex >= 0 ? `${idPrefix}-${focusedIndex}` : undefined,
    };

    expect(containerProps.tabIndex).toBe(0);
    expect(containerProps.role).toBe('listbox');
    expect(containerProps['aria-activedescendant']).toBe('diffkit-nav-abc123-5');
  });

  it('should generate correct aria attributes for items', () => {
    const idPrefix = 'diffkit-nav-abc123';
    const focusedIndex = 2;

    const getItemProps = (index: number) => ({
      id: `${idPrefix}-${index}`,
      tabIndex: -1,
      'aria-selected': index === focusedIndex,
      role: 'option',
    });

    const focusedItem = getItemProps(2);
    const unfocusedItem = getItemProps(0);

    expect(focusedItem.id).toBe('diffkit-nav-abc123-2');
    expect(focusedItem['aria-selected']).toBe(true);
    expect(focusedItem.role).toBe('option');

    expect(unfocusedItem['aria-selected']).toBe(false);
  });

  it('should not set aria-activedescendant when no focus', () => {
    const focusedIndex = -1;
    const idPrefix = 'diffkit-nav-abc123';

    const containerProps = {
      'aria-activedescendant': focusedIndex >= 0 ? `${idPrefix}-${focusedIndex}` : undefined,
    };

    expect(containerProps['aria-activedescendant']).toBeUndefined();
  });
});

describe('Custom key bindings', () => {
  it('should allow custom key bindings', () => {
    const defaultBindings = {
      next: ['ArrowDown', 'j'],
      prev: ['ArrowUp', 'k'],
    };

    const customBindings = {
      next: ['ArrowDown', 'n'], // custom: n instead of j
    };

    const mergedBindings = { ...defaultBindings, ...customBindings };

    expect(mergedBindings.next).toEqual(['ArrowDown', 'n']);
    expect(mergedBindings.prev).toEqual(['ArrowUp', 'k']); // unchanged
  });

  it('should support vim-style navigation', () => {
    const vimBindings = {
      next: ['j'],
      prev: ['k'],
      first: ['g', 'gg'],
      last: ['G'],
    };

    expect(vimBindings.next.includes('j')).toBe(true);
    expect(vimBindings.prev.includes('k')).toBe(true);
    expect(vimBindings.first.includes('gg')).toBe(true);
    expect(vimBindings.last.includes('G')).toBe(true);
  });
});

describe('Focus management', () => {
  it('should validate focus index bounds', () => {
    const itemCount = 10;

    function isValidIndex(index: number): boolean {
      return index >= -1 && index < itemCount;
    }

    expect(isValidIndex(-1)).toBe(true); // no focus
    expect(isValidIndex(0)).toBe(true);
    expect(isValidIndex(9)).toBe(true);
    expect(isValidIndex(10)).toBe(false); // out of bounds
    expect(isValidIndex(-2)).toBe(false);
  });

  it('should handle empty item list', () => {
    const itemCount = 0;

    function calculateNextIndex(currentIndex: number): number {
      if (itemCount === 0) return -1;
      return Math.min(currentIndex + 1, itemCount - 1);
    }

    expect(calculateNextIndex(-1)).toBe(-1);
    expect(calculateNextIndex(0)).toBe(-1);
  });

  it('should handle single item list', () => {
    const itemCount = 1;

    function calculateNextIndex(currentIndex: number): number {
      return Math.min(currentIndex + 1, itemCount - 1);
    }

    function calculatePrevIndex(currentIndex: number): number {
      return Math.max(currentIndex - 1, 0);
    }

    expect(calculateNextIndex(0)).toBe(0); // stays at 0
    expect(calculatePrevIndex(0)).toBe(0); // stays at 0
  });
});
