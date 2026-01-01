/**
 * React component types for DiffKit
 */

import type { CSSProperties, ReactNode } from 'react';
import type { Theme, Hunk, Change, DiffResult, AlgorithmType, GranularityType } from '../../core/types.js';

/**
 * Common props for diff view components
 */
export interface DiffViewProps {
  /** Old/original content */
  old: string;
  /** New/modified content */
  new: string;

  /** View mode */
  mode?: 'unified' | 'split' | 'inline';
  /** Programming language for syntax highlighting */
  language?: string;
  /** Show line numbers */
  lineNumbers?: boolean;
  /** Wrap long lines */
  wrapLines?: boolean;
  /** Highlight changed words/characters */
  highlightChanges?: boolean;
  /** Show hunk headers */
  showHeader?: boolean;

  /** Diff algorithm to use */
  algorithm?: AlgorithmType;
  /** Comparison granularity */
  granularity?: GranularityType;
  /** Number of context lines */
  context?: number;

  /** Theme name or object */
  theme?: Theme | string;

  /** Callback when a line is clicked */
  onLineClick?: (lineNumber: number, side: 'old' | 'new') => void;
  /** Callback when a hunk is clicked */
  onHunkClick?: (hunk: Hunk) => void;
  /** Callback when content is copied */
  onCopy?: (content: string) => void;

  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Props for unified view component
 */
export interface UnifiedViewProps extends Omit<DiffViewProps, 'mode'> {}

/**
 * Props for split view component
 */
export interface SplitViewProps extends Omit<DiffViewProps, 'mode'> {}

/**
 * Props for inline view component
 */
export interface InlineViewProps extends Omit<DiffViewProps, 'mode'> {}

/**
 * Props for individual diff line component
 */
export interface DiffLineProps {
  /** Change data */
  change: Change;
  /** View mode */
  mode: 'unified' | 'split' | 'inline';
  /** Show line numbers */
  lineNumbers?: boolean;
  /** Side for split view */
  side?: 'left' | 'right';
  /** Click handler */
  onClick?: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * Props for line number component
 */
export interface LineNumberProps {
  /** Line number to display */
  number?: number;
  /** Side (old or new) */
  side: 'old' | 'new';
  /** Click handler */
  onClick?: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * Props for hunk component
 */
export interface DiffHunkProps {
  /** Hunk data */
  hunk: Hunk;
  /** View mode */
  mode: 'unified' | 'split' | 'inline';
  /** Show line numbers */
  lineNumbers?: boolean;
  /** Show header */
  showHeader?: boolean;
  /** Line click handler */
  onLineClick?: (lineNumber: number, side: 'old' | 'new') => void;
  /** Hunk click handler */
  onClick?: () => void;
  /** Additional class name */
  className?: string;
}

/**
 * Props for theme provider
 */
export interface ThemeProviderProps {
  /** Theme to provide */
  theme: Theme | string;
  /** Children components */
  children: ReactNode;
}

/**
 * Theme context value
 */
export interface ThemeContextValue {
  /** Current theme */
  theme: Theme;
  /** Update theme */
  setTheme: (theme: Theme | string) => void;
  /** CSS variables for current theme */
  cssVars: Record<string, string>;
}

/**
 * Diff computation hook result
 */
export interface UseDiffResult {
  /** Computed diff result */
  result: DiffResult | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: Error | null;
}

/**
 * Theme hook result
 */
export interface UseThemeResult extends ThemeContextValue {}
