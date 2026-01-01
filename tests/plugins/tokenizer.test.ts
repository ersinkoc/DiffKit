/**
 * Tests for syntax tokenizer
 */

import { describe, it, expect } from 'vitest';
import {
  createTokenizer,
  simpleTokenize,
  mergeTokens,
  getLineTokens,
} from '../../src/plugins/syntax/tokenizer.js';

describe('createTokenizer', () => {
  it('should tokenize based on patterns', () => {
    const tokenize = createTokenizer([
      { type: 'keyword', pattern: /\b(const|let|var)\b/ },
      { type: 'number', pattern: /\b\d+\b/ },
    ]);

    const tokens = tokenize('const x = 42');

    expect(tokens.some((t) => t.type === 'keyword' && t.value === 'const')).toBe(true);
    expect(tokens.some((t) => t.type === 'number' && t.value === '42')).toBe(true);
  });

  it('should include plain text between matches', () => {
    const tokenize = createTokenizer([
      { type: 'keyword', pattern: /\b(if|else)\b/ },
    ]);

    const tokens = tokenize('if test else');

    expect(tokens.filter((t) => t.type === 'plain').length).toBeGreaterThan(0);
  });

  it('should handle multiple lines', () => {
    const tokenize = createTokenizer([
      { type: 'keyword', pattern: /\b(const)\b/ },
    ]);

    const tokens = tokenize('const a\nconst b');

    const keywordTokens = tokens.filter((t) => t.type === 'keyword');
    expect(keywordTokens.length).toBe(2);
    expect(keywordTokens[0]?.line).toBe(1);
    expect(keywordTokens[1]?.line).toBe(2);
  });

  it('should add newline tokens between lines', () => {
    const tokenize = createTokenizer([
      { type: 'word', pattern: /\w+/ },
    ]);

    const tokens = tokenize('line1\nline2');

    expect(tokens.some((t) => t.type === 'newline')).toBe(true);
  });

  it('should set correct column positions', () => {
    const tokenize = createTokenizer([
      { type: 'word', pattern: /\btest\b/ },
    ]);

    const tokens = tokenize('xxx test yyy');

    const testToken = tokens.find((t) => t.value === 'test');
    expect(testToken?.column).toBe(5);
  });

  it('should handle empty content', () => {
    const tokenize = createTokenizer([
      { type: 'word', pattern: /\w+/ },
    ]);

    const tokens = tokenize('');

    expect(tokens).toEqual([]);
  });

  it('should handle content with no matches', () => {
    const tokenize = createTokenizer([
      { type: 'keyword', pattern: /\b(if|else)\b/ },
    ]);

    const tokens = tokenize('no keywords here');

    expect(tokens.every((t) => t.type !== 'keyword')).toBe(true);
  });

  it('should handle overlapping patterns (first wins)', () => {
    const tokenize = createTokenizer([
      { type: 'identifier', pattern: /[a-z]+/ },
      { type: 'keyword', pattern: /const/ },
    ]);

    const tokens = tokenize('const');

    // First pattern matches first
    expect(tokens.some((t) => t.type === 'identifier' && t.value === 'const')).toBe(true);
  });
});

describe('simpleTokenize', () => {
  it('should split by whitespace', () => {
    const tokens = simpleTokenize('hello world');

    expect(tokens.filter((t) => t.type === 'text').map((t) => t.value)).toEqual([
      'hello',
      'world',
    ]);
  });

  it('should identify whitespace tokens', () => {
    const tokens = simpleTokenize('a  b');

    expect(tokens.some((t) => t.type === 'whitespace' && t.value === '  ')).toBe(true);
  });

  it('should handle multiple lines', () => {
    const tokens = simpleTokenize('line1\nline2');

    expect(tokens.filter((t) => t.type === 'newline').length).toBe(1);
  });

  it('should set correct line numbers', () => {
    const tokens = simpleTokenize('a\nb\nc');

    const textTokens = tokens.filter((t) => t.type === 'text');
    expect(textTokens[0]?.line).toBe(1);
    expect(textTokens[1]?.line).toBe(2);
    expect(textTokens[2]?.line).toBe(3);
  });

  it('should set correct column numbers', () => {
    const tokens = simpleTokenize('ab cd');

    const textTokens = tokens.filter((t) => t.type === 'text');
    expect(textTokens[0]?.column).toBe(1);
    expect(textTokens[1]?.column).toBe(4);
  });

  it('should handle empty content', () => {
    const tokens = simpleTokenize('');

    expect(tokens).toEqual([]);
  });

  it('should handle only whitespace', () => {
    const tokens = simpleTokenize('   ');

    expect(tokens.every((t) => t.type === 'whitespace')).toBe(true);
  });
});

describe('mergeTokens', () => {
  it('should merge adjacent tokens of same type on same line', () => {
    const tokens = [
      { value: 'hel', line: 1, column: 1, type: 'text' },
      { value: 'lo', line: 1, column: 4, type: 'text' },
    ];

    const merged = mergeTokens(tokens);

    expect(merged).toHaveLength(1);
    expect(merged[0]?.value).toBe('hello');
  });

  it('should not merge tokens on different lines', () => {
    const tokens = [
      { value: 'a', line: 1, column: 1, type: 'text' },
      { value: 'b', line: 2, column: 1, type: 'text' },
    ];

    const merged = mergeTokens(tokens);

    expect(merged).toHaveLength(2);
  });

  it('should not merge tokens of different types', () => {
    const tokens = [
      { value: 'hello', line: 1, column: 1, type: 'text' },
      { value: ' ', line: 1, column: 6, type: 'whitespace' },
    ];

    const merged = mergeTokens(tokens);

    expect(merged).toHaveLength(2);
  });

  it('should handle empty array', () => {
    const merged = mergeTokens([]);

    expect(merged).toEqual([]);
  });

  it('should handle single token', () => {
    const tokens = [{ value: 'hello', line: 1, column: 1, type: 'text' }];

    const merged = mergeTokens(tokens);

    expect(merged).toEqual(tokens);
  });
});

describe('getLineTokens', () => {
  it('should return tokens for specific line', () => {
    const tokens = [
      { value: 'a', line: 1, column: 1, type: 'text' },
      { value: 'b', line: 2, column: 1, type: 'text' },
      { value: 'c', line: 2, column: 2, type: 'text' },
    ];

    const line2Tokens = getLineTokens(tokens, 2);

    expect(line2Tokens).toHaveLength(2);
    expect(line2Tokens.map((t) => t.value)).toEqual(['b', 'c']);
  });

  it('should exclude newline tokens', () => {
    const tokens = [
      { value: 'a', line: 1, column: 1, type: 'text' },
      { value: '\n', line: 1, column: 2, type: 'newline' },
    ];

    const lineTokens = getLineTokens(tokens, 1);

    expect(lineTokens).toHaveLength(1);
    expect(lineTokens[0]?.type).toBe('text');
  });

  it('should return empty array for non-existent line', () => {
    const tokens = [{ value: 'a', line: 1, column: 1, type: 'text' }];

    const lineTokens = getLineTokens(tokens, 99);

    expect(lineTokens).toEqual([]);
  });
});
