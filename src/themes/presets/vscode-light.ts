/**
 * VS Code Light theme preset
 */

import type { Theme } from '../types.js';

export const vscodeLight: Theme = {
  name: 'vscode-light',
  type: 'light',
  colors: {
    background: '#ffffff',
    gutterBackground: '#f3f3f3',
    headerBackground: '#e8e8e8',
    addedBackground: '#e2f6d9',
    addedGutterBackground: '#c8e6c9',
    addedText: '#2e7d32',
    addedHighlight: '#81c784',
    deletedBackground: '#fde7e9',
    deletedGutterBackground: '#ffcdd2',
    deletedText: '#c62828',
    deletedHighlight: '#ef9a9a',
    modifiedBackground: '#fff8e1',
    modifiedText: '#f57f17',
    unchangedText: '#000000',
    lineNumber: '#999999',
    lineNumberActive: '#0a0a0a',
    border: '#d4d4d4',
    hunkBorder: '#e8e8e8',
    syntax: {
      keyword: '#0000ff',
      string: '#a31515',
      number: '#098658',
      comment: '#008000',
      function: '#795e26',
      variable: '#001080',
      operator: '#000000',
      punctuation: '#000000',
      tag: '#800000',
      attribute: '#ff0000',
      property: '#001080',
      className: '#267f99',
      regexp: '#811f3f',
    },
  },
  fonts: {
    family: "'Cascadia Code', Consolas, 'Courier New', monospace",
    size: '14px',
    lineHeight: 1.5,
  },
  spacing: {
    gutterWidth: '50px',
    lineNumberPadding: '8px',
    contentPadding: '12px',
    hunkGap: '8px',
  },
  borders: {
    radius: '4px',
    width: '1px',
  },
};

export default vscodeLight;
