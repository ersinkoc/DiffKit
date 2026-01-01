/**
 * Move/Block Detection Algorithm for DiffKit
 *
 * Detects when blocks of code are moved from one location to another
 * rather than being deleted and re-added independently.
 */

import type { DiffOperation } from '../types.js';

/**
 * Represents a detected move operation
 */
export interface MoveBlock {
  /** Original start line in the old content */
  oldStart: number;
  /** Original end line in the old content */
  oldEnd: number;
  /** New start line in the new content */
  newStart: number;
  /** New end line in the new content */
  newEnd: number;
  /** The lines that were moved */
  lines: string[];
  /** Similarity score (0-1) */
  similarity: number;
  /** Whether this is an exact match */
  isExact: boolean;
}

/**
 * Options for move detection
 */
export interface MoveDetectionOptions {
  /** Minimum number of lines for a block to be considered a move */
  minBlockSize?: number;
  /** Minimum similarity threshold (0-1) for fuzzy matching */
  similarityThreshold?: number;
  /** Whether to detect fuzzy moves (similar but not identical blocks) */
  detectFuzzyMoves?: boolean;
  /** Maximum distance (in lines) to search for moved blocks */
  maxSearchDistance?: number;
  /** Ignore whitespace when comparing lines */
  ignoreWhitespace?: boolean;
}

/**
 * Default options for move detection
 */
const defaultOptions: Required<MoveDetectionOptions> = {
  minBlockSize: 3,
  similarityThreshold: 0.8,
  detectFuzzyMoves: true,
  maxSearchDistance: 1000,
  ignoreWhitespace: false,
};

/**
 * Normalize a line for comparison
 */
function normalizeLine(line: string, ignoreWhitespace: boolean): string {
  if (ignoreWhitespace) {
    return line.replace(/\s+/g, ' ').trim();
  }
  return line;
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= a.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= b.length; j++) {
    matrix[0]![j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost
      );
    }
  }

  const maxLen = Math.max(a.length, b.length);
  return 1 - matrix[a.length]![b.length]! / maxLen;
}

/**
 * Calculate block similarity between two blocks of lines
 */
function calculateBlockSimilarity(
  block1: string[],
  block2: string[],
  ignoreWhitespace: boolean
): number {
  if (block1.length === 0 || block2.length === 0) return 0;
  if (block1.length !== block2.length) {
    // Different lengths - calculate content similarity
    const content1 = block1.map((l) => normalizeLine(l, ignoreWhitespace)).join('\n');
    const content2 = block2.map((l) => normalizeLine(l, ignoreWhitespace)).join('\n');
    return calculateSimilarity(content1, content2);
  }

  // Same length - compare line by line
  let totalSimilarity = 0;
  for (let i = 0; i < block1.length; i++) {
    const line1 = normalizeLine(block1[i]!, ignoreWhitespace);
    const line2 = normalizeLine(block2[i]!, ignoreWhitespace);
    totalSimilarity += calculateSimilarity(line1, line2);
  }
  return totalSimilarity / block1.length;
}

/**
 * Create a hash for a block of lines (for quick lookup)
 */
function hashBlock(lines: string[], ignoreWhitespace: boolean): string {
  const normalized = lines.map((l) => normalizeLine(l, ignoreWhitespace));
  return normalized.join('\n');
}

/**
 * Extract deleted and inserted blocks from diff operations
 */
function extractBlocks(operations: DiffOperation[]): {
  deleted: Array<{ start: number; end: number; lines: string[] }>;
  inserted: Array<{ start: number; end: number; lines: string[] }>;
} {
  const deleted: Array<{ start: number; end: number; lines: string[] }> = [];
  const inserted: Array<{ start: number; end: number; lines: string[] }> = [];

  for (const op of operations) {
    if (op.type === 'delete') {
      deleted.push({
        start: op.oldStart,
        end: op.oldEnd,
        lines: op.lines,
      });
    } else if (op.type === 'insert') {
      inserted.push({
        start: op.newStart,
        end: op.newEnd,
        lines: op.lines,
      });
    }
  }

  return { deleted, inserted };
}

