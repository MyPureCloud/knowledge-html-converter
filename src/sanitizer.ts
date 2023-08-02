import * as sanitizeHtmlLib from 'sanitize-html';
import { IOptions } from 'sanitize-html';
import { TagNames, StyleProperties } from './tags';

const options: IOptions = {
  allowedTags: Object.values(TagNames),
  allowedAttributes: {
    '*': ['style'],
    a: ['href'],
    iframe: ['src'],
    img: ['src'],
  },
  allowedStyles: {
    '*': {},
  },
  parser: {
    decodeEntities: false, // do not convert '&nbsp;' to ' '
  },
};
Object.values(StyleProperties).forEach((stylePropertyName) => {
  options.allowedStyles!['*'][stylePropertyName] = [/.*/];
});

export const sanitizeHtml = (dirty: string) => sanitizeHtmlLib(dirty, options);
