import * as sanitizeHtmlLib from 'sanitize-html';
import { IOptions } from 'sanitize-html';
import { StyleAttributes, Tags } from './models/html';

const options: IOptions = {
  allowedTags: Object.values(Tags),
  allowedAttributes: {
    '*': ['style'],
    a: ['href'],
    iframe: ['src'],
    img: ['src'],
    td: ['colspan', 'scope'],
    th: ['colspan', 'scope'],
  },
  allowedStyles: {
    '*': {},
  },
  parser: {
    decodeEntities: false, // do not convert '&nbsp;' to ' '
  },
};
Object.values(StyleAttributes).forEach((stylePropertyName) => {
  options.allowedStyles!['*'][stylePropertyName] = [/.*/];
});

export const sanitizeHtml = (dirty: string) => sanitizeHtmlLib(dirty, options);
