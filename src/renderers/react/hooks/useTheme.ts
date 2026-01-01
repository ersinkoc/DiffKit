/**
 * useTheme hook for accessing theme context
 */

import { useContext, createContext, useMemo } from 'react';
import type { Theme } from '../../../core/types.js';
import type { ThemeContextValue, UseThemeResult } from '../types.js';
import { defaultTheme, getTheme, generateCSSVars } from '../../../themes/index.js';

/**
 * Theme context
 */
export const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  setTheme: () => {},
  cssVars: generateCSSVars(defaultTheme),
});

/**
 * Hook to access theme context
 */
export function useTheme(): UseThemeResult {
  const context = useContext(ThemeContext);
  return context;
}

/**
 * Hook to create theme value (for ThemeProvider)
 */
export function useThemeValue(
  theme: Theme | string,
  setTheme: (theme: Theme | string) => void
): ThemeContextValue {
  const resolvedTheme = useMemo(() => {
    if (typeof theme === 'string') {
      return getTheme(theme) ?? defaultTheme;
    }
    return theme;
  }, [theme]);

  const cssVars = useMemo(() => {
    return generateCSSVars(resolvedTheme);
  }, [resolvedTheme]);

  return {
    theme: resolvedTheme,
    setTheme,
    cssVars,
  };
}

/**
 * Hook to generate CSS variables for a theme
 */
export function useThemeCSSVars(theme: Theme | string): Record<string, string> {
  return useMemo(() => {
    const resolvedTheme = typeof theme === 'string' ? getTheme(theme) ?? defaultTheme : theme;
    return generateCSSVars(resolvedTheme);
  }, [theme]);
}

export default useTheme;
