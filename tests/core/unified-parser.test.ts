/**
 * Tests for unified diff/patch parser
 */


import parseUnifiedDiff, {
  parsePatch,
  isValidUnifiedDiff,
  extractChanges,
  reverseDiff,
  applyDiff,
} from '../../src/core/unified-parser.js';

// Alias for compatibility with index.ts export name
const parseUnifiedDiffFull = parseUnifiedDiff;

describe('parseUnifiedDiffFull', () => {
  it('should parse simple unified diff', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,3 @@
 line1
-old line
+new line
 line3`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.oldFileName).toBe('file.txt');
    expect(result.newFileName).toBe('file.txt');
    expect(result.hunks).toHaveLength(1);
    expect(result.stats.additions).toBe(1);
    expect(result.stats.deletions).toBe(1);
  });

  it('should parse hunk header correctly', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -10,5 +12,7 @@
 context`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.hunks[0]?.oldStart).toBe(10);
    expect(result.hunks[0]?.oldLines).toBe(5);
    expect(result.hunks[0]?.newStart).toBe(12);
    expect(result.hunks[0]?.newLines).toBe(7);
  });

  it('should handle single line hunk headers', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1 +1 @@
-old
+new`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.hunks[0]?.oldLines).toBe(1);
    expect(result.hunks[0]?.newLines).toBe(1);
  });

  it('should parse multiple hunks', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,3 @@
 line1
-old1
+new1
 line3
@@ -10,3 +10,3 @@
 line10
-old2
+new2
 line12`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.hunks).toHaveLength(2);
    expect(result.hunks[0]?.oldStart).toBe(1);
    expect(result.hunks[1]?.oldStart).toBe(10);
  });

  it('should calculate correct stats', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,5 +1,6 @@
 line1
-deleted1
-deleted2
+added1
+added2
+added3
 line3`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.stats.additions).toBe(3);
    expect(result.stats.deletions).toBe(2);
    expect(result.stats.changes).toBe(5);
  });

  it('should handle no newline at end of file marker', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1 +1 @@
-old
\\ No newline at end of file
+new
\\ No newline at end of file`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.hunks[0]?.changes).toHaveLength(2);
  });

  it('should handle empty lines in diff', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,3 @@

-old

+new
`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.hunks[0]?.changes.some(c => c.content === '')).toBe(true);
  });

  it('should parse file names with timestamps', () => {
    const diff = `--- a/file.txt\t2024-01-01 12:00:00
+++ b/file.txt\t2024-01-02 12:00:00
@@ -1 +1 @@
-old
+new`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.oldFileName).toBe('file.txt');
    expect(result.newFileName).toBe('file.txt');
  });

  it('should handle /dev/null for new files', () => {
    const diff = `--- /dev/null
+++ b/newfile.txt
@@ -0,0 +1,2 @@
+line1
+line2`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.oldFileName).toBe('/dev/null');
    expect(result.newFileName).toBe('newfile.txt');
  });

  it('should handle /dev/null for deleted files', () => {
    const diff = `--- a/oldfile.txt
+++ /dev/null
@@ -1,2 +0,0 @@
-line1
-line2`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.oldFileName).toBe('oldfile.txt');
    expect(result.newFileName).toBe('/dev/null');
  });

  it('should handle empty diff string', () => {
    const result = parseUnifiedDiffFull('');

    expect(result.hunks).toHaveLength(0);
    expect(result.stats.additions).toBe(0);
    expect(result.stats.deletions).toBe(0);
  });

  it('should set correct line numbers on changes', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -5,3 +5,3 @@
 context
-old
+new
 context`;

    const result = parseUnifiedDiffFull(diff);
    const changes = result.hunks[0]?.changes;

    expect(changes?.[0]?.oldLineNumber).toBe(5);
    expect(changes?.[0]?.newLineNumber).toBe(5);
    expect(changes?.[1]?.oldLineNumber).toBe(6);
    expect(changes?.[2]?.newLineNumber).toBe(6);
  });
});

