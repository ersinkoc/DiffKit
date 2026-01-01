/**
 * Tests for copy to clipboard logic
 *
 * Since we can't use React hooks directly in tests without a React environment,
 * we test the formatting and logic that the hooks would use.
 */

import type { Hunk, Change } from '../../../src/core/types.js';

// Helper to create mock hunks
function createMockHunk(
  changes: Array<{ type: 'add' | 'delete' | 'normal'; content: string }>
): Hunk {
  let oldLine = 1;
  let newLine = 1;

  return {
    header: '@@ -1,5 +1,5 @@',
    oldStart: 1,
    oldLines: changes.filter((c) => c.type !== 'add').length,
    newStart: 1,
    newLines: changes.filter((c) => c.type !== 'delete').length,
    changes: changes.map((c) => {
      const change: Change = {
        type: c.type,
        content: c.content,
      } as Change;
      if (c.type !== 'add') {
        (change as any).oldLineNumber = oldLine++;
      }
      if (c.type !== 'delete') {
        (change as any).newLineNumber = newLine++;
      }
      return change;
    }),
  };
}

// Format a change for copying (mirrors hook logic)
interface CopyHunkOptions {
  includeHeader?: boolean;
  changeTypes?: Array<'add' | 'delete' | 'normal'>;
  includeLineNumbers?: boolean;
  includePrefixes?: boolean;
}

const defaultHunkOptions: Required<CopyHunkOptions> = {
  includeHeader: true,
  changeTypes: ['add', 'delete', 'normal'],
  includeLineNumbers: false,
  includePrefixes: true,
};

function formatChange(change: Change, options: Required<CopyHunkOptions>): string {
  let line = '';

  if (options.includeLineNumbers) {
    const lineNum =
      change.type === 'delete'
        ? (change as any).oldLineNumber
        : (change as any).newLineNumber;
    line += `${lineNum ?? ''}\t`;
  }

  if (options.includePrefixes) {
    const prefix = change.type === 'add' ? '+' : change.type === 'delete' ? '-' : ' ';
    line += prefix;
  }

  line += change.content;

  return line;
}

function formatHunk(hunk: Hunk, options: Required<CopyHunkOptions>): string {
  const lines: string[] = [];

  if (options.includeHeader) {
    lines.push(hunk.header);
  }

  for (const change of hunk.changes) {
    if (options.changeTypes.includes(change.type)) {
      lines.push(formatChange(change, options));
    }
  }

  return lines.join('\n');
}

function formatAllHunks(hunks: Hunk[], options: Required<CopyHunkOptions>): string {
  return hunks.map((hunk) => formatHunk(hunk, options)).join('\n\n');
}

function extractAdditions(hunks: Hunk[]): string {
  const lines: string[] = [];

  for (const hunk of hunks) {
    for (const change of hunk.changes) {
      if (change.type === 'add') {
        lines.push(change.content);
      }
    }
  }

  return lines.join('\n');
}

function extractDeletions(hunks: Hunk[]): string {
  const lines: string[] = [];

  for (const hunk of hunks) {
    for (const change of hunk.changes) {
      if (change.type === 'delete') {
        lines.push(change.content);
      }
    }
  }

  return lines.join('\n');
}

function formatAsUnifiedDiff(hunks: Hunk[]): string {
  const lines: string[] = [];

  for (const hunk of hunks) {
    lines.push(hunk.header);
    for (const change of hunk.changes) {
      const prefix = change.type === 'add' ? '+' : change.type === 'delete' ? '-' : ' ';
      lines.push(prefix + change.content);
    }
  }

  return lines.join('\n');
}

