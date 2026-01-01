/**
 * Unified view HTML renderer
 * Single column with - and + prefixes
 */

import type { DiffResult, Hunk, Change, Theme } from '../../core/types.js';
import type { HTMLRendererOptions } from '../types.js';
import { escapeHtml, div, span, classNames } from './utils.js';

/**
 * Render diff result as unified view HTML
 */
export function renderUnified(
  result: DiffResult,
  options: HTMLRendererOptions = {},
  _theme?: Theme
): string {
  const { lineNumbers = true, wrapLines = false } = options;

  const lines: string[] = [];

  lines.push(div('diffkit-diff diffkit-unified', renderHunks(result.hunks, lineNumbers, wrapLines)));

  return lines.join('\n');
}

/**
 * Render all hunks
 */
function renderHunks(hunks: Hunk[], lineNumbers: boolean, wrapLines: boolean): string {
  return hunks.map((hunk) => renderHunk(hunk, lineNumbers, wrapLines)).join('');
}

/**
 * Render a single hunk
 */
function renderHunk(hunk: Hunk, lineNumbers: boolean, wrapLines: boolean): string {
  const header = div('diffkit-hunk-header', escapeHtml(hunk.header));
  const changes = hunk.changes.map((change) => renderChange(change, lineNumbers, wrapLines)).join('');

  return div('diffkit-hunk', header + changes);
}

/**
 * Render a single change line
 */
function renderChange(change: Change, lineNumbers: boolean, wrapLines: boolean): string {
  const lineClass = classNames(
    'diffkit-line',
    change.type === 'add' && 'diffkit-add',
    change.type === 'delete' && 'diffkit-delete',
    change.type === 'normal' && 'diffkit-normal'
  );

  let gutter = '';
  if (lineNumbers) {
    const oldNum = change.oldLineNumber ?? '';
    const newNum = change.newLineNumber ?? '';

    gutter = div(
      'diffkit-gutter',
      span('diffkit-line-old', String(oldNum)) + span('diffkit-line-new', String(newNum))
    );
  }

  const prefix = getPrefix(change.type);
  const prefixSpan = span('diffkit-prefix', prefix);

  const contentClass = classNames('diffkit-content', wrapLines && 'diffkit-wrap');
  const content = div(contentClass, prefixSpan + escapeHtml(change.content));

  return div(lineClass, gutter + content);
}

/**
 * Get line prefix based on change type
 */
function getPrefix(type: Change['type']): string {
  switch (type) {
    case 'add':
      return '+';
    case 'delete':
      return '-';
    case 'normal':
    default:
      return ' ';
  }
}

/**
 * Render unified view with syntax highlighting
 */
export function renderUnifiedWithSyntax(
  result: DiffResult,
  tokens: Map<number, { value: string; type?: string }[]>,
  options: HTMLRendererOptions = {},
  _theme?: Theme
): string {
  const { lineNumbers = true, wrapLines = false } = options;

  const lines: string[] = [];
  lines.push('<div class="diffkit-diff diffkit-unified">');

  for (const hunk of result.hunks) {
    lines.push('<div class="diffkit-hunk">');
    lines.push(`<div class="diffkit-hunk-header">${escapeHtml(hunk.header)}</div>`);

    for (const change of hunk.changes) {
      const lineClass = classNames(
        'diffkit-line',
        change.type === 'add' && 'diffkit-add',
        change.type === 'delete' && 'diffkit-delete',
        change.type === 'normal' && 'diffkit-normal'
      );

      lines.push(`<div class="${lineClass}">`);

      if (lineNumbers) {
        const oldNum = change.oldLineNumber ?? '';
        const newNum = change.newLineNumber ?? '';
        lines.push(
          `<div class="diffkit-gutter"><span class="diffkit-line-old">${oldNum}</span><span class="diffkit-line-new">${newNum}</span></div>`
        );
      }

      const prefix = getPrefix(change.type);
      const lineNum = change.type === 'delete' ? change.oldLineNumber : change.newLineNumber;
      const lineTokens = lineNum ? tokens.get(lineNum) : undefined;

      let content: string;
      if (lineTokens) {
        content = lineTokens
          .map((t) => {
            const cls = t.type ? `diffkit-syntax-${t.type}` : '';
            return cls ? `<span class="${cls}">${escapeHtml(t.value)}</span>` : escapeHtml(t.value);
          })
          .join('');
      } else {
        content = escapeHtml(change.content);
      }

      const wrapClass = wrapLines ? ' diffkit-wrap' : '';
      lines.push(
        `<div class="diffkit-content${wrapClass}"><span class="diffkit-prefix">${prefix}</span>${content}</div>`
      );

      lines.push('</div>');
    }

    lines.push('</div>');
  }

  lines.push('</div>');
  return lines.join('\n');
}

export default renderUnified;