describe('parsePatch', () => {
  it('should parse git diff with single file', () => {
    const patch = `diff --git a/file.txt b/file.txt
--- a/file.txt
+++ b/file.txt
@@ -1 +1 @@
-old
+new`;

    const result = parsePatch(patch);

    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.oldFileName).toBe('file.txt');
    expect(result.files[0]?.newFileName).toBe('file.txt');
  });

  it('should parse git diff with multiple files', () => {
    const patch = `diff --git a/file1.txt b/file1.txt
--- a/file1.txt
+++ b/file1.txt
@@ -1 +1 @@
-old1
+new1
diff --git a/file2.txt b/file2.txt
--- a/file2.txt
+++ b/file2.txt
@@ -1 +1 @@
-old2
+new2`;

    const result = parsePatch(patch);

    expect(result.files).toHaveLength(2);
    expect(result.files[0]?.oldFileName).toBe('file1.txt');
    expect(result.files[1]?.oldFileName).toBe('file2.txt');
  });

  it('should detect new file mode', () => {
    const patch = `diff --git a/new.txt b/new.txt
new file mode 100644
--- /dev/null
+++ b/new.txt
@@ -0,0 +1 @@
+content`;

    const result = parsePatch(patch);

    expect(result.files[0]?.isNew).toBe(true);
    expect(result.files[0]?.isDeleted).toBe(false);
  });

  it('should detect deleted file mode', () => {
    const patch = `diff --git a/old.txt b/old.txt
deleted file mode 100644
--- a/old.txt
+++ /dev/null
@@ -1 +0,0 @@
-content`;

    const result = parsePatch(patch);

    expect(result.files[0]?.isDeleted).toBe(true);
    expect(result.files[0]?.isNew).toBe(false);
  });

  it('should detect renamed files', () => {
    const patch = `diff --git a/old.txt b/new.txt
--- a/old.txt
+++ b/new.txt
@@ -1 +1 @@
-old
+new`;

    const result = parsePatch(patch);

    expect(result.files[0]?.isRenamed).toBe(true);
    expect(result.files[0]?.oldFileName).toBe('old.txt');
    expect(result.files[0]?.newFileName).toBe('new.txt');
  });

  it('should detect binary files', () => {
    const patch = `diff --git a/image.png b/image.png
Binary files a/image.png and b/image.png differ`;

    const result = parsePatch(patch);

    expect(result.files[0]?.isBinary).toBe(true);
  });

  it('should detect GIT binary patch marker', () => {
    const patch = `diff --git a/image.png b/image.png
GIT binary patch
literal 1234
somedata`;

    const result = parsePatch(patch);

    expect(result.files[0]?.isBinary).toBe(true);
  });

  it('should calculate total stats across files', () => {
    const patch = `diff --git a/file1.txt b/file1.txt
--- a/file1.txt
+++ b/file1.txt
@@ -1 +1,2 @@
-old
+new1
+new2
diff --git a/file2.txt b/file2.txt
--- a/file2.txt
+++ b/file2.txt
@@ -1,2 +1 @@
-old1
-old2
+new`;

    const result = parsePatch(patch);

    expect(result.stats.additions).toBe(3);
    expect(result.stats.deletions).toBe(3);
  });

  it('should handle empty patch', () => {
    const result = parsePatch('');

    expect(result.files).toHaveLength(0);
    expect(result.stats.additions).toBe(0);
  });

  it('should parse unified diff without git header', () => {
    const patch = `--- a/file.txt
+++ b/file.txt
@@ -1 +1 @@
-old
+new`;

    const result = parsePatch(patch);

    expect(result.files).toHaveLength(1);
    expect(result.files[0]?.oldFileName).toBe('file.txt');
  });
});

describe('isValidUnifiedDiff', () => {
  it('should return true for valid unified diff', () => {
    const diff = `@@ -1,3 +1,3 @@
 context
-old
+new`;

    expect(isValidUnifiedDiff(diff)).toBe(true);
  });

  it('should return false for string without hunk header', () => {
    expect(isValidUnifiedDiff('just some text')).toBe(false);
  });

  it('should return false for invalid hunk header format', () => {
    expect(isValidUnifiedDiff('@@ invalid @@')).toBe(false);
  });

  it('should return true for complex hunk header', () => {
    const diff = '@@ -100,50 +200,75 @@ function name';
    expect(isValidUnifiedDiff(diff)).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(isValidUnifiedDiff('')).toBe(false);
  });
});

