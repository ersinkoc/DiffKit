# Claude Code Prompt: @oxog/diffkit

## Package Metadata

| Field | Value |
|-------|-------|
| **Package Name** | `@oxog/diffkit` |
| **GitHub Repo** | `ersinkoc/diffkit` |
| **Domain** | `diffkit.oxog.dev` |
| **Description** | Universal diff toolkit with zero dependencies — compare anything, customize everything |
| **Author** | Ersin Koc |
| **License** | MIT |
| **Node.js** | >=18.0.0 |
| **Module Format** | ESM + CJS (dual package) |

---

## Non-Negotiable Rules

These rules are ABSOLUTE. No exceptions. No compromises.

### Dependencies
- **ZERO runtime dependencies** — everything is built from scratch
- **Dev dependencies allowed**: TypeScript, Vitest, ESLint, Prettier, Vite, React (for website only)
- The `dependencies` field in package.json must be empty `{}`

### Quality Gates
- **100% test coverage** — every single line must be tested
- **100% test success** — all tests must pass before any commit
- **TypeScript strict mode** — enabled in tsconfig.json
- **No `any` types** — use `unknown` and type guards instead
- **No `@ts-ignore`** — fix the types properly

### Build Requirements
- Dual package (ESM + CJS) output
- Full TypeScript declarations (.d.ts)
- Source maps for debugging
- Tree-shakeable exports

### Documentation & Links
- **No social media links** — no Twitter, Discord, email
- **Only GitHub repo URL** — `https://github.com/ersinkoc/diffkit`
- **Website domain** — `diffkit.oxog.dev` (CNAME in website public folder)

---

## Project Structure

