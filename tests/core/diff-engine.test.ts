/**
 * DiffEngine tests
 */

import { DiffEngine, createDiff } from '../../src/core/diff-engine.js';
import type { DiffPlugin } from '../../src/core/types.js';

describe('DiffEngine', () => {
  let engine: DiffEngine;

  beforeEach(() => {
    engine = new DiffEngine();
  });

  describe('constructor', () => {
    it('should create engine with default options', () => {
      const e = new DiffEngine();
      expect(e.getPlugins()).toHaveLength(0);
    });

    it('should accept custom options', () => {
      const e = new DiffEngine({
        algorithm: 'patience',
        granularity: 'word',
        context: 5,
      });
      expect(e).toBeInstanceOf(DiffEngine);
    });

    it('should register plugins from options', () => {
      const plugin: DiffPlugin = {
        name: 'test',
        version: '1.0.0',
      };
      const e = new DiffEngine({ plugins: [plugin] });
      expect(e.getPlugins()).toHaveLength(1);
    });
  });

  describe('use', () => {
    it('should register a plugin', () => {
      const plugin: DiffPlugin = {
        name: 'test',
        version: '1.0.0',
      };

      engine.use(plugin);
      expect(engine.getPlugins()).toContain(plugin);
    });

    it('should call onInit hook', () => {
      let initCalled = false;
      const plugin: DiffPlugin = {
        name: 'test',
        version: '1.0.0',
        onInit: () => {
          initCalled = true;
        },
      };

      engine.use(plugin);
      expect(initCalled).toBe(true);
    });

    it('should be chainable', () => {
      const plugin1: DiffPlugin = { name: 'p1', version: '1.0.0' };
      const plugin2: DiffPlugin = { name: 'p2', version: '1.0.0' };

      const result = engine.use(plugin1).use(plugin2);
      expect(result).toBe(engine);
      expect(engine.getPlugins()).toHaveLength(2);
    });
  });

  describe('diff', () => {
    it('should compute diff between two strings', () => {
      const result = engine.diff('hello', 'hello world');

      expect(result).toBeDefined();
      expect(result.oldContent).toBe('hello');
      expect(result.newContent).toBe('hello world');
    });

    it('should return empty hunks for identical content', () => {
      const result = engine.diff('same', 'same');
      expect(result.hunks).toHaveLength(0);
    });

    it('should detect additions', () => {
      const result = engine.diff('a\nb', 'a\nb\nc');

      expect(result.stats.additions).toBeGreaterThan(0);
    });

    it('should detect deletions', () => {
      const result = engine.diff('a\nb\nc', 'a\nb');

      expect(result.stats.deletions).toBeGreaterThan(0);
    });

    it('should apply onBeforeDiff hooks', () => {
      const plugin: DiffPlugin = {
        name: 'trim',
        version: '1.0.0',
        onBeforeDiff: (content) => content.trim(),
      };

      engine.use(plugin);
      const result = engine.diff('  hello  ', '  hello  ');

      // After trimming, content is identical
      expect(result.hunks).toHaveLength(0);
    });

    it('should apply onAfterDiff hooks', () => {
      const plugin: DiffPlugin = {
        name: 'stats',
        version: '1.0.0',
        onAfterDiff: (result) => {
          (result.stats as unknown as Record<string, unknown>)['custom'] = 42;
          return result;
        },
      };

      engine.use(plugin);
      const result = engine.diff('a', 'b');

      expect((result.stats as unknown as Record<string, unknown>)['custom']).toBe(42);
    });
  });

  describe('setAlgorithm', () => {
    it('should change algorithm', () => {
      const result = engine.setAlgorithm('patience');
      expect(result).toBe(engine);
    });

    it('should use specified algorithm', () => {
      engine.setAlgorithm('histogram');
      const result = engine.diff('a\nb\nc', 'a\nx\nc');

      expect(result.options.algorithm).toBe('histogram');
    });
  });

  describe('setGranularity', () => {
    it('should be chainable', () => {
      const result = engine.setGranularity('word');
      expect(result).toBe(engine);
    });
  });

  describe('setTheme', () => {
    it('should be chainable', () => {
      const result = engine.setTheme('github-dark');
      expect(result).toBe(engine);
    });
  });
});

describe('createDiff', () => {
  it('should create diff with default options', () => {
    const result = createDiff('hello', 'world');

    expect(result).toBeDefined();
    expect(result.stats.additions).toBeGreaterThan(0);
    expect(result.stats.deletions).toBeGreaterThan(0);
  });

  it('should accept custom options', () => {
    const result = createDiff('a\nb\nc', 'a\nx\nc', {
      algorithm: 'patience',
      context: 5,
    });

    expect(result.options.algorithm).toBe('patience');
    expect(result.options.context).toBe(5);
  });

  it('should return DiffResult with all methods', () => {
    const result = createDiff('a', 'b');

    expect(typeof result.toJSON).toBe('function');
    expect(typeof result.toUnifiedString).toBe('function');
    expect(typeof result.toHTML).toBe('function');
  });

  describe('DiffResult methods', () => {
    it('toJSON should return serializable object', () => {
      const result = createDiff('a', 'b');
      const json = result.toJSON();

      expect(json.hunks).toBeDefined();
      expect(json.stats).toBeDefined();
      expect(json.options).toBeDefined();
    });

    it('toUnifiedString should return string', () => {
      const result = createDiff('a\nb', 'a\nc');
      const unified = result.toUnifiedString();

      expect(typeof unified).toBe('string');
      expect(unified).toContain('-b');
      expect(unified).toContain('+c');
    });

    it('toHTML should return HTML string', () => {
      const result = createDiff('a', 'b');
      const html = result.toHTML();

      expect(typeof html).toBe('string');
      expect(html).toContain('<div');
      expect(html).toContain('diffkit');
    });
  });
});
