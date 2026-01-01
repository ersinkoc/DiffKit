/**
 * HTML renderers for DiffKit
 */

import type { DiffResult, Theme } from '../../core/types.js';
import type { HTMLRendererOptions, ViewMode, HTMLRenderer as IHTMLRenderer } from '../types.js';
import { renderUnified } from './unified.js';
import { renderSplit, renderSplitWithWordDiff } from './split.js';
import { renderInline, renderInlineCharDiff } from './inline.js';
import { defaultTheme, getTheme } from '../../themes/index.js';

export { renderUnified, renderUnifiedWithSyntax } from './unified.js';
export { renderSplit, renderSplitWithWordDiff } from './split.js';
export { renderInline, renderInlineCharDiff } from './inline.js';
export * from './utils.js';

/**
 * HTML Renderer class
 */
export class HTMLRenderer implements IHTMLRenderer {
  mode: ViewMode;
  theme: Theme | string;
  options: HTMLRendererOptions;

  constructor(options: HTMLRendererOptions = {}) {
    this.mode = options.mode ?? 'unified';
    this.theme = options.theme ?? 'github-dark';
    this.options = options;
  }

  /**
   * Set the view mode
   */
  setMode(mode: ViewMode): void {
    this.mode = mode;
    this.options.mode = mode;
  }

  /**
   * Set the theme
   */
  setTheme(theme: Theme | string): void {
    this.theme = theme;
    this.options.theme = typeof theme === 'string' ? theme : theme.name;
  }

  /**
   * Render diff result to HTML
   */
  render(result: DiffResult): string {
    const theme = this.resolveTheme();

    switch (this.mode) {
      case 'split':
        return renderSplit(result, this.options, theme);
      case 'inline':
        return renderInline(result, this.options, theme);
      case 'unified':
      default:
        return renderUnified(result, this.options, theme);
    }
  }

  /**
   * Render with word-level highlighting
   */
  renderWithWordDiff(result: DiffResult): string {
    const theme = this.resolveTheme();

    switch (this.mode) {
      case 'split':
        return renderSplitWithWordDiff(result, this.options, theme);
      case 'inline':
        return renderInlineCharDiff(result, this.options, theme);
      case 'unified':
      default:
        return renderUnified(result, this.options, theme);
    }
  }

  /**
   * Resolve theme from string or object
   */
  private resolveTheme(): Theme {
    if (typeof this.theme === 'string') {
      return getTheme(this.theme) ?? defaultTheme;
    }
    return this.theme;
  }
}

/**
 * Create an HTML renderer
 */
export function createHTMLRenderer(options: HTMLRendererOptions = {}): HTMLRenderer {
  return new HTMLRenderer(options);
}

/**
 * Render diff to HTML with specified mode
 */
export function renderToHTML(
  result: DiffResult,
  mode: ViewMode = 'unified',
  options: HTMLRendererOptions = {}
): string {
  const renderer = new HTMLRenderer({ ...options, mode });
  return renderer.render(result);
}

export default HTMLRenderer;
