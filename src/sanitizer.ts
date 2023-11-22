import sanitizeHtmlLib from 'sanitize-html';
import { IOptions } from 'sanitize-html';
import { StyleAttribute } from './models/html/style-attribute.js';
import { Tag } from './models/html/tag.js';

const options: IOptions = {
  allowedTags: Object.values(Tag),
  allowedAttributes: {
    '*': ['style'],
    a: ['href'],
    iframe: ['src'],
    img: ['src'],
    td: ['colspan', 'rowspan', 'scope'],
    th: ['colspan', 'rowspan', 'scope'],
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
