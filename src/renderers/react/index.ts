/**
 * React components exports for DiffKit
 */

// Types
export * from './types.js';

// Components
export { DiffView } from './DiffView.js';
export { UnifiedView } from './UnifiedView.js';
export { SplitView } from './SplitView.js';
export { InlineView } from './InlineView.js';
export { DiffLine } from './DiffLine.js';
export { DiffHunk } from './DiffHunk.js';
export { LineNumber } from './LineNumber.js';
export { ThemeProvider } from './ThemeProvider.js';

// Virtualized components
export { VirtualizedUnifiedView } from './VirtualizedUnifiedView.js';
export {
  VirtualizedList,
  VirtualizedDiff,
  useFlattenedDiffLines,
  useScrollToLine,
  useFindLineIndex,
  type VirtualizedListProps,
  type VirtualizedDiffProps,
  type VirtualizedDiffLine,
} from './VirtualizedList.js';

// Hooks
export { useDiff, useDiffAsync } from './hooks/useDiff.js';
export { useTheme, useThemeValue, useThemeCSSVars, ThemeContext } from './hooks/useTheme.js';
export {
  useKeyboardNavigation,
  useHunkNavigation,
  useChangeNavigation,
  type KeyboardNavigationOptions,
  type KeyboardNavigationResult,
  type KeyBindings,
  type NavigationTarget,
  type NavigationDirection,
  type HunkNavigationOptions,
  type HunkNavigationResult,
  type ChangeNavigationOptions,
  type ChangeNavigationResult,
} from './hooks/useKeyboardNavigation.js';

export {
  useCollapsible,
  useHunkCollapse,
  type CollapsibleOptions,
  type CollapsibleResult,
  type CollapsibleState,
  type HunkCollapseOptions,
  type HunkCollapseResult,
} from './hooks/useCollapsible.js';

export {
  useCopyToClipboard,
  type CopyStatus,
  type CopyToClipboardOptions,
  type CopyToClipboardResult,
  type CopyHunkOptions,
} from './hooks/useCopyToClipboard.js';
