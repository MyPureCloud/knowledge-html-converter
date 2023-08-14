import { parse, AstElement } from 'html-parse-stringify';
import { sanitizeHtml } from './sanitizer';
import { Tag } from './models/html';
import { Block, BlockType } from './models/blocks/block';
import { generateParagraphBlock } from './converters/paragraph';
import { generateListBlock } from './converters/list';
import { generateVideoBlock } from './converters/video';
import { generateImageBlock } from './converters/image';
import { generateTableBlock } from './converters/table';

export const convertHtmlToBlocks = (html: string): Block[] => {
  if (!html) {
    return [];
  }
  html = sanitizeHtml(html);
  const elements = parse(html);
  return convertParsedHtmlToBlocks(elements);
};

const convertParsedHtmlToBlocks = (elements: AstElement[]): Block[] => {
  const blocks: Block[] = [];

  elements.forEach((element: AstElement) => {
    let block: Block | undefined;
    switch (element.name) {
      case Tag.Paragraph:
      case Tag.Heading1:
      case Tag.Heading2:
      case Tag.Heading3:
      case Tag.Heading4:
      case Tag.Heading5:
      case Tag.Heading6:
      case Tag.Preformatted:
        block = generateParagraphBlock(element);
        break;
      case Tag.OrderedList:
        block = generateListBlock(element, BlockType.OrderedList);
        break;
      case Tag.UnorderedList:
        block = generateListBlock(element, BlockType.UnorderedList);
        break;
      case Tag.Image:
        block = generateImageBlock(element);
        break;
      case Tag.Video:
        block = generateVideoBlock(element);
        break;
      case Tag.Table:
        block = generateTableBlock(element);
        break;
    }
    if (block) {
      blocks.push(block);
    }
  });
  return blocks;
};
