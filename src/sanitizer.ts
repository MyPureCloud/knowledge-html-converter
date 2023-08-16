import * as sanitizeHtmlLib from 'sanitize-html';
import { IOptions } from 'sanitize-html';
import { StyleAttribute, Tag } from './models/html';

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
    decodeEntities: false, // do not convert '&nbsp;' to ' '
  },
};
Object.values(StyleAttribute).forEach((stylePropertyName) => {
  options.allowedStyles!['*'][stylePropertyName] = [/.*/];
});

export const sanitizeHtml = (dirty: string) => sanitizeHtmlLib(dirty, options);
