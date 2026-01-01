/**
 * @oxog/diffkit
 * Universal diff toolkit with zero dependencies — compare anything, customize everything
 */

// Core types
export type {
  AlgorithmType,
  GranularityType,
  ChangeType,
  OperationType,
  WhitespaceMode,
  Token,
  ParsedContent,
  ParserOptions,
  DiffOperation,
  Change,
  Hunk,
  DiffStats,
  DiffOptions,
  DiffJSON,
  HTMLRendererOptions,
  DiffAlgorithm,
  DiffResult,
  DiffEngineOptions,
  DiffPlugin,
  ThemeColors,
  SyntaxColors,
  ThemeFonts,
  ThemeSpacing,
  ThemeBorders,
  Theme,
  CreateThemeOptions,
  DiffEngineInterface,
} from './core/types.js';

// Core engine
export { DiffEngine, createDiff } from './core/diff-engine.js';

// Algorithms
export {
  myersAlgorithm,
  patienceAlgorithm,
  histogramAlgorithm,
  getAlgorithm,
  listAlgorithms,
} from './core/algorithms/index.js';

// Parser
export { parse, splitLines, normalizeContent, getLines, getUnits, joinUnits } from './core/parser.js';

// Hunk utilities
export {
  generateHunks,
  formatHunkHeader,
  hunksToUnifiedString,
  parseUnifiedDiff,
} from './core/hunk.js';

// Unified diff/patch parser (full-featured)
export type { ParsedUnifiedDiff, FileDiff, ParsedPatch } from './core/unified-parser.js';
export {
  parseUnifiedDiffFull,
  parsePatch,
  isValidUnifiedDiff,
  extractChanges,
  reverseDiff,
  applyDiff,
} from './core/unified-parser.js';

// Stats
export {
  calculateStats,
  calculateStatsFromHunks,
  calculateHunkStats,
  calculateWordStats,
  calculateSimilarity,
  formatStats,
  formatDetailedStats,
} from './core/stats.js';

// Word-level diff
export {
  diffWords,
  diffLinePair,
  findLinePairs,
  enhanceChangesWithWordDiff,
  segmentsToHtml,
  type DiffSegment,
  type WordDiffResult,
  type WordDiffOptions,
  type LinePair,
  type EnhancedChange,
} from './core/word-diff.js';

// Renderers
export {
  HTMLRenderer,
  createHTMLRenderer,
  renderToHTML,
  renderUnified,
  renderSplit,
  renderInline,
} from './renderers/html/index.js';

// Themes
export {
  createTheme,
  validateTheme,
  cloneTheme,
  generateCSSVars,
  cssVarsToString,
  applyCSSVars,
  generateStylesheet,
  githubDark,
  githubLight,
  vscodeDark,
  vscodeLight,
  monokai,
  themes,
  getTheme,
  listThemes,
  defaultTheme,
} from './themes/index.js';

// Plugins
export {
  pluginRegistry,
  registerPlugin,
  getPlugin,
  listPlugins,
  syntaxPlugin,
  htmlDomPlugin,
  htmlTextPlugin,
  markdownPlugin,
} from './plugins/index.js';

// Utilities
export {
  hash,
  hashToHex,
  escapeHtml,
  unescapeHtml,
  deepMerge,
  deepClone,
} from './utils/index.js';
