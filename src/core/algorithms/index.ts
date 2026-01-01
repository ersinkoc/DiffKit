/**
 * Algorithm exports for DiffKit
 */

export { myersAlgorithm } from './myers.js';
export { patienceAlgorithm } from './patience.js';
export { histogramAlgorithm } from './histogram.js';
export {
  computeLCS,
  findUniqueLines,
  patienceLCS,
  countOccurrences,
  findLowOccurrenceLines,
} from './lcs.js';

import { myersAlgorithm } from './myers.js';
import { patienceAlgorithm } from './patience.js';
import { histogramAlgorithm } from './histogram.js';
import type { DiffAlgorithm, AlgorithmType } from '../types.js';

/**
 * Algorithm registry
 */
const algorithms: Record<AlgorithmType, DiffAlgorithm> = {
  myers: myersAlgorithm,
  patience: patienceAlgorithm,
  histogram: histogramAlgorithm,
};

/**
 * Get algorithm by name
 */
export function getAlgorithm(name: AlgorithmType): DiffAlgorithm {
  return algorithms[name];
}

/**
 * List all available algorithms
 */
export function listAlgorithms(): AlgorithmType[] {
  return Object.keys(algorithms) as AlgorithmType[];
}
