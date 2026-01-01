/**
 * Tests for inline HTML renderer
 */

import { describe, it, expect } from 'vitest';
import { renderInline, renderInlineCharDiff } from '../../src/renderers/html/inline.js';
import type { DiffResult } from '../../src/core/types.js';

describe('renderInline', () => {
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

  it('should render normal lines', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'unchanged line', oldLineNumber: 1, newLineNumber: 1 },
    ]);

    const html = renderInline(result);

    expect(html).toContain('diffkit-inline');
    expect(html).toContain('diffkit-normal');
    expect(html).toContain('unchanged line');
  });

  it('should render deleted lines', () => {
    const result = createDiffResult([
      { type: 'delete', content: 'deleted line', oldLineNumber: 1 },
    ]);

    const html = renderInline(result);

    expect(html).toContain('diffkit-modified');
    expect(html).toContain('diffkit-deleted');
    expect(html).toContain('deleted line');
  });

  it('should render added lines', () => {
    const result = createDiffResult([
      { type: 'add', content: 'added line', newLineNumber: 1 },
    ]);

    const html = renderInline(result);

    expect(html).toContain('diffkit-modified');
    expect(html).toContain('diffkit-added');
    expect(html).toContain('added line');
  });

  it('should render paired modifications inline', () => {
    const result = createDiffResult([
      { type: 'delete', content: 'hello world', oldLineNumber: 1 },
      { type: 'add', content: 'hello there', newLineNumber: 1 },
    ]);

    const html = renderInline(result);

    expect(html).toContain('diffkit-modified');
    expect(html).toContain('diffkit-deleted');
    expect(html).toContain('diffkit-added');
  });

  it('should escape HTML in content', () => {
    const result = createDiffResult([
      { type: 'normal', content: '<script>alert("xss")</script>', oldLineNumber: 1, newLineNumber: 1 },
    ]);

    const html = renderInline(result);

    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('should render line numbers by default', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'line', oldLineNumber: 5, newLineNumber: 5 },
    ]);

    const html = renderInline(result);

    expect(html).toContain('diffkit-gutter');
    expect(html).toContain('diffkit-line-old');
    expect(html).toContain('diffkit-line-new');
    expect(html).toContain('>5<');
  });

  it('should hide line numbers when disabled', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'line', oldLineNumber: 5, newLineNumber: 5 },
    ]);

    const html = renderInline(result, { lineNumbers: false });

    expect(html).not.toContain('diffkit-gutter');
  });

  it('should add wrap class when wrapLines is true', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'line', oldLineNumber: 1, newLineNumber: 1 },
    ]);

    const html = renderInline(result, { wrapLines: true });

    expect(html).toContain('diffkit-wrap');
  });

  it('should render hunk header', () => {
    const result = createDiffResult([]);
    result.hunks[0]!.header = '@@ -1,5 +1,10 @@';

    const html = renderInline(result);

    expect(html).toContain('diffkit-hunk-header');
    expect(html).toContain('@@ -1,5 +1,10 @@');
  });

  it('should handle empty hunks', () => {
    const result: DiffResult = {
      hunks: [],
      stats: { additions: 0, deletions: 0, changes: 0 },
      oldContent: '',
      newContent: '',
    };

    const html = renderInline(result);

    expect(html).toContain('diffkit-inline');
  });
});

describe('renderInlineCharDiff', () => {
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

  it('should render character-level diff for modifications', () => {
    const result = createDiffResult([
      { type: 'delete', content: 'hello world', oldLineNumber: 1 },
      { type: 'add', content: 'hello there', newLineNumber: 1 },
    ]);

    const html = renderInlineCharDiff(result);

    expect(html).toContain('diffkit-char-diff');
    expect(html).toContain('diffkit-modified');
  });

  it('should render normal lines', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'unchanged', oldLineNumber: 1, newLineNumber: 1 },
    ]);

    const html = renderInlineCharDiff(result);

    expect(html).toContain('diffkit-normal');
    expect(html).toContain('unchanged');
  });

  it('should render standalone deletions', () => {
    const result = createDiffResult([
      { type: 'delete', content: 'removed', oldLineNumber: 1 },
    ]);

    const html = renderInlineCharDiff(result);

    expect(html).toContain('diffkit-delete');
    expect(html).toContain('diffkit-deleted');
    expect(html).toContain('removed');
  });

  it('should render standalone additions', () => {
    const result = createDiffResult([
      { type: 'add', content: 'added', newLineNumber: 1 },
    ]);

    const html = renderInlineCharDiff(result);

    expect(html).toContain('diffkit-add');
    expect(html).toContain('diffkit-added');
    expect(html).toContain('added');
  });

  it('should handle missing line numbers', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'line' },
    ]);

    const html = renderInlineCharDiff(result);

    expect(html).toContain('diffkit-normal');
  });

  it('should respect wrapLines option', () => {
    const result = createDiffResult([
      { type: 'normal', content: 'line', oldLineNumber: 1, newLineNumber: 1 },
    ]);

    const htmlNoWrap = renderInlineCharDiff(result, { wrapLines: false });
    expect(htmlNoWrap).not.toContain('diffkit-wrap');

    const htmlWrap = renderInlineCharDiff(result, { wrapLines: true });
    expect(htmlWrap).toContain('diffkit-wrap');
  });
});
