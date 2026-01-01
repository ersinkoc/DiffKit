/**
 * Theme type definitions for DiffKit
 */

import type {
  Theme,
  ThemeColors,
  ThemeFonts,
  ThemeSpacing,
  ThemeBorders,
  SyntaxColors,
  CreateThemeOptions,
} from '../core/types.js';

export type {
  Theme,
  ThemeColors,
  ThemeFonts,
  ThemeSpacing,
  ThemeBorders,
  SyntaxColors,
  CreateThemeOptions,
};

/**
 * CSS variable map type
 */
export type CSSVariableMap = Record<string, string>;

/**
 * Theme registry for built-in themes
 */
export interface ThemeRegistry {
  get(name: string): Theme | undefined;
  register(theme: Theme): void;
  list(): string[];
}

/**
 * Partial theme for extending
 */
export interface PartialTheme {
  name?: string;
  type?: 'light' | 'dark';
  colors?: DeepPartial<ThemeColors>;
  fonts?: Partial<ThemeFonts>;
  spacing?: Partial<ThemeSpacing>;
  borders?: Partial<ThemeBorders>;
}

/**
 * Deep partial type helper
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
