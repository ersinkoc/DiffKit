/**
 * Myers Diff Algorithm
 * Classic O(ND) diff algorithm that produces minimal edit distance
 * Reference: "An O(ND) Difference Algorithm and Its Variations" by Eugene W. Myers
 */

import type { DiffAlgorithm, DiffOperation } from '../types.js';

/**
 * Myers diff algorithm implementation
 */
export const myersAlgorithm: DiffAlgorithm = {
  name: 'myers',

  diff(oldLines: string[], newLines: string[]): DiffOperation[] {
    const oldLen = oldLines.length;
    const newLen = newLines.length;
    const max = oldLen + newLen;

    // Handle edge cases
    if (oldLen === 0 && newLen === 0) {
      return [];
    }

    if (oldLen === 0) {
      return [
        {
          type: 'insert',
          oldStart: 0,
          oldEnd: 0,
          newStart: 0,
          newEnd: newLen,
          lines: newLines.slice(),
        },
      ];
    }

    if (newLen === 0) {
      return [
        {
          type: 'delete',
          oldStart: 0,
          oldEnd: oldLen,
          newStart: 0,
          newEnd: 0,
          lines: oldLines.slice(),
        },
      ];
    }

    // V array: v[k] stores the furthest reaching x value on diagonal k
    // We use an offset to handle negative k values
    const vOffset = max;
    const vSize = 2 * max + 1;

    // Store the path for backtracking
    const trace: number[][] = [];

    // Initialize v with -1 (meaning "not reached")
    let v = new Array<number>(vSize).fill(-1);
    v[vOffset + 1] = 0;

    // Main loop: iterate over edit distance d
    for (let d = 0; d <= max; d++) {
      // Save current v for backtracking
      trace.push([...v]);

      // Try all diagonals from -d to d
      for (let k = -d; k <= d; k += 2) {
        // Decide whether to move down or right
        let x: number;
        const kPlusOne = v[vOffset + k + 1];
        const kMinusOne = v[vOffset + k - 1];

        if (k === -d || (k !== d && (kMinusOne ?? -1) < (kPlusOne ?? -1))) {
          // Move down (insert)
          x = kPlusOne ?? 0;
        } else {
          // Move right (delete)
          x = (kMinusOne ?? 0) + 1;
        }

        let y = x - k;

        // Extend the snake (diagonal of equal elements)
        while (x < oldLen && y < newLen && oldLines[x] === newLines[y]) {
          x++;
          y++;
        }

        v[vOffset + k] = x;

        // Check if we've reached the end
        if (x >= oldLen && y >= newLen) {
          return backtrack(trace, oldLines, newLines, vOffset);
        }
      }
    }

    // Should never reach here for valid inputs
    return [];
  },
};

/**
 * Backtrack through the trace to construct the edit script
 */
function backtrack(
  trace: number[][],
  oldLines: string[],
  newLines: string[],
  vOffset: number
): DiffOperation[] {
  const operations: DiffOperation[] = [];
  let x = oldLines.length;
  let y = newLines.length;

  // Work backwards through the trace
  for (let d = trace.length - 1; d >= 0; d--) {
    const v = trace[d];
    if (!v) continue;

    const k = x - y;

    // Determine the previous k
    let prevK: number;
    const kPlusOne = v[vOffset + k + 1];
    const kMinusOne = v[vOffset + k - 1];

    if (k === -d || (k !== d && (kMinusOne ?? -1) < (kPlusOne ?? -1))) {
      prevK = k + 1;
    } else {
      prevK = k - 1;
    }

    const prevX = v[vOffset + prevK] ?? 0;
    const prevY = prevX - prevK;

    // Handle the snake (equal elements)
    while (x > prevX && y > prevY) {
      x--;
      y--;
      const line = oldLines[x];
      if (line !== undefined) {
        operations.unshift({
          type: 'equal',
          oldStart: x,
          oldEnd: x + 1,
          newStart: y,
          newEnd: y + 1,
          lines: [line],
        });
      }
    }

    // Handle the edit
    if (d > 0) {
      if (prevK === k + 1) {
        // Insert
        y--;
        const line = newLines[y];
        if (line !== undefined) {
          operations.unshift({
            type: 'insert',
            oldStart: x,
            oldEnd: x,
            newStart: y,
            newEnd: y + 1,
            lines: [line],
          });
        }
      } else {
        // Delete
        x--;
        const line = oldLines[x];
        if (line !== undefined) {
          operations.unshift({
            type: 'delete',
            oldStart: x,
            oldEnd: x + 1,
            newStart: y,
            newEnd: y,
            lines: [line],
          });
        }
      }
    }
  }

  // Merge consecutive operations of the same type
  return mergeOperations(operations);
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
      // Merge with current
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

export default myersAlgorithm;
