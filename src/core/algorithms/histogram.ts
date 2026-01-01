/**
 * Histogram Diff Algorithm
 * Optimized for large files with many repeated lines
 * Uses occurrence counting to find optimal split points
 */

import type { DiffAlgorithm, DiffOperation } from '../types.js';
import { countOccurrences, findLowOccurrenceLines } from './lcs.js';
import { myersAlgorithm } from './myers.js';

/**
 * Histogram diff algorithm implementation
 */
export const histogramAlgorithm: DiffAlgorithm = {
  name: 'histogram',

  diff(oldLines: string[], newLines: string[]): DiffOperation[] {
    return histogramDiff(oldLines, newLines, 0, oldLines.length, 0, newLines.length);
  },
};

/**
 * Recursive histogram diff implementation
 */
function histogramDiff(
  oldLines: string[],
  newLines: string[],
  oldStart: number,
  oldEnd: number,
  newStart: number,
  newEnd: number,
  depth: number = 0
): DiffOperation[] {
  // Limit recursion depth to prevent stack overflow
  const maxDepth = 64;

  // Handle empty ranges
  if (oldStart >= oldEnd && newStart >= newEnd) {
    return [];
  }

  if (oldStart >= oldEnd) {
    return [
      {
        type: 'insert',
        oldStart,
        oldEnd: oldStart,
        newStart,
        newEnd,
        lines: newLines.slice(newStart, newEnd),
      },
    ];
  }

  if (newStart >= newEnd) {
    return [
      {
        type: 'delete',
        oldStart,
        oldEnd,
        newStart,
        newEnd: newStart,
        lines: oldLines.slice(oldStart, oldEnd),
      },
    ];
  }

  // Skip common prefix
  let commonPrefixLen = 0;
  while (
    oldStart + commonPrefixLen < oldEnd &&
    newStart + commonPrefixLen < newEnd &&
    oldLines[oldStart + commonPrefixLen] === newLines[newStart + commonPrefixLen]
  ) {
    commonPrefixLen++;
  }

  // Skip common suffix
  let commonSuffixLen = 0;
  while (
    oldStart + commonPrefixLen < oldEnd - commonSuffixLen &&
    newStart + commonPrefixLen < newEnd - commonSuffixLen &&
    oldLines[oldEnd - 1 - commonSuffixLen] === newLines[newEnd - 1 - commonSuffixLen]
  ) {
    commonSuffixLen++;
  }

  const operations: DiffOperation[] = [];

  // Add common prefix
  if (commonPrefixLen > 0) {
    operations.push({
      type: 'equal',
      oldStart,
      oldEnd: oldStart + commonPrefixLen,
      newStart,
      newEnd: newStart + commonPrefixLen,
      lines: oldLines.slice(oldStart, oldStart + commonPrefixLen),
    });
  }

  // Adjust ranges
  const midOldStart = oldStart + commonPrefixLen;
  const midOldEnd = oldEnd - commonSuffixLen;
  const midNewStart = newStart + commonPrefixLen;
  const midNewEnd = newEnd - commonSuffixLen;

  // Process middle part
  if (midOldStart < midOldEnd || midNewStart < midNewEnd) {
    if (depth >= maxDepth) {
      // Fall back to Myers at max depth
      const oldRange = oldLines.slice(midOldStart, midOldEnd);
      const newRange = newLines.slice(midNewStart, midNewEnd);
      const myersOps = myersAlgorithm.diff(oldRange, newRange);

      for (const op of myersOps) {
        operations.push({
          ...op,
          oldStart: op.oldStart + midOldStart,
          oldEnd: op.oldEnd + midOldStart,
          newStart: op.newStart + midNewStart,
          newEnd: op.newEnd + midNewStart,
        });
      }
    } else {
      const midOps = histogramDiffMiddle(
        oldLines,
        newLines,
        midOldStart,
        midOldEnd,
        midNewStart,
        midNewEnd,
        depth
      );
      operations.push(...midOps);
    }
  }

  // Add common suffix
  if (commonSuffixLen > 0) {
    operations.push({
      type: 'equal',
      oldStart: oldEnd - commonSuffixLen,
      oldEnd,
      newStart: newEnd - commonSuffixLen,
      newEnd,
      lines: oldLines.slice(oldEnd - commonSuffixLen, oldEnd),
    });
  }

  return mergeOperations(operations);
}

/**
 * Process middle part using histogram approach
 */
