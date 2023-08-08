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
  const sanitizedHtml = sanitizeHtml(html);
  const parsedHtml = parse(sanitizedHtml);
  return convertParsedHtmlToBlocks(parsedHtml);
};

const convertParsedHtmlToBlocks = (parsedHtml: AstElement[]): Block[] => {
  const blocks: Block[] = [];

  parsedHtml.forEach((blockData: AstElement) => {
    let block: Block | undefined;
    switch (blockData.name) {
      case Tag.Paragraph:
      case Tag.Heading1:
      case Tag.Heading2:
      case Tag.Heading3:
      case Tag.Heading4:
      case Tag.Heading5:
      case Tag.Heading6:
      case Tag.Preformatted:
        block = generateParagraphBlock(blockData);
        break;
      case Tag.OrderedList:
        block = generateListBlock(blockData, BlockType.OrderedList);
        break;
      case Tag.UnorderedList:
        block = generateListBlock(blockData, BlockType.UnorderedList);
        break;
      case Tag.Image:
        block = generateImageBlock(blockData);
        break;
      case Tag.Video:
        block = generateVideoBlock(blockData);
        break;
      case Tag.Table:
        block = generateTableBlock(blockData);
        break;
    }

    if (block) {
      blocks.push(block);
    }
  });

  return blocks;
};
