/**
 * Syntax plugin tests
 */

import { describe, it, expect } from 'vitest';
import { syntaxPlugin } from '../../src/plugins/syntax/index.js';
import {
  getTokenizer,
  detectLanguage,
  isLanguageSupported,
  listLanguages,
} from '../../src/plugins/syntax/languages/index.js';

describe('syntaxPlugin', () => {
  it('should create plugin with default options', () => {
    const plugin = syntaxPlugin();

    expect(plugin.name).toBe('syntax');
    expect(plugin.version).toBe('1.0.0');
  });

  it('should have tokenize method', () => {
    const plugin = syntaxPlugin({ language: 'javascript' });

    expect(typeof plugin.tokenize).toBe('function');
  });

  it('should tokenize JavaScript', () => {
    const plugin = syntaxPlugin({ language: 'javascript' });
    plugin.onInit?.({} as never);

    const tokens = plugin.tokenize!('const x = 42;', 'javascript');

    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.some((t) => t.type === 'keyword')).toBe(true);
    expect(tokens.some((t) => t.type === 'number')).toBe(true);
  });

  it('should auto-detect language', () => {
    const plugin = syntaxPlugin({ language: 'auto' });
    plugin.onInit?.({} as never);

    const jsCode = 'import React from "react";\nfunction App() {}';
    const tokens = plugin.tokenize!(jsCode);

    expect(tokens.length).toBeGreaterThan(0);
  });
});

describe('getTokenizer', () => {
  it('should return tokenizer for known language', () => {
    const tokenizer = getTokenizer('javascript');

    expect(typeof tokenizer).toBe('function');
  });

  it('should return default tokenizer for unknown language', () => {
    const tokenizer = getTokenizer('unknownlang');

    expect(typeof tokenizer).toBe('function');
  });

  it('should handle language aliases', () => {
    expect(getTokenizer('js')).toBe(getTokenizer('javascript'));
    expect(getTokenizer('ts')).toBe(getTokenizer('typescript'));
    expect(getTokenizer('py')).toBe(getTokenizer('python'));
  });
});

describe('isLanguageSupported', () => {
  it('should return true for supported languages', () => {
    expect(isLanguageSupported('javascript')).toBe(true);
    expect(isLanguageSupported('typescript')).toBe(true);
    expect(isLanguageSupported('python')).toBe(true);
    expect(isLanguageSupported('css')).toBe(true);
    expect(isLanguageSupported('html')).toBe(true);
    expect(isLanguageSupported('json')).toBe(true);
    expect(isLanguageSupported('markdown')).toBe(true);
  });

  it('should return false for unsupported languages', () => {
    expect(isLanguageSupported('unknownlang')).toBe(false);
    expect(isLanguageSupported('rust')).toBe(false);
    expect(isLanguageSupported('go')).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(isLanguageSupported('JavaScript')).toBe(true);
    expect(isLanguageSupported('PYTHON')).toBe(true);
  });
});

describe('listLanguages', () => {
  it('should return array of languages', () => {
    const languages = listLanguages();

    expect(Array.isArray(languages)).toBe(true);
    expect(languages.length).toBeGreaterThan(0);
  });

  it('should include common languages', () => {
    const languages = listLanguages();

    expect(languages).toContain('javascript');
    expect(languages).toContain('typescript');
    expect(languages).toContain('python');
    expect(languages).toContain('html');
    expect(languages).toContain('css');
    expect(languages).toContain('json');
  });
});

describe('detectLanguage', () => {
  it('should detect from file extension', () => {
    expect(detectLanguage('file.js')).toBe('javascript');
    expect(detectLanguage('file.ts')).toBe('typescript');
    expect(detectLanguage('file.py')).toBe('python');
    expect(detectLanguage('file.css')).toBe('css');
    expect(detectLanguage('file.html')).toBe('html');
    expect(detectLanguage('file.json')).toBe('json');
    expect(detectLanguage('file.md')).toBe('markdown');
  });

  it('should handle unknown extensions', () => {
    expect(detectLanguage('file.xyz')).toBeUndefined();
  });

  it('should handle files without extension', () => {
    expect(detectLanguage('filename')).toBeUndefined();
  });
});

describe('JavaScript tokenizer', () => {
  it('should tokenize keywords', () => {
    const tokenizer = getTokenizer('javascript');
    const tokens = tokenizer('const let var function class');

    const keywords = tokens.filter((t) => t.type === 'keyword');
    expect(keywords.length).toBeGreaterThan(0);
  });

  it('should tokenize strings', () => {
    const tokenizer = getTokenizer('javascript');
    const tokens = tokenizer('"hello" \'world\' `template`');

    const strings = tokens.filter((t) => t.type === 'string');
    expect(strings.length).toBe(3);
  });

  it('should tokenize numbers', () => {
    const tokenizer = getTokenizer('javascript');
    const tokens = tokenizer('42 3.14 0xFF 0b1010');

    const numbers = tokens.filter((t) => t.type === 'number');
    expect(numbers.length).toBeGreaterThanOrEqual(4);
  });

  it('should tokenize comments', () => {
    const tokenizer = getTokenizer('javascript');
    const tokens = tokenizer('// comment\n/* block */');

    const comments = tokens.filter((t) => t.type === 'comment');
    expect(comments.length).toBe(2);
  });
});

describe('Python tokenizer', () => {
  it('should tokenize keywords', () => {
    const tokenizer = getTokenizer('python');
    const tokens = tokenizer('def class if else for while');

    const keywords = tokens.filter((t) => t.type === 'keyword');
    expect(keywords.length).toBeGreaterThan(0);
  });

  it('should tokenize docstrings', () => {
    const tokenizer = getTokenizer('python');
    const tokens = tokenizer('"""docstring"""');

    const strings = tokens.filter((t) => t.type === 'string');
    expect(strings.length).toBe(1);
  });

  it('should tokenize decorators', () => {
    const tokenizer = getTokenizer('python');
    const tokens = tokenizer('@decorator');

    const funcs = tokens.filter((t) => t.type === 'function');
    expect(funcs.length).toBe(1);
  });
});

describe('JSON tokenizer', () => {
  it('should tokenize property names', () => {
    const tokenizer = getTokenizer('json');
    const tokens = tokenizer('{"key": "value"}');

    const props = tokens.filter((t) => t.type === 'property');
    expect(props.length).toBeGreaterThan(0);
  });

  it('should tokenize values', () => {
    const tokenizer = getTokenizer('json');
    const tokens = tokenizer('{"a": true, "b": 42, "c": null}');

    const keywords = tokens.filter((t) => t.type === 'keyword');
    expect(keywords.length).toBe(2); // true, null
  });
});
