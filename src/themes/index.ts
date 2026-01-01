/**
 * Themes module exports for DiffKit
 */

export * from './types.js';
export { createTheme, validateTheme, cloneTheme } from './create-theme.js';
export {
  generateCSSVars,
  cssVarsToString,
  applyCSSVars,
  generateStylesheet,
} from './css-vars.js';

export {
  githubDark,
  githubLight,
  vscodeDark,
  vscodeLight,
  monokai,
  themes,
  getTheme,
  listThemes,
  defaultTheme,
} from './presets/index.js';
