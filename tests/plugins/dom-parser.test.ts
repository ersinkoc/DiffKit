/**
 * Tests for DOM parser
 */


import {
  parseHTML,
  serializeHTML,
  getTextContent,
} from '../../src/plugins/html-dom/dom-parser.js';

describe('parseHTML', () => {
  it('should parse simple element', () => {
    const nodes = parseHTML('<div>Hello</div>');

    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.type).toBe('element');
    expect(nodes[0]?.tagName).toBe('div');
  });

  it('should parse text content', () => {
    const nodes = parseHTML('<p>Hello World</p>');

    expect(nodes[0]?.children).toHaveLength(1);
    expect(nodes[0]?.children?.[0]?.type).toBe('text');
    expect(nodes[0]?.children?.[0]?.content).toBe('Hello World');
  });

  it('should parse attributes', () => {
    const nodes = parseHTML('<div id="main" class="container">Content</div>');

    expect(nodes[0]?.attributes?.id).toBe('main');
    expect(nodes[0]?.attributes?.class).toBe('container');
  });

  it('should parse boolean attributes', () => {
    const nodes = parseHTML('<input disabled>');

    expect(nodes[0]?.attributes?.disabled).toBe('');
  });

  it('should parse unquoted attribute values', () => {
    const nodes = parseHTML('<div id=main>Content</div>');

    expect(nodes[0]?.attributes?.id).toBe('main');
  });

  it('should parse single-quoted attributes', () => {
    const nodes = parseHTML("<div id='main'>Content</div>");

    expect(nodes[0]?.attributes?.id).toBe('main');
  });

  it('should parse self-closing elements', () => {
    const nodes = parseHTML('<br />');

    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.tagName).toBe('br');
    expect(nodes[0]?.children).toHaveLength(0);
  });

  it('should parse void elements', () => {
    const nodes = parseHTML('<img src="test.png"><p>After</p>');

    expect(nodes).toHaveLength(2);
    expect(nodes[0]?.tagName).toBe('img');
    expect(nodes[0]?.children).toHaveLength(0);
    expect(nodes[1]?.tagName).toBe('p');
  });

  it('should parse comments', () => {
    const nodes = parseHTML('<!-- This is a comment -->');

    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.type).toBe('comment');
    expect(nodes[0]?.content).toBe(' This is a comment ');
  });

  it('should parse unclosed comments', () => {
    const nodes = parseHTML('<!-- unclosed comment');

    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.type).toBe('comment');
    expect(nodes[0]?.content).toBe(' unclosed comment');
  });

  it('should parse nested elements', () => {
    const nodes = parseHTML('<div><span>Inner</span></div>');

    expect(nodes[0]?.children).toHaveLength(1);
    expect(nodes[0]?.children?.[0]?.tagName).toBe('span');
    expect(nodes[0]?.children?.[0]?.children?.[0]?.content).toBe('Inner');
  });

  it('should parse multiple siblings', () => {
    const nodes = parseHTML('<div>A</div><div>B</div><div>C</div>');

    expect(nodes).toHaveLength(3);
  });

  it('should handle whitespace', () => {
    const nodes = parseHTML('  <div>  Hello  </div>  ');

    expect(nodes).toHaveLength(1);
    expect(nodes[0]?.type).toBe('element');
  });

  it('should handle empty input', () => {
    const nodes = parseHTML('');

    expect(nodes).toHaveLength(0);
  });

  it('should handle whitespace-only input', () => {
    const nodes = parseHTML('   \n\t  ');

    expect(nodes).toHaveLength(0);
  });

  it('should handle mixed content', () => {
    const nodes = parseHTML('Text <b>bold</b> more text');

    expect(nodes).toHaveLength(3);
    expect(nodes[0]?.type).toBe('text');
    expect(nodes[1]?.type).toBe('element');
    expect(nodes[2]?.type).toBe('text');
  });

  it('should handle case-insensitive tags', () => {
    const nodes = parseHTML('<DIV>Content</div>');

    expect(nodes[0]?.tagName).toBe('div');
  });

  it('should handle attributes with spaces around equals', () => {
    const nodes = parseHTML('<div id = "main">Content</div>');

    expect(nodes[0]?.attributes?.id).toBe('main');
  });

  it('should handle closing tag for wrong element', () => {
    const nodes = parseHTML('<div>Content</span>');

    expect(nodes[0]?.tagName).toBe('div');
  });

  it('should parse all void elements', () => {
    const voidElements = [
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
      'link', 'meta', 'param', 'source', 'track', 'wbr',
    ];

    for (const tag of voidElements) {
      const nodes = parseHTML(`<${tag}>`);
      expect(nodes[0]?.tagName).toBe(tag);
      expect(nodes[0]?.children).toHaveLength(0);
    }
  });

  it('should parse data attributes', () => {
    const nodes = parseHTML('<div data-value="test">Content</div>');

    expect(nodes[0]?.attributes?.['data-value']).toBe('test');
  });
});

