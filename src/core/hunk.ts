/**
 * Hunk generation and formatting for DiffKit
 */

import type { DiffOperation, Hunk, Change, ChangeType } from './types.js';

/**
 * Default number of context lines
 */
const DEFAULT_CONTEXT = 3;

/**
 * Generate hunks from diff operations
 */
export function generateHunks(
  operations: DiffOperation[],
  oldLines: string[],
  newLines: string[],
  context: number = DEFAULT_CONTEXT
): Hunk[] {
  if (operations.length === 0) {
    return [];
  }

  // Find change regions (non-equal operations)
  const changeRegions = findChangeRegions(operations);

  if (changeRegions.length === 0) {
    return [];
  }

  // Group nearby change regions into hunks
  const hunkGroups = groupIntoHunks(changeRegions, operations, context);

  // Build hunks
  const hunks: Hunk[] = [];

  for (const group of hunkGroups) {
    const hunk = buildHunk(group, operations, oldLines, newLines, context);
    if (hunk) {
      hunks.push(hunk);
    }
  }

  return hunks;
}

/**
 * Find indices of change regions (non-equal operations)
 */
function findChangeRegions(operations: DiffOperation[]): number[] {
  const regions: number[] = [];

  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    if (op && op.type !== 'equal') {
      regions.push(i);
    }
  }

  return regions;
}

/**
 * Group change regions that are close together
 */
function groupIntoHunks(
  changeIndices: number[],
  operations: DiffOperation[],
  context: number
): number[][] {
  if (changeIndices.length === 0) {
    return [];
  }

  const groups: number[][] = [];
  let currentGroup: number[] = [changeIndices[0]!];

  for (let i = 1; i < changeIndices.length; i++) {
    const prevIdx = changeIndices[i - 1]!;
    const currIdx = changeIndices[i]!;

    // Calculate the gap in lines between changes
    let gapLines = 0;
    for (let j = prevIdx + 1; j < currIdx; j++) {
      const op = operations[j];
      if (op && op.type === 'equal') {
        gapLines += op.lines.length;
      }
    }

    // If gap is larger than 2 * context, start a new group
    if (gapLines > context * 2) {
      groups.push(currentGroup);
      currentGroup = [currIdx];
    } else {
      currentGroup.push(currIdx);
    }
  }

  groups.push(currentGroup);
  return groups;
}

/**
 * Build a single hunk from a group of change indices
 */
function buildHunk(
  group: number[],
  operations: DiffOperation[],
  _oldLines: string[],
  _newLines: string[],
  context: number
): Hunk | null {
  if (group.length === 0) {
    return null;
  }

  const firstChangeIdx = group[0]!;
  const lastChangeIdx = group[group.length - 1]!;

  // Find the operation range including context
  let startIdx = firstChangeIdx;
  let endIdx = lastChangeIdx;

  // Expand backwards for context
  let contextBefore = 0;
  for (let i = firstChangeIdx - 1; i >= 0 && contextBefore < context; i--) {
    const op = operations[i];
    if (op && op.type === 'equal') {
      const linesToTake = Math.min(context - contextBefore, op.lines.length);
      contextBefore += linesToTake;
      startIdx = i;
    }
  }

  // Expand forwards for context
  let contextAfter = 0;
  for (let i = lastChangeIdx + 1; i < operations.length && contextAfter < context; i++) {
    const op = operations[i];
    if (op && op.type === 'equal') {
      const linesToTake = Math.min(context - contextAfter, op.lines.length);
      contextAfter += linesToTake;
      endIdx = i;
    }
  }

  // Build changes array
  const changes: Change[] = [];
  let oldStart = 0;
  let newStart = 0;
  let oldCount = 0;
  let newCount = 0;

  // Calculate starting positions
  for (let i = 0; i < startIdx; i++) {
    const op = operations[i];
    if (op) {
      if (op.type === 'equal' || op.type === 'delete') {
        oldStart += op.lines.length;
      }
      if (op.type === 'equal' || op.type === 'insert') {
        newStart += op.lines.length;
      }
    }
  }

  // Handle context before first change
  const firstOp = operations[startIdx];
  if (firstOp && firstOp.type === 'equal' && startIdx < firstChangeIdx) {
    const skipLines = Math.max(0, firstOp.lines.length - context);
    oldStart += skipLines;
    newStart += skipLines;

    const contextLines = firstOp.lines.slice(skipLines);
    let oldLine = oldStart;
    let newLine = newStart;

    for (const line of contextLines) {
      changes.push({
        type: 'normal',
        content: line,
        oldLineNumber: oldLine + 1,
        newLineNumber: newLine + 1,
      });
      oldLine++;
      newLine++;
      oldCount++;
      newCount++;
    }
  }

  // Process operations in the hunk
  let currentOldLine = oldStart + (firstOp && firstOp.type === 'equal' && startIdx < firstChangeIdx
    ? Math.min(context, firstOp.lines.length)
    : 0);
  let currentNewLine = newStart + (firstOp && firstOp.type === 'equal' && startIdx < firstChangeIdx
    ? Math.min(context, firstOp.lines.length)
    : 0);

  const processStartIdx = startIdx < firstChangeIdx ? startIdx + 1 : startIdx;

  for (let i = processStartIdx; i <= endIdx; i++) {
    const op = operations[i];
    if (!op) continue;

    // For last equal block, only take context lines
    const isLastEqual = i === endIdx && op.type === 'equal' && i > lastChangeIdx;
    const linesToProcess = isLastEqual
      ? op.lines.slice(0, context)
      : op.lines;

    for (const line of linesToProcess) {
      let changeType: ChangeType;

      switch (op.type) {
        case 'insert':
          changeType = 'add';
          changes.push({
            type: changeType,
            content: line,
            newLineNumber: currentNewLine + 1,
          });
          currentNewLine++;
          newCount++;
          break;

        case 'delete':
          changeType = 'delete';
          changes.push({
            type: changeType,
            content: line,
            oldLineNumber: currentOldLine + 1,
          });
          currentOldLine++;
          oldCount++;
          break;

        case 'equal':
          changeType = 'normal';
          changes.push({
            type: changeType,
            content: line,
            oldLineNumber: currentOldLine + 1,
            newLineNumber: currentNewLine + 1,
          });
          currentOldLine++;
          currentNewLine++;
          oldCount++;
          newCount++;
          break;
      }
    }
  }

  // Build header
  const header = formatHunkHeader(oldStart + 1, oldCount, newStart + 1, newCount);

  return {
    oldStart: oldStart + 1,
    oldLines: oldCount,
    newStart: newStart + 1,
    newLines: newCount,
    changes,
    header,
  };
}

