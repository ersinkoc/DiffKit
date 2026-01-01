/**
 * Unified diff format parser
 * Parses unified diff/patch files into structured hunks
 */

import type { Hunk, Change, DiffStats } from './types.js';

/**
 * Parsed unified diff result
 */
export interface ParsedUnifiedDiff {
  oldFileName?: string;
  newFileName?: string;
  hunks: Hunk[];
  stats: DiffStats;
}

/**
 * File diff in a multi-file patch
 */
export interface FileDiff {
  oldFileName: string;
  newFileName: string;
  hunks: Hunk[];
  stats: DiffStats;
  isBinary: boolean;
  isNew: boolean;
  isDeleted: boolean;
  isRenamed: boolean;
}

/**
 * Parsed patch file with multiple file diffs
 */
export interface ParsedPatch {
  files: FileDiff[];
  stats: DiffStats;
}

/**
 * Parse a unified diff string into structured data
 */
export function parseUnifiedDiff(diffString: string): ParsedUnifiedDiff {
  const lines = diffString.split('\n');
  const hunks: Hunk[] = [];
  let oldFileName: string | undefined;
  let newFileName: string | undefined;
  let currentHunk: Hunk | null = null;
  let oldLineNum = 0;
  let newLineNum = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';

    // Parse file headers
    if (line.startsWith('--- ')) {
      oldFileName = parseFileName(line.slice(4));
      continue;
    }

    if (line.startsWith('+++ ')) {
      newFileName = parseFileName(line.slice(4));
      continue;
    }

    // Parse hunk header
    if (line.startsWith('@@')) {
      if (currentHunk) {
        hunks.push(currentHunk);
      }

      const hunkInfo = parseHunkHeader(line);
      if (hunkInfo) {
        currentHunk = {
          oldStart: hunkInfo.oldStart,
          oldLines: hunkInfo.oldLines,
          newStart: hunkInfo.newStart,
          newLines: hunkInfo.newLines,
          header: line,
          changes: [],
        };
        oldLineNum = hunkInfo.oldStart;
        newLineNum = hunkInfo.newStart;
      }
      continue;
    }

    // Parse change lines
    if (currentHunk) {
      if (line.startsWith('-')) {
        currentHunk.changes.push({
          type: 'delete',
          content: line.slice(1),
          oldLineNumber: oldLineNum++,
        });
      } else if (line.startsWith('+')) {
        currentHunk.changes.push({
          type: 'add',
          content: line.slice(1),
          newLineNumber: newLineNum++,
        });
      } else if (line.startsWith(' ') || line === '') {
        currentHunk.changes.push({
          type: 'normal',
          content: line.startsWith(' ') ? line.slice(1) : line,
          oldLineNumber: oldLineNum++,
          newLineNumber: newLineNum++,
        });
      } else if (line.startsWith('\\')) {
        // "\ No newline at end of file" - skip
        continue;
      }
    }
  }

  // Push last hunk
  if (currentHunk) {
    hunks.push(currentHunk);
  }

  return {
    oldFileName,
    newFileName,
    hunks,
    stats: calculateStats(hunks),
  };
}

/**
 * Parse a patch file containing multiple file diffs
 */
