/**
 * Word-level diff algorithm
 *
 * Provides fine-grained diff at the word or character level
 * to highlight exactly what changed within a line.
 */

/**
 * A segment of text with change information
 */
export interface DiffSegment {
  /** The text content */
  text: string;
  /** Type of change */
  type: 'equal' | 'insert' | 'delete';
}

/**
 * Result of word-level diff
 */
export interface WordDiffResult {
  /** Segments for the old line */
  oldSegments: DiffSegment[];
  /** Segments for the new line */
  newSegments: DiffSegment[];
  /** Whether the lines have any differences */
  hasDifferences: boolean;
}

/**
 * Options for word-level diff
 */
export interface WordDiffOptions {
  /** Granularity: 'word' or 'char' */
  granularity?: 'word' | 'char';
  /** Ignore whitespace differences */
  ignoreWhitespace?: boolean;
  /** Ignore case when comparing */
  ignoreCase?: boolean;
  /** Minimum match length for character-level diff */
  minMatchLength?: number;
}

/**
 * Default options
 */
const defaultOptions: Required<WordDiffOptions> = {
  granularity: 'word',
  ignoreWhitespace: false,
  ignoreCase: false,
  minMatchLength: 1,
};

/**
 * Tokenize a string into words (including whitespace as separate tokens)
 */
function tokenizeWords(text: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let inWord = false;

  for (const char of text) {
    const isWhitespace = /\s/.test(char);

    if (isWhitespace) {
      if (inWord && current) {
        tokens.push(current);
        current = '';
      }
      current += char;
      inWord = false;
    } else {
      if (!inWord && current) {
        tokens.push(current);
        current = '';
      }
      current += char;
      inWord = true;
    }
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

/**
 * Tokenize a string into characters
 */
function tokenizeChars(text: string): string[] {
  return [...text];
}

/**
 * Compare two tokens for equality based on options
 */
function tokensEqual(a: string, b: string, options: Required<WordDiffOptions>): boolean {
  let tokenA = a;
  let tokenB = b;

  if (options.ignoreCase) {
    tokenA = tokenA.toLowerCase();
    tokenB = tokenB.toLowerCase();
  }

  if (options.ignoreWhitespace) {
    tokenA = tokenA.replace(/\s+/g, ' ');
    tokenB = tokenB.replace(/\s+/g, ' ');
  }

  return tokenA === tokenB;
}

/**
 * Compute Longest Common Subsequence for tokens
 */
function computeTokenLCS(
  oldTokens: string[],
  newTokens: string[],
  options: Required<WordDiffOptions>
): Array<{ oldIdx: number; newIdx: number }> {
  const m = oldTokens.length;
  const n = newTokens.length;

  // Build LCS table
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (tokensEqual(oldTokens[i - 1]!, newTokens[j - 1]!, options)) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }

  // Backtrack to find LCS
  const lcs: Array<{ oldIdx: number; newIdx: number }> = [];
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    if (tokensEqual(oldTokens[i - 1]!, newTokens[j - 1]!, options)) {
      lcs.unshift({ oldIdx: i - 1, newIdx: j - 1 });
      i--;
      j--;
    } else if (dp[i - 1]![j]! > dp[i]![j - 1]!) {
      i--;
    } else {
      j--;
    }
  }

  return lcs;
}

/**
 * Compute word-level diff between two lines
 */