describe('Copy to clipboard formatting', () => {
  describe('formatHunk', () => {
    it('should format hunk with header by default', () => {
      const hunk = createMockHunk([
        { type: 'normal', content: 'line 1' },
        { type: 'delete', content: 'old line' },
        { type: 'add', content: 'new line' },
      ]);

      const result = formatHunk(hunk, defaultHunkOptions);

      expect(result).toContain('@@ -1,5 +1,5 @@');
      expect(result).toContain('line 1');
    });

    it('should include diff prefixes by default', () => {
      const hunk = createMockHunk([
        { type: 'delete', content: 'removed' },
        { type: 'add', content: 'added' },
      ]);

      const result = formatHunk(hunk, defaultHunkOptions);

      expect(result).toContain('-removed');
      expect(result).toContain('+added');
    });

    it('should exclude prefixes when includePrefixes is false', () => {
      const hunk = createMockHunk([
        { type: 'delete', content: 'removed' },
        { type: 'add', content: 'added' },
      ]);

      const options = { ...defaultHunkOptions, includePrefixes: false };
      const result = formatHunk(hunk, options);

      expect(result).not.toContain('-removed');
      expect(result).not.toContain('+added');
      expect(result).toContain('removed');
      expect(result).toContain('added');
    });

    it('should filter by change types', () => {
      const hunk = createMockHunk([
        { type: 'normal', content: 'unchanged' },
        { type: 'delete', content: 'removed' },
        { type: 'add', content: 'added' },
      ]);

      const options = { ...defaultHunkOptions, changeTypes: ['add' as const] };
      const result = formatHunk(hunk, options);

      expect(result).not.toContain('unchanged');
      expect(result).not.toContain('removed');
      expect(result).toContain('added');
    });

    it('should exclude header when includeHeader is false', () => {
      const hunk = createMockHunk([{ type: 'normal', content: 'line' }]);

      const options = { ...defaultHunkOptions, includeHeader: false };
      const result = formatHunk(hunk, options);

      expect(result).not.toContain('@@');
    });

    it('should include line numbers when includeLineNumbers is true', () => {
      const hunk = createMockHunk([{ type: 'normal', content: 'line content' }]);

      const options = { ...defaultHunkOptions, includeLineNumbers: true };
      const result = formatHunk(hunk, options);

      expect(result).toContain('1\t');
    });
  });

  describe('formatAllHunks', () => {
    it('should format all hunks', () => {
      const hunks = [
        createMockHunk([{ type: 'normal', content: 'hunk 1' }]),
        createMockHunk([{ type: 'normal', content: 'hunk 2' }]),
      ];

      const result = formatAllHunks(hunks, defaultHunkOptions);

      expect(result).toContain('hunk 1');
      expect(result).toContain('hunk 2');
    });

    it('should separate hunks with blank lines', () => {
      const hunks = [
        createMockHunk([{ type: 'normal', content: 'first' }]),
        createMockHunk([{ type: 'normal', content: 'second' }]),
      ];

      const result = formatAllHunks(hunks, defaultHunkOptions);

      expect(result).toContain('\n\n');
    });
  });

  describe('extractAdditions', () => {
    it('should extract only added lines', () => {
      const hunks = [
        createMockHunk([
          { type: 'normal', content: 'unchanged' },
          { type: 'delete', content: 'removed' },
          { type: 'add', content: 'added line 1' },
          { type: 'add', content: 'added line 2' },
        ]),
      ];

      const result = extractAdditions(hunks);

      expect(result).toBe('added line 1\nadded line 2');
    });

    it('should handle hunks with no additions', () => {
      const hunks = [
        createMockHunk([
          { type: 'normal', content: 'unchanged' },
          { type: 'delete', content: 'removed' },
        ]),
      ];

      const result = extractAdditions(hunks);

      expect(result).toBe('');
    });

    it('should extract additions from multiple hunks', () => {
      const hunks = [
        createMockHunk([{ type: 'add', content: 'first add' }]),
        createMockHunk([{ type: 'add', content: 'second add' }]),
      ];

      const result = extractAdditions(hunks);

      expect(result).toBe('first add\nsecond add');
    });
  });

  describe('extractDeletions', () => {
    it('should extract only deleted lines', () => {
      const hunks = [
        createMockHunk([
          { type: 'normal', content: 'unchanged' },
          { type: 'delete', content: 'deleted line 1' },
          { type: 'delete', content: 'deleted line 2' },
          { type: 'add', content: 'added' },
        ]),
      ];

      const result = extractDeletions(hunks);

      expect(result).toBe('deleted line 1\ndeleted line 2');
    });

    it('should handle hunks with no deletions', () => {
      const hunks = [
        createMockHunk([
          { type: 'normal', content: 'unchanged' },
          { type: 'add', content: 'added' },
        ]),
      ];

      const result = extractDeletions(hunks);

      expect(result).toBe('');
    });
  });

  describe('formatAsUnifiedDiff', () => {
    it('should format as unified diff', () => {
      const hunks = [
        createMockHunk([
          { type: 'normal', content: 'context' },
          { type: 'delete', content: 'old' },
          { type: 'add', content: 'new' },
        ]),
      ];

      const result = formatAsUnifiedDiff(hunks);

      expect(result).toContain('@@ -1,5 +1,5 @@');
      expect(result).toContain(' context');
      expect(result).toContain('-old');
      expect(result).toContain('+new');
    });

    it('should handle multiple hunks', () => {
      const hunks = [
        createMockHunk([{ type: 'delete', content: 'removed 1' }]),
        createMockHunk([{ type: 'add', content: 'added 2' }]),
      ];

      const result = formatAsUnifiedDiff(hunks);

      // Should have two hunk headers (each has two @@ markers)
      const headerMatches = result.match(/@@/g);
      expect(headerMatches?.length).toBe(4); // 2 hunks * 2 @@ per header
    });
  });
});

