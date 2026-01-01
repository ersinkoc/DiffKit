/**
 * Markdown structure parser
 */

import type { MarkdownBlock } from '../types.js';

/**
 * Parse markdown into blocks
 */
export function parseMarkdown(content: string): MarkdownBlock[] {
  const lines = content.split('\n');
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const result = parseBlock(lines, i);
    if (result) {
      blocks.push(result.block);
      i = result.endIndex;
    } else {
      i++;
    }
  }

  return blocks;
}

/**
 * Parse a single block starting at index
 */
function parseBlock(
  lines: string[],
  startIndex: number
): { block: MarkdownBlock; endIndex: number } | null {
  const line = lines[startIndex];
  if (line === undefined) return null;

  // Skip empty lines
  if (line.trim() === '') {
    return null;
  }

  // Fenced code block
  const codeMatch = line.match(/^(`{3,}|~{3,})(\w*)/);
  if (codeMatch) {
    return parseCodeBlock(lines, startIndex, codeMatch[1]!, codeMatch[2]);
  }

  // Heading
  const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
  if (headingMatch) {
    return {
      block: {
        type: 'heading',
        level: headingMatch[1]!.length,
        content: headingMatch[2]!,
      },
      endIndex: startIndex + 1,
    };
  }

  // Horizontal rule
  if (/^(?:---+|\*\*\*+|___+)\s*$/.test(line)) {
    return {
      block: {
        type: 'hr',
        content: line,
      },
      endIndex: startIndex + 1,
    };
  }

  // Blockquote
  if (line.startsWith('>')) {
    return parseBlockquote(lines, startIndex);
  }

  // Unordered list
  if (/^[\t ]*[-*+]\s/.test(line)) {
    return parseList(lines, startIndex, false);
  }

  // Ordered list
  if (/^[\t ]*\d+\.\s/.test(line)) {
    return parseList(lines, startIndex, true);
  }

  // HTML block
  if (/^<[a-zA-Z][^>]*>/.test(line)) {
    return parseHtmlBlock(lines, startIndex);
  }

  // Table
  if (line.includes('|') && startIndex + 1 < lines.length) {
    const nextLine = lines[startIndex + 1];
    if (nextLine && /^\s*\|?\s*[-:]+\s*\|/.test(nextLine)) {
      return parseTable(lines, startIndex);
    }
  }

  // Paragraph
  return parseParagraph(lines, startIndex);
}

/**
 * Parse fenced code block
 */
function parseCodeBlock(
  lines: string[],
  startIndex: number,
  fence: string,
  language: string | undefined
): { block: MarkdownBlock; endIndex: number } {
  const contentLines: string[] = [];
  let i = startIndex + 1;

  while (i < lines.length) {
    const line = lines[i]!;
    if (line.startsWith(fence)) {
      i++;
      break;
    }
    contentLines.push(line);
    i++;
  }

  return {
    block: {
      type: 'code',
      content: contentLines.join('\n'),
      language: language || undefined,
    },
    endIndex: i,
  };
}

/**
 * Parse blockquote
 */
function parseBlockquote(
  lines: string[],
  startIndex: number
): { block: MarkdownBlock; endIndex: number } {
  const contentLines: string[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i]!;
    if (line.startsWith('>')) {
      contentLines.push(line.replace(/^>\s?/, ''));
      i++;
    } else if (line.trim() === '' && i + 1 < lines.length && lines[i + 1]?.startsWith('>')) {
      contentLines.push('');
      i++;
    } else {
      break;
    }
  }

  return {
    block: {
      type: 'blockquote',
      content: contentLines.join('\n'),
      children: parseMarkdown(contentLines.join('\n')),
    },
    endIndex: i,
  };
}

/**
 * Parse list (ordered or unordered)
 */
function parseList(
  lines: string[],
  startIndex: number,
  ordered: boolean
): { block: MarkdownBlock; endIndex: number } {
  const items: MarkdownBlock[] = [];
  let i = startIndex;
  const listPattern = ordered ? /^[\t ]*\d+\.\s/ : /^[\t ]*[-*+]\s/;

  while (i < lines.length) {
    const line = lines[i]!;

    if (listPattern.test(line)) {
      const content = line.replace(listPattern, '');
      items.push({
        type: 'listItem',
        content,
      });
      i++;
    } else if (line.trim() === '') {
      // Empty line might continue list or end it
      if (i + 1 < lines.length && listPattern.test(lines[i + 1]!)) {
        i++;
      } else {
        break;
      }
    } else if (/^\s+/.test(line)) {
      // Continuation of previous item
      if (items.length > 0) {
        const lastItem = items[items.length - 1]!;
        lastItem.content += '\n' + line.trim();
      }
      i++;
    } else {
      break;
    }
  }

  return {
    block: {
      type: 'list',
      content: '',
      ordered,
      children: items,
    },
    endIndex: i,
  };
}

/**
 * Parse HTML block
 */
function parseHtmlBlock(
  lines: string[],
  startIndex: number
): { block: MarkdownBlock; endIndex: number } {
  const contentLines: string[] = [];
  let i = startIndex;
  let depth = 0;

  while (i < lines.length) {
    const line = lines[i]!;
    contentLines.push(line);

    // Count opening and closing tags (simplified)
    const opens = (line.match(/<[a-zA-Z][^>]*>/g) ?? []).length;
    const closes = (line.match(/<\/[a-zA-Z]+>/g) ?? []).length;
    const selfClose = (line.match(/<[^>]+\/>/g) ?? []).length;

    depth += opens - closes - selfClose;
    i++;

    if (depth <= 0 && i > startIndex) {
      break;
    }
  }

  return {
    block: {
      type: 'html',
      content: contentLines.join('\n'),
    },
    endIndex: i,
  };
}

/**
 * Parse table
 */
function parseTable(
  lines: string[],
  startIndex: number
): { block: MarkdownBlock; endIndex: number } {
  const contentLines: string[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i]!;
    if (line.includes('|') || /^\s*[-:]+\s*$/.test(line)) {
      contentLines.push(line);
      i++;
    } else if (line.trim() === '') {
      break;
    } else {
      break;
    }
  }

  return {
    block: {
      type: 'table',
      content: contentLines.join('\n'),
    },
    endIndex: i,
  };
}

/**
 * Parse paragraph
 */
function parseParagraph(
  lines: string[],
  startIndex: number
): { block: MarkdownBlock; endIndex: number } {
  const contentLines: string[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i]!;

    // Check for block-level element that ends paragraph
    if (
      line.trim() === '' ||
      /^#{1,6}\s/.test(line) ||
      /^(?:---+|\*\*\*+|___+)\s*$/.test(line) ||
      /^>\s/.test(line) ||
      /^[\t ]*[-*+]\s/.test(line) ||
      /^[\t ]*\d+\.\s/.test(line) ||
      /^(`{3,}|~{3,})/.test(line)
    ) {
      break;
    }

    contentLines.push(line);
    i++;
  }

  return {
    block: {
      type: 'paragraph',
      content: contentLines.join('\n'),
    },
    endIndex: i,
  };
}

