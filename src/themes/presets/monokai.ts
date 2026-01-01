/**
 * Monokai theme preset
 */

import type { Theme } from '../types.js';

export const monokai: Theme = {
  name: 'monokai',
  type: 'dark',
  colors: {
    background: '#272822',
    gutterBackground: '#2e2f2a',
    headerBackground: '#3e3d32',
    addedBackground: '#2d3b2d',
    addedGutterBackground: '#253b25',
    addedText: '#a6e22e',
    addedHighlight: '#4d6d4d',
    deletedBackground: '#3b2d2d',
    deletedGutterBackground: '#3b2525',
    deletedText: '#f92672',
    deletedHighlight: '#6d4d4d',
    modifiedBackground: '#3b3b25',
    modifiedText: '#e6db74',
    unchangedText: '#f8f8f2',
    lineNumber: '#8f908a',
    lineNumberActive: '#f8f8f2',
    border: '#49483e',
    hunkBorder: '#3e3d32',
    syntax: {
      keyword: '#f92672',
      string: '#e6db74',
      number: '#ae81ff',
      comment: '#75715e',
      function: '#a6e22e',
      variable: '#fd971f',
      operator: '#f92672',
      punctuation: '#f8f8f2',
      tag: '#f92672',
      attribute: '#a6e22e',
      property: '#66d9ef',
      className: '#a6e22e',
      regexp: '#e6db74',
    },
  },
  fonts: {
    family: "'Fira Code', 'Monaco', Consolas, monospace",
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

export default monokai;
