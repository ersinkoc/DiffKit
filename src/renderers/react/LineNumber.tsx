/**
 * Line Number component
 */

import type { LineNumberProps } from './types.js';

/**
 * Line number display component
 */
export function LineNumber({ number, side, onClick, className = '' }: LineNumberProps) {
  const baseClass = `diffkit-line-number diffkit-line-${side}`;
  const fullClass = className ? `${baseClass} ${className}` : baseClass;

  return (
    <span
      className={fullClass}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {number ?? ''}
    </span>
  );
}

export default LineNumber;
