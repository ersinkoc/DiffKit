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
} from './types.js';
import { getAlgorithm } from './algorithms/index.js';
import { getLines } from './parser.js';
import { generateHunks, hunksToUnifiedString } from './hunk.js';
import { calculateStats } from './stats.js';

/**
 * Default engine options
 */
const defaultOptions: Required<Omit<DiffEngineOptions, 'theme' | 'plugins'>> = {
  algorithm: 'myers',
  granularity: 'line',
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
 * Main DiffEngine class
 */
export class DiffEngine implements DiffEngineInterface {
  private algorithm: AlgorithmType;
  private granularity: GranularityType;
  private context: number;
  private theme?: Theme | string;
  private plugins: DiffPlugin[] = [];

  constructor(options: DiffEngineOptions = {}) {
    this.algorithm = options.algorithm ?? defaultOptions.algorithm;
    this.granularity = options.granularity ?? defaultOptions.granularity;
    this.context = options.context ?? defaultOptions.context;
    this.theme = options.theme;

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

    // Get lines based on granularity
    const oldLines = getLines(processedOld);
    const newLines = getLines(processedNew);

    // Run diff algorithm
    const algorithm = getAlgorithm(this.algorithm);
    const operations = algorithm.diff(oldLines, newLines);

    // Generate hunks
    const hunks = generateHunks(operations, oldLines, newLines, this.context);

    // Calculate stats
    const stats = calculateStats(operations, oldLines, newLines);

    // Create result
    let result = createDiffResult(hunks, stats, oldContent, newContent, {
      algorithm: this.algorithm,
      granularity: this.granularity,
      context: this.context,
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
 * Factory function for creating diffs
 */
export function createDiff(
  oldContent: string,
  newContent: string,
  options?: DiffOptions
): DiffResult {
  const engine = new DiffEngine({
    algorithm: options?.algorithm,
    granularity: options?.granularity,
    context: options?.context,
  });

  return engine.diff(oldContent, newContent);
}

export default DiffEngine;
