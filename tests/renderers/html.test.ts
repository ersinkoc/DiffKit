/**
 * HTML renderer tests
 */

import { describe, it, expect } from 'vitest';
import {
  HTMLRenderer,
  createHTMLRenderer,
  renderToHTML,
  renderUnified,
  renderSplit,
  renderInline,
} from '../../src/renderers/html/index.js';
import { createDiff } from '../../src/core/diff-engine.js';
import { githubDark } from '../../src/themes/index.js';

describe('HTMLRenderer class', () => {
  it('should create renderer with defaults', () => {
    const renderer = new HTMLRenderer();

    expect(renderer.mode).toBe('unified');
    expect(renderer.theme).toBe('github-dark');
  });

  it('should accept options', () => {
    const renderer = new HTMLRenderer({
      mode: 'split',
      theme: 'github-light',
      lineNumbers: false,
    });

    expect(renderer.mode).toBe('split');
    expect(renderer.theme).toBe('github-light');
  });

  it('should render diff result', () => {
    const renderer = new HTMLRenderer();
    const diff = createDiff('a\nb', 'a\nc');

    const html = renderer.render(diff);

    expect(html).toContain('<div');
    expect(html).toContain('diffkit');
  });

  it('should use setMode', () => {
    const renderer = new HTMLRenderer();
    renderer.setMode('split');

    expect(renderer.mode).toBe('split');
  });

  it('should use setTheme with string', () => {
    const renderer = new HTMLRenderer();
    renderer.setTheme('monokai');

    expect(renderer.theme).toBe('monokai');
  });

  it('should use setTheme with object', () => {
    const renderer = new HTMLRenderer();
    renderer.setTheme(githubDark);

    expect(renderer.theme).toBe(githubDark);
  });

  it('should render with word diff', () => {
    const renderer = new HTMLRenderer({ mode: 'split' });
    const diff = createDiff('hello world', 'hello there');

    const html = renderer.renderWithWordDiff(diff);

    expect(html).toContain('diffkit');
  });
});

describe('createHTMLRenderer', () => {
  it('should create renderer', () => {
    const renderer = createHTMLRenderer();

    expect(renderer).toBeInstanceOf(HTMLRenderer);
  });

  it('should pass options', () => {
    const renderer = createHTMLRenderer({ mode: 'inline' });

    expect(renderer.mode).toBe('inline');
  });
});

describe('renderToHTML', () => {
  it('should render with default mode', () => {
    const diff = createDiff('a', 'b');
    const html = renderToHTML(diff);

    expect(html).toContain('diffkit-unified');
  });

  it('should render with specified mode', () => {
    const diff = createDiff('a', 'b');
    const html = renderToHTML(diff, 'split');

    expect(html).toContain('diffkit-split');
  });

  it('should pass options', () => {
    const diff = createDiff('a', 'b');
    const html = renderToHTML(diff, 'unified', { lineNumbers: false });

    expect(html).toContain('diffkit');
  });
});

describe('renderUnified', () => {
  it('should render unified view', () => {
    const diff = createDiff('a\nb\nc', 'a\nx\nc');
    const html = renderUnified(diff);

    expect(html).toContain('diffkit-unified');
    expect(html).toContain('diffkit-hunk');
  });

  it('should show additions and deletions', () => {
    const diff = createDiff('old line', 'new line');
    const html = renderUnified(diff);

    expect(html).toContain('diffkit-delete');
    expect(html).toContain('diffkit-add');
  });

  it('should show line numbers by default', () => {
    const diff = createDiff('a\nb', 'a\nc');
    const html = renderUnified(diff, { lineNumbers: true });

    expect(html).toContain('diffkit-gutter');
  });

  it('should hide line numbers when disabled', () => {
    const diff = createDiff('a\nb', 'a\nc');
    const html = renderUnified(diff, { lineNumbers: false });

    expect(html).not.toContain('diffkit-gutter');
  });

  it('should handle empty diff', () => {
    const diff = createDiff('same', 'same');
    const html = renderUnified(diff);

    expect(html).toContain('diffkit-unified');
    expect(html).not.toContain('diffkit-hunk');
  });
});

describe('renderSplit', () => {
  it('should render split view', () => {
    const diff = createDiff('a\nb', 'a\nc');
    const html = renderSplit(diff);

    expect(html).toContain('diffkit-split');
  });

  it('should have left and right sides', () => {
    const diff = createDiff('old', 'new');
    const html = renderSplit(diff);

    expect(html).toContain('diffkit-left');
    expect(html).toContain('diffkit-right');
  });

  it('should align changes', () => {
    const diff = createDiff('a\nb\nc', 'a\nx\nc');
    const html = renderSplit(diff);

    expect(html).toContain('diffkit-row');
  });
});

describe('renderInline', () => {
  it('should render inline view', () => {
    const diff = createDiff('hello world', 'hello there');
    const html = renderInline(diff);

    expect(html).toContain('diffkit-inline');
  });

  it('should show inline changes', () => {
    const diff = createDiff('old text', 'new text');
    const html = renderInline(diff);

    expect(html).toContain('del');
    expect(html).toContain('ins');
  });
});

describe('HTML escaping', () => {
  it('should escape HTML in content', () => {
    const diff = createDiff('<div>old</div>', '<div>new</div>');
    const html = renderUnified(diff);

    expect(html).toContain('&lt;div&gt;');
    expect(html).not.toContain('<div>old</div>');
  });

  it('should escape special characters', () => {
    const diff = createDiff('a & b', 'a && b');
    const html = renderUnified(diff);

    expect(html).toContain('&amp;');
  });
});
