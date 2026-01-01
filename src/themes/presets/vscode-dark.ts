/**
 * VS Code Dark theme preset
 */

import type { Theme } from '../types.js';

export const vscodeDark: Theme = {
  name: 'vscode-dark',
  type: 'dark',
  colors: {
    background: '#1e1e1e',
    gutterBackground: '#252526',
    headerBackground: '#2d2d2d',
    addedBackground: '#2a3a2e',
    addedGutterBackground: '#1e3a2e',
    addedText: '#89d185',
    addedHighlight: '#3a7d44',
    deletedBackground: '#3a2a2e',
    deletedGutterBackground: '#3a1e2e',
    deletedText: '#f48771',
    deletedHighlight: '#7d3a44',
    modifiedBackground: '#3a3a1e',
    modifiedText: '#e2c08d',
    unchangedText: '#d4d4d4',
    lineNumber: '#858585',
    lineNumberActive: '#c6c6c6',
    border: '#3c3c3c',
    hunkBorder: '#2d2d2d',
    syntax: {
      keyword: '#569cd6',
      string: '#ce9178',
      number: '#b5cea8',
      comment: '#6a9955',
      function: '#dcdcaa',
      variable: '#9cdcfe',
      operator: '#d4d4d4',
      punctuation: '#d4d4d4',
      tag: '#4ec9b0',
      attribute: '#9cdcfe',
      property: '#9cdcfe',
      className: '#4ec9b0',
      regexp: '#d16969',
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

export default vscodeDark;
