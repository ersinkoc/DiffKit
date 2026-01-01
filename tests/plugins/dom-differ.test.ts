/**
 * Tests for DOM differ
 */

import { describe, it, expect } from 'vitest';
import {
  diffDOM,
  nodesEqual,
  findMatchingNode,
} from '../../src/plugins/html-dom/dom-differ.js';
import type { DOMNode } from '../../src/plugins/types.js';

describe('diffDOM', () => {
  it('should detect node addition', () => {
    const oldNodes: DOMNode[] = [];
    const newNodes: DOMNode[] = [{ type: 'text', content: 'new' }];

    const diffs = diffDOM(oldNodes, newNodes);

    expect(diffs).toHaveLength(1);
    expect(diffs[0]?.type).toBe('add');
  });

  it('should detect node deletion', () => {
    const oldNodes: DOMNode[] = [{ type: 'text', content: 'old' }];
    const newNodes: DOMNode[] = [];

    const diffs = diffDOM(oldNodes, newNodes);

    expect(diffs).toHaveLength(1);
    expect(diffs[0]?.type).toBe('delete');
  });

  it('should detect text content modification', () => {
    const oldNodes: DOMNode[] = [{ type: 'text', content: 'old text' }];
    const newNodes: DOMNode[] = [{ type: 'text', content: 'new text' }];

    const diffs = diffDOM(oldNodes, newNodes);

    expect(diffs).toHaveLength(1);
    expect(diffs[0]?.type).toBe('modify');
  });

  it('should detect comment modification', () => {
    const oldNodes: DOMNode[] = [{ type: 'comment', content: 'old comment' }];
    const newNodes: DOMNode[] = [{ type: 'comment', content: 'new comment' }];

    const diffs = diffDOM(oldNodes, newNodes);

    expect(diffs).toHaveLength(1);
    expect(diffs[0]?.type).toBe('modify');
  });

  it('should detect element tag name change', () => {
    const oldNodes: DOMNode[] = [{ type: 'element', tagName: 'div', attributes: {}, children: [] }];
    const newNodes: DOMNode[] = [{ type: 'element', tagName: 'span', attributes: {}, children: [] }];

    const diffs = diffDOM(oldNodes, newNodes);

    expect(diffs).toHaveLength(1);
    expect(diffs[0]?.type).toBe('modify');
  });

  it('should detect attribute changes', () => {
    const oldNodes: DOMNode[] = [
      { type: 'element', tagName: 'div', attributes: { class: 'old' }, children: [] },
    ];
    const newNodes: DOMNode[] = [
      { type: 'element', tagName: 'div', attributes: { class: 'new' }, children: [] },
    ];

    const diffs = diffDOM(oldNodes, newNodes);

    expect(diffs).toHaveLength(1);
    expect(diffs[0]?.type).toBe('modify');
    expect(diffs[0]?.changes?.some((c) => c.type === 'attribute')).toBe(true);
  });

  it('should detect attribute addition', () => {
    const oldNodes: DOMNode[] = [
      { type: 'element', tagName: 'div', attributes: {}, children: [] },
    ];
    const newNodes: DOMNode[] = [
      { type: 'element', tagName: 'div', attributes: { id: 'test' }, children: [] },
    ];

    const diffs = diffDOM(oldNodes, newNodes);

    expect(diffs).toHaveLength(1);
    expect(diffs[0]?.changes?.some((c) => c.type === 'attribute')).toBe(true);
  });

  it('should detect attribute removal', () => {
    const oldNodes: DOMNode[] = [
      { type: 'element', tagName: 'div', attributes: { id: 'test' }, children: [] },
    ];
    const newNodes: DOMNode[] = [
      { type: 'element', tagName: 'div', attributes: {}, children: [] },
    ];

    const diffs = diffDOM(oldNodes, newNodes);

    expect(diffs).toHaveLength(1);
    expect(diffs[0]?.changes?.some((c) => c.type === 'attribute')).toBe(true);
  });

  it('should detect children count change', () => {
    const oldNodes: DOMNode[] = [
      {
        type: 'element',
        tagName: 'div',
        attributes: {},
        children: [{ type: 'text', content: 'a' }],
      },
    ];
    const newNodes: DOMNode[] = [
      {
        type: 'element',
        tagName: 'div',
        attributes: {},
        children: [
          { type: 'text', content: 'a' },
          { type: 'text', content: 'b' },
        ],
      },
    ];

    const diffs = diffDOM(oldNodes, newNodes);

    expect(diffs).toHaveLength(1);
    expect(diffs[0]?.changes?.some((c) => c.type === 'children')).toBe(true);
  });

  it('should detect child content change', () => {
    const oldNodes: DOMNode[] = [
      {
        type: 'element',
        tagName: 'div',
        attributes: {},
        children: [{ type: 'text', content: 'old' }],
      },
    ];
    const newNodes: DOMNode[] = [
      {
        type: 'element',
        tagName: 'div',
        attributes: {},
        children: [{ type: 'text', content: 'new' }],
      },
    ];

    const diffs = diffDOM(oldNodes, newNodes);

    expect(diffs).toHaveLength(1);
    expect(diffs[0]?.changes?.some((c) => c.type === 'children')).toBe(true);
  });

  it('should return empty array for identical nodes', () => {
    const nodes: DOMNode[] = [{ type: 'text', content: 'same' }];

    const diffs = diffDOM(nodes, nodes);

    expect(diffs).toHaveLength(0);
  });

  it('should handle node type change', () => {
    const oldNodes: DOMNode[] = [{ type: 'text', content: 'text' }];
    const newNodes: DOMNode[] = [{ type: 'comment', content: 'comment' }];

    const diffs = diffDOM(oldNodes, newNodes);

    expect(diffs).toHaveLength(1);
    expect(diffs[0]?.type).toBe('modify');
  });

  it('should handle undefined attributes', () => {
    const oldNodes: DOMNode[] = [{ type: 'element', tagName: 'div', children: [] }];
    const newNodes: DOMNode[] = [{ type: 'element', tagName: 'div', children: [] }];

    const diffs = diffDOM(oldNodes, newNodes);

    expect(diffs).toHaveLength(0);
  });

  it('should handle undefined children', () => {
    const oldNodes: DOMNode[] = [{ type: 'element', tagName: 'div', attributes: {} }];
    const newNodes: DOMNode[] = [{ type: 'element', tagName: 'div', attributes: {} }];

    const diffs = diffDOM(oldNodes, newNodes);

    expect(diffs).toHaveLength(0);
  });
});

