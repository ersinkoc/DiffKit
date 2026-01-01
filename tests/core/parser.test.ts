/**
 * Parser tests
 */


import {
  parse,
  splitLines,
  normalizeContent,
  getLines,
  getUnits,
  joinUnits,
} from '../../src/core/parser.js';

describe('splitLines', () => {
  it('should split by newline', () => {
    const result = splitLines('a\nb\nc');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('should handle Windows line endings', () => {
    const result = splitLines('a\r\nb\r\nc');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('should handle Mac line endings', () => {
    const result = splitLines('a\rb\rc');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('should handle empty string', () => {
    const result = splitLines('');
    expect(result).toEqual([]);
  });

  it('should handle single line', () => {
    const result = splitLines('hello');
    expect(result).toEqual(['hello']);
  });

  it('should handle trailing newline', () => {
    const result = splitLines('a\nb\n');
    expect(result).toEqual(['a', 'b', '']);
  });
});

describe('parse', () => {
  describe('line granularity', () => {
    it('should parse content into line tokens', () => {
      const result = parse('line1\nline2\nline3');

      expect(result.tokens).toHaveLength(3);
      expect(result.tokens[0]!.value).toBe('line1');
      expect(result.tokens[0]!.line).toBe(1);
    });

    it('should build lineMap', () => {
      const result = parse('a\nb\nc');

      expect(result.lineMap.size).toBe(3);
      expect(result.lineMap.get(1)?.[0]?.value).toBe('a');
    });

    it('should handle empty content', () => {
      const result = parse('');

      expect(result.tokens).toHaveLength(0);
      expect(result.lineMap.size).toBe(0);
    });
  });

  describe('word granularity', () => {
    it('should parse into word tokens', () => {
      const result = parse('hello world', { granularity: 'word' });

      expect(result.tokens.length).toBeGreaterThanOrEqual(2);
      expect(result.tokens.some((t) => t.value === 'hello')).toBe(true);
      expect(result.tokens.some((t) => t.value === 'world')).toBe(true);
    });

    it('should include whitespace as separate tokens', () => {
      const result = parse('a b', { granularity: 'word' });

      const hasWhitespace = result.tokens.some((t) => /^\s+$/.test(t.value));
      expect(hasWhitespace).toBe(true);
    });
  });

  describe('char granularity', () => {
    it('should parse into character tokens', () => {
      const result = parse('abc', { granularity: 'char' });

      expect(result.tokens).toHaveLength(3);
      expect(result.tokens[0]!.value).toBe('a');
      expect(result.tokens[1]!.value).toBe('b');
      expect(result.tokens[2]!.value).toBe('c');
    });
  });

  describe('options', () => {
    it('should ignore whitespace when specified', () => {
      const result = parse('a b c', {
        granularity: 'char',
        ignoreWhitespace: true,
      });

      const hasSpace = result.tokens.some((t) => t.value === ' ');
      expect(hasSpace).toBe(false);
    });

    it('should convert to lowercase when ignoreCase', () => {
      const result = parse('ABC', {
        granularity: 'line',
        ignoreCase: true,
      });

      expect(result.tokens[0]!.value).toBe('abc');
    });

    it('should trim lines when specified', () => {
      const result = parse('  hello  ', {
        granularity: 'line',
        trimLines: true,
      });

      expect(result.tokens[0]!.value).toBe('hello');
    });
  });
});

describe('normalizeContent', () => {
  it('should lowercase when ignoreCase', () => {
    const result = normalizeContent('HELLO', { ignoreCase: true });
    expect(result).toBe('hello');
  });

  it('should trim lines when specified', () => {
    const result = normalizeContent('  a  \n  b  ', { trimLines: true });
    expect(result).toBe('a\nb');
  });

  it('should normalize whitespace when ignoreWhitespace', () => {
    const result = normalizeContent('a   b', { ignoreWhitespace: true });
    expect(result).toBe('a b');
  });

  it('should apply multiple options', () => {
    const result = normalizeContent('  HELLO  ', {
      ignoreCase: true,
      trimLines: true,
    });
    expect(result).toBe('hello');
  });
});

describe('getLines', () => {
  it('should return array of lines', () => {
    const result = getLines('a\nb\nc');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('should remove trailing empty line', () => {
    const result = getLines('a\nb\n');
    expect(result).toEqual(['a', 'b']);
  });

  it('should handle empty string', () => {
    const result = getLines('');
    expect(result).toEqual([]);
  });

  it('should apply options', () => {
    const result = getLines('  A  \n  B  ', {
      trimLines: true,
      ignoreCase: true,
    });
    expect(result).toEqual(['a', 'b']);
  });
});

describe('getUnits', () => {
  it('should split by lines for line granularity', () => {
    const result = getUnits('a\nb\nc', 'line');
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('should split by words for word granularity', () => {
    const result = getUnits('hello world', 'word');
    expect(result).toContain('hello');
    expect(result).toContain('world');
  });

  it('should split by chars for char granularity', () => {
    const result = getUnits('abc', 'char');
    expect(result).toEqual(['a', 'b', 'c']);
  });
});

describe('joinUnits', () => {
  it('should join lines with newline', () => {
    const result = joinUnits(['a', 'b', 'c'], 'line');
    expect(result).toBe('a\nb\nc');
  });

  it('should join words without separator', () => {
    const result = joinUnits(['hello', ' ', 'world'], 'word');
    expect(result).toBe('hello world');
  });

  it('should join chars without separator', () => {
    const result = joinUnits(['a', 'b', 'c'], 'char');
    expect(result).toBe('abc');
  });
});