```
diffkit/
├── src/
│   ├── core/
│   │   ├── algorithms/
│   │   │   ├── myers.ts              # Myers diff algorithm (default)
│   │   │   ├── patience.ts           # Patience diff algorithm
│   │   │   ├── histogram.ts          # Histogram diff algorithm
│   │   │   ├── lcs.ts                # Longest Common Subsequence utility
│   │   │   └── index.ts              # Algorithm exports
│   │   ├── diff-engine.ts            # Main DiffEngine class
│   │   ├── parser.ts                 # Text → Lines → Tokens parser
│   │   ├── hunk.ts                   # Hunk generation and formatting
│   │   ├── stats.ts                  # Diff statistics calculator
│   │   └── types.ts                  # Core type definitions
│   │
│   ├── plugins/
│   │   ├── types.ts                  # Plugin interface definitions
│   │   ├── registry.ts               # Plugin registration system
│   │   ├── syntax/
│   │   │   ├── index.ts              # Syntax highlighting plugin
│   │   │   ├── tokenizer.ts          # Language-agnostic tokenizer
│   │   │   └── languages/
│   │   │       ├── javascript.ts
│   │   │       ├── typescript.ts
│   │   │       ├── python.ts
│   │   │       ├── css.ts
│   │   │       ├── html.ts
│   │   │       ├── json.ts
│   │   │       ├── markdown.ts
│   │   │       └── index.ts
│   │   ├── html-dom/
│   │   │   ├── index.ts              # DOM-aware HTML diff plugin
│   │   │   ├── dom-parser.ts         # HTML → DOM tree parser
│   │   │   └── dom-differ.ts         # Tree diffing logic
│   │   ├── html-text/
│   │   │   └── index.ts              # Text-based HTML diff plugin
│   │   └── markdown/
│   │       ├── index.ts              # Markdown-aware diff plugin
│   │       └── md-parser.ts          # Markdown structure parser
│   │
│   ├── renderers/
│   │   ├── types.ts                  # Renderer interface definitions
│   │   ├── html/
│   │   │   ├── index.ts              # Vanilla HTML renderer
│   │   │   ├── unified.ts            # Unified view HTML
│   │   │   ├── split.ts              # Split view HTML
│   │   │   ├── inline.ts             # Inline view HTML
│   │   │   └── utils.ts              # HTML utilities (escape, etc.)
│   │   └── react/
│   │       ├── index.ts              # React exports
│   │       ├── DiffView.tsx          # Main component (auto-selects view)
│   │       ├── UnifiedView.tsx       # Unified diff component
│   │       ├── SplitView.tsx         # Side-by-side component
│   │       ├── InlineView.tsx        # Inline diff component
│   │       ├── LineNumber.tsx        # Line number gutter
│   │       ├── DiffLine.tsx          # Single diff line
│   │       ├── DiffHunk.tsx          # Hunk container
│   │       ├── ThemeProvider.tsx     # Theme context provider
│   │       ├── hooks/
│   │       │   ├── useDiff.ts        # Diff computation hook
│   │       │   ├── useTheme.ts       # Theme access hook
│   │       │   └── index.ts
│   │       └── types.ts              # React-specific types
│   │
│   ├── themes/
│   │   ├── types.ts                  # Theme type definitions
│   │   ├── create-theme.ts           # Theme factory function
│   │   ├── css-vars.ts               # CSS variables generator
│   │   ├── presets/
│   │   │   ├── github-light.ts
│   │   │   ├── github-dark.ts
│   │   │   ├── vscode-dark.ts
│   │   │   ├── vscode-light.ts
│   │   │   ├── monokai.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── hash.ts                   # Fast string hashing
│   │   ├── escape.ts                 # HTML/string escaping
│   │   ├── merge.ts                  # Deep merge utility
│   │   └── index.ts
│   │
│   └── index.ts                      # Main entry point
│
├── tests/
│   ├── core/
│   │   ├── algorithms/
│   │   │   ├── myers.test.ts
│   │   │   ├── patience.test.ts
│   │   │   ├── histogram.test.ts
│   │   │   └── lcs.test.ts
│   │   ├── diff-engine.test.ts
│   │   ├── parser.test.ts
│   │   ├── hunk.test.ts
│   │   └── stats.test.ts
│   ├── plugins/
│   │   ├── syntax.test.ts
│   │   ├── html-dom.test.ts
│   │   ├── html-text.test.ts
│   │   └── markdown.test.ts
│   ├── renderers/
│   │   ├── html.test.ts
│   │   └── react.test.ts
│   ├── themes/
│   │   └── themes.test.ts
│   ├── integration/
│   │   ├── full-flow.test.ts
│   │   ├── large-files.test.ts
│   │   └── edge-cases.test.ts
│   └── fixtures/
│       ├── sample-code.ts
│       ├── sample-html.ts
│       └── sample-markdown.ts
│
├── website/                          # Documentation website
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── CodeBlock.tsx         # IDE-style code blocks
│   │   │   ├── LiveDemo.tsx          # Interactive diff demo
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── CopyButton.tsx
│   │   │   └── ApiReference.tsx
│   │   ├── pages/
│   │   │   ├── index.tsx             # Landing page
│   │   │   ├── docs/
│   │   │   │   ├── getting-started.tsx
│   │   │   │   ├── core-concepts.tsx
│   │   │   │   ├── algorithms.tsx
│   │   │   │   ├── plugins.tsx
│   │   │   │   ├── theming.tsx
│   │   │   │   ├── react-components.tsx
│   │   │   │   └── api-reference.tsx
│   │   │   └── examples/
│   │   │       ├── basic-diff.tsx
│   │   │       ├── code-review.tsx
│   │   │       ├── html-diff.tsx
│   │   │       └── custom-theme.tsx
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   ├── CNAME                     # Contains: diffkit.oxog.dev
│   │   └── favicon.svg
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                             # GitHub Pages output (generated)
├── dist/                             # Package build output
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
├── eslint.config.js
├── .prettierrc
├── .gitignore
├── LICENSE
├── README.md
└── CHANGELOG.md
```

---

## Feature Specifications

### 1. Core Diff Engine

#### 1.1 Algorithms

**Myers Algorithm** (Default)
- Classic O(ND) diff algorithm
- Best for general-purpose diffing
- Produces minimal edit distance

