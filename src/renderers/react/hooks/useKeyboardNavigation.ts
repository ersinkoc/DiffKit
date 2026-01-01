/**
 * Keyboard navigation hook for diff views
 * Provides accessible keyboard interactions for navigating diffs
 */

import { useCallback, useRef, useState, type RefObject } from 'react';
import type { Hunk, Change } from '../../../core/types.js';

/**
 * Navigation target types
 */
export type NavigationTarget = 'change' | 'hunk' | 'line';

/**
 * Navigation direction
 */
export type NavigationDirection = 'next' | 'prev' | 'first' | 'last';

/**
 * Keyboard navigation options
 */
export interface KeyboardNavigationOptions {
  /** Enable keyboard navigation */
  enabled?: boolean;
  /** Target elements to navigate between */
  target?: NavigationTarget;
  /** Callback when navigation occurs */
  onNavigate?: (index: number, element: Element | null) => void;
  /** Callback when Enter is pressed on an element */
  onSelect?: (index: number, element: Element | null) => void;
  /** Callback when Escape is pressed */
  onEscape?: () => void;
  /** Custom key bindings */
  keyBindings?: Partial<KeyBindings>;
}

/**
 * Key bindings configuration
 */
export interface KeyBindings {
  /** Key for next item (default: ArrowDown, j) */
  next: string[];
  /** Key for previous item (default: ArrowUp, k) */
  prev: string[];
  /** Key for first item (default: Home, gg) */
  first: string[];
  /** Key for last item (default: End, G) */
  last: string[];
  /** Key for selecting item (default: Enter, Space) */
  select: string[];
  /** Key for exiting (default: Escape) */
  escape: string[];
  /** Key for next hunk (default: n, ]) */
  nextHunk: string[];
  /** Key for previous hunk (default: p, [) */
  prevHunk: string[];
  /** Key for next change (default: c) */
  nextChange: string[];
  /** Key for previous change (default: C) */
  prevChange: string[];
}

/**
 * Default key bindings
 */
