# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-01

### Added

- Initial release of @oxog/diffkit
- Core diff engine with multiple algorithm support
  - Myers algorithm (default, classic O(ND) diff)
  - Patience algorithm (better for code diffs)
  - Histogram algorithm (optimized for large files)
- Multiple granularity levels: line, word, character
- HTML renderers with three view modes
  - Unified view (single column with +/- prefixes)
  - Split view (two columns side-by-side)
  - Inline view (changes highlighted inline)
- Plugin system with lifecycle hooks
  - Syntax highlighting plugin (JS, TS, Python, CSS, HTML, JSON, Markdown)
  - HTML DOM plugin (structure-aware HTML diffing)
  - HTML Text plugin (text-based HTML diffing)
  - Markdown plugin (structure-aware Markdown diffing)
- Complete theming system
  - Five built-in themes: github-dark, github-light, vscode-dark, vscode-light, monokai
  - CSS variables generation
  - Custom theme creation with extends support
- React components
  - DiffView (auto-selecting main component)
  - UnifiedView, SplitView, InlineView
  - ThemeProvider with context
  - useDiff and useTheme hooks
- Utility functions
  - LCS (Longest Common Subsequence)
  - Hunk generation and parsing
  - Statistics calculation
  - HTML escaping
  - Deep merge utilities
- Full TypeScript support with strict mode
- Zero runtime dependencies
- Dual package format (ESM + CommonJS)

### Technical Details

- Written in TypeScript 5.3 with strict mode
- ESM-first with CommonJS fallback
- React 17+ support (optional peer dependency)
- Node.js 18+ required
