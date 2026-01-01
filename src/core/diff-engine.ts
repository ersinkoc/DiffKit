/**
 * Main DiffEngine class for DiffKit
 */

import type {
  DiffEngineOptions,
  DiffEngineInterface,
  DiffResult,
  DiffOptions,
  DiffPlugin,
  Hunk,
  DiffStats,
  DiffJSON,
  AlgorithmType,
  GranularityType,
  Theme,
  HTMLRendererOptions,
  WhitespaceMode,
} from './types.js';
import { getAlgorithm } from './algorithms/index.js';
import { getLines } from './parser.js';
import { generateHunks, hunksToUnifiedString } from './hunk.js';
import { calculateStats } from './stats.js';

/**
 * Default engine options
 */
const defaultOptions = {
  algorithm: 'myers' as const,
  granularity: 'line' as const,
  context: 3,
};

/**
 * Create a diff result object
 */
function createDiffResult(
  hunks: Hunk[],
  stats: DiffStats,
  oldContent: string,
  newContent: string,
  options: DiffOptions
): DiffResult {
  return {
    hunks,
    stats,
    oldContent,
    newContent,
    options,

    toJSON(): DiffJSON {
      return {
        hunks: this.hunks,
        stats: this.stats,
        options: this.options,
      };
    },

    toUnifiedString(): string {
      return hunksToUnifiedString(this.hunks);
    },

    toHTML(_renderOptions?: HTMLRendererOptions): string {
      // Basic HTML rendering - full implementation in renderers
      const lines: string[] = ['<div class="diffkit-diff">'];

      for (const hunk of this.hunks) {
        lines.push(`<div class="diffkit-hunk">`);
        lines.push(`<div class="diffkit-hunk-header">${escapeHtml(hunk.header)}</div>`);

        for (const change of hunk.changes) {
          const typeClass = `diffkit-${change.type}`;
          const prefix = change.type === 'add' ? '+' : change.type === 'delete' ? '-' : ' ';
          lines.push(
            `<div class="${typeClass}"><span class="diffkit-prefix">${prefix}</span>${escapeHtml(change.content)}</div>`
          );
        }

        lines.push(`</div>`);
      }

      lines.push('</div>');
      return lines.join('\n');
    },
  };
}

/**
 * Escape HTML special characters
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Normalize line for comparison based on options
 */
function normalizeLine(
  line: string,
  options: {
    ignoreWhitespace?: boolean | WhitespaceMode;
    ignoreCase?: boolean;
    trimLines?: boolean;
  }
): string {
  let normalized = line;

  // Handle whitespace normalization
  if (options.ignoreWhitespace === true || options.ignoreWhitespace === 'ignore') {
    // Remove all whitespace
    normalized = normalized.replace(/\s+/g, '');
  } else if (options.ignoreWhitespace === 'leading') {
    normalized = normalized.replace(/^\s+/, '');
  } else if (options.ignoreWhitespace === 'trailing') {
    normalized = normalized.replace(/\s+$/, '');
  } else if (options.ignoreWhitespace === 'collapse') {
    // Collapse multiple whitespace to single space
    normalized = normalized.replace(/\s+/g, ' ');
  } else if (options.ignoreWhitespace === 'all') {
    // Remove all whitespace
    normalized = normalized.replace(/\s+/g, '');
  }

  // Handle trim (only if not already handled by whitespace options)
  if (options.trimLines && !options.ignoreWhitespace) {
    normalized = normalized.trim();
  }

  // Handle case insensitivity
  if (options.ignoreCase) {
    normalized = normalized.toLowerCase();
  }

  return normalized;
}

/**
 * Main DiffEngine class
 */
export class DiffEngine implements DiffEngineInterface {
  private algorithm: AlgorithmType;
  private granularity: GranularityType;
  private context: number;
  private theme?: Theme | string;
  private plugins: DiffPlugin[] = [];
  private ignoreWhitespace?: boolean | WhitespaceMode;
  private ignoreCase?: boolean;
  private trimLines?: boolean;
  private ignoreBlankLines?: boolean;

  constructor(options: DiffEngineOptions = {}) {
    this.algorithm = options.algorithm ?? defaultOptions.algorithm;
    this.granularity = options.granularity ?? defaultOptions.granularity;
    this.context = options.context ?? defaultOptions.context;
    this.theme = options.theme;
    this.ignoreWhitespace = options.ignoreWhitespace;
    this.ignoreCase = options.ignoreCase;
    this.trimLines = options.trimLines;
    this.ignoreBlankLines = options.ignoreBlankLines;

    if (options.plugins) {
      for (const plugin of options.plugins) {
        this.use(plugin);
      }
    }
  }

