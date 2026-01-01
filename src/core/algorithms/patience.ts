/**
 * Patience Diff Algorithm
 * Uses unique lines as anchors for better readability with moved blocks
 * Based on the algorithm used by Git and Bazaar
 */

import type { DiffAlgorithm, DiffOperation } from '../types.js';
import { findUniqueLines, patienceLCS } from './lcs.js';
import { myersAlgorithm } from './myers.js';

/**
 * Patience diff algorithm implementation
 */
export const patienceAlgorithm: DiffAlgorithm = {
  name: 'patience',

  diff(oldLines: string[], newLines: string[]): DiffOperation[] {
    return patienceDiff(oldLines, newLines, 0, oldLines.length, 0, newLines.length);
  },
};

/**
 * Recursive patience diff implementation
 */
function patienceDiff(
  oldLines: string[],
  newLines: string[],
  oldStart: number,
  oldEnd: number,
  newStart: number,
  newEnd: number
): DiffOperation[] {
  // Handle empty ranges
  if (oldStart >= oldEnd && newStart >= newEnd) {
    return [];
  }

  if (oldStart >= oldEnd) {
    // All new lines are insertions
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
    // All old lines are deletions
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

  // Build operations for common prefix
  const operations: DiffOperation[] = [];

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

  // Adjust ranges for the middle part
  const midOldStart = oldStart + commonPrefixLen;
  const midOldEnd = oldEnd - commonSuffixLen;
  const midNewStart = newStart + commonPrefixLen;
  const midNewEnd = newEnd - commonSuffixLen;

  // Process the middle part
  if (midOldStart < midOldEnd || midNewStart < midNewEnd) {
    const midOps = patienceDiffMiddle(
      oldLines,
      newLines,
      midOldStart,
      midOldEnd,
      midNewStart,
      midNewEnd
    );
    operations.push(...midOps);
  }

  // Build operations for common suffix
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
 * Process the middle part using patience algorithm
 */
function patienceDiffMiddle(
  oldLines: string[],
  newLines: string[],
  oldStart: number,
  oldEnd: number,
  newStart: number,
  newEnd: number
): DiffOperation[] {
  // Extract the ranges we're working with
  const oldRange = oldLines.slice(oldStart, oldEnd);
  const newRange = newLines.slice(newStart, newEnd);

  // Find unique lines that appear exactly once in both
  const uniqueLines = findUniqueLines(oldRange, newRange);

  if (uniqueLines.size === 0) {
    // No unique lines found, fall back to Myers
    const myersOps = myersAlgorithm.diff(oldRange, newRange);
    // Adjust indices
    return myersOps.map((op) => ({
      ...op,
      oldStart: op.oldStart + oldStart,
      oldEnd: op.oldEnd + oldStart,
      newStart: op.newStart + newStart,
      newEnd: op.newEnd + newStart,
    }));
  }

  // Convert unique lines to array and find LIS
  const uniqueMatches = Array.from(uniqueLines.values());
  const lcs = patienceLCS(uniqueMatches);

  if (lcs.length === 0) {
    // No common subsequence, fall back to Myers
    const myersOps = myersAlgorithm.diff(oldRange, newRange);
    return myersOps.map((op) => ({
      ...op,
      oldStart: op.oldStart + oldStart,
      oldEnd: op.oldEnd + oldStart,
      newStart: op.newStart + newStart,
      newEnd: op.newEnd + newStart,
    }));
  }

  // Recursively diff between anchor points
  const operations: DiffOperation[] = [];
  let prevOldIdx = 0;
  let prevNewIdx = 0;

  for (const match of lcs) {
    // Diff before this anchor
    if (prevOldIdx < match.oldIndex || prevNewIdx < match.newIndex) {
      const beforeOps = patienceDiff(
        oldRange,
        newRange,
        prevOldIdx,
        match.oldIndex,
        prevNewIdx,
        match.newIndex
      );

      // Adjust indices
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

    // Add the anchor as equal
    const line = oldRange[match.oldIndex];
    if (line !== undefined) {
      operations.push({
        type: 'equal',
        oldStart: oldStart + match.oldIndex,
        oldEnd: oldStart + match.oldIndex + 1,
        newStart: newStart + match.newIndex,
        newEnd: newStart + match.newIndex + 1,
        lines: [line],
      });
    }

    prevOldIdx = match.oldIndex + 1;
    prevNewIdx = match.newIndex + 1;
  }

  // Diff after last anchor
  if (prevOldIdx < oldRange.length || prevNewIdx < newRange.length) {
    const afterOps = patienceDiff(
      oldRange,
      newRange,
      prevOldIdx,
      oldRange.length,
      prevNewIdx,
      newRange.length
    );

    // Adjust indices
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

export default patienceAlgorithm;
