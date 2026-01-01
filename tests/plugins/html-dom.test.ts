/**
 * HTML DOM plugin tests
 */

import { describe, it, expect } from 'vitest';
import { htmlDomPlugin, parseHTML, serializeHTML, diffDOM } from '../../src/plugins/html-dom/index.js';

describe('htmlDomPlugin', () => {
  it('should create plugin', () => {
    const plugin = htmlDomPlugin();

    expect(plugin.name).toBe('html-dom');
    expect(plugin.version).toBe('1.0.0');
  });

  it('should normalize HTML in onBeforeDiff', () => {
    const plugin = htmlDomPlugin({ preserveWhitespace: false });

    const html = '  <div>  hello  </div>  ';
    const result = plugin.onBeforeDiff!(html);

    expect(result).not.toContain('  hello  ');
  });

  it('should ignore comments when specified', () => {
    const plugin = htmlDomPlugin({ ignoreComments: true });

    const html = '<div><!-- comment --></div>';
    const result = plugin.onBeforeDiff!(html);

    expect(result).not.toContain('comment');
  });

  it('should ignore attributes when specified', () => {
    const plugin = htmlDomPlugin({ ignoreAttributes: ['id', 'class'] });

    const html = '<div id="test" class="foo">content</div>';
    const result = plugin.onBeforeDiff!(html);

    expect(result).not.toContain('id=');
    expect(result).not.toContain('class=');
  });
});

describe('parseHTML', () => {
  it('should parse simple element', () => {
    const nodes = parseHTML('<div>hello</div>');

    expect(nodes).toHaveLength(1);
    expect(nodes[0]!.type).toBe('element');
    expect(nodes[0]!.tagName).toBe('div');
  });

  it('should parse nested elements', () => {
    const nodes = parseHTML('<div><span>text</span></div>');

    expect(nodes).toHaveLength(1);
    expect(nodes[0]!.children).toHaveLength(1);
    expect(nodes[0]!.children![0]!.tagName).toBe('span');
  });

  it('should parse attributes', () => {
    const nodes = parseHTML('<div id="test" class="foo">content</div>');

    expect(nodes[0]!.attributes!['id']).toBe('test');
    expect(nodes[0]!.attributes!['class']).toBe('foo');
  });

  it('should parse text nodes', () => {
    const nodes = parseHTML('<div>hello world</div>');

    expect(nodes[0]!.children).toHaveLength(1);
    expect(nodes[0]!.children![0]!.type).toBe('text');
    expect(nodes[0]!.children![0]!.content).toBe('hello world');
  });

  it('should parse comments', () => {
    const nodes = parseHTML('<!-- comment -->');

    expect(nodes).toHaveLength(1);
    expect(nodes[0]!.type).toBe('comment');
    expect(nodes[0]!.content).toBe(' comment ');
  });

  it('should handle self-closing tags', () => {
    const nodes = parseHTML('<img src="test.jpg" />');

    expect(nodes).toHaveLength(1);
    expect(nodes[0]!.tagName).toBe('img');
  });

  it('should handle void elements', () => {
    const nodes = parseHTML('<br><hr><input>');

    expect(nodes).toHaveLength(3);
    expect(nodes[0]!.tagName).toBe('br');
    expect(nodes[1]!.tagName).toBe('hr');
    expect(nodes[2]!.tagName).toBe('input');
  });

  it('should handle empty string', () => {
    const nodes = parseHTML('');
    expect(nodes).toHaveLength(0);
  });

  it('should handle multiple root elements', () => {
    const nodes = parseHTML('<div>a</div><div>b</div>');

    expect(nodes).toHaveLength(2);
  });
});

describe('serializeHTML', () => {
  it('should serialize elements', () => {
    const nodes = [
      {
        type: 'element' as const,
        tagName: 'div',
        attributes: { id: 'test' },
        children: [{ type: 'text' as const, content: 'hello' }],
      },
    ];

    const html = serializeHTML(nodes);

    expect(html).toBe('<div id="test">hello</div>');
  });

  it('should serialize text nodes', () => {
    const nodes = [{ type: 'text' as const, content: 'hello' }];

    const html = serializeHTML(nodes);

    expect(html).toBe('hello');
  });

  it('should serialize comments', () => {
    const nodes = [{ type: 'comment' as const, content: ' comment ' }];

    const html = serializeHTML(nodes);

    expect(html).toBe('<!-- comment -->');
  });

  it('should serialize void elements without closing tag', () => {
    const nodes = [
      {
        type: 'element' as const,
        tagName: 'br',
        attributes: {},
        children: [],
      },
    ];

    const html = serializeHTML(nodes);

    expect(html).toBe('<br>');
  });
});

describe('diffDOM', () => {
  it('should detect additions', () => {
    const oldNodes = parseHTML('<div>a</div>');
    const newNodes = parseHTML('<div>a</div><div>b</div>');

    const diff = diffDOM(oldNodes, newNodes);

    expect(diff.some((d) => d.type === 'add')).toBe(true);
  });

  it('should detect deletions', () => {
    const oldNodes = parseHTML('<div>a</div><div>b</div>');
    const newNodes = parseHTML('<div>a</div>');

    const diff = diffDOM(oldNodes, newNodes);

    expect(diff.some((d) => d.type === 'delete')).toBe(true);
  });

  it('should detect text changes', () => {
    const oldNodes = parseHTML('<div>old</div>');
    const newNodes = parseHTML('<div>new</div>');

    const diff = diffDOM(oldNodes, newNodes);

    expect(diff.some((d) => d.type === 'modify')).toBe(true);
  });

  it('should detect attribute changes', () => {
    const oldNodes = parseHTML('<div id="old">text</div>');
    const newNodes = parseHTML('<div id="new">text</div>');

    const diff = diffDOM(oldNodes, newNodes);

    expect(diff.some((d) => d.type === 'modify')).toBe(true);
  });

  it('should handle identical nodes', () => {
    const nodes = parseHTML('<div>same</div>');

    const diff = diffDOM(nodes, nodes);

    expect(diff.every((d) => d.type === 'equal' || d === null)).toBe(true);
  });
});
