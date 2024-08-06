import sanitizeHtmlLib from 'sanitize-html';
import { IOptions } from 'sanitize-html';
import { StyleAttribute } from './models/html/style-attribute.js';
import { Tag } from './models/html/tag.js';

const options: IOptions = {
  allowedTags: Object.values(Tag),
  allowedAttributes: {
    '*': ['style'],
    a: ['title', 'href', 'target'],
    iframe: ['src', 'width', 'height', 'style'],
    img: [
      'src',
      'srcset',
      'alt',
      'title',
      'width',
      'height',
      'loading',
      'style',
    ],
    table: ['border', 'bgcolor', 'style'],
    td: ['style', 'scope', 'rowspan', 'colspan', 'bgcolor'],
    th: ['style', 'scope', 'rowspan', 'colspan', 'bgcolor'],
  },
  allowedStyles: {
    '*': {},
  },
  parser: {
    decodeEntities: false, // do not convert '&nbsp;' to '\u00a0'
  },
};
Object.values(StyleAttribute).forEach((stylePropertyName) => {
  options.allowedStyles!['*'][stylePropertyName] = [/.*/];
});

export const sanitizeHtml = (dirty: string) => sanitizeHtmlLib(dirty, options);
