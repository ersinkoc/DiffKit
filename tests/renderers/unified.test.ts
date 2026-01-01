/**
 * Tests for unified HTML renderer
 */


import { renderUnified, renderUnifiedWithSyntax } from '../../src/renderers/html/unified.js';
import type { DiffResult } from '../../src/core/types.js';

describe('renderUnified', () => {
  const createDiffResult = (changes: DiffResult['hunks'][0]['changes']): DiffResult => ({
    hunks: [
      {
        oldStart: 1,
        oldLines: 1,
        newStart: 1,
        newLines: 1,
        header: '@@ -1,1 +1,1 @@',
        changes,
      },
    ],
    stats: { additions: 0, deletions: 0, changes: 0 },
    oldContent: '',
    newContent: '',
  });

  it('should render unified diff view', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'unchanged', oldLineNumber: 1, newLineNumber: 1 },
    ]);

    const html = renderUnified(result);

    expect(html).toContain('diffkit-unified');
    expect(html).toContain('diffkit-normal');
  });

  it('should render with + prefix for additions', () => {
    const result = createDiffResult([
      { type: 'add', content: 'added line', newLineNumber: 1 },
    ]);

    const html = renderUnified(result);

    expect(html).toContain('diffkit-add');
    expect(html).toContain('diffkit-prefix');
    expect(html).toContain('>+<');
  });

  it('should render with - prefix for deletions', () => {
    const result = createDiffResult([
      { type: 'delete', content: 'deleted line', oldLineNumber: 1 },
    ]);

    const html = renderUnified(result);

    expect(html).toContain('diffkit-delete');
    expect(html).toContain('diffkit-prefix');
    expect(html).toContain('>-<');
  });

  it('should render with space prefix for normal lines', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'unchanged', oldLineNumber: 1, newLineNumber: 1 },
    ]);

    const html = renderUnified(result);

    expect(html).toContain('diffkit-prefix');
  });

  it('should render line numbers by default', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'line', oldLineNumber: 5, newLineNumber: 10 },
    ]);

    const html = renderUnified(result);

    expect(html).toContain('diffkit-gutter');
    expect(html).toContain('>5<');
    expect(html).toContain('>10<');
  });

  it('should hide line numbers when disabled', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'line', oldLineNumber: 1, newLineNumber: 1 },
    ]);

    const html = renderUnified(result, { lineNumbers: false });

    expect(html).not.toContain('diffkit-gutter');
  });

  it('should escape HTML content', () => {
    const result = createDiffResult([
      { type: 'normal', content: '<div>', oldLineNumber: 1, newLineNumber: 1 },
    ]);

    const html = renderUnified(result);

    expect(html).toContain('&lt;div&gt;');
    expect(html).not.toContain('<div>');
  });

  it('should render hunk headers', () => {
    const result = createDiffResult([]);
    result.hunks[0]!.header = '@@ -10,5 +20,10 @@';

    const html = renderUnified(result);

    expect(html).toContain('diffkit-hunk-header');
    expect(html).toContain('@@ -10,5 +20,10 @@');
  });

  it('should handle multiple hunks', () => {
    const result: DiffResult = {
      hunks: [
        {
          oldStart: 1,
          oldLines: 1,
          newStart: 1,
          newLines: 1,
          header: '@@ -1,1 +1,1 @@',
          changes: [{ type: 'normal', content: 'line1', oldLineNumber: 1, newLineNumber: 1 }],
        },
        {
          oldStart: 10,
          oldLines: 1,
          newStart: 10,
          newLines: 1,
          header: '@@ -10,1 +10,1 @@',
          changes: [{ type: 'normal', content: 'line10', oldLineNumber: 10, newLineNumber: 10 }],
        },
      ],
      stats: { additions: 0, deletions: 0, changes: 0 },
      oldContent: '',
      newContent: '',
    };

    const html = renderUnified(result);

    expect(html.match(/diffkit-hunk-header/g)?.length).toBe(2);
  });

  it('should add wrap class when enabled', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'line', oldLineNumber: 1, newLineNumber: 1 },
    ]);

    const html = renderUnified(result, { wrapLines: true });

    expect(html).toContain('diffkit-wrap');
  });

  it('should handle missing line numbers', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'line' },
    ]);

    const html = renderUnified(result);

    expect(html).toContain('diffkit-normal');
  });
});

