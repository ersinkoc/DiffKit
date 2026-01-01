/**
 * Collapsible hunks hook
 *
 * Provides state management for collapsing/expanding hunks in diff views.
 */

import { useState, useCallback, useMemo } from 'react';
import type { Hunk } from '../../../core/types.js';

/**
 * Collapse state for hunks
 */
export type CollapseState = 'collapsed' | 'expanded' | 'auto';

/**
 * Options for collapsible hunks
 */
export interface CollapsibleOptions {
  /** Initial state for all hunks */
  defaultState?: CollapseState;
  /** Auto-collapse hunks larger than this many lines */
  autoCollapseThreshold?: number;
  /** Remember collapsed state between re-renders */
  persistent?: boolean;
  /** Callback when collapse state changes */
  onChange?: (hunkIndex: number, isCollapsed: boolean) => void;
}

/**
 * Result from useCollapsible hook
 */
export interface CollapsibleResult {
  /** Check if a hunk is collapsed */
  isCollapsed: (hunkIndex: number) => boolean;
  /** Toggle a hunk's collapsed state */
  toggle: (hunkIndex: number) => void;
  /** Expand a specific hunk */
  expand: (hunkIndex: number) => void;
  /** Collapse a specific hunk */
  collapse: (hunkIndex: number) => void;
  /** Expand all hunks */
  expandAll: () => void;
  /** Collapse all hunks */
  collapseAll: () => void;
  /** Get the number of collapsed hunks */
  collapsedCount: number;
  /** Get the number of expanded hunks */
  expandedCount: number;
}

/**
 * Hook for managing collapsible hunks
 */
export function useCollapsible(
  hunks: Hunk[],
  options: CollapsibleOptions = {}
): CollapsibleResult {
  const {
    defaultState = 'expanded',
    autoCollapseThreshold = 50,
    onChange,
  } = options;

  // Calculate initial state based on options
  const initialState = useMemo(() => {
    const state = new Map<number, boolean>();

    hunks.forEach((hunk, index) => {
      if (defaultState === 'collapsed') {
        state.set(index, true);
      } else if (defaultState === 'auto') {
        // Auto-collapse large hunks
        const lineCount = hunk.changes.length;
        state.set(index, lineCount > autoCollapseThreshold);
      } else {
        state.set(index, false);
      }
    });

    return state;
  }, [hunks.length, defaultState, autoCollapseThreshold]);

  const [collapsedState, setCollapsedState] = useState<Map<number, boolean>>(initialState);

  const isCollapsed = useCallback(
    (hunkIndex: number): boolean => {
      return collapsedState.get(hunkIndex) ?? false;
    },
    [collapsedState]
  );

  const toggle = useCallback(
    (hunkIndex: number) => {
      setCollapsedState((prev) => {
        const newState = new Map(prev);
        const currentlyCollapsed = prev.get(hunkIndex) ?? false;
        newState.set(hunkIndex, !currentlyCollapsed);
        onChange?.(hunkIndex, !currentlyCollapsed);
        return newState;
      });
    },
    [onChange]
  );

  const expand = useCallback(
    (hunkIndex: number) => {
      setCollapsedState((prev) => {
        if (!prev.get(hunkIndex)) return prev;
        const newState = new Map(prev);
        newState.set(hunkIndex, false);
        onChange?.(hunkIndex, false);
        return newState;
      });
    },
    [onChange]
  );

  const collapse = useCallback(
    (hunkIndex: number) => {
      setCollapsedState((prev) => {
        if (prev.get(hunkIndex)) return prev;
        const newState = new Map(prev);
        newState.set(hunkIndex, true);
        onChange?.(hunkIndex, true);
        return newState;
      });
    },
    [onChange]
  );

  const expandAll = useCallback(() => {
    setCollapsedState((prev) => {
      const newState = new Map(prev);
      for (const key of newState.keys()) {
        newState.set(key, false);
        onChange?.(key, false);
      }
      return newState;
    });
  }, [onChange]);

  const collapseAll = useCallback(() => {
    setCollapsedState((prev) => {
      const newState = new Map(prev);
      for (const key of newState.keys()) {
        newState.set(key, true);
        onChange?.(key, true);
      }
      return newState;
    });
  }, [onChange]);

  const collapsedCount = useMemo(() => {
    let count = 0;
    collapsedState.forEach((isCollapsed) => {
      if (isCollapsed) count++;
    });
    return count;
  }, [collapsedState]);

  const expandedCount = useMemo(() => {
    return hunks.length - collapsedCount;
  }, [hunks.length, collapsedCount]);

  return {
    isCollapsed,
    toggle,
    expand,
    collapse,
    expandAll,
    collapseAll,
    collapsedCount,
    expandedCount,
  };
}

/**
 * State type for external use
 */
export type CollapsibleState = CollapseState;

/**
 * Options for single hunk collapse
 */
export interface HunkCollapseOptions {
  /** Initial collapsed state */
  initialCollapsed?: boolean;
  /** Callback when state changes */
  onChange?: (isCollapsed: boolean) => void;
}

/**
 * Result from useHunkCollapse hook
 */
export interface HunkCollapseResult {
  /** Current collapsed state */
  isCollapsed: boolean;
  /** Toggle collapsed state */
  toggle: () => void;
  /** Expand the hunk */
  expand: () => void;
  /** Collapse the hunk */
  collapse: () => void;
}

/**
 * Simple hook for managing a single hunk's collapse state
 */
export function useHunkCollapse(
  options: HunkCollapseOptions = {}
): HunkCollapseResult {
  const { initialCollapsed = false, onChange } = options;
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      onChange?.(newValue);
      return newValue;
    });
  }, [onChange]);

  const expand = useCallback(() => {
    if (isCollapsed) {
      setIsCollapsed(false);
      onChange?.(false);
    }
  }, [isCollapsed, onChange]);

  const collapse = useCallback(() => {
    if (!isCollapsed) {
      setIsCollapsed(true);
      onChange?.(true);
    }
  }, [isCollapsed, onChange]);

  return {
    isCollapsed,
    toggle,
    expand,
    collapse,
  };
}

export default useCollapsible;
