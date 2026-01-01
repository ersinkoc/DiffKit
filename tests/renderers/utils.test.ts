/**
 * Tests for HTML renderer utilities
 */


import {
  escapeHtml,
  unescapeHtml,
  createElement,
  div,
  span,
  classNames,
  inlineStyles,
  wrapText,
  highlightMatch,
  tabsToSpaces,
  showWhitespace,
} from '../../src/renderers/html/utils.js';

describe('escapeHtml', () => {
  it('should escape all HTML special characters', () => {
    expect(escapeHtml('<script>"test"</script>')).toBe(
      '&lt;script&gt;&quot;test&quot;&lt;/script&gt;'
    );
  });

  it('should escape ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('should escape single quotes', () => {
    expect(escapeHtml("it's")).toBe('it&#039;s');
  });
});

describe('unescapeHtml', () => {
  it('should unescape HTML entities', () => {
    expect(unescapeHtml('&lt;div&gt;')).toBe('<div>');
  });

  it('should unescape quotes', () => {
    expect(unescapeHtml('&quot;test&quot;')).toBe('"test"');
  });

  it('should unescape single quotes', () => {
    expect(unescapeHtml('it&#039;s')).toBe("it's");
  });
});

describe('createElement', () => {
  it('should create element without attributes', () => {
    expect(createElement('div')).toBe('<div></div>');
  });

  it('should create element with content', () => {
    expect(createElement('p', {}, 'Hello')).toBe('<p>Hello</p>');
  });

  it('should create element with attributes', () => {
    expect(createElement('a', { href: '/test', class: 'link' }, 'Click')).toBe(
      '<a href="/test" class="link">Click</a>'
    );
  });

  it('should handle boolean true attributes', () => {
    expect(createElement('input', { disabled: true })).toBe('<input disabled />');
  });

  it('should skip undefined attributes', () => {
    expect(createElement('div', { id: undefined, class: 'test' }, '')).toBe(
      '<div class="test"></div>'
    );
  });

  it('should skip false boolean attributes', () => {
    expect(createElement('input', { disabled: false })).toBe('<input />');
  });

  it('should handle self-closing tags', () => {
    expect(createElement('br')).toBe('<br />');
    expect(createElement('hr')).toBe('<hr />');
    expect(createElement('img', { src: 'test.png' })).toBe('<img src="test.png" />');
    expect(createElement('input', { type: 'text' })).toBe('<input type="text" />');
    expect(createElement('meta', { charset: 'utf-8' })).toBe('<meta charset="utf-8" />');
    expect(createElement('link', { rel: 'stylesheet' })).toBe('<link rel="stylesheet" />');
  });

  it('should escape attribute values', () => {
    expect(createElement('div', { title: '<script>' })).toBe(
      '<div title="&lt;script&gt;"></div>'
    );
  });
});

describe('div', () => {
  it('should create div with class', () => {
    expect(div('container')).toBe('<div class="container"></div>');
  });

  it('should create div with content', () => {
    expect(div('box', 'Hello')).toBe('<div class="box">Hello</div>');
  });

  it('should create div with additional attributes', () => {
    expect(div('item', 'Text', { id: 'main' })).toBe(
      '<div class="item" id="main">Text</div>'
    );
  });
});

describe('span', () => {
  it('should create span with class', () => {
    expect(span('highlight')).toBe('<span class="highlight"></span>');
  });

  it('should create span with content', () => {
    expect(span('bold', 'Text')).toBe('<span class="bold">Text</span>');
  });

  it('should create span with additional attributes', () => {
    expect(span('icon', '', { 'aria-hidden': true })).toBe(
      '<span class="icon" aria-hidden></span>'
    );
  });
});

describe('classNames', () => {
  it('should join class names', () => {
    expect(classNames('a', 'b', 'c')).toBe('a b c');
  });

  it('should filter out falsy values', () => {
    expect(classNames('a', false, 'b', undefined, 'c', null)).toBe('a b c');
  });

  it('should handle empty input', () => {
    expect(classNames()).toBe('');
  });

  it('should handle all falsy values', () => {
    expect(classNames(false, undefined, null)).toBe('');
  });
});

