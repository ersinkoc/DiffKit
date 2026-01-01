/**
 * Diff Line component
 */

import type { DiffLineProps } from './types.js';
import { LineNumber } from './LineNumber.js';

/**
 * Single diff line component
 */
export function DiffLine({
  change,
  mode,
  lineNumbers = true,
  side,
  onClick,
  className = '',
}: DiffLineProps) {
  const typeClass =
    change.type === 'add'
      ? 'diffkit-add'
      : change.type === 'delete'
        ? 'diffkit-delete'
        : 'diffkit-normal';

  const baseClass = `diffkit-line ${typeClass}`;
  const fullClass = className ? `${baseClass} ${className}` : baseClass;

  const prefix = change.type === 'add' ? '+' : change.type === 'delete' ? '-' : ' ';

  return (
    <div className={fullClass} onClick={onClick}>
      {lineNumbers && (
        <div className="diffkit-gutter">
          {mode === 'unified' || mode === 'inline' ? (
            <>
              <LineNumber number={change.oldLineNumber} side="old" />
              <LineNumber number={change.newLineNumber} side="new" />
            </>
          ) : (
            <LineNumber
              number={side === 'left' ? change.oldLineNumber : change.newLineNumber}
              side={side === 'left' ? 'old' : 'new'}
            />
          )}
        </div>
      )}
      <div className="diffkit-content">
        {mode === 'unified' && <span className="diffkit-prefix">{prefix}</span>}
        <span className="diffkit-text">{change.content}</span>
      </div>
    </div>
  );
}

export default DiffLine;