describe('renderUnifiedWithSyntax', () => {
  const createDiffResult = (changes: DiffResult['hunks'][0]['changes']): DiffResult => ({
    hunks: [
      {
        oldStart: 1,
        oldLines: 1,
        newStart: 1,
        newLines: 1,
        header: '@@ -1,1 +1,1 @@',
        changes,
      },
    ],
    stats: { additions: 0, deletions: 0, changes: 0 },
    oldContent: '',
    newContent: '',
  });

  it('should render with syntax tokens', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'const x = 1;', oldLineNumber: 1, newLineNumber: 1 },
    ]);

    const tokens = new Map<number, { value: string; type?: string }[]>([
      [1, [
        { value: 'const', type: 'keyword' },
        { value: ' x = ', type: undefined },
        { value: '1', type: 'number' },
        { value: ';' },
      ]],
    ]);

    const html = renderUnifiedWithSyntax(result, tokens);

    expect(html).toContain('diffkit-syntax-keyword');
    expect(html).toContain('diffkit-syntax-number');
    expect(html).toContain('const');
  });

  it('should fall back to plain content when no tokens', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'plain text', oldLineNumber: 1, newLineNumber: 1 },
    ]);

    const tokens = new Map<number, { value: string; type?: string }[]>();

    const html = renderUnifiedWithSyntax(result, tokens);

    expect(html).toContain('plain text');
  });

  it('should use oldLineNumber for deletions', () => {
    const result = createDiffResult([
      { type: 'delete', content: 'deleted', oldLineNumber: 5 },
    ]);

    const tokens = new Map<number, { value: string; type?: string }[]>([
      [5, [{ value: 'deleted', type: 'keyword' }]],
    ]);

    const html = renderUnifiedWithSyntax(result, tokens);

    expect(html).toContain('diffkit-syntax-keyword');
  });

  it('should use newLineNumber for additions', () => {
    const result = createDiffResult([
      { type: 'add', content: 'added', newLineNumber: 3 },
    ]);

    const tokens = new Map<number, { value: string; type?: string }[]>([
      [3, [{ value: 'added', type: 'string' }]],
    ]);

    const html = renderUnifiedWithSyntax(result, tokens);

    expect(html).toContain('diffkit-syntax-string');
  });

  it('should respect lineNumbers option', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'line', oldLineNumber: 1, newLineNumber: 1 },
    ]);

    const tokens = new Map<number, { value: string; type?: string }[]>();

    const htmlWithNumbers = renderUnifiedWithSyntax(result, tokens, { lineNumbers: true });
    expect(htmlWithNumbers).toContain('diffkit-gutter');

    const htmlWithoutNumbers = renderUnifiedWithSyntax(result, tokens, { lineNumbers: false });
    expect(htmlWithoutNumbers).not.toContain('diffkit-gutter');
  });

  it('should respect wrapLines option', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'line', oldLineNumber: 1, newLineNumber: 1 },
    ]);

    const tokens = new Map<number, { value: string; type?: string }[]>();

    const htmlNoWrap = renderUnifiedWithSyntax(result, tokens, { wrapLines: false });
    expect(htmlNoWrap).not.toContain('diffkit-wrap');

    const htmlWrap = renderUnifiedWithSyntax(result, tokens, { wrapLines: true });
    expect(htmlWrap).toContain('diffkit-wrap');
  });

  it('should escape HTML in tokens', () => {
    const result = createDiffResult([
      { type: 'normal', content: '<div>', oldLineNumber: 1, newLineNumber: 1 },
    ]);

    const tokens = new Map<number, { value: string; type?: string }[]>([
      [1, [{ value: '<div>', type: 'tag' }]],
    ]);

    const html = renderUnifiedWithSyntax(result, tokens);

    expect(html).toContain('&lt;div&gt;');
    expect(html).not.toContain('<div>');
  });
});
