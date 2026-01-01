/**
 * DOM tree diffing logic
 */

import type { DOMNode, DOMDiffResult } from '../types.js';

/**
 * Diff two DOM trees
 */
export function diffDOM(oldNodes: DOMNode[], newNodes: DOMNode[]): DOMDiffResult[] {
  const results: DOMDiffResult[] = [];

  const maxLen = Math.max(oldNodes.length, newNodes.length);

  for (let i = 0; i < maxLen; i++) {
    const oldNode = oldNodes[i];
    const newNode = newNodes[i];

    if (!oldNode && newNode) {
      // Addition
      results.push({
        type: 'add',
        node: newNode,
      });
    } else if (oldNode && !newNode) {
      // Deletion
      results.push({
        type: 'delete',
        node: oldNode,
      });
    } else if (oldNode && newNode) {
      // Compare nodes
      const diff = diffNode(oldNode, newNode);
      if (diff) {
        results.push(diff);
      }
    }
  }

  return results;
}

/**
 * Diff two individual nodes
 */
function diffNode(oldNode: DOMNode, newNode: DOMNode): DOMDiffResult | null {
  // Different types
  if (oldNode.type !== newNode.type) {
    return {
      type: 'modify',
      node: newNode,
      changes: [
        {
          type: 'children',
          oldValue: nodeToString(oldNode),
          newValue: nodeToString(newNode),
        },
      ],
    };
  }

  switch (oldNode.type) {
    case 'text':
      if (oldNode.content !== newNode.content) {
        return {
          type: 'modify',
          node: newNode,
          changes: [
            {
              type: 'text',
              oldValue: oldNode.content,
              newValue: newNode.content,
            },
          ],
        };
      }
      return null;

    case 'comment':
      if (oldNode.content !== newNode.content) {
        return {
          type: 'modify',
          node: newNode,
          changes: [
            {
              type: 'text',
              oldValue: oldNode.content,
              newValue: newNode.content,
            },
          ],
        };
      }
      return null;

    case 'element':
      return diffElement(oldNode, newNode);
  }

  return null;
}

/**
 * Diff two element nodes
 */
function diffElement(oldNode: DOMNode, newNode: DOMNode): DOMDiffResult | null {
  const changes: DOMDiffResult['changes'] = [];

  // Check tag name
  if (oldNode.tagName !== newNode.tagName) {
    return {
      type: 'modify',
      node: newNode,
      changes: [
        {
          type: 'children',
          oldValue: `<${oldNode.tagName}>`,
          newValue: `<${newNode.tagName}>`,
        },
      ],
    };
  }

  // Check attributes
  const oldAttrs = oldNode.attributes ?? {};
  const newAttrs = newNode.attributes ?? {};
  const allAttrNames = new Set([...Object.keys(oldAttrs), ...Object.keys(newAttrs)]);

  for (const name of allAttrNames) {
    const oldValue = oldAttrs[name];
    const newValue = newAttrs[name];

    if (oldValue !== newValue) {
      changes.push({
        type: 'attribute',
        oldValue: oldValue ? `${name}="${oldValue}"` : undefined,
        newValue: newValue ? `${name}="${newValue}"` : undefined,
      });
    }
  }

  // Check children
  const oldChildren = oldNode.children ?? [];
  const newChildren = newNode.children ?? [];

  if (oldChildren.length !== newChildren.length) {
    const childDiffs = diffDOM(oldChildren, newChildren);
    if (childDiffs.length > 0) {
      changes.push({
        type: 'children',
        oldValue: `${oldChildren.length} children`,
        newValue: `${newChildren.length} children`,
      });
    }
  } else {
    // Same number of children, check each
    for (let i = 0; i < oldChildren.length; i++) {
      const oldChild = oldChildren[i];
      const newChild = newChildren[i];
      if (oldChild && newChild) {
        const childDiff = diffNode(oldChild, newChild);
        if (childDiff) {
          changes.push({
            type: 'children',
            oldValue: nodeToString(oldChild),
            newValue: nodeToString(newChild),
          });
        }
      }
    }
  }

  if (changes.length > 0) {
    return {
      type: 'modify',
      node: newNode,
      changes,
    };
  }

  return null;
}

/**
 * Convert node to string representation
 */
function nodeToString(node: DOMNode): string {
  switch (node.type) {
    case 'text':
      return node.content ?? '';
    case 'comment':
      return `<!--${node.content ?? ''}-->`;
    case 'element': {
      const tag = node.tagName ?? 'unknown';
      const attrs = Object.entries(node.attributes ?? {})
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ');
      return attrs ? `<${tag} ${attrs}>` : `<${tag}>`;
    }
  }
  return '';
}

/**
 * Check if two nodes are equal
 */
export function nodesEqual(a: DOMNode, b: DOMNode): boolean {
  if (a.type !== b.type) return false;

  switch (a.type) {
    case 'text':
    case 'comment':
      return a.content === b.content;

    case 'element':
      if (a.tagName !== b.tagName) return false;

      // Check attributes
      const aAttrs = a.attributes ?? {};
      const bAttrs = b.attributes ?? {};
      const aKeys = Object.keys(aAttrs);
      const bKeys = Object.keys(bAttrs);

      if (aKeys.length !== bKeys.length) return false;

      for (const key of aKeys) {
        if (aAttrs[key] !== bAttrs[key]) return false;
      }

      // Check children
      const aChildren = a.children ?? [];
      const bChildren = b.children ?? [];

      if (aChildren.length !== bChildren.length) return false;

      for (let i = 0; i < aChildren.length; i++) {
        const aChild = aChildren[i];
        const bChild = bChildren[i];
        if (aChild && bChild && !nodesEqual(aChild, bChild)) {
          return false;
        }
      }

      return true;
  }

  return false;
}

/**
 * Find matching node in a list
 */
export function findMatchingNode(node: DOMNode, candidates: DOMNode[]): number {
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    if (candidate && nodesEqual(node, candidate)) {
      return i;
    }
  }
  return -1;
}