describe('nodesEqual', () => {
  it('should return true for identical text nodes', () => {
    const a: DOMNode = { type: 'text', content: 'hello' };
    const b: DOMNode = { type: 'text', content: 'hello' };

    expect(nodesEqual(a, b)).toBe(true);
  });

  it('should return false for different text content', () => {
    const a: DOMNode = { type: 'text', content: 'hello' };
    const b: DOMNode = { type: 'text', content: 'world' };

    expect(nodesEqual(a, b)).toBe(false);
  });

  it('should return true for identical comment nodes', () => {
    const a: DOMNode = { type: 'comment', content: 'comment' };
    const b: DOMNode = { type: 'comment', content: 'comment' };

    expect(nodesEqual(a, b)).toBe(true);
  });

  it('should return false for different comment content', () => {
    const a: DOMNode = { type: 'comment', content: 'old' };
    const b: DOMNode = { type: 'comment', content: 'new' };

    expect(nodesEqual(a, b)).toBe(false);
  });

  it('should return false for different node types', () => {
    const a: DOMNode = { type: 'text', content: 'text' };
    const b: DOMNode = { type: 'comment', content: 'text' };

    expect(nodesEqual(a, b)).toBe(false);
  });

  it('should return true for identical element nodes', () => {
    const a: DOMNode = {
      type: 'element',
      tagName: 'div',
      attributes: { class: 'test' },
      children: [{ type: 'text', content: 'hello' }],
    };
    const b: DOMNode = {
      type: 'element',
      tagName: 'div',
      attributes: { class: 'test' },
      children: [{ type: 'text', content: 'hello' }],
    };

    expect(nodesEqual(a, b)).toBe(true);
  });

  it('should return false for different tag names', () => {
    const a: DOMNode = { type: 'element', tagName: 'div', attributes: {}, children: [] };
    const b: DOMNode = { type: 'element', tagName: 'span', attributes: {}, children: [] };

    expect(nodesEqual(a, b)).toBe(false);
  });

  it('should return false for different attributes', () => {
    const a: DOMNode = { type: 'element', tagName: 'div', attributes: { id: 'a' }, children: [] };
    const b: DOMNode = { type: 'element', tagName: 'div', attributes: { id: 'b' }, children: [] };

    expect(nodesEqual(a, b)).toBe(false);
  });

  it('should return false for different number of attributes', () => {
    const a: DOMNode = { type: 'element', tagName: 'div', attributes: { id: 'a' }, children: [] };
    const b: DOMNode = {
      type: 'element',
      tagName: 'div',
      attributes: { id: 'a', class: 'b' },
      children: [],
    };

    expect(nodesEqual(a, b)).toBe(false);
  });

  it('should return false for different children count', () => {
    const a: DOMNode = {
      type: 'element',
      tagName: 'div',
      attributes: {},
      children: [{ type: 'text', content: 'a' }],
    };
    const b: DOMNode = {
      type: 'element',
      tagName: 'div',
      attributes: {},
      children: [
        { type: 'text', content: 'a' },
        { type: 'text', content: 'b' },
      ],
    };

    expect(nodesEqual(a, b)).toBe(false);
  });

  it('should return false for different children content', () => {
    const a: DOMNode = {
      type: 'element',
      tagName: 'div',
      attributes: {},
      children: [{ type: 'text', content: 'old' }],
    };
    const b: DOMNode = {
      type: 'element',
      tagName: 'div',
      attributes: {},
      children: [{ type: 'text', content: 'new' }],
    };

    expect(nodesEqual(a, b)).toBe(false);
  });

  it('should handle undefined attributes', () => {
    const a: DOMNode = { type: 'element', tagName: 'div', children: [] };
    const b: DOMNode = { type: 'element', tagName: 'div', children: [] };

    expect(nodesEqual(a, b)).toBe(true);
  });

  it('should handle undefined children', () => {
    const a: DOMNode = { type: 'element', tagName: 'div', attributes: {} };
    const b: DOMNode = { type: 'element', tagName: 'div', attributes: {} };

    expect(nodesEqual(a, b)).toBe(true);
  });
});

