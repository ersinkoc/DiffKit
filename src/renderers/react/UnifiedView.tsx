/**
 * Unified View component
 */

import type { CSSProperties } from 'react';
import { useMemo } from 'react';
import type { UnifiedViewProps } from './types.js';
import { DiffHunk } from './DiffHunk.js';
import { useDiff } from './hooks/useDiff.js';
import { useThemeCSSVars } from './hooks/useTheme.js';

/**
 * Unified diff view component
 * Shows changes in a single column with +/- prefixes
 */
export function UnifiedView({
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
}: UnifiedViewProps) {
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
  const baseClass = `diffkit-diff diffkit-unified ${wrapClass}`;
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
      {result.hunks.map((hunk, index) => (
        <DiffHunk
          key={index}
          hunk={hunk}
          mode="unified"
          lineNumbers={lineNumbers}
          showHeader={showHeader}
          onLineClick={onLineClick}
          onClick={onHunkClick ? () => onHunkClick(hunk) : undefined}
        />
      ))}
    </div>
  );
}

export default UnifiedView;