describe('extractChanges', () => {
  it('should extract all changes from diff', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,3 @@
 context
-deleted
+added
 context`;

    const changes = extractChanges(diff);

    expect(changes).toHaveLength(4);
    expect(changes.filter(c => c.type === 'add')).toHaveLength(1);
    expect(changes.filter(c => c.type === 'delete')).toHaveLength(1);
    expect(changes.filter(c => c.type === 'normal')).toHaveLength(2);
  });

  it('should extract changes from multiple hunks', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,2 +1,2 @@
-old1
+new1
 context
@@ -10,2 +10,2 @@
-old2
+new2
 context`;

    const changes = extractChanges(diff);

    expect(changes.filter(c => c.type === 'add')).toHaveLength(2);
    expect(changes.filter(c => c.type === 'delete')).toHaveLength(2);
  });

  it('should handle empty diff', () => {
    const changes = extractChanges('');

    expect(changes).toHaveLength(0);
  });
});

describe('reverseDiff', () => {
  it('should swap add and delete types', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,2 +1,2 @@
-deleted
+added
 context`;

    const parsed = parseUnifiedDiffFull(diff);
    const reversed = reverseDiff(parsed);

    const addChange = reversed.hunks[0]?.changes.find(c => c.type === 'add');
    const deleteChange = reversed.hunks[0]?.changes.find(c => c.type === 'delete');

    expect(addChange?.content).toBe('deleted');
    expect(deleteChange?.content).toBe('added');
  });

  it('should swap file names', () => {
    const diff = `--- a/old.txt
+++ b/new.txt
@@ -1 +1 @@
-old
+new`;

    const parsed = parseUnifiedDiffFull(diff);
    const reversed = reverseDiff(parsed);

    expect(reversed.oldFileName).toBe('new.txt');
    expect(reversed.newFileName).toBe('old.txt');
  });

  it('should swap hunk line ranges', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -10,5 +20,7 @@
 context`;

    const parsed = parseUnifiedDiffFull(diff);
    const reversed = reverseDiff(parsed);

    expect(reversed.hunks[0]?.oldStart).toBe(20);
    expect(reversed.hunks[0]?.oldLines).toBe(7);
    expect(reversed.hunks[0]?.newStart).toBe(10);
    expect(reversed.hunks[0]?.newLines).toBe(5);
  });

  it('should swap stats', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,4 @@
-deleted
+added1
+added2
 context`;

    const parsed = parseUnifiedDiffFull(diff);
    const reversed = reverseDiff(parsed);

    expect(reversed.stats.additions).toBe(1);
    expect(reversed.stats.deletions).toBe(2);
  });

  it('should update hunk header', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +4,5 @@
 context`;

    const parsed = parseUnifiedDiffFull(diff);
    const reversed = reverseDiff(parsed);

    expect(reversed.hunks[0]?.header).toBe('@@ -4,5 +1,3 @@');
  });

  it('should preserve normal lines with swapped line numbers', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,1 +1,1 @@
 context`;

    const parsed = parseUnifiedDiffFull(diff);
    const reversed = reverseDiff(parsed);
    const normalChange = reversed.hunks[0]?.changes[0];

    expect(normalChange?.type).toBe('normal');
    expect(normalChange?.oldLineNumber).toBe(1);
    expect(normalChange?.newLineNumber).toBe(1);
  });
});

describe('applyDiff', () => {
  it('should apply simple replacement', () => {
    const content = `line1
old
line3`;
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,3 @@
 line1
-old
+new
 line3`;

    const parsed = parseUnifiedDiffFull(diff);
    const result = applyDiff(content, parsed);

    expect(result).toBe(`line1
new
line3`);
  });

  it('should apply addition', () => {
    const content = `line1
line2`;
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,2 +1,3 @@
 line1
+inserted
 line2`;

    const parsed = parseUnifiedDiffFull(diff);
    const result = applyDiff(content, parsed);

    expect(result).toBe(`line1
inserted
line2`);
  });

  it('should apply deletion', () => {
    const content = `line1
to-delete
line3`;
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,2 @@
 line1
-to-delete
 line3`;

    const parsed = parseUnifiedDiffFull(diff);
    const result = applyDiff(content, parsed);

    expect(result).toBe(`line1
line3`);
  });

  it('should apply multiple hunks', () => {
    const content = `line1
old1
line3
line4
line5
line6
line7
old2
line9`;
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,3 @@
 line1
-old1
+new1
 line3
@@ -7,3 +7,3 @@
 line7
-old2
+new2
 line9`;

    const parsed = parseUnifiedDiffFull(diff);
    const result = applyDiff(content, parsed);

    expect(result).toContain('new1');
    expect(result).toContain('new2');
    expect(result).not.toContain('old1');
    expect(result).not.toContain('old2');
  });

  it('should handle empty content', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -0,0 +1,2 @@
+line1
+line2`;

    const parsed = parseUnifiedDiffFull(diff);
    const result = applyDiff('', parsed);

    // Result includes trailing content from join
    expect(result).toContain('line1');
    expect(result).toContain('line2');
  });

  it('should handle diff with no hunks', () => {
    const content = 'unchanged';
    const parsed = parseUnifiedDiffFull('');
    const result = applyDiff(content, parsed);

    expect(result).toBe('unchanged');
  });
});