**Patience Algorithm**
- Better for code with moved blocks
- Identifies unique lines as anchors
- Produces more readable diffs

**Histogram Algorithm**
- Optimized for large files
- Uses occurrence counting
- Fastest for files with many repeated lines

```typescript
// Algorithm interface
interface DiffAlgorithm {
  name: string;
  diff(oldLines: string[], newLines: string[]): DiffOperation[];
}

interface DiffOperation {
  type: 'equal' | 'insert' | 'delete';
  oldStart: number;
  oldEnd: number;
  newStart: number;
  newEnd: number;
  lines: string[];
}
```

#### 1.2 Parser

```typescript
interface ParserOptions {
  granularity: 'line' | 'word' | 'char';
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  trimLines?: boolean;
}

interface ParsedContent {
  tokens: Token[];
  lineMap: Map<number, Token[]>;
}

interface Token {
  value: string;
  line: number;
  column: number;
  type?: string; // For syntax highlighting
}
```

#### 1.3 Diff Engine API

```typescript
// Main factory function
function createDiff(
  oldContent: string,
  newContent: string,
  options?: DiffOptions
): DiffResult;

interface DiffOptions {
  algorithm?: 'myers' | 'patience' | 'histogram';
  granularity?: 'line' | 'word' | 'char';
  context?: number; // Lines of context around changes
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
}

interface DiffResult {
  hunks: Hunk[];
  stats: DiffStats;
  oldContent: string;
  newContent: string;
  options: DiffOptions;
  
  // Methods
  toJSON(): DiffJSON;
  toUnifiedString(): string;
  toHTML(renderer?: HTMLRenderer): string;
}

interface Hunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  changes: Change[];
  header: string; // @@ -1,3 +1,4 @@
}

interface Change {
  type: 'add' | 'delete' | 'normal';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
  tokens?: Token[]; // If syntax highlighting applied
}

interface DiffStats {
  additions: number;
  deletions: number;
  changes: number;
  oldLineCount: number;
  newLineCount: number;
}
```

#### 1.4 Class-based API

```typescript
class DiffEngine {
  constructor(options?: DiffEngineOptions);
  
  // Plugin system
  use(plugin: DiffPlugin): this;
  
  // Core methods
  diff(oldContent: string, newContent: string): DiffResult;
  
  // Configuration
  setAlgorithm(algorithm: AlgorithmType): this;
  setGranularity(granularity: GranularityType): this;
  setTheme(theme: Theme | string): this;
  
  // Getters
  getPlugins(): DiffPlugin[];
  getTheme(): Theme;
}

interface DiffEngineOptions {
  algorithm?: AlgorithmType;
  granularity?: GranularityType;
  context?: number;
  theme?: Theme | string;
  plugins?: DiffPlugin[];
}
```

### 2. Plugin System

#### 2.1 Plugin Interface

```typescript
interface DiffPlugin {
  name: string;
  version: string;
  
  // Lifecycle hooks
  onInit?(engine: DiffEngine): void;
  onBeforeDiff?(content: string): string;
  onAfterDiff?(result: DiffResult): DiffResult;
  onBeforeRender?(hunks: Hunk[]): Hunk[];
  onAfterRender?(output: string): string;
  
  // Optional extensions
  tokenize?(content: string, language?: string): Token[];
  parse?(content: string): ParsedContent;
}
```

#### 2.2 Built-in Plugins

**Syntax Highlighting Plugin**
```typescript
import { syntaxPlugin } from '@oxog/diffkit/plugins/syntax';

const engine = new DiffEngine();
engine.use(syntaxPlugin({
  language: 'typescript', // or 'auto' for detection
  theme: 'github-dark'
}));
```

Supported languages (built-in tokenizers):
- JavaScript / TypeScript
- Python
- HTML / CSS
- JSON
- Markdown
- SQL
- Bash/Shell
- YAML

