/**
 * GitHub Dark theme preset
 */

import type { Theme } from '../types.js';

export const githubDark: Theme = {
  name: 'github-dark',
  type: 'dark',
  colors: {
    background: '#0d1117',
    gutterBackground: '#161b22',
    headerBackground: '#161b22',
    addedBackground: '#1a472a',
    addedGutterBackground: '#1f3929',
    addedText: '#aff5b4',
    addedHighlight: '#2ea043',
    deletedBackground: '#5c1a1a',
    deletedGutterBackground: '#4a1818',
    deletedText: '#ffc0c0',
    deletedHighlight: '#d73a49',
    modifiedBackground: '#3d2c00',
    modifiedText: '#f0c14b',
    unchangedText: '#c9d1d9',
    lineNumber: '#6e7681',
    lineNumberActive: '#c9d1d9',
    border: '#30363d',
    hunkBorder: '#21262d',
    syntax: {
      keyword: '#ff7b72',
      string: '#a5d6ff',
      number: '#79c0ff',
      comment: '#8b949e',
      function: '#d2a8ff',
      variable: '#ffa657',
      operator: '#ff7b72',
      punctuation: '#c9d1d9',
      tag: '#7ee787',
      attribute: '#79c0ff',
      property: '#79c0ff',
      className: '#ffa657',
      regexp: '#a5d6ff',
    },
  },
  fonts: {
    family: "'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace",
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
    radius: '6px',
    width: '1px',
  },
};

export default githubDark;
