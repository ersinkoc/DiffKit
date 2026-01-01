/**
 * Diff statistics calculator for DiffKit
 */

import type { DiffStats, DiffOperation, Hunk, Change } from './types.js';

/**
 * Calculate statistics from diff operations
 */
export function calculateStats(
  operations: DiffOperation[],
  oldLines: string[],
  newLines: string[]
): DiffStats {
  let additions = 0;
  let deletions = 0;

  for (const op of operations) {
    switch (op.type) {
      case 'insert':
        additions += op.lines.length;
        break;
      case 'delete':
        deletions += op.lines.length;
        break;
    }
  }

  return {
    additions,
    deletions,
    changes: additions + deletions,
    oldLineCount: oldLines.length,
    newLineCount: newLines.length,
  };
}

/**
 * Calculate statistics from hunks
 */
export function calculateStatsFromHunks(hunks: Hunk[]): DiffStats {
  let additions = 0;
  let deletions = 0;
  let oldLineCount = 0;
  let newLineCount = 0;

  for (const hunk of hunks) {
    for (const change of hunk.changes) {
      switch (change.type) {
        case 'add':
          additions++;
          break;
        case 'delete':
          deletions++;
          break;
      }
    }

    // Track max line numbers
    if (hunk.oldStart + hunk.oldLines - 1 > oldLineCount) {
      oldLineCount = hunk.oldStart + hunk.oldLines - 1;
    }
    if (hunk.newStart + hunk.newLines - 1 > newLineCount) {
      newLineCount = hunk.newStart + hunk.newLines - 1;
    }
  }

  return {
    additions,
    deletions,
    changes: additions + deletions,
    oldLineCount,
    newLineCount,
  };
}

/**
 * Calculate statistics for a single hunk
 */
export function calculateHunkStats(hunk: Hunk): { additions: number; deletions: number } {
  let additions = 0;
  let deletions = 0;

  for (const change of hunk.changes) {
    if (change.type === 'add') {
      additions++;
    } else if (change.type === 'delete') {
      deletions++;
    }
  }

  return { additions, deletions };
}

/**
 * Calculate word-level statistics for inline diff
 */
export function calculateWordStats(changes: Change[]): {
  addedWords: number;
  deletedWords: number;
  totalWords: number;
} {
  let addedWords = 0;
  let deletedWords = 0;
  let totalWords = 0;

  for (const change of changes) {
    const words = countWords(change.content);
    totalWords += words;

    if (change.type === 'add') {
      addedWords += words;
    } else if (change.type === 'delete') {
      deletedWords += words;
    }
  }

  return { addedWords, deletedWords, totalWords };
}

/**
 * Count words in a string
 */
function countWords(text: string): number {
  const words = text.trim().split(/\s+/);
  return words.length > 0 && words[0] !== '' ? words.length : 0;
}

/**
 * Calculate similarity percentage between old and new content
 */
export function calculateSimilarity(stats: DiffStats): number {
  const maxLines = Math.max(stats.oldLineCount, stats.newLineCount);

  if (maxLines === 0) {
    return 100; // Two empty files are 100% similar
  }

  const unchanged = maxLines - Math.max(stats.additions, stats.deletions);
  return Math.round((unchanged / maxLines) * 100);
}

/**
 * Get a summary string of the diff stats
 */
export function formatStats(stats: DiffStats): string {
  const parts: string[] = [];

  if (stats.additions > 0) {
    parts.push(`+${stats.additions}`);
  }

  if (stats.deletions > 0) {
    parts.push(`-${stats.deletions}`);
  }

  if (parts.length === 0) {
    return 'No changes';
  }

  return parts.join(', ');
}

/**
 * Get detailed summary of changes
 */
export function formatDetailedStats(stats: DiffStats): string {
  const lines: string[] = [];

  lines.push(`Files compared:`);
  lines.push(`  Old: ${stats.oldLineCount} lines`);
  lines.push(`  New: ${stats.newLineCount} lines`);
  lines.push(``);
  lines.push(`Changes:`);
  lines.push(`  Additions: ${stats.additions} lines`);
  lines.push(`  Deletions: ${stats.deletions} lines`);
  lines.push(`  Total: ${stats.changes} lines changed`);
  lines.push(``);
  lines.push(`Similarity: ${calculateSimilarity(stats)}%`);

  return lines.join('\n');
}
