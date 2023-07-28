import { parse, AstElement } from 'html-parse-stringify';
import { sanitizeHtml } from './sanitizer';
import { Block, BlockTypes, TagNames } from './tags';
import { generateParagraphBlock } from './elements/paragraph';
import { generateListBlock } from './elements/list';
import { generateVideoBlock } from './elements/video';
import { generateImageBlock } from './elements/image';
import { generateTableBlock } from './elements/table/table-converter';

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
      case TagNames.Paragraph:
      case TagNames.Heading1:
      case TagNames.Heading2:
      case TagNames.Heading3:
      case TagNames.Heading4:
      case TagNames.Heading5:
      case TagNames.Heading6:
      case TagNames.Preformatted:
        block = generateParagraphBlock(blockData);
        break;
      case TagNames.OrderedList:
        block = generateListBlock(blockData, BlockTypes.OrderedList);
        break;
      case TagNames.UnorderedList:
        block = generateListBlock(blockData, BlockTypes.UnorderedList);
        break;
      case TagNames.Image:
        block = generateImageBlock(blockData);
        break;
      case TagNames.Video:
        block = generateVideoBlock(blockData);
        break;
      case TagNames.Table:
        block = generateTableBlock(blockData);
        break;
    }

    if (block) {
      blocks.push(block);
    }
  });

  return blocks;
};