/**
 * Serialize blocks back to markdown
 */
export function serializeMarkdown(blocks: MarkdownBlock[]): string {
  return blocks.map(serializeBlock).join('\n\n');
}

/**
 * Serialize a single block
 */
function serializeBlock(block: MarkdownBlock): string {
  switch (block.type) {
    case 'heading':
      return '#'.repeat(block.level ?? 1) + ' ' + block.content;

    case 'paragraph':
      return block.content;

    case 'code':
      return '```' + (block.language ?? '') + '\n' + block.content + '\n```';

    case 'blockquote':
      return block.content
        .split('\n')
        .map((line) => '> ' + line)
        .join('\n');

    case 'list':
      return (block.children ?? [])
        .map((item, idx) => {
          const prefix = block.ordered ? `${idx + 1}. ` : '- ';
          return prefix + item.content;
        })
        .join('\n');

    case 'listItem':
      return '- ' + block.content;

    case 'hr':
      return '---';

    case 'table':
    case 'html':
      return block.content;

    default:
      return block.content;
  }
}

/**
 * Get plain text from markdown
 */
export function getPlainText(blocks: MarkdownBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading':
        case 'paragraph':
          return stripInlineMarkdown(block.content);

        case 'blockquote':
          return block.children ? getPlainText(block.children) : stripInlineMarkdown(block.content);

        case 'list':
          return block.children ? getPlainText(block.children) : '';

        case 'listItem':
          return stripInlineMarkdown(block.content);

        case 'code':
          return block.content;

        default:
          return '';
      }
    })
    .filter((text) => text.length > 0)
    .join('\n\n');
}

/**
 * Strip inline markdown formatting
 */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/_([^_]+)_/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1') // Strikethrough
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1'); // Images
}
