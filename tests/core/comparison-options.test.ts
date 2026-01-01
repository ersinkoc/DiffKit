/**
 * Tests for comparison options (ignoreWhitespace, ignoreCase, etc.)
 */

import { DiffEngine, createDiff } from '../../src/core/diff-engine.js';

describe('DiffEngine comparison options', () => {
  describe('ignoreCase', () => {
    it('should detect differences when ignoreCase is false', () => {
      const engine = new DiffEngine({ ignoreCase: false });
      const result = engine.diff('Hello World', 'hello world');

      expect(result.stats.changes).toBeGreaterThan(0);
    });

    it('should ignore case differences when ignoreCase is true', () => {
      const engine = new DiffEngine({ ignoreCase: true });
      const result = engine.diff('Hello World', 'hello world');

      expect(result.stats.changes).toBe(0);
    });

    it('should work with multiline content', () => {
      const engine = new DiffEngine({ ignoreCase: true });
      const result = engine.diff('Line ONE\nLine TWO', 'line one\nline two');

      expect(result.stats.changes).toBe(0);
    });
  });

  describe('ignoreWhitespace', () => {
    it('should detect whitespace differences by default', () => {
      const engine = new DiffEngine();
      const result = engine.diff('hello  world', 'hello world');

      expect(result.stats.changes).toBeGreaterThan(0);
    });

    it('should ignore whitespace when ignoreWhitespace is true', () => {
      const engine = new DiffEngine({ ignoreWhitespace: true });
      const result = engine.diff('hello  world', 'hello world');

      expect(result.stats.changes).toBe(0);
    });

    it('should ignore leading whitespace when mode is leading', () => {
      const engine = new DiffEngine({ ignoreWhitespace: 'leading' });
      const result = engine.diff('  hello', 'hello');

      expect(result.stats.changes).toBe(0);
    });

    it('should still detect trailing whitespace with leading mode', () => {
      const engine = new DiffEngine({ ignoreWhitespace: 'leading' });
      const result = engine.diff('hello', 'hello  ');

      expect(result.stats.changes).toBeGreaterThan(0);
    });

    it('should ignore trailing whitespace when mode is trailing', () => {
      const engine = new DiffEngine({ ignoreWhitespace: 'trailing' });
      const result = engine.diff('hello  ', 'hello');

      expect(result.stats.changes).toBe(0);
    });

    it('should collapse multiple spaces when mode is collapse', () => {
      const engine = new DiffEngine({ ignoreWhitespace: 'collapse' });
      const result = engine.diff('hello    world', 'hello world');

      expect(result.stats.changes).toBe(0);
    });

    it('should ignore all whitespace when mode is all', () => {
      const engine = new DiffEngine({ ignoreWhitespace: 'all' });
      const result = engine.diff('hello world', 'helloworld');

      expect(result.stats.changes).toBe(0);
    });

    it('should ignore all whitespace when mode is ignore', () => {
      const engine = new DiffEngine({ ignoreWhitespace: 'ignore' });
      const result = engine.diff('  hello   world  ', 'helloworld');

      expect(result.stats.changes).toBe(0);
    });
  });

  describe('trimLines', () => {
    it('should not trim lines by default', () => {
      const engine = new DiffEngine();
      const result = engine.diff('  hello  ', 'hello');

      expect(result.stats.changes).toBeGreaterThan(0);
    });

    it('should trim lines when trimLines is true', () => {
      const engine = new DiffEngine({ trimLines: true });
      const result = engine.diff('  hello  ', 'hello');

      expect(result.stats.changes).toBe(0);
    });

    it('should trim each line independently', () => {
      const engine = new DiffEngine({ trimLines: true });
      const result = engine.diff('  line1  \n  line2  ', 'line1\nline2');

      expect(result.stats.changes).toBe(0);
    });
  });

  describe('ignoreBlankLines', () => {
    it('should detect blank line differences by default', () => {
      const engine = new DiffEngine();
      const result = engine.diff('line1\n\nline2', 'line1\nline2');

      expect(result.stats.changes).toBeGreaterThan(0);
    });

    it('should ignore blank lines when ignoreBlankLines is true', () => {
      const engine = new DiffEngine({ ignoreBlankLines: true });
      const result = engine.diff('line1\n\nline2', 'line1\nline2');

      expect(result.stats.changes).toBe(0);
    });

    it('should ignore multiple blank lines', () => {
      const engine = new DiffEngine({ ignoreBlankLines: true });
      const result = engine.diff('line1\n\n\n\nline2', 'line1\nline2');

      expect(result.stats.changes).toBe(0);
    });
  });

  describe('combined options', () => {
    it('should combine ignoreCase and ignoreWhitespace', () => {
      const engine = new DiffEngine({
        ignoreCase: true,
        ignoreWhitespace: true,
      });
      const result = engine.diff('  HELLO  WORLD  ', 'hello world');

      expect(result.stats.changes).toBe(0);
    });

    it('should combine ignoreCase and trimLines', () => {
      const engine = new DiffEngine({
        ignoreCase: true,
        trimLines: true,
      });
      const result = engine.diff('  HELLO  ', '  hello  ');

      expect(result.stats.changes).toBe(0);
    });

    it('should combine all options', () => {
      const engine = new DiffEngine({
        ignoreCase: true,
        ignoreWhitespace: true,
        ignoreBlankLines: true,
      });
      const result = engine.diff(
        'HELLO WORLD\n\nFOO BAR',
        'hello world\nfoo bar'
      );

      expect(result.stats.changes).toBe(0);
    });
  });
});

describe('createDiff with comparison options', () => {
  it('should support ignoreCase option', () => {
    const result = createDiff('Hello', 'hello', { ignoreCase: true });
    expect(result.stats.changes).toBe(0);
  });

  it('should support ignoreWhitespace option', () => {
    const result = createDiff('hello  world', 'hello world', {
      ignoreWhitespace: true,
    });
    expect(result.stats.changes).toBe(0);
  });

  it('should support trimLines option', () => {
    const result = createDiff('  hello  ', 'hello', { trimLines: true });
    expect(result.stats.changes).toBe(0);
  });

  it('should support ignoreBlankLines option', () => {
    const result = createDiff('a\n\nb', 'a\nb', { ignoreBlankLines: true });
    expect(result.stats.changes).toBe(0);
  });

  it('should include options in result', () => {
    const result = createDiff('A', 'a', { ignoreCase: true });
    expect(result.options.ignoreCase).toBe(true);
  });
});