/**
 * Format hunk header in unified diff format
 */
export function formatHunkHeader(
  oldStart: number,
  oldLines: number,
  newStart: number,
  newLines: number
): string {
  const oldRange = oldLines === 1 ? `${oldStart}` : `${oldStart},${oldLines}`;
  const newRange = newLines === 1 ? `${newStart}` : `${newStart},${newLines}`;
  return `@@ -${oldRange} +${newRange} @@`;
}

/**
 * Convert hunks to unified diff string
 */
export function hunksToUnifiedString(
  hunks: Hunk[],
  oldFileName: string = 'a',
  newFileName: string = 'b'
): string {
  if (hunks.length === 0) {
    return '';
  }

  const lines: string[] = [
    `--- ${oldFileName}`,
    `+++ ${newFileName}`,
  ];

  for (const hunk of hunks) {
    lines.push(hunk.header);

    for (const change of hunk.changes) {
      switch (change.type) {
        case 'add':
          lines.push(`+${change.content}`);
          break;
        case 'delete':
          lines.push(`-${change.content}`);
          break;
        case 'normal':
          lines.push(` ${change.content}`);
          break;
      }
    }
  }

  return lines.join('\n');
}

/**
 * Parse unified diff string back to hunks
 */
export function parseUnifiedDiff(diffString: string): Hunk[] {
  const lines = diffString.split('\n');
  const hunks: Hunk[] = [];
  let currentHunk: Hunk | null = null;

  const hunkHeaderRegex = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;

  for (const line of lines) {
    const headerMatch = line.match(hunkHeaderRegex);

    if (headerMatch) {
      if (currentHunk) {
        hunks.push(currentHunk);
      }

      currentHunk = {
        oldStart: parseInt(headerMatch[1]!, 10),
        oldLines: headerMatch[2] ? parseInt(headerMatch[2], 10) : 1,
        newStart: parseInt(headerMatch[3]!, 10),
        newLines: headerMatch[4] ? parseInt(headerMatch[4], 10) : 1,
        changes: [],
        header: line,
      };
    } else if (currentHunk) {
      if (line.startsWith('+')) {
        currentHunk.changes.push({
          type: 'add',
          content: line.slice(1),
        });
      } else if (line.startsWith('-')) {
        currentHunk.changes.push({
          type: 'delete',
          content: line.slice(1),
        });
      } else if (line.startsWith(' ')) {
        currentHunk.changes.push({
          type: 'normal',
          content: line.slice(1),
        });
      }
    }
  }

  if (currentHunk) {
    hunks.push(currentHunk);
  }

  return hunks;
}
