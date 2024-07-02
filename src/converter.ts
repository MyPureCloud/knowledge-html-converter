import HtmlParseStringify, { DomNode, DomNodeType } from 'html-parse-stringify';
import { sanitizeHtml } from './sanitizer.js';
import { Tag } from './models/html/tag.js';
import { DocumentBodyBlock } from './models/blocks/document-body-block.js';
import {
  generateEmptyParagraphBlock,
  generateParagraphBlock,
} from './converters/paragraph.js';
import { generateListBlock } from './converters/list.js';
import { generateVideoBlock } from './converters/video.js';
import { generateImageBlock } from './converters/image.js';
import { generateTableBlock } from './converters/table.js';
import {
  DefaultOptions,
  HtmlConverterOptions,
} from './models/options/html-converter-options.js';

/**
 * Converts html to document body blocks.
 * @param html html string, such as '\<p\>Document content\</p\>'
 * @returns document body blocks
 */
export const convertHtmlToBlocks = (
  html: string,
  options: HtmlConverterOptions = DefaultOptions,
): DocumentBodyBlock[] => {
  options = options ?? DefaultOptions; // if the parameter is NULL set it to DefaultOptions
  options.baseFontSize = options?.baseFontSize ?? 16; // if NULL set it to default value
  html = sanitizeHtml(html || '');
  const domNodes = HtmlParseStringify.parse(html);
  return convertParsedHtmlToBlocks(domNodes, options);
};

const convertParsedHtmlToBlocks = (
  domNodes: DomNode[],
  options: HtmlConverterOptions,
): DocumentBodyBlock[] => {
  const blocks: DocumentBodyBlock[] = [];

  domNodes.forEach((domNode: DomNode) => {
    let block: DocumentBodyBlock | undefined;
    switch (domNode.name) {
      case Tag.Paragraph:
      case Tag.Heading1:
      case Tag.Heading2:
      case Tag.Heading3:
      case Tag.Heading4:
      case Tag.Heading5:
      case Tag.Heading6:
      case Tag.Preformatted:
        block = generateParagraphBlock(domNode, options);
        break;
      case Tag.OrderedList:
        block = generateListBlock(domNode, 'OrderedList', options);
        break;
      case Tag.UnorderedList:
        block = generateListBlock(domNode, 'UnorderedList', options);
        break;
      case Tag.Image:
        if (domNode?.attrs?.src) {
          block = generateImageBlock(domNode, options);
        }
        break;
      case Tag.IFrame:
        block = generateVideoBlock(domNode);
        break;
      case Tag.Table:
        block = generateTableBlock(domNode, options);
        break;
      default:
        block = generateParagraphBlock(
          {
            name: Tag.Paragraph,
            type: DomNodeType.Text,
            children: [domNode],
          },
          options,
        );
        break;
    }
    if (block) {
      blocks.push(block);
    }
  });
  if (!blocks.length) {
    blocks.push(generateEmptyParagraphBlock());
  }
  blocks.forEach(removeUndefinedProperties);
  return blocks;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const removeUndefinedProperties = (obj: any) => {
  /* eslint-enable */
  if (typeof obj === 'object') {
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      if (obj[prop] === undefined) {
        delete obj[prop];
      } else if (obj[prop] && typeof (obj[prop] === 'object')) {
        removeUndefinedProperties(obj[prop]);
      }
    });
  }
};