function histogramDiffMiddle(
  oldLines: string[],
  newLines: string[],
  oldStart: number,
  oldEnd: number,
  newStart: number,
  newEnd: number,
  depth: number
): DiffOperation[] {
  const oldRange = oldLines.slice(oldStart, oldEnd);
  const newRange = newLines.slice(newStart, newEnd);

  // Find low-occurrence lines to use as anchors
  const lowOccLines = findLowOccurrenceLines(oldRange, newRange);

  if (lowOccLines.length === 0) {
    // No suitable anchors, use Myers
    const myersOps = myersAlgorithm.diff(oldRange, newRange);
    return myersOps.map((op) => ({
      ...op,
      oldStart: op.oldStart + oldStart,
      oldEnd: op.oldEnd + oldStart,
      newStart: op.newStart + newStart,
      newEnd: op.newEnd + newStart,
    }));
  }

  // Find the best split point (lowest occurrence line that appears in both)
  const oldCounts = countOccurrences(oldRange);
  const newCounts = countOccurrences(newRange);

  let bestLine: string | null = null;
  let bestOldIdx = -1;
  let bestNewIdx = -1;
  let bestScore = Infinity;

  for (const line of lowOccLines) {
    const oldCount = oldCounts.get(line) ?? 0;
    const newCount = newCounts.get(line) ?? 0;

    if (oldCount === 0 || newCount === 0) continue;

    const score = oldCount + newCount;

    if (score < bestScore) {
      // Find first occurrence in each
      const oldIdx = oldRange.indexOf(line);
      const newIdx = newRange.indexOf(line);

      if (oldIdx !== -1 && newIdx !== -1) {
        bestLine = line;
        bestOldIdx = oldIdx;
        bestNewIdx = newIdx;
        bestScore = score;

        // Perfect match - stop early
        if (score === 2) break;
      }
    }
  }

  if (bestLine === null || bestOldIdx === -1 || bestNewIdx === -1) {
    // No good split point, use Myers
    const myersOps = myersAlgorithm.diff(oldRange, newRange);
    return myersOps.map((op) => ({
      ...op,
      oldStart: op.oldStart + oldStart,
      oldEnd: op.oldEnd + oldStart,
      newStart: op.newStart + newStart,
      newEnd: op.newEnd + newStart,
    }));
  }

  // Split and recurse
  const operations: DiffOperation[] = [];

  // Before the split
  if (bestOldIdx > 0 || bestNewIdx > 0) {
    const beforeOps = histogramDiff(
      oldRange,
      newRange,
      0,
      bestOldIdx,
      0,
      bestNewIdx,
      depth + 1
    );

    for (const op of beforeOps) {
      operations.push({
        ...op,
        oldStart: op.oldStart + oldStart,
        oldEnd: op.oldEnd + oldStart,
        newStart: op.newStart + newStart,
        newEnd: op.newEnd + newStart,
      });
    }
  }

  // The split line itself
  operations.push({
    type: 'equal',
    oldStart: oldStart + bestOldIdx,
    oldEnd: oldStart + bestOldIdx + 1,
    newStart: newStart + bestNewIdx,
    newEnd: newStart + bestNewIdx + 1,
    lines: [bestLine],
  });

  // After the split
  if (bestOldIdx + 1 < oldRange.length || bestNewIdx + 1 < newRange.length) {
    const afterOps = histogramDiff(
      oldRange,
      newRange,
      bestOldIdx + 1,
      oldRange.length,
      bestNewIdx + 1,
      newRange.length,
      depth + 1
    );

    for (const op of afterOps) {
      operations.push({
        ...op,
        oldStart: op.oldStart + oldStart,
        oldEnd: op.oldEnd + oldStart,
        newStart: op.newStart + newStart,
        newEnd: op.newEnd + newStart,
      });
    }
  }

  return operations;
}

/**
 * Merge consecutive operations of the same type
 */
function mergeOperations(operations: DiffOperation[]): DiffOperation[] {
  if (operations.length === 0) {
    return [];
  }

  const merged: DiffOperation[] = [];
  let current = operations[0]!;

  for (let i = 1; i < operations.length; i++) {
    const op = operations[i]!;

    if (op.type === current.type && op.oldStart === current.oldEnd && op.newStart === current.newEnd) {
      current = {
        type: current.type,
        oldStart: current.oldStart,
        oldEnd: op.oldEnd,
        newStart: current.newStart,
        newEnd: op.newEnd,
        lines: [...current.lines, ...op.lines],
      };
    } else {
      merged.push(current);
      current = op;
    }
  }

  merged.push(current);
  return merged;
}

export default histogramAlgorithm;