export function diffWords(
  oldLine: string,
  newLine: string,
  options: WordDiffOptions = {}
): WordDiffResult {
  const opts = { ...defaultOptions, ...options };

  // Quick equality check
  if (oldLine === newLine) {
    return {
      oldSegments: [{ text: oldLine, type: 'equal' }],
      newSegments: [{ text: newLine, type: 'equal' }],
      hasDifferences: false,
    };
  }

  // Tokenize based on granularity
  const tokenize = opts.granularity === 'word' ? tokenizeWords : tokenizeChars;
  const oldTokens = tokenize(oldLine);
  const newTokens = tokenize(newLine);

  // Compute LCS
  const lcs = computeTokenLCS(oldTokens, newTokens, opts);

  // Build segments for old line
  const oldSegments: DiffSegment[] = [];
  let oldLcsIdx = 0;
  let currentOldSegment = '';
  let currentOldType: 'equal' | 'delete' = 'delete';

  for (let i = 0; i < oldTokens.length; i++) {
    const token = oldTokens[i]!;
    const isMatch = oldLcsIdx < lcs.length && lcs[oldLcsIdx]!.oldIdx === i;

    if (isMatch) {
      // Flush any pending delete segment
      if (currentOldSegment && currentOldType === 'delete') {
        oldSegments.push({ text: currentOldSegment, type: 'delete' });
        currentOldSegment = '';
      }
      // Add equal segment
      if (currentOldType === 'equal') {
        currentOldSegment += token;
      } else {
        currentOldSegment = token;
        currentOldType = 'equal';
      }
      oldLcsIdx++;
    } else {
      // Flush any pending equal segment
      if (currentOldSegment && currentOldType === 'equal') {
        oldSegments.push({ text: currentOldSegment, type: 'equal' });
        currentOldSegment = '';
      }
      // Add to delete segment
      if (currentOldType === 'delete') {
        currentOldSegment += token;
      } else {
        currentOldSegment = token;
        currentOldType = 'delete';
      }
    }
  }

  // Flush remaining
  if (currentOldSegment) {
    oldSegments.push({ text: currentOldSegment, type: currentOldType });
  }

  // Build segments for new line
  const newSegments: DiffSegment[] = [];
  let newLcsIdx = 0;
  let currentNewSegment = '';
  let currentNewType: 'equal' | 'insert' = 'insert';

  for (let i = 0; i < newTokens.length; i++) {
    const token = newTokens[i]!;
    const isMatch = newLcsIdx < lcs.length && lcs[newLcsIdx]!.newIdx === i;

    if (isMatch) {
      // Flush any pending insert segment
      if (currentNewSegment && currentNewType === 'insert') {
        newSegments.push({ text: currentNewSegment, type: 'insert' });
        currentNewSegment = '';
      }
      // Add equal segment
      if (currentNewType === 'equal') {
        currentNewSegment += token;
      } else {
        currentNewSegment = token;
        currentNewType = 'equal';
      }
      newLcsIdx++;
    } else {
      // Flush any pending equal segment
      if (currentNewSegment && currentNewType === 'equal') {
        newSegments.push({ text: currentNewSegment, type: 'equal' });
        currentNewSegment = '';
      }
      // Add to insert segment
      if (currentNewType === 'insert') {
        currentNewSegment += token;
      } else {
        currentNewSegment = token;
        currentNewType = 'insert';
      }
    }
  }

  // Flush remaining
  if (currentNewSegment) {
    newSegments.push({ text: currentNewSegment, type: currentNewType });
  }

  // Handle empty cases
  if (oldSegments.length === 0 && oldLine) {
    oldSegments.push({ text: oldLine, type: 'delete' });
  }
  if (newSegments.length === 0 && newLine) {
    newSegments.push({ text: newLine, type: 'insert' });
  }

  return {
    oldSegments,
    newSegments,
    hasDifferences: true,
  };
}

/**
 * Compute word diff for a pair of matching delete/add lines
 */
export function diffLinePair(
  deletedLine: string,
  addedLine: string,
  options: WordDiffOptions = {}
): WordDiffResult {
  return diffWords(deletedLine, addedLine, options);
}

/**
 * Find pairs of delete/add lines that likely correspond to each other
 * (for highlighting changes within modified lines)
 */
export interface LinePair {
  /** Index in the deleted lines array */
  deleteIdx: number;
  /** Index in the added lines array */
  addIdx: number;
  /** Similarity score (0-1) */
  similarity: number;
}

/**
 * Calculate similarity between two strings (0-1)
 */
function calculateLineSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  // Use a simple ratio based on LCS length
  const lcs = computeTokenLCS(
    tokenizeWords(a),
    tokenizeWords(b),
    defaultOptions
  );

  const maxLen = Math.max(a.length, b.length);
  const lcsLen = lcs.reduce((sum, match) => {
    const aToken = tokenizeWords(a)[match.oldIdx] ?? '';
    return sum + aToken.length;
  }, 0);

  return lcsLen / maxLen;
}

/**
 * Find matching line pairs between deleted and added lines
 */
