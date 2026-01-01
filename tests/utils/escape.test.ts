/**
 * Tests for escape utilities
 */


import {
  escapeHtml,
  unescapeHtml,
  escapeRegExp,
  escapeJson,
  escapeCss,
  escapeShell,
  escapeForDisplay,
  stripAnsi,
} from '../../src/utils/escape.js';

describe('escapeHtml', () => {
  it('should escape ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('should escape less than', () => {
    expect(escapeHtml('a < b')).toBe('a &lt; b');
  });

  it('should escape greater than', () => {
    expect(escapeHtml('a > b')).toBe('a &gt; b');
  });

  it('should escape double quotes', () => {
    expect(escapeHtml('a "b" c')).toBe('a &quot;b&quot; c');
  });

  it('should escape single quotes', () => {
    expect(escapeHtml("a 'b' c")).toBe('a &#039;b&#039; c');
  });

  it('should escape all special characters', () => {
    expect(escapeHtml('<div class="test">Hello & World</div>')).toBe(
      '&lt;div class=&quot;test&quot;&gt;Hello &amp; World&lt;/div&gt;'
    );
  });

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should handle string with no special characters', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
});

describe('unescapeHtml', () => {
  it('should unescape ampersand', () => {
    expect(unescapeHtml('a &amp; b')).toBe('a & b');
  });

  it('should unescape less than', () => {
    expect(unescapeHtml('a &lt; b')).toBe('a < b');
  });

  it('should unescape greater than', () => {
    expect(unescapeHtml('a &gt; b')).toBe('a > b');
  });

  it('should unescape double quotes', () => {
    expect(unescapeHtml('a &quot;b&quot; c')).toBe('a "b" c');
  });

  it('should unescape single quotes (&#039;)', () => {
    expect(unescapeHtml('a &#039;b&#039; c')).toBe("a 'b' c");
  });

  it('should unescape single quotes (&#x27;)', () => {
    expect(unescapeHtml('a &#x27;b&#x27; c')).toBe("a 'b' c");
  });

  it('should unescape forward slash (&#x2F;)', () => {
    expect(unescapeHtml('a &#x2F; b')).toBe('a / b');
  });

  it('should handle empty string', () => {
    expect(unescapeHtml('')).toBe('');
  });
});

describe('escapeRegExp', () => {
  it('should escape dot', () => {
    expect(escapeRegExp('a.b')).toBe('a\\.b');
  });

  it('should escape asterisk', () => {
    expect(escapeRegExp('a*b')).toBe('a\\*b');
  });

  it('should escape plus', () => {
    expect(escapeRegExp('a+b')).toBe('a\\+b');
  });

  it('should escape question mark', () => {
    expect(escapeRegExp('a?b')).toBe('a\\?b');
  });

  it('should escape caret', () => {
    expect(escapeRegExp('^abc')).toBe('\\^abc');
  });

  it('should escape dollar', () => {
    expect(escapeRegExp('abc$')).toBe('abc\\$');
  });

  it('should escape braces', () => {
    expect(escapeRegExp('{a}')).toBe('\\{a\\}');
  });

  it('should escape parentheses', () => {
    expect(escapeRegExp('(a)')).toBe('\\(a\\)');
  });

  it('should escape pipe', () => {
    expect(escapeRegExp('a|b')).toBe('a\\|b');
  });

  it('should escape brackets', () => {
    expect(escapeRegExp('[a]')).toBe('\\[a\\]');
  });

  it('should escape backslash', () => {
    expect(escapeRegExp('a\\b')).toBe('a\\\\b');
  });

  it('should escape all special characters', () => {
    expect(escapeRegExp('.*+?^${}()|[]\\')).toBe(
      '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\'
    );
  });
});

describe('escapeJson', () => {
  it('should escape newlines', () => {
    expect(escapeJson('a\nb')).toBe('a\\nb');
  });

  it('should escape tabs', () => {
    expect(escapeJson('a\tb')).toBe('a\\tb');
  });

  it('should escape quotes', () => {
    expect(escapeJson('a"b')).toBe('a\\"b');
  });

  it('should escape backslash', () => {
    expect(escapeJson('a\\b')).toBe('a\\\\b');
  });

  it('should handle empty string', () => {
    expect(escapeJson('')).toBe('');
  });
});

describe('escapeCss', () => {
  it('should escape backslash', () => {
    expect(escapeCss('a\\b')).toBe('a\\\\b');
  });

  it('should escape double quotes', () => {
    expect(escapeCss('a"b')).toBe('a\\"b');
  });

  it('should escape single quotes', () => {
    expect(escapeCss("a'b")).toBe("a\\'b");
  });

  it('should handle empty string', () => {
    expect(escapeCss('')).toBe('');
  });
});

describe('escapeShell', () => {
  it('should wrap in single quotes', () => {
    expect(escapeShell('hello')).toBe("'hello'");
  });

  it('should escape single quotes', () => {
    expect(escapeShell("it's")).toBe("'it'\\''s'");
  });

  it('should handle empty string', () => {
    expect(escapeShell('')).toBe("''");
  });

  it('should handle special characters', () => {
    expect(escapeShell('$HOME')).toBe("'$HOME'");
  });
});

describe('escapeForDisplay', () => {
  it('should replace tab with arrow', () => {
    expect(escapeForDisplay('\t')).toBe('→');
  });

  it('should replace carriage return with symbol', () => {
    expect(escapeForDisplay('\r')).toBe('↵');
  });

  it('should replace newline with symbol', () => {
    expect(escapeForDisplay('\n')).toBe('↲');
  });

  it('should replace space with middle dot', () => {
    expect(escapeForDisplay(' ')).toBe('·');
  });

  it('should replace all whitespace characters', () => {
    expect(escapeForDisplay('a b\tc\nd')).toBe('a·b→c↲d');
  });

  it('should handle empty string', () => {
    expect(escapeForDisplay('')).toBe('');
  });
});

describe('stripAnsi', () => {
  it('should strip color codes', () => {
    expect(stripAnsi('\u001B[31mred\u001B[0m')).toBe('red');
  });

  it('should strip bold codes', () => {
    expect(stripAnsi('\u001B[1mbold\u001B[0m')).toBe('bold');
  });

  it('should strip multiple codes', () => {
    expect(stripAnsi('\u001B[31;1mred bold\u001B[0m')).toBe('red bold');
  });

  it('should handle string without ANSI codes', () => {
    expect(stripAnsi('no codes')).toBe('no codes');
  });

  it('should handle empty string', () => {
    expect(stripAnsi('')).toBe('');
  });
});
