/**
 * Themes tests
 */

import { describe, it, expect } from 'vitest';
import {
  createTheme,
  validateTheme,
  cloneTheme,
  generateCSSVars,
  cssVarsToString,
  generateStylesheet,
  githubDark,
  githubLight,
  vscodeDark,
  vscodeLight,
  monokai,
  getTheme,
  listThemes,
  defaultTheme,
} from '../../src/themes/index.js';

describe('preset themes', () => {
  it('should export githubDark theme', () => {
    expect(githubDark.name).toBe('github-dark');
    expect(githubDark.type).toBe('dark');
    expect(githubDark.colors).toBeDefined();
    expect(githubDark.fonts).toBeDefined();
    expect(githubDark.spacing).toBeDefined();
    expect(githubDark.borders).toBeDefined();
  });

  it('should export githubLight theme', () => {
    expect(githubLight.name).toBe('github-light');
    expect(githubLight.type).toBe('light');
  });

  it('should export vscodeDark theme', () => {
    expect(vscodeDark.name).toBe('vscode-dark');
    expect(vscodeDark.type).toBe('dark');
  });

  it('should export vscodeLight theme', () => {
    expect(vscodeLight.name).toBe('vscode-light');
    expect(vscodeLight.type).toBe('light');
  });

  it('should export monokai theme', () => {
    expect(monokai.name).toBe('monokai');
    expect(monokai.type).toBe('dark');
  });

  it('should have complete color definitions', () => {
    for (const theme of [githubDark, githubLight, vscodeDark, vscodeLight, monokai]) {
      expect(theme.colors.background).toBeDefined();
      expect(theme.colors.addedBackground).toBeDefined();
      expect(theme.colors.deletedBackground).toBeDefined();
      expect(theme.colors.syntax).toBeDefined();
      expect(theme.colors.syntax.keyword).toBeDefined();
    }
  });
});

describe('getTheme', () => {
  it('should return theme by name', () => {
    expect(getTheme('github-dark')).toBe(githubDark);
    expect(getTheme('github-light')).toBe(githubLight);
    expect(getTheme('vscode-dark')).toBe(vscodeDark);
  });

  it('should return undefined for unknown theme', () => {
    expect(getTheme('unknown-theme')).toBeUndefined();
  });
});

describe('listThemes', () => {
  it('should return all theme names', () => {
    const themes = listThemes();

    expect(themes).toContain('github-dark');
    expect(themes).toContain('github-light');
    expect(themes).toContain('vscode-dark');
    expect(themes).toContain('vscode-light');
    expect(themes).toContain('monokai');
  });
});

describe('defaultTheme', () => {
  it('should be github-dark', () => {
    expect(defaultTheme).toBe(githubDark);
  });
});

describe('createTheme', () => {
  it('should create theme with custom name', () => {
    const theme = createTheme({ name: 'custom' });

    expect(theme.name).toBe('custom');
  });

  it('should extend existing theme', () => {
    const theme = createTheme({
      name: 'custom-dark',
      extends: 'github-dark',
      colors: {
        background: '#000000',
      },
    });

    expect(theme.colors.background).toBe('#000000');
    expect(theme.colors.addedBackground).toBe(githubDark.colors.addedBackground);
  });

  it('should set type', () => {
    const theme = createTheme({
      name: 'custom-light',
      type: 'light',
    });

    expect(theme.type).toBe('light');
  });

  it('should override syntax colors', () => {
    const theme = createTheme({
      name: 'custom',
      colors: {
        syntax: {
          ...githubDark.colors.syntax,
          keyword: '#ff0000',
        },
      },
    });

    expect(theme.colors.syntax.keyword).toBe('#ff0000');
    expect(theme.colors.syntax.string).toBe(githubDark.colors.syntax.string);
  });

  it('should merge fonts', () => {
    const theme = createTheme({
      name: 'custom',
      fonts: {
        size: '16px',
      },
    });

    expect(theme.fonts.size).toBe('16px');
    expect(theme.fonts.family).toBe(githubDark.fonts.family);
  });
});

describe('validateTheme', () => {
  it('should return true for valid theme', () => {
    expect(validateTheme(githubDark)).toBe(true);
  });

  it('should return false for invalid theme', () => {
    expect(validateTheme(null)).toBe(false);
    expect(validateTheme(undefined)).toBe(false);
    expect(validateTheme({})).toBe(false);
    expect(validateTheme({ name: 'test' })).toBe(false);
  });

  it('should validate type field', () => {
    expect(
      validateTheme({
        name: 'test',
        type: 'invalid',
        colors: {},
        fonts: {},
        spacing: {},
        borders: {},
      })
    ).toBe(false);
  });
});

describe('cloneTheme', () => {
  it('should create deep copy with new name', () => {
    const clone = cloneTheme(githubDark, 'cloned-theme');

    expect(clone.name).toBe('cloned-theme');
    expect(clone.colors).not.toBe(githubDark.colors);
    expect(clone.colors.background).toBe(githubDark.colors.background);
  });

  it('should not affect original when modifying clone', () => {
    const clone = cloneTheme(githubDark, 'test');
    clone.colors.background = '#000000';

    expect(githubDark.colors.background).not.toBe('#000000');
  });
});

describe('generateCSSVars', () => {
  it('should generate CSS variable map', () => {
    const vars = generateCSSVars(githubDark);

    expect(vars['--diffkit-bg']).toBe(githubDark.colors.background);
    expect(vars['--diffkit-added-bg']).toBe(githubDark.colors.addedBackground);
    expect(vars['--diffkit-deleted-bg']).toBe(githubDark.colors.deletedBackground);
  });

  it('should include all color variables', () => {
    const vars = generateCSSVars(githubDark);

    expect(vars['--diffkit-syntax-keyword']).toBeDefined();
    expect(vars['--diffkit-syntax-string']).toBeDefined();
    expect(vars['--diffkit-syntax-comment']).toBeDefined();
  });

  it('should include font variables', () => {
    const vars = generateCSSVars(githubDark);

    expect(vars['--diffkit-font-family']).toBe(githubDark.fonts.family);
    expect(vars['--diffkit-font-size']).toBe(githubDark.fonts.size);
  });

  it('should include spacing variables', () => {
    const vars = generateCSSVars(githubDark);

    expect(vars['--diffkit-gutter-width']).toBe(githubDark.spacing.gutterWidth);
    expect(vars['--diffkit-content-padding']).toBe(githubDark.spacing.contentPadding);
  });
});

describe('cssVarsToString', () => {
  it('should convert vars to style string', () => {
    const vars = { '--color': 'red', '--size': '10px' };
    const result = cssVarsToString(vars);

    expect(result).toBe('--color: red; --size: 10px');
  });
});

describe('generateStylesheet', () => {
  it('should generate complete stylesheet', () => {
    const css = generateStylesheet(githubDark);

    expect(css).toContain('.diffkit-theme-github-dark');
    expect(css).toContain('.diffkit-diff');
    expect(css).toContain('.diffkit-hunk');
    expect(css).toContain('.diffkit-add');
    expect(css).toContain('.diffkit-delete');
    expect(css).toContain('--diffkit-bg');
  });

  it('should include syntax highlighting classes', () => {
    const css = generateStylesheet(githubDark);

    expect(css).toContain('.diffkit-syntax-keyword');
    expect(css).toContain('.diffkit-syntax-string');
    expect(css).toContain('.diffkit-syntax-comment');
  });
});