describe('inlineStyles', () => {
  it('should create style string from object', () => {
    expect(inlineStyles({ color: 'red', fontSize: '14px' })).toBe(
      'color: red; font-size: 14px'
    );
  });

  it('should convert camelCase to kebab-case', () => {
    expect(inlineStyles({ backgroundColor: 'blue' })).toBe('background-color: blue');
  });

  it('should filter out undefined values', () => {
    expect(inlineStyles({ color: 'red', border: undefined })).toBe('color: red');
  });

  it('should handle empty object', () => {
    expect(inlineStyles({})).toBe('');
  });

  it('should handle numeric values', () => {
    expect(inlineStyles({ zIndex: 100 })).toBe('z-index: 100');
  });
});

describe('wrapText', () => {
  it('should return single line if within width', () => {
    expect(wrapText('short', 10)).toEqual(['short']);
  });

  it('should wrap at word boundaries', () => {
    expect(wrapText('hello world test', 10)).toEqual(['hello', 'world test']);
  });

  it('should break long words at width', () => {
    expect(wrapText('verylongword', 5)).toEqual(['veryl', 'ongwo', 'rd']);
  });

  it('should handle empty string', () => {
    expect(wrapText('', 10)).toEqual(['']);
  });

  it('should handle string exactly at width', () => {
    expect(wrapText('exact', 5)).toEqual(['exact']);
  });

  it('should handle multiple spaces', () => {
    const result = wrapText('a b c d e f g', 5);
    expect(result.length).toBeGreaterThan(1);
  });
});

describe('highlightMatch', () => {
  it('should highlight matching text', () => {
    expect(highlightMatch('hello world', 'world', 'match')).toBe(
      'hello <span class="match">world</span>'
    );
  });

  it('should be case insensitive', () => {
    expect(highlightMatch('Hello World', 'hello', 'match')).toContain(
      '<span class="match">Hello</span>'
    );
  });

  it('should handle multiple matches', () => {
    const result = highlightMatch('test test test', 'test', 'match');
    expect(result.match(/<span class="match">test<\/span>/g)?.length).toBe(3);
  });

  it('should return escaped text when no match', () => {
    expect(highlightMatch('hello <world>', '')).toBe('hello &lt;world&gt;');
  });

  it('should escape HTML in original text', () => {
    expect(highlightMatch('<div>test</div>', 'test', 'match')).toContain('&lt;div&gt;');
  });

  it('should escape regex special characters in match', () => {
    expect(highlightMatch('test.*test', '.*', 'match')).toBe(
      'test<span class="match">.*</span>test'
    );
  });
});

describe('tabsToSpaces', () => {
  it('should convert tabs to 4 spaces by default', () => {
    expect(tabsToSpaces('\tcode')).toBe('    code');
  });

  it('should use custom tab size', () => {
    expect(tabsToSpaces('\tcode', 2)).toBe('  code');
  });

  it('should handle multiple tabs', () => {
    expect(tabsToSpaces('\t\tcode')).toBe('        code');
  });

  it('should handle no tabs', () => {
    expect(tabsToSpaces('no tabs')).toBe('no tabs');
  });
});

describe('showWhitespace', () => {
  it('should replace spaces with visible dots', () => {
    expect(showWhitespace('a b')).toBe('a<span class="diffkit-space">·</span>b');
  });

  it('should replace tabs with arrows', () => {
    expect(showWhitespace('a\tb')).toBe('a<span class="diffkit-tab">→</span>b');
  });

  it('should handle mixed whitespace', () => {
    const result = showWhitespace('a b\tc');
    expect(result).toContain('diffkit-space');
    expect(result).toContain('diffkit-tab');
  });

  it('should handle no whitespace', () => {
    expect(showWhitespace('abc')).toBe('abc');
  });
});
