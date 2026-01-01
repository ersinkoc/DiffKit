/**
 * Inline View component
 */

import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import type { InlineViewProps } from './types.js';
import type { Change } from '../../core/types.js';
import { useDiff } from './hooks/useDiff.js';
import { useThemeCSSVars } from './hooks/useTheme.js';
import { LineNumber } from './LineNumber.js';

/**
 * Inline diff view component
 * Shows changes inline with deletions and additions highlighted
 */
export function InlineView({
  old: oldContent,
  new: newContent,
  lineNumbers = true,
  wrapLines = true,
  showHeader = true,
  algorithm = 'myers',
  granularity = 'line',
  context = 3,
  theme = 'github-dark',
  onLineClick,
  onHunkClick,
  className = '',
  style,
}: InlineViewProps) {
  const { result, loading, error } = useDiff(oldContent, newContent, {
    algorithm,
    granularity,
    context,
  });

  const cssVars = useThemeCSSVars(theme);

  const containerStyle = useMemo(() => {
    return {
      ...cssVars,
      ...style,
    } as CSSProperties;
  }, [cssVars, style]);

  const wrapClass = wrapLines ? 'diffkit-wrap' : '';
  const baseClass = `diffkit-diff diffkit-inline ${wrapClass}`;
  const fullClass = className ? `${baseClass} ${className}` : baseClass;

  if (loading) {
    return (
      <div className={fullClass} style={containerStyle}>
        <div className="diffkit-loading">Computing diff...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={fullClass} style={containerStyle}>
        <div className="diffkit-error">Error: {error.message}</div>
      </div>
    );
  }

  if (!result || result.hunks.length === 0) {
    return (
      <div className={fullClass} style={containerStyle}>
        <div className="diffkit-empty">No differences found</div>
      </div>
    );
  }

  return (
    <div className={fullClass} style={containerStyle}>
      {result.hunks.map((hunk, hunkIndex) => {
        const inlineItems = buildInlineContent(hunk.changes);

        return (
          <div
            key={hunkIndex}
            className="diffkit-hunk"
            onClick={onHunkClick ? () => onHunkClick(hunk) : undefined}
          >
            {showHeader && <div className="diffkit-hunk-header">{hunk.header}</div>}
            <div className="diffkit-hunk-content">
              {inlineItems.map((item, itemIndex) => (
                <InlineLine
                  key={itemIndex}
                  item={item}
                  lineNumbers={lineNumbers}
                  onLineClick={onLineClick}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface InlineItem {
  type: 'normal' | 'modified';
  oldLineNumber?: number;
  newLineNumber?: number;
  segments: { type: 'unchanged' | 'deleted' | 'added'; text: string }[];
}

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
      const nextChange = changes[i + 1];

      if (nextChange && nextChange.type === 'add') {
        const segments = computeInlineDiff(change.content, nextChange.content);
        items.push({
          type: 'modified',
          oldLineNumber: change.oldLineNumber,
          newLineNumber: nextChange.newLineNumber,
          segments,
        });
        i += 2;
      } else {
        items.push({
          type: 'modified',
          oldLineNumber: change.oldLineNumber,
          segments: [{ type: 'deleted', text: change.content }],
        });
        i++;
      }
    } else if (change.type === 'add') {
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

function computeInlineDiff(
  oldLine: string,
  newLine: string
): { type: 'unchanged' | 'deleted' | 'added'; text: string }[] {
  const segments: { type: 'unchanged' | 'deleted' | 'added'; text: string }[] = [];
  const oldWords = oldLine.split(/(\s+)/);
  const newWords = newLine.split(/(\s+)/);

  let prefixLen = 0;
  while (prefixLen < oldWords.length && prefixLen < newWords.length && oldWords[prefixLen] === newWords[prefixLen]) {
    prefixLen++;
  }

  let suffixLen = 0;
  while (
    suffixLen < oldWords.length - prefixLen &&
    suffixLen < newWords.length - prefixLen &&
    oldWords[oldWords.length - 1 - suffixLen] === newWords[newWords.length - 1 - suffixLen]
  ) {
    suffixLen++;
  }

  if (prefixLen > 0) {
    segments.push({ type: 'unchanged', text: oldWords.slice(0, prefixLen).join('') });
  }

  const oldMiddle = oldWords.slice(prefixLen, oldWords.length - suffixLen);
  const newMiddle = newWords.slice(prefixLen, newWords.length - suffixLen);

  if (oldMiddle.length > 0) {
    segments.push({ type: 'deleted', text: oldMiddle.join('') });
  }

  if (newMiddle.length > 0) {
    segments.push({ type: 'added', text: newMiddle.join('') });
  }

  if (suffixLen > 0) {
    segments.push({ type: 'unchanged', text: oldWords.slice(oldWords.length - suffixLen).join('') });
  }

  return segments;
}

interface InlineLineProps {
  item: InlineItem;
  lineNumbers: boolean;
  onLineClick?: (lineNumber: number, side: 'old' | 'new') => void;
}

function InlineLine({ item, lineNumbers, onLineClick }: InlineLineProps) {
  const typeClass = item.type === 'normal' ? 'diffkit-normal' : 'diffkit-modified';

  const handleClick = () => {
    if (!onLineClick) return;
    const lineNum = item.newLineNumber ?? item.oldLineNumber;
    const side = item.newLineNumber ? 'new' : 'old';
    if (lineNum) {
      onLineClick(lineNum, side);
    }
  };

  return (
    <div className={`diffkit-line ${typeClass}`} onClick={handleClick}>
      {lineNumbers && (
        <div className="diffkit-gutter">
          <LineNumber number={item.oldLineNumber} side="old" />
          <LineNumber number={item.newLineNumber} side="new" />
        </div>
      )}
      <div className="diffkit-content">
        {item.segments.map((seg, index) => {
          if (seg.type === 'deleted') {
            return (
              <del key={index} className="diffkit-deleted">
                {seg.text}
              </del>
            );
          }
          if (seg.type === 'added') {
            return (
              <ins key={index} className="diffkit-added">
                {seg.text}
              </ins>
            );
          }
          return <span key={index}>{seg.text}</span>;
        })}
      </div>
    </div>
  );
}

export default InlineView;
