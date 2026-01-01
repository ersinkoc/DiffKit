/**
 * Virtualized Unified View component
 * Uses virtual scrolling for efficient rendering of large diffs
 */

import { useCallback, type CSSProperties } from 'react';
import { useMemo } from 'react';
import type { VirtualizedUnifiedViewProps } from './types.js';
import { useDiff } from './hooks/useDiff.js';
import { useThemeCSSVars } from './hooks/useTheme.js';
import {
  VirtualizedDiff,
  useFlattenedDiffLines,
  type VirtualizedDiffLine,
} from './VirtualizedList.js';
import { LineNumber } from './LineNumber.js';

/**
 * Default values
 */
const DEFAULT_LINE_HEIGHT = 22;
const DEFAULT_CONTAINER_HEIGHT = 600;
const DEFAULT_VIRTUALIZE_THRESHOLD = 500;

/**
 * Virtualized unified diff view component
 * Uses virtual scrolling for large diffs
 */
export function VirtualizedUnifiedView({
  old: oldContent,
  new: newContent,
  lineNumbers = true,
  wrapLines = false,
  showHeader = true,
  algorithm = 'myers',
  granularity = 'line',
  context = 3,
  theme = 'github-dark',
  onLineClick,
  onHunkClick,
  className = '',
  style,
  containerHeight = DEFAULT_CONTAINER_HEIGHT,
  lineHeight = DEFAULT_LINE_HEIGHT,
  overscan = 5,
  virtualize = 'auto',
  virtualizeThreshold = DEFAULT_VIRTUALIZE_THRESHOLD,
}: VirtualizedUnifiedViewProps) {
  const { result, loading, error } = useDiff(oldContent, newContent, {
    algorithm,
    granularity,
    context,
  });

  const cssVars = useThemeCSSVars(theme);

  // Flatten hunks into virtualized lines
  const flatLines = useFlattenedDiffLines(result?.hunks ?? [], showHeader);

  // Determine if we should use virtualization
  const shouldVirtualize = useMemo(() => {
    if (virtualize === true) return true;
    if (virtualize === false) return false;
    // Auto mode: virtualize if lines exceed threshold
    return flatLines.length > virtualizeThreshold;
  }, [virtualize, flatLines.length, virtualizeThreshold]);

  // Note: scrollToLine and find utilities are available via exports for external use
  // const scrollToLine = useScrollToLine(containerRef, lineHeight);
  // const { findByOldLineNumber, findByNewLineNumber, findByHunkIndex } = useFindLineIndex(flatLines);

  const containerStyle = useMemo(() => {
    return {
      ...cssVars,
      ...style,
    } as CSSProperties;
  }, [cssVars, style]);

  const wrapClass = wrapLines ? 'diffkit-wrap' : '';
  const baseClass = `diffkit-diff diffkit-unified diffkit-virtualized ${wrapClass}`;
  const fullClass = className ? `${baseClass} ${className}` : baseClass;

  // Handle line click
  const handleLineClick = useCallback(
    (line: VirtualizedDiffLine) => {
      if (!onLineClick) return;
      const lineNum = line.type === 'delete' ? line.oldLineNumber : line.newLineNumber;
      const side = line.type === 'delete' ? 'old' : 'new';
      if (lineNum) {
        onLineClick(lineNum, side);
      }
    },
    [onLineClick]
  );

  // Handle hunk click
  const handleHunkClick = useCallback(
    (line: VirtualizedDiffLine) => {
      if (!onHunkClick || !result) return;
      const hunk = result.hunks[line.hunkIndex];
      if (hunk) {
        onHunkClick(hunk);
      }
    },
    [onHunkClick, result]
  );

  // Render a single line
  const renderLine = useCallback(
    (line: VirtualizedDiffLine, index: number, itemStyle: CSSProperties) => {
      if (line.type === 'hunk-header') {
        return (
          <div
            key={`hunk-${line.hunkIndex}`}
            className="diffkit-hunk-header diffkit-virtualized-item"
            style={itemStyle}
            onClick={() => handleHunkClick(line)}
          >
            {line.header}
          </div>
        );
      }

      const typeClass =
        line.type === 'add'
          ? 'diffkit-add'
          : line.type === 'delete'
            ? 'diffkit-delete'
            : 'diffkit-normal';

      const prefix = line.type === 'add' ? '+' : line.type === 'delete' ? '-' : ' ';

      return (
        <div
          key={`line-${index}`}
          className={`diffkit-line ${typeClass} diffkit-virtualized-item`}
          style={itemStyle}
          onClick={() => handleLineClick(line)}
        >
          {lineNumbers && (
            <div className="diffkit-gutter">
              <LineNumber number={line.oldLineNumber} side="old" />
              <LineNumber number={line.newLineNumber} side="new" />
            </div>
          )}
          <div className="diffkit-content">
            <span className="diffkit-prefix">{prefix}</span>
            <span className="diffkit-text">{line.content}</span>
          </div>
        </div>
      );
    },
    [lineNumbers, handleLineClick, handleHunkClick]
  );

  // Render non-virtualized (standard) view
  const renderStandardView = () => {
    return (
      <div className={fullClass} style={containerStyle}>
        {flatLines.map((line, index) => {
          const itemStyle: CSSProperties = {
            height: lineHeight,
          };
          return renderLine(line, index, itemStyle);
        })}
      </div>
    );
  };

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

  // Use standard rendering for small diffs
  if (!shouldVirtualize) {
    return renderStandardView();
  }

  // Use virtualized rendering for large diffs
  return (
    <div className={fullClass} style={containerStyle}>
      <VirtualizedDiff
        lines={flatLines}
        lineHeight={lineHeight}
        containerHeight={containerHeight}
        overscan={overscan}
        renderLine={renderLine}
      />
    </div>
  );
}

export default VirtualizedUnifiedView;
