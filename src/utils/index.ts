/**
 * Utility exports for DiffKit
 */

export { hash, hashToHex, hashMultiple, fnv1a, createHashMap, likelyEqual } from './hash.js';
export {
  escapeHtml,
  unescapeHtml,
  escapeRegExp,
  escapeJson,
  escapeCss,
  escapeShell,
  escapeForDisplay,
  stripAnsi,
} from './escape.js';
export {
  deepMerge,
  deepMergeAll,
  shallowMerge,
  deepClone,
  pick,
  omit,
} from './merge.js';
