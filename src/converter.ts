import { parse, DomNode } from 'html-parse-stringify';
import { sanitizeHtml } from './sanitizer';
import { Tag } from './models/html';
import {
  DocumentBodyBlock,
  DocumentBodyBlockType,
} from './models/blocks/document-body-block';
import {
  generateEmptyParagraph,
  generateParagraph,
} from './converters/paragraph';
import { generateList } from './converters/list';
import { generateVideo } from './converters/video';
import { generateImage } from './converters/image';
import { generateTable } from './converters/table';

/**
 * Converts html to document body blocks.
 * @param html html string, such as '\<p\>Document content\</p\>'
 * @returns document body blocks
 */
export const convertHtmlToBlocks = (html: string): DocumentBodyBlock[] => {
  html = sanitizeHtml(html || '');
  const domNodes = parse(html);
  return convertParsedHtmlToBlocks(domNodes);
};

const convertParsedHtmlToBlocks = (
  domNodes: DomNode[],
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
        block = generateParagraphBlock(domNode);
        break;
      case Tag.OrderedList:
        block = generateListBlock(domNode, DocumentBodyBlockType.OrderedList);
        break;
      case Tag.UnorderedList:
        block = generateListBlock(domNode, DocumentBodyBlockType.UnorderedList);
        break;
      case Tag.Image:
        block = generateImageBlock(domNode);
        break;
      case Tag.IFrame:
        block = generateVideoBlock(domNode);
        break;
      case Tag.Table:
        block = generateTableBlock(domNode);
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

const generateParagraphBlock = (domNode: DomNode): DocumentBodyBlock => {
  return {
    type: DocumentBodyBlockType.Paragraph,
    paragraph: generateParagraph(domNode),
  };
};

const generateEmptyParagraphBlock = (): DocumentBodyBlock => {
  return {
    type: DocumentBodyBlockType.Paragraph,
    paragraph: generateEmptyParagraph(),
  };
};

const generateListBlock = (
  domNode: DomNode,
  type: DocumentBodyBlockType.OrderedList | DocumentBodyBlockType.UnorderedList,
): DocumentBodyBlock | undefined => {
  const list = generateList(domNode, type);
  return list
    ? {
        type,
        list,
      }
    : undefined;
};

const generateImageBlock = (domNode: DomNode): DocumentBodyBlock => {
  return {
    type: DocumentBodyBlockType.Image,
    image: generateImage(domNode),
  };
};

const generateVideoBlock = (domNode: DomNode): DocumentBodyBlock => {
  return {
    type: DocumentBodyBlockType.Video,
    video: generateVideo(domNode),
  };
};

const generateTableBlock = (
  domNode: DomNode,
): DocumentBodyBlock | undefined => {
  const table = generateTable(domNode);
  return table
    ? {
        type: DocumentBodyBlockType.Table,
        table: generateTable(domNode),
      }
    : undefined;
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