export function parsePatch(patchString: string): ParsedPatch {
  const files: FileDiff[] = [];
  const lines = patchString.split('\n');
  let currentFile: Partial<FileDiff> | null = null;
  let currentHunk: Hunk | null = null;
  let oldLineNum = 0;
  let newLineNum = 0;
  let isBinary = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';

    // Git diff header
    if (line.startsWith('diff --git ')) {
      // Save previous file
      if (currentFile && currentFile.oldFileName) {
        if (currentHunk) {
          currentFile.hunks = currentFile.hunks || [];
          currentFile.hunks.push(currentHunk);
          currentHunk = null;
        }
        currentFile.stats = calculateStats(currentFile.hunks || []);
        files.push(currentFile as FileDiff);
      }

      // Parse git diff header
      const match = line.match(/^diff --git a\/(.+) b\/(.+)$/);
      if (match) {
        currentFile = {
          oldFileName: match[1],
          newFileName: match[2],
          hunks: [],
          isBinary: false,
          isNew: false,
          isDeleted: false,
          isRenamed: match[1] !== match[2],
        };
        isBinary = false;
      }
      continue;
    }

    // Binary file marker
    if (line.startsWith('Binary files ') || line.includes('GIT binary patch')) {
      if (currentFile) {
        currentFile.isBinary = true;
        isBinary = true;
      }
      continue;
    }

    // New file mode
    if (line.startsWith('new file mode')) {
      if (currentFile) {
        currentFile.isNew = true;
      }
      continue;
    }

    // Deleted file mode
    if (line.startsWith('deleted file mode')) {
      if (currentFile) {
        currentFile.isDeleted = true;
      }
      continue;
    }

    // Skip binary content
    if (isBinary) {
      continue;
    }

    // File headers for unified diff
    if (line.startsWith('--- ')) {
      if (!currentFile) {
        currentFile = {
          oldFileName: parseFileName(line.slice(4)),
          newFileName: '',
          hunks: [],
          isBinary: false,
          isNew: false,
          isDeleted: false,
          isRenamed: false,
        };
      }
      continue;
    }

    if (line.startsWith('+++ ')) {
      if (currentFile) {
        currentFile.newFileName = parseFileName(line.slice(4));
      }
      continue;
    }

    // Hunk header
    if (line.startsWith('@@') && currentFile) {
      if (currentHunk) {
        currentFile.hunks = currentFile.hunks || [];
        currentFile.hunks.push(currentHunk);
      }

      const hunkInfo = parseHunkHeader(line);
      if (hunkInfo) {
        currentHunk = {
          oldStart: hunkInfo.oldStart,
          oldLines: hunkInfo.oldLines,
          newStart: hunkInfo.newStart,
          newLines: hunkInfo.newLines,
          header: line,
          changes: [],
        };
        oldLineNum = hunkInfo.oldStart;
        newLineNum = hunkInfo.newStart;
      }
      continue;
    }

    // Change lines
    if (currentHunk && currentFile) {
      if (line.startsWith('-')) {
        currentHunk.changes.push({
          type: 'delete',
          content: line.slice(1),
          oldLineNumber: oldLineNum++,
        });
      } else if (line.startsWith('+')) {
        currentHunk.changes.push({
          type: 'add',
          content: line.slice(1),
          newLineNumber: newLineNum++,
        });
      } else if (line.startsWith(' ')) {
        currentHunk.changes.push({
          type: 'normal',
          content: line.slice(1),
          oldLineNumber: oldLineNum++,
          newLineNumber: newLineNum++,
        });
      } else if (line.startsWith('\\')) {
        // No newline marker - skip
        continue;
      }
    }
  }

  // Save last file
  if (currentFile && currentFile.oldFileName) {
    if (currentHunk) {
      currentFile.hunks = currentFile.hunks || [];
      currentFile.hunks.push(currentHunk);
    }
    currentFile.stats = calculateStats(currentFile.hunks || []);
    files.push(currentFile as FileDiff);
  }

  // Calculate total stats
  const totalStats: DiffStats = {
    additions: 0,
    deletions: 0,
    changes: 0,
    oldLineCount: 0,
    newLineCount: 0,
  };

  for (const file of files) {
    totalStats.additions += file.stats.additions;
    totalStats.deletions += file.stats.deletions;
    totalStats.changes += file.stats.changes;
    totalStats.oldLineCount += file.stats.oldLineCount;
    totalStats.newLineCount += file.stats.newLineCount;
  }

  return { files, stats: totalStats };
}

/**
 * Parse hunk header line
 */
function parseHunkHeader(header: string): {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
} | null {
  // @@ -oldStart,oldLines +newStart,newLines @@
  const match = header.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);

  if (!match) {
    return null;
  }

  return {
    oldStart: parseInt(match[1] ?? '0', 10),
    oldLines: parseInt(match[2] ?? '1', 10),
    newStart: parseInt(match[3] ?? '0', 10),
    newLines: parseInt(match[4] ?? '1', 10),
  };
}

/**
 * Parse file name from header line
 */