**HTML DOM Plugin**
```typescript
import { htmlDomPlugin } from '@oxog/diffkit/plugins/html-dom';

engine.use(htmlDomPlugin({
  ignoreAttributes: ['id', 'class'], // Optional
  ignoreComments: true,
  preserveWhitespace: false
}));

// Produces semantic diffs:
// - Tag additions/removals
// - Attribute changes
// - Text content changes
```

**HTML Text Plugin**
```typescript
import { htmlTextPlugin } from '@oxog/diffkit/plugins/html-text';

engine.use(htmlTextPlugin({
  stripTags: false,
  decodeEntities: true
}));
```

**Markdown Plugin**
```typescript
import { markdownPlugin } from '@oxog/diffkit/plugins/markdown';

engine.use(markdownPlugin({
  preserveStructure: true, // Diff by blocks
  ignoreFormatting: false
}));
```

#### 2.3 Custom Plugin Example

```typescript
const myPlugin: DiffPlugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',
  
  onBeforeDiff(content) {
    // Pre-process content
    return content.trim();
  },
  
  onAfterDiff(result) {
    // Post-process result
    result.stats.custom = calculateCustomMetric(result);
    return result;
  }
};

engine.use(myPlugin);
```

### 3. Renderers

#### 3.1 HTML Renderer

```typescript
import { HTMLRenderer } from '@oxog/diffkit/renderers/html';

const renderer = new HTMLRenderer({
  mode: 'unified' | 'split' | 'inline',
  theme: 'github-dark',
  lineNumbers: true,
  wrapLines: true,
  highlightSyntax: true
});

const html = renderer.render(diffResult);

// Or use shorthand
const html = diffResult.toHTML({ mode: 'split' });
```

**Unified View**: Single column, - and + prefixes
**Split View**: Two columns side-by-side
**Inline View**: Changes highlighted inline within text

#### 3.2 React Components

```tsx
import { 
  DiffView, 
  SplitView, 
  UnifiedView, 
  InlineView,
  ThemeProvider 
} from '@oxog/diffkit/react';

// Auto-selecting component
<DiffView
  old={oldCode}
  new={newCode}
  language="typescript"
  mode="split"
  theme="github-dark"
  lineNumbers={true}
  wrapLines={false}
  highlightChanges={true}
  onLineClick={(lineNumber, side) => {}}
  onHunkClick={(hunk) => {}}
  className="my-diff"
  style={{ maxHeight: '500px' }}
/>

// Specific views
<SplitView old={old} new={new} {...props} />
<UnifiedView old={old} new={new} {...props} />
<InlineView old={old} new={new} {...props} />

// With theme provider
<ThemeProvider theme={customTheme}>
  <DiffView old={old} new={new} />
</ThemeProvider>
```

**Props Interface**
```typescript
interface DiffViewProps {
  // Required
  old: string;
  new: string;
  
  // Display options
  mode?: 'unified' | 'split' | 'inline';
  language?: string;
  lineNumbers?: boolean;
  wrapLines?: boolean;
  highlightChanges?: boolean;
  showHeader?: boolean;
  
  // Diff options
  algorithm?: 'myers' | 'patience' | 'histogram';
  granularity?: 'line' | 'word' | 'char';
  context?: number;
  
  // Theming
  theme?: Theme | string;
  
  // Events
  onLineClick?: (line: number, side: 'old' | 'new') => void;
  onHunkClick?: (hunk: Hunk) => void;
  onCopy?: (content: string) => void;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
}
```

**Hooks**
```typescript
import { useDiff, useTheme } from '@oxog/diffkit/react';

// Compute diff
const { result, loading, error } = useDiff(oldContent, newContent, options);

// Access theme
const { theme, setTheme, cssVars } = useTheme();
```

### 4. Theming System

#### 4.1 Theme Structure