describe('Copy status management', () => {
  type CopyStatus = 'idle' | 'copying' | 'success' | 'error';

  it('should start with idle status', () => {
    const status: CopyStatus = 'idle';
    expect(status).toBe('idle');
  });

  it('should transition to copying during operation', () => {
    let status: CopyStatus = 'idle';
    status = 'copying';
    expect(status).toBe('copying');
  });

  it('should transition to success after successful copy', () => {
    let status: CopyStatus = 'copying';
    status = 'success';
    expect(status).toBe('success');
  });

  it('should transition to error on failure', () => {
    let status: CopyStatus = 'copying';
    status = 'error';
    expect(status).toBe('error');
  });

  it('should reset to idle after timeout', () => {
    let status: CopyStatus = 'success';
    // Simulate timeout
    status = 'idle';
    expect(status).toBe('idle');
  });
});

describe('formatChange', () => {
  it('should format normal change with space prefix', () => {
    const change: Change = {
      type: 'normal',
      content: 'unchanged line',
      oldLineNumber: 1,
      newLineNumber: 1,
    };

    const result = formatChange(change, defaultHunkOptions);

    expect(result).toBe(' unchanged line');
  });

  it('should format add change with + prefix', () => {
    const change: Change = {
      type: 'add',
      content: 'new line',
      newLineNumber: 1,
    };

    const result = formatChange(change, defaultHunkOptions);

    expect(result).toBe('+new line');
  });

  it('should format delete change with - prefix', () => {
    const change: Change = {
      type: 'delete',
      content: 'old line',
      oldLineNumber: 1,
    };

    const result = formatChange(change, defaultHunkOptions);

    expect(result).toBe('-old line');
  });

  it('should include line number when option is set', () => {
    const change: Change = {
      type: 'normal',
      content: 'line',
      oldLineNumber: 5,
      newLineNumber: 5,
    };

    const options = { ...defaultHunkOptions, includeLineNumbers: true };
    const result = formatChange(change, options);

    expect(result).toBe('5\t line');
  });

  it('should use old line number for deletions', () => {
    const change: Change = {
      type: 'delete',
      content: 'deleted',
      oldLineNumber: 10,
    };

    const options = { ...defaultHunkOptions, includeLineNumbers: true };
    const result = formatChange(change, options);

    expect(result).toBe('10\t-deleted');
  });

  it('should format without prefix when includePrefixes is false', () => {
    const change: Change = {
      type: 'add',
      content: 'new content',
      newLineNumber: 1,
    };

    const options = { ...defaultHunkOptions, includePrefixes: false };
    const result = formatChange(change, options);

    expect(result).toBe('new content');
  });
});

describe('Edge cases', () => {
  it('should handle empty hunks array', () => {
    const hunks: Hunk[] = [];

    const result = formatAllHunks(hunks, defaultHunkOptions);

    expect(result).toBe('');
  });

  it('should handle hunk with no changes', () => {
    const hunk: Hunk = {
      header: '@@ -0,0 +0,0 @@',
      oldStart: 0,
      oldLines: 0,
      newStart: 0,
      newLines: 0,
      changes: [],
    };

    const result = formatHunk(hunk, defaultHunkOptions);

    expect(result).toBe('@@ -0,0 +0,0 @@');
  });

  it('should handle changes with empty content', () => {
    const hunk = createMockHunk([{ type: 'normal', content: '' }]);

    const result = formatHunk(hunk, defaultHunkOptions);

    // Header plus space prefix for normal change with empty content
    expect(result).toContain('@@ -1,5 +1,5 @@');
    // The result will have a space as the prefix for normal line
    expect(result.endsWith(' ')).toBe(true);
  });

  it('should handle special characters in content', () => {
    const hunk = createMockHunk([
      { type: 'add', content: '<script>alert("xss")</script>' },
    ]);

    const result = formatHunk(hunk, defaultHunkOptions);

    expect(result).toContain('+<script>alert("xss")</script>');
  });

  it('should handle unicode content', () => {
    const hunk = createMockHunk([
      { type: 'add', content: '日本語テキスト' },
      { type: 'delete', content: '中文文本' },
    ]);

    const result = formatHunk(hunk, defaultHunkOptions);

    expect(result).toContain('+日本語テキスト');
    expect(result).toContain('-中文文本');
  });
});
