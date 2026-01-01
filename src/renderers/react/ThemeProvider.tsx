/**
 * Theme Provider component
 */

import type { CSSProperties } from 'react';
import { useState, useCallback, useMemo } from 'react';
import type { Theme } from '../../core/types.js';
import type { ThemeProviderProps } from './types.js';
import { ThemeContext, useThemeValue } from './hooks/useTheme.js';

/**
 * Theme Provider component
 * Provides theme context to child components
 */
export function ThemeProvider({ theme: initialTheme, children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme | string>(initialTheme);

  const setTheme = useCallback((newTheme: Theme | string) => {
    setThemeState(newTheme);
  }, []);

  const contextValue = useThemeValue(theme, setTheme);

  const style = useMemo(() => {
    const cssVars = contextValue.cssVars;
    return Object.entries(cssVars).reduce(
      (acc, [key, value]) => {
        acc[key as keyof CSSProperties] = value;
        return acc;
      },
      {} as Record<string, string>
    );
  }, [contextValue.cssVars]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <div className={`diffkit-theme-${contextValue.theme.name}`} style={style}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