```typescript
interface Theme {
  name: string;
  type: 'light' | 'dark';
  
  colors: {
    // Backgrounds
    background: string;
    gutterBackground: string;
    headerBackground: string;
    
    // Line colors
    addedBackground: string;
    addedGutterBackground: string;
    addedText: string;
    addedHighlight: string; // Word-level highlight
    
    deletedBackground: string;
    deletedGutterBackground: string;
    deletedText: string;
    deletedHighlight: string;
    
    modifiedBackground: string;
    modifiedText: string;
    
    unchangedText: string;
    lineNumber: string;
    lineNumberActive: string;
    
    // Borders
    border: string;
    hunkBorder: string;
    
    // Syntax colors
    syntax: {
      keyword: string;
      string: string;
      number: string;
      comment: string;
      function: string;
      variable: string;
      operator: string;
      punctuation: string;
      tag: string;
      attribute: string;
      property: string;
      className: string;
      regexp: string;
    };
  };
  
  fonts: {
    family: string;
    size: string;
    lineHeight: string | number;
  };
  
  spacing: {
    gutterWidth: string;
    lineNumberPadding: string;
    contentPadding: string;
    hunkGap: string;
  };
  
  borders: {
    radius: string;
    width: string;
  };
}
```

#### 4.2 Built-in Themes

```typescript
import { 
  githubLight, 
  githubDark, 
  vscodeDark, 
  vscodeLight,
  monokai 
} from '@oxog/diffkit/themes';

// Use by name
const engine = new DiffEngine({ theme: 'github-dark' });

// Use by object
const engine = new DiffEngine({ theme: githubDark });
```

#### 4.3 Custom Themes

```typescript
import { createTheme } from '@oxog/diffkit/themes';

// Extend existing theme
const myTheme = createTheme({
  name: 'my-theme',
  extends: 'github-dark',
  colors: {
    addedBackground: '#1a472a',
    deletedBackground: '#5c1a1a'
  }
});

// Create from scratch
const fullCustomTheme = createTheme({
  name: 'brand-theme',
  type: 'dark',
  colors: {
    background: '#1a1a2e',
    // ... all color properties
  },
  fonts: {
    family: 'Fira Code, monospace',
    size: '14px',
    lineHeight: 1.5
  }
});
```

#### 4.4 CSS Variables

```typescript
import { generateCSSVars } from '@oxog/diffkit/themes';

// Generate CSS variables from theme
const cssVars = generateCSSVars(githubDark);
// Returns: { '--diffkit-background': '#0d1117', ... }

// Apply to element
element.style.cssText = Object.entries(cssVars)
  .map(([k, v]) => `${k}: ${v}`)
  .join(';');
```

CSS Variable naming convention:
```css
--diffkit-bg
--diffkit-gutter-bg
--diffkit-added-bg
--diffkit-added-text
--diffkit-deleted-bg
--diffkit-deleted-text
--diffkit-line-number
--diffkit-border
--diffkit-font-family
--diffkit-font-size
/* etc. */
```

---

## Implementation Workflow

Follow this exact sequence:

### Phase 1: Specification
Read and understand all specifications in this document before writing any code.

### Phase 2: Implementation Plan
Create a detailed implementation plan breaking down the work into tasks.

### Phase 3: Task Execution

Execute tasks in this order:

1. **Project Setup**
   - Initialize npm package
   - Configure TypeScript (strict mode)
   - Configure Vitest
   - Configure ESLint + Prettier
   - Set up build scripts (dual ESM/CJS)

2. **Core Types**
   - Define all interfaces and types in `src/core/types.ts`
   - Define plugin types in `src/plugins/types.ts`
   - Define renderer types in `src/renderers/types.ts`
   - Define theme types in `src/themes/types.ts`

3. **Algorithms**
   - Implement LCS utility
   - Implement Myers algorithm
   - Implement Patience algorithm
   - Implement Histogram algorithm
   - Write comprehensive tests for each

4. **Parser & Engine**
   - Implement parser (line/word/char granularity)
   - Implement hunk generation
   - Implement stats calculation
   - Implement DiffEngine class
   - Write tests

5. **Plugin System**
   - Implement plugin registry
   - Implement lifecycle hooks
   - Implement syntax plugin (with all languages)
   - Implement html-dom plugin
   - Implement html-text plugin
   - Implement markdown plugin
   - Write tests for each plugin

