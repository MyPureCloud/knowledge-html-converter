import { parse, AstElement } from 'html-parse-stringify';
import { sanitizeHtml } from './sanitizer';
import { Tags } from './models/html';
import { Block } from './models/blocks/block';
import { BlockTypes } from './models/blocks/block-type';
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
      case Tags.Paragraph:
      case Tags.Heading1:
      case Tags.Heading2:
      case Tags.Heading3:
      case Tags.Heading4:
      case Tags.Heading5:
      case Tags.Heading6:
      case Tags.Preformatted:
        block = generateParagraphBlock(blockData);
        break;
      case Tags.OrderedList:
        block = generateListBlock(blockData, BlockTypes.OrderedList);
        break;
      case Tags.UnorderedList:
        block = generateListBlock(blockData, BlockTypes.UnorderedList);
        break;
      case Tags.Image:
        block = generateImageBlock(blockData);
        break;
      case Tags.Video:
        block = generateVideoBlock(blockData);
        break;
      case Tags.Table:
        block = generateTableBlock(blockData);
        break;
    }

    if (block) {
      blocks.push(block);
    }
  });

  return blocks;
};
