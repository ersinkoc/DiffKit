/**
 * Copy to clipboard hook
 *
 * Provides clipboard functionality for copying diff content.
 */

import { useState, useCallback, useRef } from 'react';
import type { Hunk, Change, DiffResult } from '../../../core/types.js';

/**
 * Copy status
 */
export type CopyStatus = 'idle' | 'copying' | 'success' | 'error';

/**
 * Options for copy to clipboard
 */
export interface CopyToClipboardOptions {
  /** Duration to show success/error status (ms) */
  statusDuration?: number;
  /** Callback on successful copy */
  onSuccess?: (content: string) => void;
  /** Callback on copy error */
  onError?: (error: Error) => void;
  /** Include line numbers in copied content */
  includeLineNumbers?: boolean;
  /** Include diff prefixes (+/-) in copied content */
  includePrefixes?: boolean;
}

/**
 * Result from useCopyToClipboard hook
 */
export interface CopyToClipboardResult {
  /** Current copy status */
  status: CopyStatus;
  /** Copy arbitrary text to clipboard */
  copy: (text: string) => Promise<boolean>;
  /** Copy a single hunk's content */
  copyHunk: (hunk: Hunk, options?: CopyHunkOptions) => Promise<boolean>;
  /** Copy all hunks' content */
  copyAllHunks: (hunks: Hunk[], options?: CopyHunkOptions) => Promise<boolean>;
  /** Copy only added lines */
  copyAdditions: (hunks: Hunk[]) => Promise<boolean>;
  /** Copy only deleted lines */
  copyDeletions: (hunks: Hunk[]) => Promise<boolean>;
  /** Copy the full diff result */
  copyDiffResult: (result: DiffResult) => Promise<boolean>;
  /** Copy as unified diff format */
  copyAsUnifiedDiff: (hunks: Hunk[]) => Promise<boolean>;
  /** Reset status to idle */
  reset: () => void;
}

/**
 * Options for copying a hunk
 */
export interface CopyHunkOptions {
  /** Include the hunk header */
  includeHeader?: boolean;
  /** Filter by change type */
  changeTypes?: Array<'add' | 'delete' | 'normal'>;
  /** Include line numbers */
  includeLineNumbers?: boolean;
  /** Include diff prefixes */
  includePrefixes?: boolean;
}

/**
 * Default options
 */
const defaultOptions: Required<CopyToClipboardOptions> = {
  statusDuration: 2000,
  onSuccess: () => {},
  onError: () => {},
  includeLineNumbers: false,
  includePrefixes: true,
};

/**
 * Default hunk options
 */
const defaultHunkOptions: Required<CopyHunkOptions> = {
  includeHeader: true,
  changeTypes: ['add', 'delete', 'normal'],
  includeLineNumbers: false,
  includePrefixes: true,
};

/**
 * Format a change for copying
 */
function formatChange(
  change: Change,
  options: Required<CopyHunkOptions>
): string {
  let line = '';

  if (options.includeLineNumbers) {
    const lineNum = change.type === 'delete'
      ? change.oldLineNumber
      : change.newLineNumber;
    line += `${lineNum ?? ''}\t`;
  }

  if (options.includePrefixes) {
    const prefix = change.type === 'add' ? '+' : change.type === 'delete' ? '-' : ' ';
    line += prefix;
  }

  line += change.content;

  return line;
}

/**
 * Format a hunk for copying
 */
function formatHunk(hunk: Hunk, options: Required<CopyHunkOptions>): string {
  const lines: string[] = [];

  if (options.includeHeader) {
    lines.push(hunk.header);
  }

  for (const change of hunk.changes) {
    if (options.changeTypes.includes(change.type)) {
      lines.push(formatChange(change, options));
    }
  }

  return lines.join('\n');
}

/**
 * Hook for copy to clipboard functionality
 */