6. **Themes**
   - Implement theme type definitions
   - Implement createTheme factory
   - Implement CSS variables generator
   - Create all preset themes
   - Write tests

7. **HTML Renderer**
   - Implement unified view
   - Implement split view
   - Implement inline view
   - Write tests

8. **React Components**
   - Implement ThemeProvider
   - Implement hooks (useDiff, useTheme)
   - Implement DiffLine, LineNumber, DiffHunk
   - Implement UnifiedView, SplitView, InlineView
   - Implement DiffView (auto-selecting)
   - Write tests

9. **Integration Testing**
   - Full flow tests
   - Large file tests
   - Edge case tests
   - Performance benchmarks

10. **Exports & Build**
    - Configure all exports in index.ts files
    - Build and verify dual package
    - Verify tree-shaking works
    - Test in both ESM and CJS environments

11. **Documentation Website**
    - Set up Vite + React + Tailwind
    - Create layout and navigation
    - Write all documentation pages
    - Create interactive examples
    - Build to /docs folder
    - Add CNAME file

12. **Final Polish**
    - README.md with badges and examples
    - CHANGELOG.md
    - Final test coverage check (must be 100%)
    - Final lint check
    - Package size check

---

## Website Requirements

### Stack
- React 18+
- Vite
- TypeScript
- Tailwind CSS

### Domain
- Custom domain: `diffkit.oxog.dev`
- CNAME file in `website/public/CNAME` containing: `diffkit.oxog.dev`
- Build output to `/docs` folder for GitHub Pages