  /**
   * Register a plugin
   */
  use(plugin: DiffPlugin): this {
    this.plugins.push(plugin);

    if (plugin.onInit) {
      plugin.onInit(this);
    }

    return this;
  }

  /**
   * Perform diff between two strings
   */
  diff(oldContent: string, newContent: string): DiffResult {
    // Apply onBeforeDiff hooks
    let processedOld = oldContent;
    let processedNew = newContent;

    for (const plugin of this.plugins) {
      if (plugin.onBeforeDiff) {
        processedOld = plugin.onBeforeDiff(processedOld);
        processedNew = plugin.onBeforeDiff(processedNew);
      }
    }

    // Get original lines (for display)
    const oldLines = getLines(processedOld);
    const newLines = getLines(processedNew);

    // Get normalized lines (for comparison)
    const normOptions = {
      ignoreWhitespace: this.ignoreWhitespace,
      ignoreCase: this.ignoreCase,
      trimLines: this.trimLines,
    };

    let oldLinesNorm = oldLines.map((line) => normalizeLine(line, normOptions));
    let newLinesNorm = newLines.map((line) => normalizeLine(line, normOptions));

    // Filter blank lines if needed
    let oldLineIndices: number[] | undefined;
    let newLineIndices: number[] | undefined;

    if (this.ignoreBlankLines) {
      oldLineIndices = [];
      newLineIndices = [];
      const filteredOld: string[] = [];
      const filteredNew: string[] = [];

      for (let i = 0; i < oldLinesNorm.length; i++) {
        if (oldLinesNorm[i]?.trim() !== '') {
          oldLineIndices.push(i);
          filteredOld.push(oldLinesNorm[i]!);
        }
      }

      for (let i = 0; i < newLinesNorm.length; i++) {
        if (newLinesNorm[i]?.trim() !== '') {
          newLineIndices.push(i);
          filteredNew.push(newLinesNorm[i]!);
        }
      }

      oldLinesNorm = filteredOld;
      newLinesNorm = filteredNew;
    }

    // Run diff algorithm on normalized lines
    const algorithm = getAlgorithm(this.algorithm);
    const operations = algorithm.diff(oldLinesNorm, newLinesNorm);

    // Generate hunks using original lines (for correct display)
    // But map the operations back to original line indices if we filtered blank lines
    const hunks = generateHunks(operations, oldLines, newLines, this.context);

    // Calculate stats
    const stats = calculateStats(operations, oldLines, newLines);

    // Create result with options
    let result = createDiffResult(hunks, stats, oldContent, newContent, {
      algorithm: this.algorithm,
      granularity: this.granularity,
      context: this.context,
      ignoreWhitespace: this.ignoreWhitespace === true ||
        (typeof this.ignoreWhitespace === 'string' && this.ignoreWhitespace !== 'all'),
      ignoreCase: this.ignoreCase,
    });

    // Apply onAfterDiff hooks
    for (const plugin of this.plugins) {
      if (plugin.onAfterDiff) {
        result = plugin.onAfterDiff(result);
      }
    }

    return result;
  }

  /**
   * Set the diff algorithm
   */
  setAlgorithm(algorithm: AlgorithmType): this {
    this.algorithm = algorithm;
    return this;
  }

  /**
   * Set the granularity
   */
  setGranularity(granularity: GranularityType): this {
    this.granularity = granularity;
    return this;
  }

  /**
   * Set the theme
   */
  setTheme(theme: Theme | string): this {
    this.theme = theme;
    return this;
  }

  /**
   * Get registered plugins
   */
  getPlugins(): DiffPlugin[] {
    return [...this.plugins];
  }

  /**
   * Get current theme
   */
  getTheme(): Theme | undefined {
    if (typeof this.theme === 'string') {
      return undefined; // Would need theme registry
    }
    return this.theme;
  }
}

/**
 * Extended options for createDiff that includes comparison options
 */
interface CreateDiffOptions {
  algorithm?: AlgorithmType;
  granularity?: GranularityType;
  context?: number;
  ignoreWhitespace?: boolean | WhitespaceMode;
  ignoreCase?: boolean;
  trimLines?: boolean;
  ignoreBlankLines?: boolean;
}

/**
 * Factory function for creating diffs
 */
export function createDiff(
  oldContent: string,
  newContent: string,
  options?: CreateDiffOptions
): DiffResult {
  const engine = new DiffEngine({
    algorithm: options?.algorithm,
    granularity: options?.granularity,
    context: options?.context,
    ignoreWhitespace: options?.ignoreWhitespace,
    ignoreCase: options?.ignoreCase,
    trimLines: options?.trimLines,
    ignoreBlankLines: options?.ignoreBlankLines,
  });

  return engine.diff(oldContent, newContent);
}

export default DiffEngine;
