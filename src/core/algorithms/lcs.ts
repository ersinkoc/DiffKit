/**
 * Longest Common Subsequence (LCS) utility
 * Used by all diff algorithms as a foundation
 */

/**
 * Compute the longest common subsequence between two arrays
 * Returns the indices of matching elements
 */
export function computeLCS<T>(
  oldArr: T[],
  newArr: T[],
  equals: (a: T, b: T) => boolean = (a, b) => a === b
): { oldIndex: number; newIndex: number }[] {
  const oldLen = oldArr.length;
  const newLen = newArr.length;

  if (oldLen === 0 || newLen === 0) {
    return [];
  }

  // Build LCS length table
  const dp: number[][] = Array.from({ length: oldLen + 1 }, () =>
    Array.from({ length: newLen + 1 }, () => 0)
  );

  for (let i = 1; i <= oldLen; i++) {
    for (let j = 1; j <= newLen; j++) {
      const oldItem = oldArr[i - 1];
      const newItem = newArr[j - 1];
      if (oldItem !== undefined && newItem !== undefined && equals(oldItem, newItem)) {
        dp[i]![j] = (dp[i - 1]?.[j - 1] ?? 0) + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]?.[j] ?? 0, dp[i]?.[j - 1] ?? 0);
      }
    }
  }

  // Backtrack to find the actual LCS
  const result: { oldIndex: number; newIndex: number }[] = [];
  let i = oldLen;
  let j = newLen;

  while (i > 0 && j > 0) {
    const oldItem = oldArr[i - 1];
    const newItem = newArr[j - 1];
    if (oldItem !== undefined && newItem !== undefined && equals(oldItem, newItem)) {
      result.unshift({ oldIndex: i - 1, newIndex: j - 1 });
      i--;
      j--;
    } else if ((dp[i - 1]?.[j] ?? 0) > (dp[i]?.[j - 1] ?? 0)) {
      i--;
    } else {
      j--;
    }
  }

  return result;
}

/**
 * Find all unique lines that appear exactly once in both sequences
 * Used by Patience algorithm
 */
export function findUniqueLines(oldLines: string[], newLines: string[]): Map<string, { oldIndex: number; newIndex: number }> {
  const oldCounts = new Map<string, { count: number; index: number }>();
  const newCounts = new Map<string, { count: number; index: number }>();

  // Count occurrences in old
  for (let i = 0; i < oldLines.length; i++) {
    const line = oldLines[i]!;
    const existing = oldCounts.get(line);
    if (existing) {
      existing.count++;
    } else {
      oldCounts.set(line, { count: 1, index: i });
    }
  }

  // Count occurrences in new
  for (let i = 0; i < newLines.length; i++) {
    const line = newLines[i]!;
    const existing = newCounts.get(line);
    if (existing) {
      existing.count++;
    } else {
      newCounts.set(line, { count: 1, index: i });
    }
  }

  // Find lines that appear exactly once in both
  const result = new Map<string, { oldIndex: number; newIndex: number }>();

  for (const [line, oldData] of oldCounts) {
    if (oldData.count === 1) {
      const newData = newCounts.get(line);
      if (newData && newData.count === 1) {
        result.set(line, { oldIndex: oldData.index, newIndex: newData.index });
      }
    }
  }

  return result;
}

/**
 * Compute LCS for patience algorithm using unique lines as anchors
 */
export function patienceLCS(
  uniqueMatches: { oldIndex: number; newIndex: number }[]
): { oldIndex: number; newIndex: number }[] {
  if (uniqueMatches.length === 0) {
    return [];
  }

  // Sort by old index
  const sorted = [...uniqueMatches].sort((a, b) => a.oldIndex - b.oldIndex);

  // Find LIS (Longest Increasing Subsequence) by new index
  // This is the core of patience algorithm
  const piles: { oldIndex: number; newIndex: number; prev: number }[] = [];
  const positions: number[] = [];

  for (const match of sorted) {
    // Binary search for the pile to place this element
    let lo = 0;
    let hi = piles.length;

    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if ((piles[mid]?.newIndex ?? 0) < match.newIndex) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }

    const prev = lo > 0 ? lo - 1 : -1;
    const entry = { ...match, prev };

    if (lo === piles.length) {
      piles.push(entry);
    } else {
      piles[lo] = entry;
    }
    positions.push(lo);
  }

  // Reconstruct LIS
  const result: { oldIndex: number; newIndex: number }[] = [];
  let idx = piles.length - 1;

  for (let i = positions.length - 1; i >= 0 && idx >= 0; i--) {
    if (positions[i] === idx) {
      const pile = piles[idx];
      if (pile) {
        result.unshift({ oldIndex: pile.oldIndex, newIndex: pile.newIndex });
        idx = pile.prev;
      }
    }
  }

  return result;
}

/**
 * Count line occurrences for histogram algorithm
 */
export function countOccurrences(lines: string[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const line of lines) {
    counts.set(line, (counts.get(line) ?? 0) + 1);
  }

  return counts;
}

/**
 * Find low-occurrence lines for histogram algorithm
 * Returns lines sorted by occurrence count (lowest first)
 */
export function findLowOccurrenceLines(
  oldLines: string[],
  newLines: string[],
  maxOccurrences: number = 64
): string[] {
  const oldCounts = countOccurrences(oldLines);
  const newCounts = countOccurrences(newLines);

  const candidates: { line: string; total: number }[] = [];

  for (const [line, oldCount] of oldCounts) {
    const newCount = newCounts.get(line) ?? 0;
    const total = oldCount + newCount;

    if (total <= maxOccurrences && newCount > 0) {
      candidates.push({ line, total });
    }
  }

  // Sort by total occurrences
  candidates.sort((a, b) => a.total - b.total);

  return candidates.map((c) => c.line);
}
