/**
 * Theme presets index
 */

export { githubDark } from './github-dark.js';
export { githubLight } from './github-light.js';
export { vscodeDark } from './vscode-dark.js';
export { vscodeLight } from './vscode-light.js';
export { monokai } from './monokai.js';

import { githubDark } from './github-dark.js';
import { githubLight } from './github-light.js';
import { vscodeDark } from './vscode-dark.js';
import { vscodeLight } from './vscode-light.js';
import { monokai } from './monokai.js';
import type { Theme } from '../types.js';

/**
 * All available theme presets
 */
export const themes: Record<string, Theme> = {
  'github-dark': githubDark,
  'github-light': githubLight,
  'vscode-dark': vscodeDark,
  'vscode-light': vscodeLight,
  monokai: monokai,
};

/**
 * Get a theme by name
 */
export function getTheme(name: string): Theme | undefined {
  return themes[name];
}

/**
 * List all available theme names
 */
export function listThemes(): string[] {
  return Object.keys(themes);
}

/**
 * Default theme
 */
export const defaultTheme = githubDark;
