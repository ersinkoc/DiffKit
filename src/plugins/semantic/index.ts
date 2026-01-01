/**
 * Semantic Diff Plugin
 *
 * Provides semantic diffing for structured data formats like JSON and YAML.
 */

import type { DiffPlugin, DiffEngineInterface, DiffResult } from '../../core/types.js';
import {
  diffJson,
  diffJsonStrings,
  formatJsonChanges,
  type JsonChange,
  type JsonDiffResult,
  type JsonDiffOptions,
} from './json-differ.js';
import {
  diffYaml,
  parseYaml,
  formatYamlChanges,
  type YamlDiffOptions,
} from './yaml-differ.js';

// Re-export all types and functions
export {
  diffJson,
  diffJsonStrings,
  formatJsonChanges,
  diffYaml,
  parseYaml,
  formatYamlChanges,
  type JsonChange,
  type JsonDiffResult,
  type JsonDiffOptions,
  type YamlDiffOptions,
};

/**
 * Options for semantic diff plugin
 */
export interface SemanticDiffOptions {
  /** Format to use (auto-detect if not specified) */
  format?: 'json' | 'yaml' | 'auto';
  /** JSON/YAML diff options */
  diffOptions?: JsonDiffOptions;
}

/**
 * Create a semantic diff plugin
 */
export function semanticDiffPlugin(options: SemanticDiffOptions = {}): DiffPlugin {
  const { format = 'auto', diffOptions = {} } = options;

  let detectedFormat: 'json' | 'yaml' | 'text' = 'text';

  return {
    name: 'semantic-diff',
    version: '1.0.0',

    onInit(_engine: DiffEngineInterface): void {
      // Plugin initialized
    },

    onBeforeDiff(content: string): string {
      // Try to detect format
      const trimmed = content.trim();

      if (format === 'json' || (format === 'auto' && isLikelyJson(trimmed))) {
        detectedFormat = 'json';
      } else if (format === 'yaml' || (format === 'auto' && isLikelyYaml(trimmed))) {
        detectedFormat = 'yaml';
      } else {
        detectedFormat = 'text';
      }

      return content;
    },

    onAfterDiff(result: DiffResult): DiffResult {
      // Add semantic diff information to the result
      if (detectedFormat === 'text') {
        return result;
      }

      try {
        let semanticResult: JsonDiffResult;

        if (detectedFormat === 'json') {
          semanticResult = diffJsonStrings(result.oldContent, result.newContent, diffOptions);
        } else {
          semanticResult = diffYaml(result.oldContent, result.newContent, diffOptions);
        }

        // Attach semantic diff result to the result object
        return {
          ...result,
          // Add semantic diff info (extending the result)
          toJSON() {
            return {
              ...result.toJSON(),
              semantic: {
                format: detectedFormat,
                changes: semanticResult.changes,
                stats: semanticResult.stats,
              },
            };
          },
        };
      } catch {
        // If parsing fails, return original result
        return result;
      }
    },
  };
}

/**
 * Check if content is likely JSON
 */
function isLikelyJson(content: string): boolean {
  const trimmed = content.trim();
  return (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'))
  );
}

/**
 * Check if content is likely YAML
 */
function isLikelyYaml(content: string): boolean {
  const lines = content.split('\n');
  let yamlIndicators = 0;

  for (const line of lines.slice(0, 10)) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (trimmed === '' || trimmed.startsWith('#')) continue;

    // YAML document markers
    if (trimmed === '---' || trimmed === '...') {
      yamlIndicators += 2;
      continue;
    }

    // Key: value pattern (not in quotes)
    if (/^[a-zA-Z_][a-zA-Z0-9_]*:\s/.test(trimmed)) {
      yamlIndicators++;
    }

    // Array item
    if (trimmed.startsWith('- ')) {
      yamlIndicators++;
    }
  }

  return yamlIndicators >= 2;
}

/**
 * Utility function to get semantic diff for JSON content
 */
export function getJsonSemanticDiff(
  oldContent: string,
  newContent: string,
  options?: JsonDiffOptions
): JsonDiffResult {
  return diffJsonStrings(oldContent, newContent, options);
}

/**
 * Utility function to get semantic diff for YAML content
 */
export function getYamlSemanticDiff(
  oldContent: string,
  newContent: string,
  options?: YamlDiffOptions
): JsonDiffResult {
  return diffYaml(oldContent, newContent, options);
}

export default semanticDiffPlugin;
