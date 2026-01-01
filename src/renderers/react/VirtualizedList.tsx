/**
 * VirtualizedList component for efficient rendering of large diffs
 * Implements windowing/virtual scrolling to only render visible items
 */

import React, {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type CSSProperties,
  type ReactNode,
} from 'react';

/**
 * Props for VirtualizedList
 */
export interface VirtualizedListProps<T> {
  /** Array of items to render */
  items: T[];
  /** Height of each item in pixels */
  itemHeight: number;
  /** Height of the container in pixels */
  containerHeight: number;
  /** Number of items to render outside visible area (buffer) */
  overscan?: number;
  /** Render function for each item */
  renderItem: (item: T, index: number, style: CSSProperties) => ReactNode;
  /** Additional class name for the container */
  className?: string;
  /** Inline styles for the container */
  style?: CSSProperties;
  /** Callback when scroll position changes */
  onScroll?: (scrollTop: number) => void;
  /** Callback when visible range changes */
  onVisibleRangeChange?: (startIndex: number, endIndex: number) => void;
}

/**
 * Calculate visible range based on scroll position
 */
function calculateVisibleRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  itemCount: number,
  overscan: number
): { startIndex: number; endIndex: number } {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(
    itemCount - 1,
    Math.floor(scrollTop / itemHeight) + visibleCount + overscan
  );

  return { startIndex, endIndex };
}

/**
 * VirtualizedList component
 * Efficiently renders large lists by only rendering visible items
 */
export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3,
  renderItem,
  className = '',
  style,
  onScroll,
  onVisibleRangeChange,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;

  const { startIndex, endIndex } = useMemo(
    () =>
      calculateVisibleRange(scrollTop, containerHeight, itemHeight, items.length, overscan),
    [scrollTop, containerHeight, itemHeight, items.length, overscan]
  );

  // Notify when visible range changes
  useEffect(() => {
    onVisibleRangeChange?.(startIndex, endIndex);
  }, [startIndex, endIndex, onVisibleRangeChange]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    },
    [onScroll]
  );

  // Generate visible items
  const visibleItems = useMemo(() => {
    const rendered: ReactNode[] = [];

    for (let i = startIndex; i <= endIndex; i++) {
      const item = items[i];
      if (item === undefined) continue;

      const itemStyle: CSSProperties = {
        position: 'absolute',
        top: i * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
      };

      rendered.push(renderItem(item, i, itemStyle));
    }

    return rendered;
  }, [items, startIndex, endIndex, itemHeight, renderItem]);

  const containerStyle: CSSProperties = useMemo(
    () => ({
      ...style,
      height: containerHeight,
      overflow: 'auto',
      position: 'relative',
    }),
    [style, containerHeight]
  );

  const innerStyle: CSSProperties = useMemo(
    () => ({
      height: totalHeight,
      position: 'relative',
    }),
    [totalHeight]
  );

  const baseClass = 'diffkit-virtualized-list';
  const fullClass = className ? `${baseClass} ${className}` : baseClass;

  return (
    <div
      ref={containerRef}
      className={fullClass}
      style={containerStyle}
      onScroll={handleScroll}
    >
      <div style={innerStyle}>{visibleItems}</div>
    </div>
  );
}

/**
 * Props for VirtualizedDiff - specialized for diff rendering
 */
export interface VirtualizedDiffProps {
  /** Flattened array of all lines across all hunks */
  lines: VirtualizedDiffLine[];
  /** Height of each line in pixels */
  lineHeight?: number;
  /** Height of the container in pixels */
  containerHeight?: number;
  /** Number of lines to render outside visible area */
  overscan?: number;
  /** Render function for each line */
  renderLine: (line: VirtualizedDiffLine, index: number, style: CSSProperties) => ReactNode;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Callback when scroll position changes */
  onScroll?: (scrollTop: number) => void;
}

/**
 * Represents a line in the virtualized diff
 */
export interface VirtualizedDiffLine {
  /** Type of line */
  type: 'hunk-header' | 'add' | 'delete' | 'normal';
  /** Content of the line */
  content: string;
  /** Old line number (if applicable) */
  oldLineNumber?: number;
  /** New line number (if applicable) */
  newLineNumber?: number;
  /** Hunk index this line belongs to */
  hunkIndex: number;
  /** Header text (for hunk-header type) */
  header?: string;
}

/**
 * Default line height for diff lines
 */
const DEFAULT_LINE_HEIGHT = 20;

/**
 * Default container height
 */
const DEFAULT_CONTAINER_HEIGHT = 500;

/**
 * VirtualizedDiff component
 * Specialized virtual scrolling for diff content
 */
export function VirtualizedDiff({
  lines,
  lineHeight = DEFAULT_LINE_HEIGHT,
  containerHeight = DEFAULT_CONTAINER_HEIGHT,
  overscan = 5,
  renderLine,
  className = '',
  style,
  onScroll,
}: VirtualizedDiffProps) {
  return (
    <VirtualizedList
      items={lines}
      itemHeight={lineHeight}
      containerHeight={containerHeight}
      overscan={overscan}
      renderItem={renderLine}
      className={className}
      style={style}
      onScroll={onScroll}
    />
  );
}

/**
 * Hook to flatten hunks into virtualized lines
 */
export function useFlattenedDiffLines(
  hunks: Array<{
    header: string;
    changes: Array<{
      type: 'add' | 'delete' | 'normal';
      content: string;
      oldLineNumber?: number;
      newLineNumber?: number;
    }>;
  }>,
  showHeaders = true
): VirtualizedDiffLine[] {
  return useMemo(() => {
    const lines: VirtualizedDiffLine[] = [];

    hunks.forEach((hunk, hunkIndex) => {
      // Add hunk header
      if (showHeaders) {
        lines.push({
          type: 'hunk-header',
          content: hunk.header,
          header: hunk.header,
          hunkIndex,
        });
      }

      // Add all changes
      hunk.changes.forEach((change) => {
        lines.push({
          type: change.type,
          content: change.content,
          oldLineNumber: change.oldLineNumber,
          newLineNumber: change.newLineNumber,
          hunkIndex,
        });
      });
    });

    return lines;
  }, [hunks, showHeaders]);
}

/**
 * Hook to scroll to a specific line
 */
export function useScrollToLine(
  containerRef: React.RefObject<HTMLDivElement | null>,
  lineHeight: number
) {
  const scrollToLine = useCallback(
    (lineIndex: number, behavior: ScrollBehavior = 'smooth') => {
      if (containerRef.current) {
        const targetTop = lineIndex * lineHeight;
        containerRef.current.scrollTo({
          top: targetTop,
          behavior,
        });
      }
    },
    [containerRef, lineHeight]
  );

  return scrollToLine;
}

/**
 * Hook to find line index by line number
 */
export function useFindLineIndex(lines: VirtualizedDiffLine[]) {
  const findByOldLineNumber = useCallback(
    (lineNumber: number): number => {
      return lines.findIndex(
        (line) => line.oldLineNumber === lineNumber && line.type !== 'hunk-header'
      );
    },
    [lines]
  );

  const findByNewLineNumber = useCallback(
    (lineNumber: number): number => {
      return lines.findIndex(
        (line) => line.newLineNumber === lineNumber && line.type !== 'hunk-header'
      );
    },
    [lines]
  );

  const findByHunkIndex = useCallback(
    (hunkIndex: number): number => {
      return lines.findIndex(
        (line) => line.hunkIndex === hunkIndex && line.type === 'hunk-header'
      );
    },
    [lines]
  );

  return { findByOldLineNumber, findByNewLineNumber, findByHunkIndex };
}

export default VirtualizedList;