export function findLinePairs(
  deletedLines: string[],
  addedLines: string[],
  similarityThreshold = 0.4
): LinePair[] {
  const pairs: LinePair[] = [];
  const usedDeleted = new Set<number>();
  const usedAdded = new Set<number>();

  // Calculate all similarities
  const similarities: Array<{ delIdx: number; addIdx: number; similarity: number }> = [];

  for (let delIdx = 0; delIdx < deletedLines.length; delIdx++) {
    for (let addIdx = 0; addIdx < addedLines.length; addIdx++) {
      const similarity = calculateLineSimilarity(deletedLines[delIdx]!, addedLines[addIdx]!);
      if (similarity >= similarityThreshold) {
        similarities.push({ delIdx, addIdx, similarity });
      }
    }
  }

  // Sort by similarity (highest first)
  similarities.sort((a, b) => b.similarity - a.similarity);

  // Greedily match pairs
  for (const { delIdx, addIdx, similarity } of similarities) {
    if (usedDeleted.has(delIdx) || usedAdded.has(addIdx)) continue;

    pairs.push({ deleteIdx: delIdx, addIdx, similarity });
    usedDeleted.add(delIdx);
    usedAdded.add(addIdx);
  }

  return pairs;
}

/**
 * Enhanced change with word-level diff information
 */
export interface EnhancedChange {
  /** Original change type */
  type: 'add' | 'delete' | 'normal';
  /** Original content */
  content: string;
  /** Word-level segments (if available) */
  segments?: DiffSegment[];
  /** Old line number */
  oldLineNumber?: number;
  /** New line number */
  newLineNumber?: number;
  /** Whether this change has a paired change */
  hasPairedChange?: boolean;
  /** Index of the paired change (if any) */
  pairedChangeIndex?: number;
}

/**
 * Enhance a list of changes with word-level diff information
 */
export function enhanceChangesWithWordDiff(
  changes: Array<{
    type: 'add' | 'delete' | 'normal';
    content: string;
    oldLineNumber?: number;
    newLineNumber?: number;
  }>,
  options: WordDiffOptions = {}
): EnhancedChange[] {
  const opts = { ...defaultOptions, ...options };

  // Collect consecutive deletes and adds
  const enhanced: EnhancedChange[] = changes.map((c) => ({ ...c }));

  let i = 0;
  while (i < enhanced.length) {
    // Find a run of deletes followed by adds
    const deleteStart = i;
    while (i < enhanced.length && enhanced[i]!.type === 'delete') {
      i++;
    }
    const deleteEnd = i;

    const addStart = i;
    while (i < enhanced.length && enhanced[i]!.type === 'add') {
      i++;
    }
    const addEnd = i;

    // If we have both deletes and adds, try to pair them
    if (deleteEnd > deleteStart && addEnd > addStart) {
      const deletedLines = enhanced.slice(deleteStart, deleteEnd).map((c) => c.content);
      const addedLines = enhanced.slice(addStart, addEnd).map((c) => c.content);

      const pairs = findLinePairs(deletedLines, addedLines);

      for (const pair of pairs) {
        const delChange = enhanced[deleteStart + pair.deleteIdx]!;
        const addChange = enhanced[addStart + pair.addIdx]!;

        const wordDiff = diffWords(delChange.content, addChange.content, opts);

        delChange.segments = wordDiff.oldSegments;
        delChange.hasPairedChange = true;
        delChange.pairedChangeIndex = addStart + pair.addIdx;

        addChange.segments = wordDiff.newSegments;
        addChange.hasPairedChange = true;
        addChange.pairedChangeIndex = deleteStart + pair.deleteIdx;
      }
    }

    // Move to next change if we didn't advance
    if (i === deleteStart) {
      i++;
    }
  }

  return enhanced;
}

/**
 * Render segments to HTML with highlighting
 */
export function segmentsToHtml(
  segments: DiffSegment[],
  options: { deleteClass?: string; insertClass?: string; equalClass?: string } = {}
): string {
  const {
    deleteClass = 'diffkit-word-delete',
    insertClass = 'diffkit-word-insert',
    equalClass = 'diffkit-word-equal',
  } = options;

  return segments
    .map((segment) => {
      const escaped = segment.text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      switch (segment.type) {
        case 'delete':
          return `<span class="${deleteClass}">${escaped}</span>`;
        case 'insert':
          return `<span class="${insertClass}">${escaped}</span>`;
        case 'equal':
          return `<span class="${equalClass}">${escaped}</span>`;
      }
    })
    .join('');
}

export default diffWords;