describe('serializeHTML', () => {
  it('should serialize simple element', () => {
    const html = serializeHTML([
      { type: 'element', tagName: 'div', attributes: {}, children: [] },
    ]);

    expect(html).toBe('<div></div>');
  });

  it('should serialize with text content', () => {
    const html = serializeHTML([
      {
        type: 'element',
        tagName: 'p',
        attributes: {},
        children: [{ type: 'text', content: 'Hello' }],
      },
    ]);

    expect(html).toBe('<p>Hello</p>');
  });

  it('should serialize with attributes', () => {
    const html = serializeHTML([
      {
        type: 'element',
        tagName: 'div',
        attributes: { id: 'main', class: 'container' },
        children: [],
      },
    ]);

    expect(html).toContain('id="main"');
    expect(html).toContain('class="container"');
  });

  it('should serialize comments', () => {
    const html = serializeHTML([{ type: 'comment', content: 'comment text' }]);

    expect(html).toBe('<!--comment text-->');
  });

  it('should serialize text nodes', () => {
    const html = serializeHTML([{ type: 'text', content: 'plain text' }]);

    expect(html).toBe('plain text');
  });

  it('should serialize void elements without closing tag', () => {
    const html = serializeHTML([
      { type: 'element', tagName: 'br', attributes: {}, children: [] },
    ]);

    expect(html).toBe('<br>');
  });

  it('should serialize nested elements', () => {
    const html = serializeHTML([
      {
        type: 'element',
        tagName: 'div',
        attributes: {},
        children: [
          {
            type: 'element',
            tagName: 'span',
            attributes: {},
            children: [{ type: 'text', content: 'Inner' }],
          },
        ],
      },
    ]);

    expect(html).toBe('<div><span>Inner</span></div>');
  });

  it('should serialize boolean attributes', () => {
    const html = serializeHTML([
      {
        type: 'element',
        tagName: 'input',
        attributes: { disabled: '' },
        children: [],
      },
    ]);

    expect(html).toContain('disabled');
  });

  it('should handle undefined content', () => {
    const html = serializeHTML([{ type: 'text' }]);

    expect(html).toBe('');
  });

  it('should handle undefined children', () => {
    const html = serializeHTML([
      { type: 'element', tagName: 'div', attributes: {} },
    ]);

    expect(html).toBe('<div></div>');
  });

  it('should handle undefined attributes', () => {
    const html = serializeHTML([
      { type: 'element', tagName: 'div', children: [] },
    ]);

    expect(html).toBe('<div></div>');
  });
});

describe('getTextContent', () => {
  it('should extract text from simple element', () => {
    const nodes = parseHTML('<p>Hello World</p>');
    const text = getTextContent(nodes);

    expect(text).toBe('Hello World');
  });

  it('should extract text from nested elements', () => {
    const nodes = parseHTML('<div><span>Hello</span><span>World</span></div>');
    const text = getTextContent(nodes);

    expect(text).toBe('HelloWorld');
  });

  it('should extract text from multiple elements', () => {
    const nodes = parseHTML('<p>First</p><p>Second</p>');
    const text = getTextContent(nodes);

    expect(text).toBe('FirstSecond');
  });

  it('should return empty for comment nodes', () => {
    const nodes = parseHTML('<!-- comment -->');
    const text = getTextContent(nodes);

    expect(text).toBe('');
  });

  it('should handle empty nodes array', () => {
    const text = getTextContent([]);

    expect(text).toBe('');
  });

  it('should handle deeply nested text', () => {
    const nodes = parseHTML('<div><p><span><b>Deep</b></span></p></div>');
    const text = getTextContent(nodes);

    expect(text).toBe('Deep');
  });
});

describe('round-trip parsing', () => {
  it('should preserve structure through parse-serialize cycle', () => {
    const original = '<div id="test"><p>Hello</p></div>';
    const nodes = parseHTML(original);
    const serialized = serializeHTML(nodes);

    expect(serialized).toBe(original);
  });

  it('should preserve comments', () => {
    const original = '<!-- comment -->';
    const nodes = parseHTML(original);
    const serialized = serializeHTML(nodes);

    expect(serialized).toBe(original);
  });
});
