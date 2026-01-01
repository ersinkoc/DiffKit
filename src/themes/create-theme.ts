/**
 * Theme factory for DiffKit
 */

import type { Theme, CreateThemeOptions, DeepPartial, ThemeColors } from './types.js';
import { githubDark } from './presets/github-dark.js';

/**
 * Get base theme by name
 */
function getBaseTheme(name: string): Theme {
  // Import dynamically to avoid circular dependencies
  const themes: Record<string, Theme> = {
    'github-dark': githubDark,
  };

  return themes[name] ?? githubDark;
}

/**
 * Merge theme colors
 */
function mergeColors(base: ThemeColors, overrides: DeepPartial<ThemeColors>): ThemeColors {
  const result = { ...base } as ThemeColors;

  for (const key of Object.keys(overrides) as Array<keyof ThemeColors>) {
    const value = overrides[key];
    if (value !== undefined) {
      if (key === 'syntax' && typeof value === 'object') {
        result.syntax = { ...base.syntax, ...value };
      } else {
        (result as unknown as Record<string, unknown>)[key] = value;
      }
    }
  }

  return result;
}

/**
 * Create a new theme, optionally extending an existing one
 */
export function createTheme(options: CreateThemeOptions): Theme {
  const baseTheme = options.extends ? getBaseTheme(options.extends) : githubDark;

  const theme: Theme = {
    name: options.name,
    type: options.type ?? baseTheme.type,
    colors: options.colors
      ? mergeColors(baseTheme.colors, options.colors)
      : baseTheme.colors,
    fonts: options.fonts ? { ...baseTheme.fonts, ...options.fonts } : baseTheme.fonts,
    spacing: options.spacing ? { ...baseTheme.spacing, ...options.spacing } : baseTheme.spacing,
    borders: options.borders ? { ...baseTheme.borders, ...options.borders } : baseTheme.borders,
  };

  return theme;
}

/**
 * Validate a theme object
 */
export function validateTheme(theme: unknown): theme is Theme {
  if (typeof theme !== 'object' || theme === null) {
    return false;
  }

  const t = theme as Record<string, unknown>;

  if (typeof t.name !== 'string') return false;
  if (t.type !== 'light' && t.type !== 'dark') return false;
  if (typeof t.colors !== 'object' || t.colors === null) return false;
  if (typeof t.fonts !== 'object' || t.fonts === null) return false;
  if (typeof t.spacing !== 'object' || t.spacing === null) return false;
  if (typeof t.borders !== 'object' || t.borders === null) return false;

  return true;
}

/**
 * Clone a theme with a new name
 */
export function cloneTheme(theme: Theme, newName: string): Theme {
  return {
    ...theme,
    name: newName,
    colors: { ...theme.colors, syntax: { ...theme.colors.syntax } },
    fonts: { ...theme.fonts },
    spacing: { ...theme.spacing },
    borders: { ...theme.borders },
  };
}

export default createTheme;