describe('round-trip operations', () => {
  it('should reverse twice to get original', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,4 @@
 line1
-deleted
+added1
+added2
 line3`;

    const parsed = parseUnifiedDiffFull(diff);
    const reversedOnce = reverseDiff(parsed);
    const reversedTwice = reverseDiff(reversedOnce);

    expect(reversedTwice.stats.additions).toBe(parsed.stats.additions);
    expect(reversedTwice.stats.deletions).toBe(parsed.stats.deletions);
    expect(reversedTwice.oldFileName).toBe(parsed.oldFileName);
    expect(reversedTwice.newFileName).toBe(parsed.newFileName);
  });

  it('should apply and reverse to get original content', () => {
    const original = `line1
old
line3`;
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,3 @@
 line1
-old
+new
 line3`;

    const parsed = parseUnifiedDiffFull(diff);
    const modified = applyDiff(original, parsed);
    const reversed = reverseDiff(parsed);
    const restored = applyDiff(modified, reversed);

    expect(restored).toBe(original);
  });
});

describe('edge cases', () => {
  it('should handle diff with only additions', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,1 +1,3 @@
 existing
+new1
+new2`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.stats.additions).toBe(2);
    expect(result.stats.deletions).toBe(0);
  });

  it('should handle diff with only deletions', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,1 @@
 existing
-old1
-old2`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.stats.additions).toBe(0);
    expect(result.stats.deletions).toBe(2);
  });

  it('should handle file with spaces in path', () => {
    const diff = `--- a/path with spaces/file.txt
+++ b/path with spaces/file.txt
@@ -1 +1 @@
-old
+new`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.oldFileName).toBe('path with spaces/file.txt');
  });

  it('should handle context-only hunk', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,2 +1,2 @@
 line1
 line2`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.hunks[0]?.changes).toHaveLength(2);
    expect(result.hunks[0]?.changes.every(c => c.type === 'normal')).toBe(true);
  });

  it('should handle very long lines', () => {
    const longLine = 'x'.repeat(1000);
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1 +1 @@
-${longLine}
+${longLine}modified`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.hunks[0]?.changes[0]?.content).toBe(longLine);
    expect(result.hunks[0]?.changes[1]?.content).toBe(longLine + 'modified');
  });

  it('should handle unicode content', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1 +1 @@
-日本語テキスト
+中文文本`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.hunks[0]?.changes[0]?.content).toBe('日本語テキスト');
    expect(result.hunks[0]?.changes[1]?.content).toBe('中文文本');
  });

  it('should handle lines starting with special characters', () => {
    const diff = `--- a/file.txt
+++ b/file.txt
@@ -1,3 +1,3 @@
 normal
---line
++line`;

    const result = parseUnifiedDiffFull(diff);

    expect(result.hunks[0]?.changes[1]?.type).toBe('delete');
    expect(result.hunks[0]?.changes[1]?.content).toBe('--line');
    expect(result.hunks[0]?.changes[2]?.type).toBe('add');
    expect(result.hunks[0]?.changes[2]?.content).toBe('+line');
  });
});
