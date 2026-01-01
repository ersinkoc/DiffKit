/**
 * HTML DOM diff plugin
 * Provides semantic diffing of HTML by parsing to DOM tree
 */

import type { DiffPlugin, HTMLDOMPluginOptions } from '../types.js';
import { parseHTML, serializeHTML } from './dom-parser.js';

export { parseHTML, serializeHTML } from './dom-parser.js';
export { diffDOM, nodesEqual, findMatchingNode } from './dom-differ.js';

/**
 * Create HTML DOM plugin
 */
export function htmlDomPlugin(options: HTMLDOMPluginOptions = {}): DiffPlugin {
  const {
    ignoreAttributes = [],
    ignoreComments = false,
    preserveWhitespace = false,
  } = options;

  return {
    name: 'html-dom',
    version: '1.0.0',

    onBeforeDiff(content: string): string {
      // Parse and normalize HTML
      let nodes = parseHTML(content);

      // Filter comments if needed
      if (ignoreComments) {
        nodes = filterComments(nodes);
      }

      // Filter attributes if needed
      if (ignoreAttributes.length > 0) {
        nodes = filterAttributes(nodes, ignoreAttributes);
      }

      // Normalize whitespace if not preserving
      if (!preserveWhitespace) {
        nodes = normalizeWhitespace(nodes);
      }

      return serializeHTML(nodes);
    },

    parse(content: string) {
      parseHTML(content);
      const tokens: { value: string; line: number; column: number; type: string }[] = [];
      const lineMap = new Map<number, typeof tokens>();

      // Convert DOM to tokens
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        const lineTokens = [
          {
            value: line,
            line: i + 1,
            column: 1,
            type: 'html',
          },
        ];
        tokens.push(...lineTokens);
        lineMap.set(i + 1, lineTokens);
      }

      return { tokens, lineMap };
    },
  };
}

/**
 * Filter comment nodes recursively
 */
function filterComments(nodes: ReturnType<typeof parseHTML>): ReturnType<typeof parseHTML> {
  return nodes
    .filter((node) => node.type !== 'comment')
    .map((node) => {
      if (node.type === 'element' && node.children) {
        return {
          ...node,
          children: filterComments(node.children),
        };
      }
      return node;
    });
}

/**
 * Filter specified attributes from nodes
 */
function filterAttributes(
  nodes: ReturnType<typeof parseHTML>,
  ignoreList: string[]
): ReturnType<typeof parseHTML> {
  return nodes.map((node) => {
    if (node.type === 'element') {
      const filteredAttrs = { ...node.attributes };
      for (const attr of ignoreList) {
        delete filteredAttrs[attr];
      }

      return {
        ...node,
        attributes: filteredAttrs,
        children: node.children ? filterAttributes(node.children, ignoreList) : [],
      };
    }
    return node;
  });
}

/**
 * Normalize whitespace in text nodes
 */
function normalizeWhitespace(nodes: ReturnType<typeof parseHTML>): ReturnType<typeof parseHTML> {
  return nodes
    .map((node) => {
      if (node.type === 'text') {
        const normalized = (node.content ?? '').replace(/\s+/g, ' ').trim();
        if (!normalized) return null;
        return { ...node, content: normalized };
      }
      if (node.type === 'element' && node.children) {
        return {
          ...node,
          children: normalizeWhitespace(node.children),
        };
      }
      return node;
    })
    .filter((node): node is NonNullable<typeof node> => node !== null);
}

export default htmlDomPlugin;
