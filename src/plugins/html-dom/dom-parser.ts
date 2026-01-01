/**
 * Simple DOM parser for HTML diffing
 * Zero dependencies - built from scratch
 */

import type { DOMNode } from '../types.js';

/**
 * Parse HTML string into DOM tree
 */
export function parseHTML(html: string): DOMNode[] {
  const nodes: DOMNode[] = [];
  let pos = 0;

  while (pos < html.length) {
    const result = parseNode(html, pos);
    if (result) {
      nodes.push(result.node);
      pos = result.end;
    } else {
      pos++;
    }
  }

  return nodes;
}

/**
 * Parse a single node starting at position
 */
function parseNode(
  html: string,
  start: number
): { node: DOMNode; end: number } | null {
  // Skip whitespace
  while (start < html.length && /\s/.test(html[start]!)) {
    start++;
  }

  if (start >= html.length) {
    return null;
  }

  // Check for comment
  if (html.slice(start, start + 4) === '<!--') {
    return parseComment(html, start);
  }

  // Check for element
  if (html[start] === '<') {
    // Check for closing tag
    if (html[start + 1] === '/') {
      return null;
    }
    return parseElement(html, start);
  }

  // Text node
  return parseText(html, start);
}

/**
 * Parse comment node
 */
function parseComment(
  html: string,
  start: number
): { node: DOMNode; end: number } | null {
  const endIndex = html.indexOf('-->', start + 4);
  if (endIndex === -1) {
    return {
      node: {
        type: 'comment',
        content: html.slice(start + 4),
      },
      end: html.length,
    };
  }

  return {
    node: {
      type: 'comment',
      content: html.slice(start + 4, endIndex),
    },
    end: endIndex + 3,
  };
}

/**
 * Parse element node
 */
function parseElement(
  html: string,
  start: number
): { node: DOMNode; end: number } | null {
  // Find tag name
  let pos = start + 1;
  const tagStart = pos;

  while (pos < html.length && /[a-zA-Z0-9-]/.test(html[pos]!)) {
    pos++;
  }

  const tagName = html.slice(tagStart, pos).toLowerCase();
  if (!tagName) {
    return null;
  }

  // Parse attributes
  const attributes: Record<string, string> = {};

  while (pos < html.length) {
    // Skip whitespace
    while (pos < html.length && /\s/.test(html[pos]!)) {
      pos++;
    }

    // Check for end of opening tag
    if (html[pos] === '>') {
      pos++;
      break;
    }

    // Check for self-closing
    if (html[pos] === '/' && html[pos + 1] === '>') {
      return {
        node: {
          type: 'element',
          tagName,
          attributes,
          children: [],
        },
        end: pos + 2,
      };
    }

    // Parse attribute
    const attrResult = parseAttribute(html, pos);
    if (attrResult) {
      attributes[attrResult.name] = attrResult.value;
      pos = attrResult.end;
    } else {
      pos++;
    }
  }

  // Void elements
  const voidElements = [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
  ];

  if (voidElements.includes(tagName)) {
    return {
      node: {
        type: 'element',
        tagName,
        attributes,
        children: [],
      },
      end: pos,
    };
  }

  // Parse children
  const children: DOMNode[] = [];
  const closingTag = `</${tagName}>`;

  while (pos < html.length) {
    // Check for closing tag
    const remaining = html.slice(pos).toLowerCase();
    if (remaining.startsWith(closingTag)) {
      pos += closingTag.length;
      break;
    }

    const childResult = parseNode(html, pos);
    if (childResult) {
      children.push(childResult.node);
      pos = childResult.end;
    } else {
      // Check if we hit a closing tag
      if (html[pos] === '<' && html[pos + 1] === '/') {
        // Find actual closing tag
        const closeEnd = html.indexOf('>', pos);
        if (closeEnd !== -1) {
          pos = closeEnd + 1;
          break;
        }
      }
      pos++;
    }
  }

  return {
    node: {
      type: 'element',
      tagName,
      attributes,
      children,
    },
    end: pos,
  };
}

/**
 * Parse attribute
 */
function parseAttribute(
  html: string,
  start: number
): { name: string; value: string; end: number } | null {
  let pos = start;

  // Parse attribute name
  const nameStart = pos;
  while (pos < html.length && /[a-zA-Z0-9-_:]/.test(html[pos]!)) {
    pos++;
  }

  const name = html.slice(nameStart, pos).toLowerCase();
  if (!name) {
    return null;
  }

  // Skip whitespace
  while (pos < html.length && /\s/.test(html[pos]!)) {
    pos++;
  }

  // Check for value
  if (html[pos] !== '=') {
    return { name, value: '', end: pos };
  }

  pos++; // Skip =

  // Skip whitespace
  while (pos < html.length && /\s/.test(html[pos]!)) {
    pos++;
  }

  // Parse value
  let value: string;
  const quote = html[pos];

  if (quote === '"' || quote === "'") {
    pos++;
    const valueStart = pos;
    while (pos < html.length && html[pos] !== quote) {
      pos++;
    }
    value = html.slice(valueStart, pos);
    pos++; // Skip closing quote
  } else {
    const valueStart = pos;
    while (pos < html.length && !/[\s>]/.test(html[pos]!)) {
      pos++;
    }
    value = html.slice(valueStart, pos);
  }

  return { name, value, end: pos };
}

/**
 * Parse text node
 */
function parseText(
  html: string,
  start: number
): { node: DOMNode; end: number } | null {
  let pos = start;

  while (pos < html.length && html[pos] !== '<') {
    pos++;
  }

  const content = html.slice(start, pos);

  // Skip empty text nodes
  if (!content.trim()) {
    return null;
  }

  return {
    node: {
      type: 'text',
      content,
    },
    end: pos,
  };
}

/**
 * Serialize DOM tree back to HTML
 */
export function serializeHTML(nodes: DOMNode[]): string {
  return nodes.map(serializeNode).join('');
}

/**
 * Serialize a single node
 */
function serializeNode(node: DOMNode): string {
  switch (node.type) {
    case 'comment':
      return `<!--${node.content ?? ''}-->`;

    case 'text':
      return node.content ?? '';

    case 'element': {
      const attrs = Object.entries(node.attributes ?? {})
        .map(([name, value]) => (value ? `${name}="${value}"` : name))
        .join(' ');

      const opening = attrs ? `<${node.tagName} ${attrs}>` : `<${node.tagName}>`;

      const voidElements = [
        'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
        'link', 'meta', 'param', 'source', 'track', 'wbr',
      ];

      if (voidElements.includes(node.tagName ?? '')) {
        return opening;
      }

      const children = (node.children ?? []).map(serializeNode).join('');
      return `${opening}${children}</${node.tagName}>`;
    }

    default:
      return '';
  }
}

/**
 * Get text content of a DOM tree
 */
export function getTextContent(nodes: DOMNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text') {
        return node.content ?? '';
      }
      if (node.type === 'element' && node.children) {
        return getTextContent(node.children);
      }
      return '';
    })
    .join('');
}