### Code Blocks
IDE-style code blocks with:
- Line numbers on left side (muted color)
- Syntax highlighting (use the package's own syntax plugin!)
- Copy button with feedback (top-right)
- Filename/language badge
- Rounded corners with subtle border
- Support for both light and dark themes

### Theme Support
- Dark and Light mode with toggle
- Persist preference in localStorage
- System preference detection

### Pages Required

**Landing Page**
- Hero section with tagline
- Key features (zero-dep, 3 algorithms, customizable)
- Quick start code example
- Live interactive demo
- Installation commands

**Documentation**
- Getting Started
- Core Concepts
- Algorithms Explained
- Plugin System
- Theming Guide
- React Components
- API Reference

**Examples**
- Basic Diff
- Code Review UI
- HTML Diff
- Custom Theme

### Build
- Output to `/docs` folder
- Optimized for GitHub Pages
- Include 404.html for SPA routing

---

## Package.json Template

```json
{
  "name": "@oxog/diffkit",
  "version": "1.0.0",
  "description": "Universal diff toolkit with zero dependencies — compare anything, customize everything",
  "author": "Ersin Koc",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/ersinkoc/diffkit.git"
  },
  "homepage": "https://diffkit.oxog.dev",
  "keywords": [
    "diff",
    "compare",
    "difference",
    "text-diff",
    "code-diff",
    "html-diff",
    "unified-diff",
    "split-diff",
    "react-diff",
    "syntax-highlighting",
    "zero-dependency"
  ],
  "type": "module",
  "main": "./dist/cjs/index.js",
  "module": "./dist/esm/index.js",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "require": "./dist/cjs/index.js",
      "types": "./dist/types/index.d.ts"
    },
    "./react": {
      "import": "./dist/esm/renderers/react/index.js",
      "require": "./dist/cjs/renderers/react/index.js",
      "types": "./dist/types/renderers/react/index.d.ts"
    },
    "./plugins/*": {
      "import": "./dist/esm/plugins/*/index.js",
      "require": "./dist/cjs/plugins/*/index.js",
      "types": "./dist/types/plugins/*/index.d.ts"
    },
    "./themes": {
      "import": "./dist/esm/themes/index.js",
      "require": "./dist/cjs/themes/index.js",
      "types": "./dist/types/themes/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ],
  "scripts": {
    "dev": "vitest",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "build": "npm run build:esm && npm run build:cjs && npm run build:types",
    "build:esm": "tsc -p tsconfig.build.json --outDir dist/esm",
    "build:cjs": "tsc -p tsconfig.build.json --outDir dist/cjs --module commonjs",
    "build:types": "tsc -p tsconfig.build.json --outDir dist/types --declaration --emitDeclarationOnly",
    "lint": "eslint src tests",
    "format": "prettier --write .",
    "prepublishOnly": "npm run lint && npm run test:coverage && npm run build",
    "website:dev": "cd website && npm run dev",
    "website:build": "cd website && npm run build"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "prettier": "^3.1.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    },
    "react-dom": {
      "optional": true
    }
  }
}
```

---

## README Template

````markdown
# @oxog/diffkit

Universal diff toolkit with zero dependencies — compare anything, customize everything.

[![npm version](https://img.shields.io/npm/v/@oxog/diffkit.svg)](https://www.npmjs.com/package/@oxog/diffkit)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@oxog/diffkit)](https://bundlephobia.com/package/@oxog/diffkit)
[![test coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)]()

## Features

- 🚀 **Zero Dependencies** — No bloat, just pure diffing power
- 🔄 **3 Algorithms** — Myers, Patience, Histogram
- 📊 **3 View Modes** — Unified, Split, Inline
- 🎨 **Fully Themeable** — CSS variables + JS config
- ⚛️ **React Components** — Ready-to-use UI
- 🔌 **Plugin System** — Extend with syntax, HTML, Markdown support
- 📦 **Universal** — Works in Node.js and browsers

## Installation

```bash
npm install @oxog/diffkit
```

## Quick Start

```typescript
import { createDiff } from '@oxog/diffkit';

const diff = createDiff(
  'Hello World',
  'Hello Diff World'
);

console.log(diff.stats);
// { additions: 1, deletions: 1, changes: 1 }
```

## React Usage

```tsx
import { DiffView } from '@oxog/diffkit/react';

function App() {
  return (
    <DiffView
      old={oldCode}
      new={newCode}
      mode="split"
      language="typescript"
      theme="github-dark"
    />
  );
}
```

## Documentation

Visit [diffkit.oxog.dev](https://diffkit.oxog.dev) for full documentation.

## License

MIT © Ersin Koc

---

[GitHub](https://github.com/ersinkoc/diffkit)
````

---

## Final Checklist

Before considering this package complete, verify:

- [ ] `dependencies` in package.json is empty `{}`
- [ ] All tests pass (`npm test`)
- [ ] Test coverage is 100% (`npm run test:coverage`)
- [ ] Builds successfully for both ESM and CJS
- [ ] TypeScript declarations are generated
- [ ] ESLint passes with no errors
- [ ] Website builds to /docs folder
- [ ] CNAME file exists with `diffkit.oxog.dev`
- [ ] README has all required sections
- [ ] CHANGELOG has v1.0.0 entry
- [ ] Package size is under target (core < 10KB gzip)

---

## Notes for Implementation

1. **Algorithm Implementation**: Start with Myers as it's the most commonly used. Use the LCS utility for all three algorithms.

2. **Syntax Highlighting**: Build a simple but effective tokenizer. Don't try to compete with Prism/Shiki — focus on the most common languages and patterns.

3. **React Components**: Keep them simple and composable. Use CSS-in-JS only via CSS variables for theming.

4. **Performance**: For large files (>10,000 lines), consider:
   - Lazy hunk rendering
   - Virtual scrolling hints in docs
   - Streaming diff for very large files

5. **Testing**: Use property-based testing for algorithms. Test edge cases: empty strings, single characters, identical content, completely different content.

6. **Bundle Size**: Monitor with `bundlephobia`. Core should be <10KB. React components add ~5KB. Plugins are separate chunks.

---

**END OF PROMPT**

This prompt contains everything needed to build @oxog/diffkit from scratch with zero errors. Execute each phase in order, verify each step, and maintain 100% test coverage throughout.
