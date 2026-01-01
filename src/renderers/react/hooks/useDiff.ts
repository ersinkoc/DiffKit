/**
 * useDiff hook for computing diffs
 */

import { useState, useEffect, useMemo } from 'react';
import type { DiffResult, DiffOptions } from '../../../core/types.js';
import type { UseDiffResult } from '../types.js';
import { createDiff } from '../../../core/diff-engine.js';

/**
 * Hook to compute diff between two strings
 */
export function useDiff(
  oldContent: string,
  newContent: string,
  options?: DiffOptions
): UseDiffResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Memoize options to prevent unnecessary recalculations
  const memoizedOptions = useMemo(
    () => ({
      algorithm: options?.algorithm ?? 'myers',
      granularity: options?.granularity ?? 'line',
      context: options?.context ?? 3,
      ignoreWhitespace: options?.ignoreWhitespace,
      ignoreCase: options?.ignoreCase,
    }),
    [
      options?.algorithm,
      options?.granularity,
      options?.context,
      options?.ignoreWhitespace,
      options?.ignoreCase,
    ]
  );

  // Compute diff
  const result = useMemo(() => {
    try {
      setLoading(true);
      setError(null);
      const diff = createDiff(oldContent, newContent, memoizedOptions);
      setLoading(false);
      return diff;
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    }
  }, [oldContent, newContent, memoizedOptions]);

  return { result, loading, error };
}

/**
 * Async version of useDiff for large files
 */
export function useDiffAsync(
  oldContent: string,
  newContent: string,
  options?: DiffOptions
): UseDiffResult {
  const [result, setResult] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const computeDiff = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use setTimeout to allow UI to update
        await new Promise((resolve) => window.setTimeout(resolve, 0));

        if (cancelled) return;

        const diff = createDiff(oldContent, newContent, options);

        if (!cancelled) {
          setResult(diff);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    };

    computeDiff();

    return () => {
      cancelled = true;
    };
  }, [oldContent, newContent, options?.algorithm, options?.granularity, options?.context]);

  return { result, loading, error };
}

export default useDiff;
