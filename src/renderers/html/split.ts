/**
 * Split view HTML renderer
 * Two columns side-by-side
 */

import type { DiffResult, Change, Theme } from '../../core/types.js';
import type { HTMLRendererOptions, SplitLinePair } from '../types.js';
import { escapeHtml, div, classNames } from './utils.js';

/**
 * Render diff result as split view HTML
 */
export function renderSplit(
  result: DiffResult,
  options: HTMLRendererOptions = {},
  _theme?: Theme
): string {
  const { lineNumbers = true, wrapLines = false } = options;

  const lines: string[] = [];
  lines.push('<div class="diffkit-diff diffkit-split">');

  for (const hunk of result.hunks) {
    lines.push('<div class="diffkit-hunk">');
    lines.push(`<div class="diffkit-hunk-header">${escapeHtml(hunk.header)}</div>`);

    const pairs = buildLinePairs(hunk.changes);

    for (const pair of pairs) {
      lines.push('<div class="diffkit-row">');
      lines.push(renderSide(pair.left, 'left', lineNumbers, wrapLines));
      lines.push(renderSide(pair.right, 'right', lineNumbers, wrapLines));
      lines.push('</div>');
    }

    lines.push('</div>');
  }

  lines.push('</div>');
  return lines.join('\n');
}

/**
 * Build pairs of lines for split view
 */
function buildLinePairs(changes: Change[]): SplitLinePair[] {
  const pairs: SplitLinePair[] = [];
  const deletions: Change[] = [];
  const additions: Change[] = [];

  for (const change of changes) {
    if (change.type === 'normal') {
      // Flush pending deletions and additions
      flushPairs(pairs, deletions, additions);

      pairs.push({
        left: { type: 'normal', content: change.content, lineNumber: change.oldLineNumber },
        right: { type: 'normal', content: change.content, lineNumber: change.newLineNumber },
      });
    } else if (change.type === 'delete') {
      deletions.push(change);
    } else if (change.type === 'add') {
      additions.push(change);
    }
  }

  // Flush remaining
  flushPairs(pairs, deletions, additions);

  return pairs;
}

/**
 * Flush pending deletions and additions into pairs
 */
function flushPairs(pairs: SplitLinePair[], deletions: Change[], additions: Change[]): void {
  const maxLen = Math.max(deletions.length, additions.length);

  for (let i = 0; i < maxLen; i++) {
    const del = deletions[i];
    const add = additions[i];

    pairs.push({
      left: del
        ? { type: 'delete', content: del.content, lineNumber: del.oldLineNumber }
        : { type: 'empty', content: '' },
      right: add
        ? { type: 'add', content: add.content, lineNumber: add.newLineNumber }
        : { type: 'empty', content: '' },
    });
  }

  deletions.length = 0;
  additions.length = 0;
}

/**
 * Render one side of split view
 */
function renderSide(
  line: { type: string; content: string; lineNumber?: number } | null,
  side: 'left' | 'right',
  lineNumbers: boolean,
  wrapLines: boolean
): string {
  if (!line) {
    return div(`diffkit-side diffkit-${side} diffkit-empty`, '');
  }

  const sideClass = classNames(
    'diffkit-side',
    `diffkit-${side}`,
    line.type === 'add' && 'diffkit-add',
    line.type === 'delete' && 'diffkit-delete',
    line.type === 'normal' && 'diffkit-normal',
    line.type === 'empty' && 'diffkit-empty'
  );

  let gutter = '';
  if (lineNumbers) {
    const lineNum = line.lineNumber ?? '';
    gutter = div('diffkit-gutter', String(lineNum));
  }

  const contentClass = classNames('diffkit-content', wrapLines && 'diffkit-wrap');
  const content = line.type === 'empty' ? '' : escapeHtml(line.content);

  return div(sideClass, gutter + div(contentClass, content));
}

/**
 * Render split view with word-level highlighting
 */
export function renderSplitWithWordDiff(
  result: DiffResult,
  options: HTMLRendererOptions = {},
  _theme?: Theme
): string {
  const { lineNumbers = true, wrapLines = false } = options;

  const lines: string[] = [];
  lines.push('<div class="diffkit-diff diffkit-split diffkit-word-diff">');

  for (const hunk of result.hunks) {
    lines.push('<div class="diffkit-hunk">');
    lines.push(`<div class="diffkit-hunk-header">${escapeHtml(hunk.header)}</div>`);

    const pairs = buildLinePairs(hunk.changes);

    for (const pair of pairs) {
      lines.push('<div class="diffkit-row">');

      // Word-level diff for modify pairs
      if (pair.left?.type === 'delete' && pair.right?.type === 'add') {
        const wordDiff = computeWordDiff(pair.left.content, pair.right.content);
        lines.push(
          renderSideWithHighlight(
            { ...pair.left, highlightedContent: wordDiff.left },
            'left',
            lineNumbers,
            wrapLines
          )
        );
        lines.push(
          renderSideWithHighlight(
            { ...pair.right, highlightedContent: wordDiff.right },
            'right',
            lineNumbers,
            wrapLines
          )
        );
      } else {
        lines.push(renderSide(pair.left, 'left', lineNumbers, wrapLines));
        lines.push(renderSide(pair.right, 'right', lineNumbers, wrapLines));
      }

      lines.push('</div>');
    }

    lines.push('</div>');
  }

  lines.push('</div>');
  return lines.join('\n');
}

/**
 * Compute word-level diff between two lines
 */
function computeWordDiff(
  oldLine: string,
  newLine: string
): { left: string; right: string } {
  const oldWords = oldLine.split(/(\s+)/);
  const newWords = newLine.split(/(\s+)/);

  // Simple diff: highlight words that differ
  let leftHtml = '';
  let rightHtml = '';

  const maxLen = Math.max(oldWords.length, newWords.length);

  for (let i = 0; i < maxLen; i++) {
    const oldWord = oldWords[i] ?? '';
    const newWord = newWords[i] ?? '';

    if (oldWord === newWord) {
      leftHtml += escapeHtml(oldWord);
      rightHtml += escapeHtml(newWord);
    } else {
      if (oldWord) {
        leftHtml += `<span class="diffkit-highlight-delete">${escapeHtml(oldWord)}</span>`;
      }
      if (newWord) {
        rightHtml += `<span class="diffkit-highlight-add">${escapeHtml(newWord)}</span>`;
      }
    }
  }

  return { left: leftHtml, right: rightHtml };
}

/**
 * Render side with pre-highlighted content
 */
function renderSideWithHighlight(
  line: { type: string; content: string; lineNumber?: number; highlightedContent?: string },
  side: 'left' | 'right',
  lineNumbers: boolean,
  wrapLines: boolean
): string {
  const sideClass = classNames(
    'diffkit-side',
    `diffkit-${side}`,
    line.type === 'add' && 'diffkit-add',
    line.type === 'delete' && 'diffkit-delete',
    line.type === 'normal' && 'diffkit-normal'
  );

  let gutter = '';
  if (lineNumbers) {
    const lineNum = line.lineNumber ?? '';
    gutter = div('diffkit-gutter', String(lineNum));
  }

  const contentClass = classNames('diffkit-content', wrapLines && 'diffkit-wrap');
  const content = line.highlightedContent ?? escapeHtml(line.content);

  return div(sideClass, gutter + div(contentClass, content));
}

export default renderSplit;
