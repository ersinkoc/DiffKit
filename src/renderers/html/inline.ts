/**
 * Inline view HTML renderer
 * Changes highlighted inline within text
 */

import type { DiffResult, Change, Theme } from '../../core/types.js';
import type { HTMLRendererOptions } from '../types.js';
import { escapeHtml, classNames } from './utils.js';

/**
 * Render diff result as inline view HTML
 */
export function renderInline(
  result: DiffResult,
  options: HTMLRendererOptions = {},
  _theme?: Theme
): string {
  const { lineNumbers = true, wrapLines = true } = options;

  const lines: string[] = [];
  lines.push('<div class="diffkit-diff diffkit-inline">');

  for (const hunk of result.hunks) {
    lines.push('<div class="diffkit-hunk">');
    lines.push(`<div class="diffkit-hunk-header">${escapeHtml(hunk.header)}</div>`);

    const inlineContent = buildInlineContent(hunk.changes);

    for (const item of inlineContent) {
      lines.push(renderInlineLine(item, lineNumbers, wrapLines));
    }

    lines.push('</div>');
  }

  lines.push('</div>');
  return lines.join('\n');
}

/**
 * Inline content item
 */
interface InlineItem {
  type: 'normal' | 'modified';
  oldLineNumber?: number;
  newLineNumber?: number;
  segments: { type: 'unchanged' | 'deleted' | 'added'; text: string }[];
}

/**
 * Build inline content from changes
 */
function buildInlineContent(changes: Change[]): InlineItem[] {
  const items: InlineItem[] = [];
  let i = 0;

  while (i < changes.length) {
    const change = changes[i]!;

    if (change.type === 'normal') {
      items.push({
        type: 'normal',
        oldLineNumber: change.oldLineNumber,
        newLineNumber: change.newLineNumber,
        segments: [{ type: 'unchanged', text: change.content }],
      });
      i++;
    } else if (change.type === 'delete') {
      // Look for paired addition
      const nextChange = changes[i + 1];

      if (nextChange && nextChange.type === 'add') {
        // Paired modification - inline diff
        const segments = computeInlineDiff(change.content, nextChange.content);
        items.push({
          type: 'modified',
          oldLineNumber: change.oldLineNumber,
          newLineNumber: nextChange.newLineNumber,
          segments,
        });
        i += 2;
      } else {
        // Pure deletion
        items.push({
          type: 'modified',
          oldLineNumber: change.oldLineNumber,
          segments: [{ type: 'deleted', text: change.content }],
        });
        i++;
      }
    } else if (change.type === 'add') {
      // Pure addition
      items.push({
        type: 'modified',
        newLineNumber: change.newLineNumber,
        segments: [{ type: 'added', text: change.content }],
      });
      i++;
    } else {
      i++;
    }
  }

  return items;
}

/**
 * Compute inline diff between two lines
 */
