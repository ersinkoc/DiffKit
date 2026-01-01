/**
 * Core type definitions for DiffKit
 */

// Algorithm types
export type AlgorithmType = 'myers' | 'patience' | 'histogram';
export type GranularityType = 'line' | 'word' | 'char';
export type ChangeType = 'add' | 'delete' | 'normal';
export type OperationType = 'equal' | 'insert' | 'delete';

/**
 * Token representation for parsed content
 */
export interface Token {
  value: string;
  line: number;
  column: number;
  type?: string;
}

/**
 * Parsed content result
 */
export interface ParsedContent {
  tokens: Token[];
  lineMap: Map<number, Token[]>;
}

/**
 * Parser configuration options
 */
export interface ParserOptions {
  granularity: GranularityType;
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  trimLines?: boolean;
}

/**
 * Single diff operation from algorithm
 */
export interface DiffOperation {
  type: OperationType;
  oldStart: number;
  oldEnd: number;
  newStart: number;
  newEnd: number;
  lines: string[];
}

/**
 * Single change within a hunk
 */
export interface Change {
  type: ChangeType;
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
  tokens?: Token[];
}

/**
 * A hunk represents a contiguous block of changes
 */
export interface Hunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  changes: Change[];
  header: string;
}

/**
 * Statistics about the diff
 */
export interface DiffStats {
  additions: number;
  deletions: number;
  changes: number;
  oldLineCount: number;
  newLineCount: number;
}

/**
 * Main diff options
 */
export interface DiffOptions {
  algorithm?: AlgorithmType;
  granularity?: GranularityType;
  context?: number;
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
}

/**
 * JSON representation of diff result
 */
export interface DiffJSON {
  hunks: Hunk[];
  stats: DiffStats;
  options: DiffOptions;
}

/**
 * HTML renderer configuration
 */
export interface HTMLRendererOptions {
  mode?: 'unified' | 'split' | 'inline';
  theme?: string;
  lineNumbers?: boolean;
  wrapLines?: boolean;
  highlightSyntax?: boolean;
}

/**
 * Diff algorithm interface
 */
export interface DiffAlgorithm {
  name: string;
  diff(oldLines: string[], newLines: string[]): DiffOperation[];
}

/**
 * Main diff result interface
 */
export interface DiffResult {
  hunks: Hunk[];
  stats: DiffStats;
  oldContent: string;
  newContent: string;
  options: DiffOptions;
  toJSON(): DiffJSON;
  toUnifiedString(): string;
  toHTML(options?: HTMLRendererOptions): string;
}

/**
 * Diff engine configuration options
 */
export interface DiffEngineOptions {
  algorithm?: AlgorithmType;
  granularity?: GranularityType;
  context?: number;
  theme?: Theme | string;
  plugins?: DiffPlugin[];
}

/**
 * Plugin interface for extending diff functionality
 */
export interface DiffPlugin {
  name: string;
  version: string;
  onInit?(engine: DiffEngineInterface): void;
  onBeforeDiff?(content: string): string;
  onAfterDiff?(result: DiffResult): DiffResult;
  onBeforeRender?(hunks: Hunk[]): Hunk[];
  onAfterRender?(output: string): string;
  tokenize?(content: string, language?: string): Token[];
  parse?(content: string): ParsedContent;
}

/**
 * Theme color definitions
 */
export interface ThemeColors {
  background: string;
  gutterBackground: string;
  headerBackground: string;
  addedBackground: string;
  addedGutterBackground: string;
  addedText: string;
  addedHighlight: string;
  deletedBackground: string;
  deletedGutterBackground: string;
  deletedText: string;
  deletedHighlight: string;
  modifiedBackground: string;
  modifiedText: string;
  unchangedText: string;
  lineNumber: string;
  lineNumberActive: string;
  border: string;
  hunkBorder: string;
  syntax: SyntaxColors;
}

/**
 * Syntax highlighting colors
 */
export interface SyntaxColors {
  keyword: string;
  string: string;
  number: string;
  comment: string;
  function: string;
  variable: string;
  operator: string;
  punctuation: string;
  tag: string;
  attribute: string;
  property: string;
  className: string;
  regexp: string;
}

/**
 * Theme font settings
 */
export interface ThemeFonts {
  family: string;
  size: string;
  lineHeight: string | number;
}

/**
 * Theme spacing settings
 */
export interface ThemeSpacing {
  gutterWidth: string;
  lineNumberPadding: string;
  contentPadding: string;
  hunkGap: string;
}

/**
 * Theme border settings
 */
export interface ThemeBorders {
  radius: string;
  width: string;
}

/**
 * Complete theme definition
 */
export interface Theme {
  name: string;
  type: 'light' | 'dark';
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: ThemeSpacing;
  borders: ThemeBorders;
}

/**
 * Theme creation options
 */
export interface CreateThemeOptions {
  name: string;
  extends?: string;
  type?: 'light' | 'dark';
  colors?: Partial<ThemeColors>;
  fonts?: Partial<ThemeFonts>;
  spacing?: Partial<ThemeSpacing>;
  borders?: Partial<ThemeBorders>;
}

/**
 * Diff engine interface
 */
export interface DiffEngineInterface {
  use(plugin: DiffPlugin): DiffEngineInterface;
  diff(oldContent: string, newContent: string): DiffResult;
  setAlgorithm(algorithm: AlgorithmType): DiffEngineInterface;
  setGranularity(granularity: GranularityType): DiffEngineInterface;
  setTheme(theme: Theme | string): DiffEngineInterface;
  getPlugins(): DiffPlugin[];
  getTheme(): Theme | undefined;
}