function parseFileName(raw: string): string {
  // Remove timestamp if present (e.g., "file.txt\t2024-01-01 12:00:00")
  let fileName = raw.split('\t')[0] ?? raw;

  // Remove a/ or b/ prefix from git diffs
  if (fileName.startsWith('a/') || fileName.startsWith('b/')) {
    fileName = fileName.slice(2);
  }

  // Handle /dev/null for new or deleted files
  if (fileName === '/dev/null') {
    return '/dev/null';
  }

  return fileName.trim();
}

/**
 * Calculate statistics from hunks
 */
function calculateStats(hunks: Hunk[]): DiffStats {
  let additions = 0;
  let deletions = 0;
  let oldLineCount = 0;
  let newLineCount = 0;

  for (const hunk of hunks) {
    for (const change of hunk.changes) {
      if (change.type === 'add') {
        additions++;
        newLineCount++;
      } else if (change.type === 'delete') {
        deletions++;
        oldLineCount++;
      } else {
        oldLineCount++;
        newLineCount++;
      }
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
 * Validate unified diff format
 */
export function isValidUnifiedDiff(diffString: string): boolean {
  // Must have at least one hunk header
  if (!diffString.includes('@@')) {
    return false;
  }

  // Check for valid hunk header format
  const hunkHeaderRegex = /@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@/;
  return hunkHeaderRegex.test(diffString);
}

/**
 * Extract just the changes from a unified diff (without file headers)
 */
export function extractChanges(diffString: string): Change[] {
  const parsed = parseUnifiedDiff(diffString);
  const changes: Change[] = [];

  for (const hunk of parsed.hunks) {
    changes.push(...hunk.changes);
  }

  return changes;
}

/**
 * Reverse a unified diff (swap add/delete)
 */
export function reverseDiff(parsed: ParsedUnifiedDiff): ParsedUnifiedDiff {
  const reversedHunks: Hunk[] = parsed.hunks.map((hunk) => ({
    oldStart: hunk.newStart,
    oldLines: hunk.newLines,
    newStart: hunk.oldStart,
    newLines: hunk.oldLines,
    header: `@@ -${hunk.newStart},${hunk.newLines} +${hunk.oldStart},${hunk.oldLines} @@`,
    changes: hunk.changes.map((change) => {
      if (change.type === 'add') {
        return {
          type: 'delete' as const,
          content: change.content,
          oldLineNumber: change.newLineNumber,
        };
      } else if (change.type === 'delete') {
        return {
          type: 'add' as const,
          content: change.content,
          newLineNumber: change.oldLineNumber,
        };
      }
      return {
        ...change,
        oldLineNumber: change.newLineNumber,
        newLineNumber: change.oldLineNumber,
      };
    }),
  }));

  return {
    oldFileName: parsed.newFileName,
    newFileName: parsed.oldFileName,
    hunks: reversedHunks,
    stats: {
      additions: parsed.stats.deletions,
      deletions: parsed.stats.additions,
      changes: parsed.stats.changes,
      oldLineCount: parsed.stats.newLineCount,
      newLineCount: parsed.stats.oldLineCount,
    },
  };
}

/**
 * Apply a parsed diff to content
 */
export function applyDiff(content: string, parsed: ParsedUnifiedDiff): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let lineIndex = 0;

  for (const hunk of parsed.hunks) {
    // Add unchanged lines before this hunk
    while (lineIndex < hunk.oldStart - 1) {
      result.push(lines[lineIndex] ?? '');
      lineIndex++;
    }

    // Apply changes from this hunk
    for (const change of hunk.changes) {
      if (change.type === 'normal') {
        result.push(change.content);
        lineIndex++;
      } else if (change.type === 'add') {
        result.push(change.content);
      } else if (change.type === 'delete') {
        lineIndex++;
      }
    }
  }

  // Add remaining lines
  while (lineIndex < lines.length) {
    result.push(lines[lineIndex] ?? '');
    lineIndex++;
  }

  return result.join('\n');
}

export default parseUnifiedDiff;

// Alias export for use alongside hunk.ts parseUnifiedDiff
export { parseUnifiedDiff as parseUnifiedDiffFull };
