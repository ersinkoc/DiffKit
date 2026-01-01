/**
 * Full flow integration tests
 */

import { describe, it, expect } from 'vitest';
import {
  createDiff,
  DiffEngine,
  syntaxPlugin,
  htmlDomPlugin,
  markdownPlugin,
  HTMLRenderer,
  githubDark,
  generateCSSVars,
} from '../../src/index.js';

describe('Full diff workflow', () => {
  it('should diff and render simple text', () => {
    const diff = createDiff('hello\nworld', 'hello\nthere');
    const html = diff.toHTML();

    expect(diff.stats.additions).toBe(1);
    expect(diff.stats.deletions).toBe(1);
    expect(html).toContain('diffkit');
  });

  it('should work with DiffEngine and plugins', () => {
    const engine = new DiffEngine({ algorithm: 'patience' });
    engine.use(syntaxPlugin({ language: 'javascript' }));

    const diff = engine.diff(
      'const x = 1;',
      'const y = 2;'
    );

    expect(diff.hunks.length).toBeGreaterThan(0);
  });

  it('should work with HTML DOM plugin', () => {
    const engine = new DiffEngine();
    engine.use(htmlDomPlugin({ ignoreComments: true }));

    const diff = engine.diff(
      '<div><!-- old --><span>text</span></div>',
      '<div><span>text</span></div>'
    );

    expect(diff).toBeDefined();
  });

  it('should work with markdown plugin', () => {
    const engine = new DiffEngine();
    engine.use(markdownPlugin({ preserveStructure: true }));

    const diff = engine.diff(
      '# Title\n\nParagraph one.',
      '# Title\n\nParagraph two.'
    );

    expect(diff.hunks.length).toBeGreaterThan(0);
  });

  it('should render with different modes', () => {
    const diff = createDiff('a\nb\nc', 'a\nx\nc');

    const unified = diff.toHTML({ mode: 'unified' });
    // The unified renderer wraps in diffkit-diff class
    expect(unified).toContain('diffkit-diff');

    const renderer = new HTMLRenderer({ mode: 'split' });
    const split = renderer.render(diff);
    // The split renderer also wraps in diffkit-diff class
    expect(split).toContain('diffkit-diff');
  });

  it('should apply themes', () => {
    const diff = createDiff('old', 'new');
    const renderer = new HTMLRenderer({ theme: githubDark.name });
    const html = renderer.render(diff);

    expect(html).toContain('diffkit');
  });

  it('should generate JSON output', () => {
    const diff = createDiff('a', 'b');
    const json = diff.toJSON();

    expect(json.hunks).toBeDefined();
    expect(json.stats).toBeDefined();
    expect(json.options).toBeDefined();
  });

  it('should generate unified string output', () => {
    const diff = createDiff('old line', 'new line');
    const unified = diff.toUnifiedString();

    expect(unified).toContain('---');
    expect(unified).toContain('+++');
    expect(unified).toContain('-old line');
    expect(unified).toContain('+new line');
  });
});

describe('Multi-algorithm comparison', () => {
  it('should produce similar results with different algorithms', () => {
    const old = 'line1\nline2\nline3\nline4\nline5';
    const newContent = 'line1\nmodified\nline3\nline4\nline5';

    const myersDiff = createDiff(old, newContent, { algorithm: 'myers' });
    const patienceDiff = createDiff(old, newContent, { algorithm: 'patience' });
    const histogramDiff = createDiff(old, newContent, { algorithm: 'histogram' });

    // All should detect the same number of changes
    expect(myersDiff.stats.changes).toBe(patienceDiff.stats.changes);
    expect(patienceDiff.stats.changes).toBe(histogramDiff.stats.changes);
  });

  it('should handle moved blocks differently', () => {
    const old = 'A\nB\nC\nD\nE';
    const newContent = 'A\nD\nE\nB\nC';

    const myersDiff = createDiff(old, newContent, { algorithm: 'myers' });
    const patienceDiff = createDiff(old, newContent, { algorithm: 'patience' });

    // Both should produce hunks
    expect(myersDiff.hunks.length).toBeGreaterThan(0);
    expect(patienceDiff.hunks.length).toBeGreaterThan(0);
  });
});

describe('Theme and CSS integration', () => {
  it('should generate complete CSS for theme', () => {
    const vars = generateCSSVars(githubDark);

    expect(Object.keys(vars).length).toBeGreaterThan(20);
    expect(vars['--diffkit-bg']).toBe(githubDark.colors.background);
  });

  it('should use theme in renderer', () => {
    const renderer = new HTMLRenderer({ theme: 'monokai' });
    const diff = createDiff('old', 'new');
    const html = renderer.render(diff);

    expect(html).toContain('diffkit');
  });
});

describe('Plugin chaining', () => {
  it('should apply multiple plugins in order', () => {
    let order = '';

    const plugin1 = {
      name: 'plugin1',
      version: '1.0.0',
      onBeforeDiff: (content: string) => {
        order += '1';
        return content;
      },
    };

    const plugin2 = {
      name: 'plugin2',
      version: '1.0.0',
      onBeforeDiff: (content: string) => {
        order += '2';
        return content;
      },
    };

    const engine = new DiffEngine();
    engine.use(plugin1).use(plugin2);
    engine.diff('a', 'b');

    // Plugins are called sequentially for old content then for new content
    // So: plugin1 for old (1), plugin2 for old (2), plugin1 for new (1), plugin2 for new (2)
    expect(order).toBe('1122');
  });
});

describe('Edge cases', () => {
  it('should handle very long lines', () => {
    const longLine = 'x'.repeat(10000);
    const diff = createDiff(longLine, longLine + 'y');

    expect(diff.stats.additions).toBe(1);
    expect(diff.stats.deletions).toBe(1);
  });

  it('should handle many lines', () => {
    const old = Array.from({ length: 1000 }, (_, i) => `line ${i}`).join('\n');
    const newContent = old.replace('line 500', 'modified 500');

    const diff = createDiff(old, newContent);

    expect(diff.hunks.length).toBeGreaterThan(0);
  });

  it('should handle binary-like content', () => {
    const binary = '\x00\x01\x02\x03';
    const diff = createDiff(binary, binary + '\x04');

    expect(diff).toBeDefined();
  });

  it('should handle unicode content', () => {
    const diff = createDiff('Hello 世界', 'Hello 🌍');

    expect(diff.stats.changes).toBeGreaterThan(0);
  });

  it('should handle empty strings', () => {
    expect(createDiff('', '').hunks).toHaveLength(0);
    expect(createDiff('', 'new').stats.additions).toBeGreaterThan(0);
    expect(createDiff('old', '').stats.deletions).toBeGreaterThan(0);
  });
});