/**
 * Detect moved blocks in diff operations
 */
export function detectMoves(
  operations: DiffOperation[],
  options: MoveDetectionOptions = {}
): MoveBlock[] {
  const opts = { ...defaultOptions, ...options };
  const { deleted, inserted } = extractBlocks(operations);

  const moves: MoveBlock[] = [];
  const usedDeletedIndices = new Set<number>();
  const usedInsertedIndices = new Set<number>();

  // Build hash map for quick exact match lookup
  const insertedHashMap = new Map<string, number[]>();
  for (let i = 0; i < inserted.length; i++) {
    const block = inserted[i]!;
    if (block.lines.length >= opts.minBlockSize) {
      const hash = hashBlock(block.lines, opts.ignoreWhitespace);
      if (!insertedHashMap.has(hash)) {
        insertedHashMap.set(hash, []);
      }
      insertedHashMap.get(hash)!.push(i);
    }
  }

  // First pass: find exact matches
  for (let delIdx = 0; delIdx < deleted.length; delIdx++) {
    if (usedDeletedIndices.has(delIdx)) continue;

    const delBlock = deleted[delIdx]!;
    if (delBlock.lines.length < opts.minBlockSize) continue;

    const hash = hashBlock(delBlock.lines, opts.ignoreWhitespace);
    const matchingIndices = insertedHashMap.get(hash);

    if (matchingIndices) {
      for (const insIdx of matchingIndices) {
        if (usedInsertedIndices.has(insIdx)) continue;

        const insBlock = inserted[insIdx]!;

        // Verify it's actually moved (different location)
        if (delBlock.start !== insBlock.start) {
          moves.push({
            oldStart: delBlock.start,
            oldEnd: delBlock.end,
            newStart: insBlock.start,
            newEnd: insBlock.end,
            lines: delBlock.lines,
            similarity: 1.0,
            isExact: true,
          });

          usedDeletedIndices.add(delIdx);
          usedInsertedIndices.add(insIdx);
          break;
        }
      }
    }
  }

  // Second pass: find fuzzy matches if enabled
  if (opts.detectFuzzyMoves) {
    for (let delIdx = 0; delIdx < deleted.length; delIdx++) {
      if (usedDeletedIndices.has(delIdx)) continue;

      const delBlock = deleted[delIdx]!;
      if (delBlock.lines.length < opts.minBlockSize) continue;

      let bestMatch: { insIdx: number; similarity: number } | null = null;

      for (let insIdx = 0; insIdx < inserted.length; insIdx++) {
        if (usedInsertedIndices.has(insIdx)) continue;

        const insBlock = inserted[insIdx]!;
        if (insBlock.lines.length < opts.minBlockSize) continue;

        // Check distance constraint
        const distance = Math.abs(insBlock.start - delBlock.start);
        if (distance > opts.maxSearchDistance) continue;

        const similarity = calculateBlockSimilarity(
          delBlock.lines,
          insBlock.lines,
          opts.ignoreWhitespace
        );

        if (similarity >= opts.similarityThreshold) {
          if (!bestMatch || similarity > bestMatch.similarity) {
            bestMatch = { insIdx, similarity };
          }
        }
      }

      if (bestMatch) {
        const insBlock = inserted[bestMatch.insIdx]!;

        moves.push({
          oldStart: delBlock.start,
          oldEnd: delBlock.end,
          newStart: insBlock.start,
          newEnd: insBlock.end,
          lines: delBlock.lines,
          similarity: bestMatch.similarity,
          isExact: bestMatch.similarity === 1.0,
        });

        usedDeletedIndices.add(delIdx);
        usedInsertedIndices.add(bestMatch.insIdx);
      }
    }
  }

  // Sort moves by old position
  moves.sort((a, b) => a.oldStart - b.oldStart);

  return moves;
}

/**
 * Detect moves directly from old and new content
 */