function computeInlineDiff(
  oldLine: string,
  newLine: string
): { type: 'unchanged' | 'deleted' | 'added'; text: string }[] {
  const segments: { type: 'unchanged' | 'deleted' | 'added'; text: string }[] = [];

  // Split into words
  const oldWords = oldLine.split(/(\s+)/);
  const newWords = newLine.split(/(\s+)/);

  // Find common prefix
  let prefixLen = 0;
  while (
    prefixLen < oldWords.length &&
    prefixLen < newWords.length &&
    oldWords[prefixLen] === newWords[prefixLen]
  ) {
    prefixLen++;
  }

  // Find common suffix
  let suffixLen = 0;
  while (
    suffixLen < oldWords.length - prefixLen &&
    suffixLen < newWords.length - prefixLen &&
    oldWords[oldWords.length - 1 - suffixLen] === newWords[newWords.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  // Build segments
  if (prefixLen > 0) {
    segments.push({
      type: 'unchanged',
      text: oldWords.slice(0, prefixLen).join(''),
    });
  }

  const oldMiddle = oldWords.slice(prefixLen, oldWords.length - suffixLen);
  const newMiddle = newWords.slice(prefixLen, newWords.length - suffixLen);

  if (oldMiddle.length > 0) {
    segments.push({
      type: 'deleted',
      text: oldMiddle.join(''),
    });
  }

  if (newMiddle.length > 0) {
    segments.push({
      type: 'added',
      text: newMiddle.join(''),
    });
  }

  if (suffixLen > 0) {
    segments.push({
      type: 'unchanged',
      text: oldWords.slice(oldWords.length - suffixLen).join(''),
    });
  }

  return segments;
}

/**
 * Render inline line
 */
function renderInlineLine(item: InlineItem, lineNumbers: boolean, wrapLines: boolean): string {
  const lineClass = classNames(
    'diffkit-line',
    item.type === 'normal' && 'diffkit-normal',
    item.type === 'modified' && 'diffkit-modified'
  );

  let gutter = '';
  if (lineNumbers) {
    const oldNum = item.oldLineNumber ?? '';
    const newNum = item.newLineNumber ?? '';
    gutter = `<div class="diffkit-gutter"><span class="diffkit-line-old">${oldNum}</span><span class="diffkit-line-new">${newNum}</span></div>`;
  }

  const content = item.segments
    .map((seg) => {
      const text = escapeHtml(seg.text);
      switch (seg.type) {
        case 'deleted':
          return `<del class="diffkit-deleted">${text}</del>`;
        case 'added':
          return `<ins class="diffkit-added">${text}</ins>`;
        default:
          return text;
      }
    })
    .join('');

  const wrapClass = wrapLines ? ' diffkit-wrap' : '';

  return `<div class="${lineClass}">${gutter}<div class="diffkit-content${wrapClass}">${content}</div></div>`;
}

/**
 * Render inline view with character-level diff
 */
export function renderInlineCharDiff(
  result: DiffResult,
  options: HTMLRendererOptions = {},
  _theme?: Theme
): string {
  const { lineNumbers = true, wrapLines = true } = options;

  const lines: string[] = [];
  lines.push('<div class="diffkit-diff diffkit-inline diffkit-char-diff">');

  for (const hunk of result.hunks) {
    lines.push('<div class="diffkit-hunk">');
    lines.push(`<div class="diffkit-hunk-header">${escapeHtml(hunk.header)}</div>`);

    let i = 0;
    while (i < hunk.changes.length) {
      const change = hunk.changes[i]!;

      if (change.type === 'normal') {
        lines.push(renderNormalLine(change, lineNumbers, wrapLines));
        i++;
      } else if (change.type === 'delete') {
        const nextChange = hunk.changes[i + 1];
        if (nextChange && nextChange.type === 'add') {
          lines.push(renderCharDiffLine(change, nextChange, lineNumbers, wrapLines));
          i += 2;
        } else {
          lines.push(renderDeleteLine(change, lineNumbers, wrapLines));
          i++;
        }
      } else if (change.type === 'add') {
        lines.push(renderAddLine(change, lineNumbers, wrapLines));
        i++;
      } else {
        i++;
      }
    }

    lines.push('</div>');
  }

  lines.push('</div>');
  return lines.join('\n');
}

function renderNormalLine(change: Change, lineNumbers: boolean, wrapLines: boolean): string {
  let gutter = '';
  if (lineNumbers) {
    gutter = `<div class="diffkit-gutter"><span class="diffkit-line-old">${change.oldLineNumber ?? ''}</span><span class="diffkit-line-new">${change.newLineNumber ?? ''}</span></div>`;
  }
  const wrapClass = wrapLines ? ' diffkit-wrap' : '';
  return `<div class="diffkit-line diffkit-normal">${gutter}<div class="diffkit-content${wrapClass}">${escapeHtml(change.content)}</div></div>`;
}

function renderDeleteLine(change: Change, lineNumbers: boolean, wrapLines: boolean): string {
  let gutter = '';
  if (lineNumbers) {
    gutter = `<div class="diffkit-gutter"><span class="diffkit-line-old">${change.oldLineNumber ?? ''}</span><span class="diffkit-line-new"></span></div>`;
  }
  const wrapClass = wrapLines ? ' diffkit-wrap' : '';
  return `<div class="diffkit-line diffkit-delete">${gutter}<div class="diffkit-content${wrapClass}"><del class="diffkit-deleted">${escapeHtml(change.content)}</del></div></div>`;
}

function renderAddLine(change: Change, lineNumbers: boolean, wrapLines: boolean): string {
  let gutter = '';
  if (lineNumbers) {
    gutter = `<div class="diffkit-gutter"><span class="diffkit-line-old"></span><span class="diffkit-line-new">${change.newLineNumber ?? ''}</span></div>`;
  }
  const wrapClass = wrapLines ? ' diffkit-wrap' : '';
  return `<div class="diffkit-line diffkit-add">${gutter}<div class="diffkit-content${wrapClass}"><ins class="diffkit-added">${escapeHtml(change.content)}</ins></div></div>`;
}

function renderCharDiffLine(
  delChange: Change,
  addChange: Change,
  lineNumbers: boolean,
  wrapLines: boolean
): string {
  let gutter = '';
  if (lineNumbers) {
    gutter = `<div class="diffkit-gutter"><span class="diffkit-line-old">${delChange.oldLineNumber ?? ''}</span><span class="diffkit-line-new">${addChange.newLineNumber ?? ''}</span></div>`;
  }

  const segments = computeCharDiff(delChange.content, addChange.content);
  const content = segments
    .map((seg) => {
      const text = escapeHtml(seg.text);
      switch (seg.type) {
        case 'deleted':
          return `<del class="diffkit-deleted">${text}</del>`;
        case 'added':
          return `<ins class="diffkit-added">${text}</ins>`;
        default:
          return text;
      }
    })
    .join('');

  const wrapClass = wrapLines ? ' diffkit-wrap' : '';
  return `<div class="diffkit-line diffkit-modified">${gutter}<div class="diffkit-content${wrapClass}">${content}</div></div>`;
}

function computeCharDiff(
  oldText: string,
  newText: string
): { type: 'unchanged' | 'deleted' | 'added'; text: string }[] {
  const segments: { type: 'unchanged' | 'deleted' | 'added'; text: string }[] = [];

  // Find common prefix
  let prefixLen = 0;
  while (prefixLen < oldText.length && prefixLen < newText.length && oldText[prefixLen] === newText[prefixLen]) {
    prefixLen++;
  }

  // Find common suffix
  let suffixLen = 0;
  while (
    suffixLen < oldText.length - prefixLen &&
    suffixLen < newText.length - prefixLen &&
    oldText[oldText.length - 1 - suffixLen] === newText[newText.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  if (prefixLen > 0) {
    segments.push({ type: 'unchanged', text: oldText.slice(0, prefixLen) });
  }

  const oldMiddle = oldText.slice(prefixLen, oldText.length - suffixLen);
  const newMiddle = newText.slice(prefixLen, newText.length - suffixLen);

  if (oldMiddle.length > 0) {
    segments.push({ type: 'deleted', text: oldMiddle });
  }

  if (newMiddle.length > 0) {
    segments.push({ type: 'added', text: newMiddle });
  }

  if (suffixLen > 0) {
    segments.push({ type: 'unchanged', text: oldText.slice(oldText.length - suffixLen) });
  }

  return segments;
}

export default renderInline;
