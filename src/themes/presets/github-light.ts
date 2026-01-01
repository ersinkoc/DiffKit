/**
 * GitHub Light theme preset
 */

import type { Theme } from '../types.js';

export const githubLight: Theme = {
  name: 'github-light',
  type: 'light',
  colors: {
    background: '#ffffff',
    gutterBackground: '#f6f8fa',
    headerBackground: '#f6f8fa',
    addedBackground: '#e6ffec',
    addedGutterBackground: '#ccffd8',
    addedText: '#1a7f37',
    addedHighlight: '#acf2bd',
    deletedBackground: '#ffebe9',
    deletedGutterBackground: '#ffc0c0',
    deletedText: '#cf222e',
    deletedHighlight: '#ff8080',
    modifiedBackground: '#fff8c5',
    modifiedText: '#9a6700',
    unchangedText: '#24292f',
    lineNumber: '#6e7681',
    lineNumberActive: '#24292f',
    border: '#d0d7de',
    hunkBorder: '#d8dee4',
    syntax: {
      keyword: '#cf222e',
      string: '#0a3069',
      number: '#0550ae',
      comment: '#6e7781',
      function: '#8250df',
      variable: '#953800',
      operator: '#cf222e',
      punctuation: '#24292f',
      tag: '#116329',
      attribute: '#0550ae',
      property: '#0550ae',
      className: '#953800',
      regexp: '#0a3069',
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

export default githubLight;
