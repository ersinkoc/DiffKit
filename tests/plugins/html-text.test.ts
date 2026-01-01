/**
 * HTML text plugin tests
 */

import { describe, it, expect } from 'vitest';
import {
  htmlTextPlugin,
  stripHtmlTags,
  decodeHtmlEntities,
  encodeHtmlEntities,
  extractTextContent,
  containsHtml,
  getVisibleText,
} from '../../src/plugins/html-text/index.js';

describe('htmlTextPlugin', () => {
  it('should create plugin', () => {
    const plugin = htmlTextPlugin();

    expect(plugin.name).toBe('html-text');
    expect(plugin.version).toBe('1.0.0');
  });

  it('should strip tags when specified', () => {
    const plugin = htmlTextPlugin({ stripTags: true });

    const html = '<div>hello</div>';
    const result = plugin.onBeforeDiff!(html);

    expect(result).not.toContain('<div>');
    expect(result).toContain('hello');
  });

  it('should decode entities when specified', () => {
    const plugin = htmlTextPlugin({ decodeEntities: true });

    const html = '&lt;test&gt;';
    const result = plugin.onBeforeDiff!(html);

    expect(result).toBe('<test>');
  });

  it('should apply both options', () => {
    const plugin = htmlTextPlugin({ stripTags: true, decodeEntities: true });

    const html = '<div>&amp; hello</div>';
    const result = plugin.onBeforeDiff!(html);

    expect(result).toBe('& hello');
  });
});

describe('stripHtmlTags', () => {
  it('should remove all tags', () => {
    const result = stripHtmlTags('<div><span>hello</span></div>');
    expect(result).toBe('hello');
  });

  it('should remove script content', () => {
    const result = stripHtmlTags('<script>alert("xss")</script>text');
    expect(result).toBe('text');
  });

  it('should remove style content', () => {
    const result = stripHtmlTags('<style>.foo { color: red; }</style>text');
    expect(result).toBe('text');
  });

  it('should remove comments', () => {
    const result = stripHtmlTags('<!-- comment -->text');
    expect(result).toBe('text');
  });

  it('should normalize whitespace', () => {
    const result = stripHtmlTags('<div>  hello   world  </div>');
    expect(result).toBe('hello world');
  });

  it('should handle empty string', () => {
    expect(stripHtmlTags('')).toBe('');
  });
});

describe('decodeHtmlEntities', () => {
  it('should decode named entities', () => {
    expect(decodeHtmlEntities('&amp;')).toBe('&');
    expect(decodeHtmlEntities('&lt;')).toBe('<');
    expect(decodeHtmlEntities('&gt;')).toBe('>');
    expect(decodeHtmlEntities('&quot;')).toBe('"');
    expect(decodeHtmlEntities('&nbsp;')).toBe(' ');
  });

  it('should decode numeric entities', () => {
    expect(decodeHtmlEntities('&#65;')).toBe('A');
    expect(decodeHtmlEntities('&#97;')).toBe('a');
  });

  it('should decode hex entities', () => {
    expect(decodeHtmlEntities('&#x41;')).toBe('A');
    expect(decodeHtmlEntities('&#x61;')).toBe('a');
  });

  it('should handle multiple entities', () => {
    expect(decodeHtmlEntities('&lt;tag&gt;')).toBe('<tag>');
  });

  it('should leave unknown entities', () => {
    expect(decodeHtmlEntities('&unknown;')).toBe('&unknown;');
  });
});

describe('encodeHtmlEntities', () => {
  it('should encode special characters', () => {
    expect(encodeHtmlEntities('&')).toBe('&amp;');
    expect(encodeHtmlEntities('<')).toBe('&lt;');
    expect(encodeHtmlEntities('>')).toBe('&gt;');
    expect(encodeHtmlEntities('"')).toBe('&quot;');
    expect(encodeHtmlEntities("'")).toBe('&#039;');
  });

  it('should encode all in string', () => {
    expect(encodeHtmlEntities('<a href="test">')).toBe('&lt;a href=&quot;test&quot;&gt;');
  });
});

describe('extractTextContent', () => {
  it('should extract text from HTML', () => {
    const result = extractTextContent('<div>hello &amp; world</div>');
    expect(result).toBe('hello & world');
  });

  it('should handle nested tags', () => {
    const result = extractTextContent('<div><p>a</p><p>b</p></div>');
    // extractTextContent strips tags but doesn't add spaces between block elements
    expect(result).toBe('ab');
  });
});

describe('containsHtml', () => {
  it('should detect HTML tags', () => {
    expect(containsHtml('<div>text</div>')).toBe(true);
    expect(containsHtml('<br>')).toBe(true);
    expect(containsHtml('<img src="test">')).toBe(true);
  });

  it('should return false for plain text', () => {
    expect(containsHtml('plain text')).toBe(false);
    expect(containsHtml('1 < 2 && 2 > 1')).toBe(false);
  });
});

describe('getVisibleText', () => {
  it('should add spaces for block elements', () => {
    const result = getVisibleText('<p>a</p><p>b</p>');
    // Implementation adds spaces between elements, not newlines
    expect(result).toBe('a b');
  });

  it('should add spaces for inline elements', () => {
    const result = getVisibleText('<span>a</span><span>b</span>');
    expect(result).toBe('a b');
  });

  it('should handle br tags', () => {
    const result = getVisibleText('a<br>b');
    // Implementation adds space for br tags
    expect(result).toBe('a b');
  });

  it('should decode entities', () => {
    const result = getVisibleText('&lt;test&gt;');
    expect(result).toBe('<test>');
  });
});
