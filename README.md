# @oxog/diffkit

Universal diff toolkit with zero dependencies - compare anything, customize everything.

[![npm version](https://badge.fury.io/js/%40oxog%2Fdiffkit.svg)](https://www.npmjs.com/package/@oxog/diffkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

## Features

- **Zero Runtime Dependencies** - Lightweight and self-contained
- **Multiple Diff Algorithms** - Myers (default), Patience, and Histogram
- **Multiple View Modes** - Unified, Split, and Inline
- **Syntax Highlighting** - Built-in support for JavaScript, TypeScript, Python, CSS, HTML, JSON, and Markdown
- **Theming System** - Pre-built themes (GitHub Dark/Light, VSCode Dark/Light, Monokai) with CSS variables
- **Plugin Architecture** - Extensible with syntax, HTML DOM, HTML text, and Markdown plugins
- **React Components** - Ready-to-use React components with hooks
- **Full TypeScript Support** - Complete type definitions included

## Installation

```bash
npm install @oxog/diffkit
```

## Quick Start

### Basic Usage

```typescript
import { createDiff } from '@oxog/diffkit';

const diff = createDiff(
  'Hello World',
  'Hello DiffKit'
);

console.log(diff.stats);
// { additions: 1, deletions: 1, changes: 2, similarity: 0.5 }

// Get unified diff string
console.log(diff.toUnifiedString());

// Get HTML output
console.log(diff.toHTML());
```

### Using DiffEngine

```typescript
import { DiffEngine, syntaxPlugin } from '@oxog/diffkit';

const engine = new DiffEngine({
  algorithm: 'patience',
  granularity: 'line',
  context: 3,
});

// Add syntax highlighting plugin
engine.use(syntaxPlugin({ language: 'javascript' }));

const result = engine.diff(oldCode, newCode);
```

### React Components

```tsx
import { DiffView, ThemeProvider } from '@oxog/diffkit/react';

function App() {
  return (
    <ThemeProvider theme="github-dark">
      <DiffView
        old={oldContent}
        new={newContent}
        mode="split"
        lineNumbers
      />
    </ThemeProvider>
  );
}
```

## Algorithms

### Myers (Default)
The classic O(ND) diff algorithm. Best for general-purpose text diffing.

```typescript
createDiff(old, new, { algorithm: 'myers' });
```

### Patience
Uses unique lines as anchors for better readability. Ideal for code diffs.

```typescript
createDiff(old, new, { algorithm: 'patience' });
```

### Histogram
Optimized for large files with many repeated lines.

```typescript
createDiff(old, new, { algorithm: 'histogram' });
```

## View Modes

### Unified View
Single column with +/- prefixes.

```typescript
const html = diff.toHTML({ mode: 'unified' });
```

### Split View
Two columns side-by-side.

```typescript
import { HTMLRenderer } from '@oxog/diffkit';

const renderer = new HTMLRenderer({ mode: 'split' });
const html = renderer.render(diff);
```

### Inline View
Changes highlighted inline within the text.

```typescript
const renderer = new HTMLRenderer({ mode: 'inline' });
const html = renderer.render(diff);
```

## Plugins

### Syntax Plugin
Adds syntax highlighting for supported languages.

```typescript
import { syntaxPlugin } from '@oxog/diffkit';

engine.use(syntaxPlugin({
  language: 'typescript',
  highlightChanges: true,
}));
```

Supported languages: `javascript`, `typescript`, `python`, `css`, `html`, `json`, `markdown`

### HTML DOM Plugin
Structure-aware HTML diffing.

```typescript
import { htmlDomPlugin } from '@oxog/diffkit';

engine.use(htmlDomPlugin({
  ignoreComments: true,
  normalizeWhitespace: true,
}));
```

### HTML Text Plugin
Text-based HTML diffing with tag stripping.

```typescript
import { htmlTextPlugin } from '@oxog/diffkit';

engine.use(htmlTextPlugin({
  stripTags: true,
  decodeEntities: true,
}));
```

### Markdown Plugin
Markdown-aware diffing.

```typescript
import { markdownPlugin } from '@oxog/diffkit';

engine.use(markdownPlugin({
  preserveStructure: true,
}));
```

## Theming

### Built-in Themes
- `github-dark` (default)
- `github-light`
- `vscode-dark`
- `vscode-light`
- `monokai`

### Using Themes

```typescript
import { HTMLRenderer, getTheme } from '@oxog/diffkit';

const renderer = new HTMLRenderer({
  theme: 'github-dark',
});
```

### Creating Custom Themes

```typescript
import { createTheme } from '@oxog/diffkit';

const customTheme = createTheme({
  name: 'my-theme',
  extends: 'github-dark',
  colors: {
    background: '#1a1a1a',
    addedBackground: '#1a3d1a',
    deletedBackground: '#3d1a1a',
  },
});
```

### CSS Variables

```typescript
import { generateCSSVars, cssVarsToString } from '@oxog/diffkit';

const vars = generateCSSVars(theme);
const styleString = cssVarsToString(vars);
```

## API Reference

### createDiff(old, new, options?)

Creates a diff result between two strings.

**Options:**
- `algorithm`: `'myers'` | `'patience'` | `'histogram'` (default: `'myers'`)
- `granularity`: `'line'` | `'word'` | `'char'` (default: `'line'`)
- `context`: number (default: 3)
- `ignoreCase`: boolean (default: false)
- `ignoreWhitespace`: boolean (default: false)

**Returns:** `DiffResult` with methods:
- `toJSON()` - Get serializable object
- `toUnifiedString()` - Get unified diff string
- `toHTML(options?)` - Get HTML output

### DiffEngine

```typescript
const engine = new DiffEngine(options);
engine.use(plugin);
engine.setAlgorithm('patience');
engine.setGranularity('word');
engine.setTheme('github-dark');
const result = engine.diff(old, new);
```

### HTMLRenderer

```typescript
const renderer = new HTMLRenderer({
  mode: 'unified' | 'split' | 'inline',
  theme: string | Theme,
  lineNumbers: boolean,
  wrapLines: boolean,
});

const html = renderer.render(result);
const htmlWithWordDiff = renderer.renderWithWordDiff(result);
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## License

MIT - see [LICENSE](./LICENSE)

## Author

Ersin Koc

## Links

- [Website](https://diffkit.oxog.dev)
- [GitHub](https://github.com/ersinkoc/diffkit)
- [NPM](https://www.npmjs.com/package/@oxog/diffkit)