export function detectMovesFromContent(
  oldLines: string[],
  newLines: string[],
  options: MoveDetectionOptions = {}
): MoveBlock[] {
  const opts = { ...defaultOptions, ...options };
  const moves: MoveBlock[] = [];

  // Build hash map of blocks in new content
  const newBlockMap = new Map<string, Array<{ start: number; lines: string[] }>>();

  for (let size = opts.minBlockSize; size <= Math.min(newLines.length, 50); size++) {
    for (let i = 0; i <= newLines.length - size; i++) {
      const block = newLines.slice(i, i + size);
      const hash = hashBlock(block, opts.ignoreWhitespace);

      if (!newBlockMap.has(hash)) {
        newBlockMap.set(hash, []);
      }
      newBlockMap.get(hash)!.push({ start: i, lines: block });
    }
  }

  // Find blocks in old content that appear in new content at different positions
  const usedOldRanges: Array<{ start: number; end: number }> = [];
  const usedNewRanges: Array<{ start: number; end: number }> = [];

  function overlapsWithUsed(
    start: number,
    end: number,
    usedRanges: Array<{ start: number; end: number }>
  ): boolean {
    for (const range of usedRanges) {
      if (start < range.end && end > range.start) {
        return true;
      }
    }
    return false;
  }

  // Search for largest moves first (prioritize larger blocks)
  for (let size = Math.min(oldLines.length, 50); size >= opts.minBlockSize; size--) {
    for (let i = 0; i <= oldLines.length - size; i++) {
      if (overlapsWithUsed(i, i + size, usedOldRanges)) continue;

      const block = oldLines.slice(i, i + size);
      const hash = hashBlock(block, opts.ignoreWhitespace);

      const matches = newBlockMap.get(hash);
      if (!matches) continue;

      for (const match of matches) {
        // Skip if same position (not a move)
        if (match.start === i) continue;

        // Skip if already used
        if (overlapsWithUsed(match.start, match.start + size, usedNewRanges)) continue;

        moves.push({
          oldStart: i,
          oldEnd: i + size,
          newStart: match.start,
          newEnd: match.start + size,
          lines: block,
          similarity: 1.0,
          isExact: true,
        });

        usedOldRanges.push({ start: i, end: i + size });
        usedNewRanges.push({ start: match.start, end: match.start + size });
        break;
      }
    }
  }

  // Sort moves by old position
  moves.sort((a, b) => a.oldStart - b.oldStart);

  return moves;
}

/**
 * Enhance diff operations with move information
 */
export interface EnhancedDiffOperation extends DiffOperation {
  /** If this is part of a move, the move info */
  move?: {
    /** Unique ID for this move */
    moveId: number;
    /** Whether this is the source (delete) or destination (insert) */
    role: 'source' | 'destination';
    /** The corresponding move block */
    block: MoveBlock;
  };
}

/**
 * Annotate diff operations with move detection information
 */
export function annotateMoves(
  operations: DiffOperation[],
  options: MoveDetectionOptions = {}
): EnhancedDiffOperation[] {
  const moves = detectMoves(operations, options);

  // Create a map of line ranges to moves
  const deleteMoveMap = new Map<string, { moveId: number; block: MoveBlock }>();
  const insertMoveMap = new Map<string, { moveId: number; block: MoveBlock }>();

  moves.forEach((move, idx) => {
    const moveId = idx + 1;
    deleteMoveMap.set(`${move.oldStart}-${move.oldEnd}`, { moveId, block: move });
    insertMoveMap.set(`${move.newStart}-${move.newEnd}`, { moveId, block: move });
  });

  // Annotate operations
  return operations.map((op): EnhancedDiffOperation => {
    if (op.type === 'delete') {
      const key = `${op.oldStart}-${op.oldEnd}`;
      const moveInfo = deleteMoveMap.get(key);
      if (moveInfo) {
        return {
          ...op,
          move: {
            moveId: moveInfo.moveId,
            role: 'source',
            block: moveInfo.block,
          },
        };
      }
    } else if (op.type === 'insert') {
      const key = `${op.newStart}-${op.newEnd}`;
      const moveInfo = insertMoveMap.get(key);
      if (moveInfo) {
        return {
          ...op,
          move: {
            moveId: moveInfo.moveId,
            role: 'destination',
            block: moveInfo.block,
          },
        };
      }
    }
    return op;
  });
}

export default detectMoves;