describe('findMatchingNode', () => {
  it('should find matching node', () => {
    const node: DOMNode = { type: 'text', content: 'target' };
    const candidates: DOMNode[] = [
      { type: 'text', content: 'other' },
      { type: 'text', content: 'target' },
      { type: 'text', content: 'another' },
    ];

    const index = findMatchingNode(node, candidates);

    expect(index).toBe(1);
  });

  it('should return first match when multiple exist', () => {
    const node: DOMNode = { type: 'text', content: 'dup' };
    const candidates: DOMNode[] = [
      { type: 'text', content: 'dup' },
      { type: 'text', content: 'dup' },
    ];

    const index = findMatchingNode(node, candidates);

    expect(index).toBe(0);
  });

  it('should return -1 when no match found', () => {
    const node: DOMNode = { type: 'text', content: 'missing' };
    const candidates: DOMNode[] = [
      { type: 'text', content: 'a' },
      { type: 'text', content: 'b' },
    ];

    const index = findMatchingNode(node, candidates);

    expect(index).toBe(-1);
  });

  it('should return -1 for empty candidates', () => {
    const node: DOMNode = { type: 'text', content: 'text' };

    const index = findMatchingNode(node, []);

    expect(index).toBe(-1);
  });

  it('should match element nodes', () => {
    const node: DOMNode = {
      type: 'element',
      tagName: 'div',
      attributes: { id: 'test' },
      children: [],
    };
    const candidates: DOMNode[] = [
      { type: 'element', tagName: 'span', attributes: {}, children: [] },
      { type: 'element', tagName: 'div', attributes: { id: 'test' }, children: [] },
    ];

    const index = findMatchingNode(node, candidates);

    expect(index).toBe(1);
  });
});
