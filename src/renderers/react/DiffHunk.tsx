/**
 * Diff Hunk component
 */

import type { DiffHunkProps } from './types.js';
import { DiffLine } from './DiffLine.js';

/**
 * Hunk container component
 */
export function DiffHunk({
  hunk,
  mode,
  lineNumbers = true,
  showHeader = true,
  onLineClick,
  onClick,
  className = '',
}: DiffHunkProps) {
  const baseClass = 'diffkit-hunk';
  const fullClass = className ? `${baseClass} ${className}` : baseClass;

  return (
    <div className={fullClass} onClick={onClick}>
      {showHeader && <div className="diffkit-hunk-header">{hunk.header}</div>}
      <div className="diffkit-hunk-content">
        {hunk.changes.map((change, index) => (
          <DiffLine
            key={index}
            change={change}
            mode={mode}
            lineNumbers={lineNumbers}
            onClick={
              onLineClick
                ? () => {
                    const lineNum = change.type === 'delete' ? change.oldLineNumber : change.newLineNumber;
                    const side = change.type === 'delete' ? 'old' : 'new';
                    if (lineNum) {
                      onLineClick(lineNum, side);
                    }
                  }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

export default DiffHunk;