export function useCopyToClipboard(
  options: CopyToClipboardOptions = {}
): CopyToClipboardResult {
  const opts = { ...defaultOptions, ...options };
  const [status, setStatus] = useState<CopyStatus>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetStatus = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const setStatusWithTimeout = useCallback(
    (newStatus: CopyStatus) => {
      resetStatus();
      setStatus(newStatus);

      if (newStatus === 'success' || newStatus === 'error') {
        timeoutRef.current = setTimeout(() => {
          setStatus('idle');
        }, opts.statusDuration);
      }
    },
    [opts.statusDuration, resetStatus]
  );

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      setStatus('copying');

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.left = '-9999px';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }

        setStatusWithTimeout('success');
        opts.onSuccess(text);
        return true;
      } catch (error) {
        setStatusWithTimeout('error');
        opts.onError(error instanceof Error ? error : new Error('Copy failed'));
        return false;
      }
    },
    [setStatusWithTimeout, opts]
  );

  const copyHunk = useCallback(
    async (hunk: Hunk, hunkOptions: CopyHunkOptions = {}): Promise<boolean> => {
      const mergedOptions = {
        ...defaultHunkOptions,
        ...hunkOptions,
        includeLineNumbers: hunkOptions.includeLineNumbers ?? opts.includeLineNumbers,
        includePrefixes: hunkOptions.includePrefixes ?? opts.includePrefixes,
      };

      const content = formatHunk(hunk, mergedOptions);
      return copy(content);
    },
    [copy, opts.includeLineNumbers, opts.includePrefixes]
  );

  const copyAllHunks = useCallback(
    async (hunks: Hunk[], hunkOptions: CopyHunkOptions = {}): Promise<boolean> => {
      const mergedOptions = {
        ...defaultHunkOptions,
        ...hunkOptions,
        includeLineNumbers: hunkOptions.includeLineNumbers ?? opts.includeLineNumbers,
        includePrefixes: hunkOptions.includePrefixes ?? opts.includePrefixes,
      };

      const content = hunks.map((hunk) => formatHunk(hunk, mergedOptions)).join('\n\n');
      return copy(content);
    },
    [copy, opts.includeLineNumbers, opts.includePrefixes]
  );

  const copyAdditions = useCallback(
    async (hunks: Hunk[]): Promise<boolean> => {
      const lines: string[] = [];

      for (const hunk of hunks) {
        for (const change of hunk.changes) {
          if (change.type === 'add') {
            lines.push(change.content);
          }
        }
      }

      return copy(lines.join('\n'));
    },
    [copy]
  );

  const copyDeletions = useCallback(
    async (hunks: Hunk[]): Promise<boolean> => {
      const lines: string[] = [];

      for (const hunk of hunks) {
        for (const change of hunk.changes) {
          if (change.type === 'delete') {
            lines.push(change.content);
          }
        }
      }

      return copy(lines.join('\n'));
    },
    [copy]
  );

  const copyDiffResult = useCallback(
    async (result: DiffResult): Promise<boolean> => {
      const content = result.toUnifiedString();
      return copy(content);
    },
    [copy]
  );

  const copyAsUnifiedDiff = useCallback(
    async (hunks: Hunk[]): Promise<boolean> => {
      const lines: string[] = [];

      for (const hunk of hunks) {
        lines.push(hunk.header);
        for (const change of hunk.changes) {
          const prefix = change.type === 'add' ? '+' : change.type === 'delete' ? '-' : ' ';
          lines.push(prefix + change.content);
        }
      }

      return copy(lines.join('\n'));
    },
    [copy]
  );

  const reset = useCallback(() => {
    resetStatus();
    setStatus('idle');
  }, [resetStatus]);

  return {
    status,
    copy,
    copyHunk,
    copyAllHunks,
    copyAdditions,
    copyDeletions,
    copyDiffResult,
    copyAsUnifiedDiff,
    reset,
  };
}

export default useCopyToClipboard;
