/**
 * CSS variables generator for DiffKit themes
 */

import type { Theme, CSSVariableMap } from './types.js';

/**
 * Generate CSS variables from a theme
 */
export function generateCSSVars(theme: Theme): CSSVariableMap {
  const vars: CSSVariableMap = {};

  // Colors
  vars['--diffkit-bg'] = theme.colors.background;
  vars['--diffkit-gutter-bg'] = theme.colors.gutterBackground;
  vars['--diffkit-header-bg'] = theme.colors.headerBackground;

  vars['--diffkit-added-bg'] = theme.colors.addedBackground;
  vars['--diffkit-added-gutter-bg'] = theme.colors.addedGutterBackground;
  vars['--diffkit-added-text'] = theme.colors.addedText;
  vars['--diffkit-added-highlight'] = theme.colors.addedHighlight;

  vars['--diffkit-deleted-bg'] = theme.colors.deletedBackground;
  vars['--diffkit-deleted-gutter-bg'] = theme.colors.deletedGutterBackground;
  vars['--diffkit-deleted-text'] = theme.colors.deletedText;
  vars['--diffkit-deleted-highlight'] = theme.colors.deletedHighlight;

  vars['--diffkit-modified-bg'] = theme.colors.modifiedBackground;
  vars['--diffkit-modified-text'] = theme.colors.modifiedText;

  vars['--diffkit-unchanged-text'] = theme.colors.unchangedText;
  vars['--diffkit-line-number'] = theme.colors.lineNumber;
  vars['--diffkit-line-number-active'] = theme.colors.lineNumberActive;

  vars['--diffkit-border'] = theme.colors.border;
  vars['--diffkit-hunk-border'] = theme.colors.hunkBorder;

  // Syntax colors
  vars['--diffkit-syntax-keyword'] = theme.colors.syntax.keyword;
  vars['--diffkit-syntax-string'] = theme.colors.syntax.string;
  vars['--diffkit-syntax-number'] = theme.colors.syntax.number;
  vars['--diffkit-syntax-comment'] = theme.colors.syntax.comment;
  vars['--diffkit-syntax-function'] = theme.colors.syntax.function;
  vars['--diffkit-syntax-variable'] = theme.colors.syntax.variable;
  vars['--diffkit-syntax-operator'] = theme.colors.syntax.operator;
  vars['--diffkit-syntax-punctuation'] = theme.colors.syntax.punctuation;
  vars['--diffkit-syntax-tag'] = theme.colors.syntax.tag;
  vars['--diffkit-syntax-attribute'] = theme.colors.syntax.attribute;
  vars['--diffkit-syntax-property'] = theme.colors.syntax.property;
  vars['--diffkit-syntax-classname'] = theme.colors.syntax.className;
  vars['--diffkit-syntax-regexp'] = theme.colors.syntax.regexp;

  // Fonts
  vars['--diffkit-font-family'] = theme.fonts.family;
  vars['--diffkit-font-size'] = theme.fonts.size;
  vars['--diffkit-line-height'] = String(theme.fonts.lineHeight);

  // Spacing
  vars['--diffkit-gutter-width'] = theme.spacing.gutterWidth;
  vars['--diffkit-line-number-padding'] = theme.spacing.lineNumberPadding;
  vars['--diffkit-content-padding'] = theme.spacing.contentPadding;
  vars['--diffkit-hunk-gap'] = theme.spacing.hunkGap;

  // Borders
  vars['--diffkit-border-radius'] = theme.borders.radius;
  vars['--diffkit-border-width'] = theme.borders.width;

  return vars;
}

/**
 * Convert CSS variables map to inline style string
 */
export function cssVarsToString(vars: CSSVariableMap): string {
  return Object.entries(vars)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ');
}

/**
 * Apply CSS variables to an element
 */
export function applyCSSVars(element: HTMLElement, vars: CSSVariableMap): void {
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
}

/**
 * Generate a complete CSS stylesheet for a theme
 */
export function generateStylesheet(theme: Theme): string {
  const vars = generateCSSVars(theme);
  const cssVarDeclarations = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');

  return `
.diffkit-theme-${theme.name} {
${cssVarDeclarations}
}

.diffkit-diff {
  font-family: var(--diffkit-font-family);
  font-size: var(--diffkit-font-size);
  line-height: var(--diffkit-line-height);
  background: var(--diffkit-bg);
  color: var(--diffkit-unchanged-text);
  border: var(--diffkit-border-width) solid var(--diffkit-border);
  border-radius: var(--diffkit-border-radius);
  overflow: hidden;
}

.diffkit-hunk {
  border-bottom: var(--diffkit-border-width) solid var(--diffkit-hunk-border);
}

.diffkit-hunk:last-child {
  border-bottom: none;
}

.diffkit-hunk-header {
  background: var(--diffkit-header-bg);
  padding: var(--diffkit-content-padding);
  color: var(--diffkit-line-number);
  font-style: italic;
}

.diffkit-line {
  display: flex;
  min-height: calc(var(--diffkit-line-height) * var(--diffkit-font-size));
}

.diffkit-gutter {
  background: var(--diffkit-gutter-bg);
  width: var(--diffkit-gutter-width);
  padding: 0 var(--diffkit-line-number-padding);
  text-align: right;
  color: var(--diffkit-line-number);
  user-select: none;
  flex-shrink: 0;
}

.diffkit-content {
  padding: 0 var(--diffkit-content-padding);
  flex: 1;
  overflow-x: auto;
  white-space: pre;
}

.diffkit-add {
  background: var(--diffkit-added-bg);
}

.diffkit-add .diffkit-gutter {
  background: var(--diffkit-added-gutter-bg);
}

.diffkit-add .diffkit-content {
  color: var(--diffkit-added-text);
}

.diffkit-delete {
  background: var(--diffkit-deleted-bg);
}

.diffkit-delete .diffkit-gutter {
  background: var(--diffkit-deleted-gutter-bg);
}

.diffkit-delete .diffkit-content {
  color: var(--diffkit-deleted-text);
}

.diffkit-normal {
  background: var(--diffkit-bg);
}

.diffkit-highlight-add {
  background: var(--diffkit-added-highlight);
}

.diffkit-highlight-delete {
  background: var(--diffkit-deleted-highlight);
}

/* Syntax highlighting */
.diffkit-syntax-keyword { color: var(--diffkit-syntax-keyword); }
.diffkit-syntax-string { color: var(--diffkit-syntax-string); }
.diffkit-syntax-number { color: var(--diffkit-syntax-number); }
.diffkit-syntax-comment { color: var(--diffkit-syntax-comment); font-style: italic; }
.diffkit-syntax-function { color: var(--diffkit-syntax-function); }
.diffkit-syntax-variable { color: var(--diffkit-syntax-variable); }
.diffkit-syntax-operator { color: var(--diffkit-syntax-operator); }
.diffkit-syntax-punctuation { color: var(--diffkit-syntax-punctuation); }
.diffkit-syntax-tag { color: var(--diffkit-syntax-tag); }
.diffkit-syntax-attribute { color: var(--diffkit-syntax-attribute); }
.diffkit-syntax-property { color: var(--diffkit-syntax-property); }
.diffkit-syntax-classname { color: var(--diffkit-syntax-classname); }
.diffkit-syntax-regexp { color: var(--diffkit-syntax-regexp); }
`.trim();
}

export default generateCSSVars;
