import { parse, DomNode } from 'html-parse-stringify';
import { sanitizeHtml } from './sanitizer';
import { Tag } from './models/html';
import { Block, BlockType } from './models/blocks/block';
import {
  createEmptyParagraph,
  generateParagraphBlock,
} from './converters/paragraph';
import { generateListBlock } from './converters/list';
import { generateVideoBlock } from './converters/video';
import { generateImageBlock } from './converters/image';
import { generateTableBlock } from './converters/table';

export const convertHtmlToBlocks = (html: string): Block[] => {
  html = sanitizeHtml(html || '');
  const domNodes = parse(html);
  return convertParsedHtmlToBlocks(domNodes);
};

const convertParsedHtmlToBlocks = (domNodes: DomNode[]): Block[] => {
  const blocks: Block[] = [];

  domNodes.forEach((domNode: DomNode) => {
    let block: Block | undefined;
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
        block = generateListBlock(domNode, BlockType.OrderedList);
        break;
      case Tag.UnorderedList:
        block = generateListBlock(domNode, BlockType.UnorderedList);
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
    blocks.push(createEmptyParagraph());
  }
  return blocks;
};