const defaultKeyBindings: KeyBindings = {
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

/**
 * Result from useKeyboardNavigation hook
 */
export interface KeyboardNavigationResult {
  /** Currently focused index */
  focusedIndex: number;
  /** Set the focused index */
  setFocusedIndex: (index: number) => void;
  /** Navigate to next item */
  navigateNext: () => void;
  /** Navigate to previous item */
  navigatePrev: () => void;
  /** Navigate to first item */
  navigateFirst: () => void;
  /** Navigate to last item */
  navigateLast: () => void;
  /** Container ref to attach to the scrollable container */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Props to spread on the container */
  containerProps: {
    tabIndex: number;
    role: string;
    'aria-activedescendant': string | undefined;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** Get props for a navigable item */
  getItemProps: (index: number) => {
    id: string;
    tabIndex: number;
    'aria-selected': boolean;
    role: string;
    onClick: () => void;
  };
}

/**
 * Hook for keyboard navigation in diff views
 */
export function useKeyboardNavigation(
  itemCount: number,
  options: KeyboardNavigationOptions = {}
): KeyboardNavigationResult {
  const {
    enabled = true,
    // target is reserved for future use (filtering by type)
    target: _target = 'change',
    onNavigate,
    onSelect,
    onEscape,
    keyBindings: customKeyBindings,
  } = options;
  void _target; // Reserved for future use

  const keyBindings = { ...defaultKeyBindings, ...customKeyBindings };
  const containerRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndexState] = useState(-1);
  const idPrefix = useRef(`diffkit-nav-${Math.random().toString(36).substr(2, 9)}`);

  // Set focused index and scroll into view
  const setFocusedIndex = useCallback(
    (index: number) => {
      if (index < -1 || index >= itemCount) return;

      setFocusedIndexState(index);

      if (index >= 0 && containerRef.current) {
        const element = containerRef.current.querySelector(`#${idPrefix.current}-${index}`);
        if (element) {
          element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          onNavigate?.(index, element);
        }
      }
    },
    [itemCount, onNavigate]
  );

  // Navigation functions
  const navigateNext = useCallback(() => {
    setFocusedIndex(Math.min(focusedIndex + 1, itemCount - 1));
  }, [focusedIndex, itemCount, setFocusedIndex]);

  const navigatePrev = useCallback(() => {
    setFocusedIndex(Math.max(focusedIndex - 1, 0));
  }, [focusedIndex, setFocusedIndex]);

  const navigateFirst = useCallback(() => {
    setFocusedIndex(0);
  }, [setFocusedIndex]);

  const navigateLast = useCallback(() => {
    setFocusedIndex(itemCount - 1);
  }, [itemCount, setFocusedIndex]);

  // Handle key press
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enabled) return;

      const key = e.key;

      // Check for key matches
      const matchesNext = keyBindings.next.includes(key);
      const matchesPrev = keyBindings.prev.includes(key);
      const matchesFirst = keyBindings.first.includes(key);
      const matchesLast = keyBindings.last.includes(key);
      const matchesSelect = keyBindings.select.includes(key);
      const matchesEscape = keyBindings.escape.includes(key);

      if (matchesNext) {
        e.preventDefault();
        navigateNext();
      } else if (matchesPrev) {
        e.preventDefault();
        navigatePrev();
      } else if (matchesFirst) {
        e.preventDefault();
        navigateFirst();
      } else if (matchesLast) {
        e.preventDefault();
        navigateLast();
      } else if (matchesSelect && focusedIndex >= 0) {
        e.preventDefault();
        const element = containerRef.current?.querySelector(`#${idPrefix.current}-${focusedIndex}`);
        onSelect?.(focusedIndex, element ?? null);
      } else if (matchesEscape) {
        e.preventDefault();
        setFocusedIndex(-1);
        onEscape?.();
      }
    },
    [
      enabled,
      keyBindings,
      focusedIndex,
      navigateNext,
      navigatePrev,
      navigateFirst,
      navigateLast,
      setFocusedIndex,
      onSelect,
      onEscape,
    ]
  );

  // Container props
  const containerProps = {
    tabIndex: enabled ? 0 : -1,
    role: 'listbox',
    'aria-activedescendant':
      focusedIndex >= 0 ? `${idPrefix.current}-${focusedIndex}` : undefined,
    onKeyDown: handleKeyDown,
  };

  // Get props for individual items
  const getItemProps = useCallback(
    (index: number) => ({
      id: `${idPrefix.current}-${index}`,
      tabIndex: -1,
      'aria-selected': index === focusedIndex,
      role: 'option',
      onClick: () => setFocusedIndex(index),
    }),
    [focusedIndex, setFocusedIndex]
  );

  return {
    focusedIndex,
    setFocusedIndex,
    navigateNext,
    navigatePrev,
    navigateFirst,
    navigateLast,
    containerRef,
    containerProps,
    getItemProps,
  };
}

/**
 * Options for hunk navigation
 */
export interface HunkNavigationOptions {
  /** Array of hunks to navigate */
  hunks: Hunk[];
  /** Callback when a hunk is focused */
  onHunkFocus?: (hunkIndex: number, hunk: Hunk) => void;
  /** Callback when a hunk is selected */
  onHunkSelect?: (hunkIndex: number, hunk: Hunk) => void;
}

/**
 * Result from useHunkNavigation hook
 */
export interface HunkNavigationResult {
  /** Currently focused hunk index */
  focusedHunkIndex: number;
  /** Navigate to next hunk */
  nextHunk: () => void;
  /** Navigate to previous hunk */
  prevHunk: () => void;
  /** Navigate to specific hunk */
  goToHunk: (index: number) => void;
  /** Keyboard handler for hunk navigation */
  handleHunkKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * Hook for navigating between hunks
 */
export function useHunkNavigation(options: HunkNavigationOptions): HunkNavigationResult {
  const { hunks, onHunkFocus, onHunkSelect } = options;
  const [focusedHunkIndex, setFocusedHunkIndex] = useState(-1);

  const goToHunk = useCallback(
    (index: number) => {
      if (index >= 0 && index < hunks.length) {
        setFocusedHunkIndex(index);
        onHunkFocus?.(index, hunks[index]!);
      }
    },
    [hunks, onHunkFocus]
  );

  const nextHunk = useCallback(() => {
    const nextIndex = focusedHunkIndex < hunks.length - 1 ? focusedHunkIndex + 1 : 0;
    goToHunk(nextIndex);
  }, [focusedHunkIndex, hunks.length, goToHunk]);

  const prevHunk = useCallback(() => {
    const prevIndex = focusedHunkIndex > 0 ? focusedHunkIndex - 1 : hunks.length - 1;
    goToHunk(prevIndex);
  }, [focusedHunkIndex, hunks.length, goToHunk]);

  const handleHunkKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const key = e.key;

      if (key === 'n' || key === ']') {
        e.preventDefault();
        nextHunk();
      } else if (key === 'p' || key === '[') {
        e.preventDefault();
        prevHunk();
      } else if (key === 'Enter' && focusedHunkIndex >= 0) {
        e.preventDefault();
        onHunkSelect?.(focusedHunkIndex, hunks[focusedHunkIndex]!);
      }
    },
    [nextHunk, prevHunk, focusedHunkIndex, hunks, onHunkSelect]
  );

  return {
    focusedHunkIndex,
    nextHunk,
    prevHunk,
    goToHunk,
    handleHunkKeyDown,
  };
}

