/**
 * React hooks exports
 */

export { useDiff, useDiffAsync } from './useDiff.js';
export { useTheme, useThemeValue, useThemeCSSVars, ThemeContext } from './useTheme.js';
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
} from './useKeyboardNavigation.js';

export {
  useCollapsible,
  useHunkCollapse,
  type CollapsibleOptions,
  type CollapsibleResult,
  type CollapsibleState,
  type HunkCollapseOptions,
  type HunkCollapseResult,
} from './useCollapsible.js';

export {
  useCopyToClipboard,
  type CopyStatus,
  type CopyToClipboardOptions,
  type CopyToClipboardResult,
  type CopyHunkOptions,
} from './useCopyToClipboard.js';
