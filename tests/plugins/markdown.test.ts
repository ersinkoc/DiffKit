/**
 * Markdown plugin tests
 */

import { describe, it, expect } from 'vitest';
import {
  markdownPlugin,
  parseMarkdown,
  serializeMarkdown,
  getPlainText,
} from '../../src/plugins/markdown/index.js';

describe('markdownPlugin', () => {
  it('should create plugin', () => {
    const plugin = markdownPlugin();

    expect(plugin.name).toBe('markdown');
    expect(plugin.version).toBe('1.0.0');
  });

  it('should normalize markdown when ignoreFormatting', () => {
    const plugin = markdownPlugin({ ignoreFormatting: true });

    const md = '# Heading\n\nParagraph';
    const result = plugin.onBeforeDiff!(md);

    expect(result).toContain('# Heading');
    expect(result).toContain('Paragraph');
  });

  it('should extract plain text when both options enabled', () => {
    const plugin = markdownPlugin({
      preserveStructure: false,
      ignoreFormatting: true,
    });

    const md = '# **Bold Heading**\n\n*italic* text';
    const result = plugin.onBeforeDiff!(md);

    expect(result).not.toContain('*');
    expect(result).not.toContain('#');
  });
});

describe('parseMarkdown', () => {
  describe('headings', () => {
    it('should parse headings', () => {
      const blocks = parseMarkdown('# Heading 1\n## Heading 2');

      expect(blocks).toHaveLength(2);
      expect(blocks[0]!.type).toBe('heading');
      expect(blocks[0]!.level).toBe(1);
      expect(blocks[1]!.level).toBe(2);
    });

    it('should parse heading content', () => {
      const blocks = parseMarkdown('# My Title');

      expect(blocks[0]!.content).toBe('My Title');
    });
  });

  describe('paragraphs', () => {
    it('should parse paragraphs', () => {
      const blocks = parseMarkdown('First paragraph.\n\nSecond paragraph.');

      const paragraphs = blocks.filter((b) => b.type === 'paragraph');
      expect(paragraphs.length).toBe(2);
    });
  });

  describe('code blocks', () => {
    it('should parse fenced code blocks', () => {
      const blocks = parseMarkdown('```javascript\nconst x = 1;\n```');

      expect(blocks).toHaveLength(1);
      expect(blocks[0]!.type).toBe('code');
      expect(blocks[0]!.language).toBe('javascript');
      expect(blocks[0]!.content).toBe('const x = 1;');
    });

    it('should handle code blocks without language', () => {
      const blocks = parseMarkdown('```\ncode\n```');

      expect(blocks[0]!.type).toBe('code');
      expect(blocks[0]!.language).toBeUndefined();
    });
  });

  describe('blockquotes', () => {
    it('should parse blockquotes', () => {
      const blocks = parseMarkdown('> This is a quote');

      expect(blocks).toHaveLength(1);
      expect(blocks[0]!.type).toBe('blockquote');
    });

    it('should parse multi-line blockquotes', () => {
      const blocks = parseMarkdown('> Line 1\n> Line 2');

      expect(blocks).toHaveLength(1);
      expect(blocks[0]!.content).toContain('Line 1');
      expect(blocks[0]!.content).toContain('Line 2');
    });
  });

  describe('lists', () => {
    it('should parse unordered lists', () => {
      const blocks = parseMarkdown('- Item 1\n- Item 2');

      expect(blocks).toHaveLength(1);
      expect(blocks[0]!.type).toBe('list');
      expect(blocks[0]!.ordered).toBe(false);
      expect(blocks[0]!.children).toHaveLength(2);
    });

    it('should parse ordered lists', () => {
      const blocks = parseMarkdown('1. First\n2. Second');

      expect(blocks).toHaveLength(1);
      expect(blocks[0]!.type).toBe('list');
      expect(blocks[0]!.ordered).toBe(true);
    });

    it('should handle different bullet markers', () => {
      const blocks = parseMarkdown('* Item 1\n+ Item 2\n- Item 3');

      expect(blocks[0]!.children).toHaveLength(3);
    });
  });

  describe('horizontal rules', () => {
    it('should parse horizontal rules', () => {
      const blocks = parseMarkdown('---');

      expect(blocks).toHaveLength(1);
      expect(blocks[0]!.type).toBe('hr');
    });

    it('should handle different hr styles', () => {
      expect(parseMarkdown('---')[0]!.type).toBe('hr');
      expect(parseMarkdown('***')[0]!.type).toBe('hr');
      expect(parseMarkdown('___')[0]!.type).toBe('hr');
    });
  });

  describe('tables', () => {
    it('should parse tables', () => {
      const blocks = parseMarkdown('| A | B |\n|---|---|\n| 1 | 2 |');

      expect(blocks).toHaveLength(1);
      expect(blocks[0]!.type).toBe('table');
    });
  });
});

describe('serializeMarkdown', () => {
  it('should serialize headings', () => {
    const blocks = [{ type: 'heading' as const, level: 2, content: 'Title' }];
    const result = serializeMarkdown(blocks);

    expect(result).toBe('## Title');
  });

  it('should serialize paragraphs', () => {
    const blocks = [{ type: 'paragraph' as const, content: 'Text here' }];
    const result = serializeMarkdown(blocks);

    expect(result).toBe('Text here');
  });

  it('should serialize code blocks', () => {
    const blocks = [{ type: 'code' as const, language: 'js', content: 'code' }];
    const result = serializeMarkdown(blocks);

    expect(result).toContain('```js');
    expect(result).toContain('code');
    expect(result).toContain('```');
  });

  it('should serialize lists', () => {
    const blocks = [
      {
        type: 'list' as const,
        ordered: false,
        content: '',
        children: [
          { type: 'listItem' as const, content: 'a' },
          { type: 'listItem' as const, content: 'b' },
        ],
      },
    ];
    const result = serializeMarkdown(blocks);

    expect(result).toContain('- a');
    expect(result).toContain('- b');
  });

  it('should serialize ordered lists', () => {
    const blocks = [
      {
        type: 'list' as const,
        ordered: true,
        content: '',
        children: [
          { type: 'listItem' as const, content: 'a' },
          { type: 'listItem' as const, content: 'b' },
        ],
      },
    ];
    const result = serializeMarkdown(blocks);

    expect(result).toContain('1. a');
    expect(result).toContain('2. b');
  });
});

describe('getPlainText', () => {
  it('should extract text from headings', () => {
    const blocks = parseMarkdown('# Title');
    const text = getPlainText(blocks);

    expect(text).toBe('Title');
  });

  it('should strip inline formatting', () => {
    const blocks = parseMarkdown('**bold** and *italic*');
    const text = getPlainText(blocks);

    expect(text).toBe('bold and italic');
  });

  it('should extract text from links', () => {
    const blocks = parseMarkdown('[link text](http://example.com)');
    const text = getPlainText(blocks);

    expect(text).toBe('link text');
  });

  it('should preserve code content', () => {
    const blocks = parseMarkdown('```\ncode here\n```');
    const text = getPlainText(blocks);

    expect(text).toBe('code here');
  });
});