/**
 * Options for change navigation
 */
export interface ChangeNavigationOptions {
  /** Flattened array of all changes */
  changes: Array<{ change: Change; hunkIndex: number; changeIndex: number }>;
  /** Filter to only additions */
  onlyAdditions?: boolean;
  /** Filter to only deletions */
  onlyDeletions?: boolean;
  /** Callback when a change is focused */
  onChangeFocus?: (index: number, change: Change) => void;
}

/**
 * Result from useChangeNavigation hook
 */
export interface ChangeNavigationResult {
  /** Currently focused change index */
  focusedChangeIndex: number;
  /** Navigate to next change */
  nextChange: () => void;
  /** Navigate to previous change */
  prevChange: () => void;
  /** Navigate to specific change */
  goToChange: (index: number) => void;
  /** Keyboard handler for change navigation */
  handleChangeKeyDown: (e: React.KeyboardEvent) => void;
}

/**
 * Hook for navigating between changes (additions/deletions)
 */
export function useChangeNavigation(options: ChangeNavigationOptions): ChangeNavigationResult {
  const { changes, onlyAdditions, onlyDeletions, onChangeFocus } = options;
  const [focusedChangeIndex, setFocusedChangeIndex] = useState(-1);

  // Filter changes based on options
  const filteredIndices = changes
    .map((c, i) => ({ ...c, originalIndex: i }))
    .filter((c) => {
      if (onlyAdditions) return c.change.type === 'add';
      if (onlyDeletions) return c.change.type === 'delete';
      return c.change.type !== 'normal';
    })
    .map((c) => c.originalIndex);

  const goToChange = useCallback(
    (index: number) => {
      if (index >= 0 && index < changes.length) {
        setFocusedChangeIndex(index);
        onChangeFocus?.(index, changes[index]!.change);
      }
    },
    [changes, onChangeFocus]
  );

  const nextChange = useCallback(() => {
    // Find next filtered change after current index
    const currentPos = filteredIndices.indexOf(focusedChangeIndex);
    const nextPos = currentPos < filteredIndices.length - 1 ? currentPos + 1 : 0;
    const nextIndex = filteredIndices[nextPos];
    if (nextIndex !== undefined) {
      goToChange(nextIndex);
    }
  }, [focusedChangeIndex, filteredIndices, goToChange]);

  const prevChange = useCallback(() => {
    // Find previous filtered change before current index
    const currentPos = filteredIndices.indexOf(focusedChangeIndex);
    const prevPos = currentPos > 0 ? currentPos - 1 : filteredIndices.length - 1;
    const prevIndex = filteredIndices[prevPos];
    if (prevIndex !== undefined) {
      goToChange(prevIndex);
    }
  }, [focusedChangeIndex, filteredIndices, goToChange]);

  const handleChangeKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const key = e.key;

      if (key === 'c') {
        e.preventDefault();
        nextChange();
      } else if (key === 'C') {
        e.preventDefault();
        prevChange();
      }
    },
    [nextChange, prevChange]
  );

  return {
    focusedChangeIndex,
    nextChange,
    prevChange,
    goToChange,
    handleChangeKeyDown,
  };
}

export default useKeyboardNavigation;
