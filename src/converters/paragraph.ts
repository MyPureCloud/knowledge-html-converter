import { AstElement } from 'html-parse-stringify';
import { StyleAttributes } from '../models/html';
import { AlignType } from '../models/blocks/align-type';
import { BlockType } from '../models/blocks/block-type';
import { htmlTagToFontType } from '../models/blocks/font-type';
import { generateTextBlocks } from './text';
import {
  ParagraphBlock,
  ParagraphProperties,
} from '../models/blocks/paragraph';

export const generateParagraphBlock = (
  blockData: AstElement,
): ParagraphBlock => {
  const paragraphBlock: ParagraphBlock = {
    type: BlockType.Paragraph,
    paragraph: {
      blocks: [],
    },
  };
  const children = blockData.children;
  const fontType = htmlTagToFontType(blockData.name);
  const properties = generateProperties(blockData.attrs);
  if (properties) {
    paragraphBlock.paragraph.properties = { ...properties, fontType };
  } else {
    paragraphBlock.paragraph.properties = { fontType };
  }

  children?.forEach((child: AstElement) => {
    paragraphBlock.paragraph.blocks.push(...generateTextBlocks(child));
  });
  return paragraphBlock;
};

const generateProperties = (
  attrs: Record<string, string> | undefined,
): ParagraphProperties | undefined => {
  let paragraphProperties: ParagraphProperties | undefined;
  let indentation: number | undefined;
  let align: AlignType | undefined;
  const styles: string | undefined = attrs?.style;
  if (styles) {
    styles
      .split(/\s*;\s*/) //split with extra spaces around the semi colon
      .map((chunk) => chunk.split(/\s*:\s*/)) //split key:value with colon
      .map((keyValue) => {
        if (keyValue.length === 2) {
          if (keyValue[0] === StyleAttributes.Indentation) {
            // remove the em from the value
            indentation = Number(keyValue[1].replace(/\s*em\s*/g, ''));
          }
          if (
            keyValue[0] === StyleAttributes.Align &&
            keyValue[1] &&
            keyValue[1].length > 0
          ) {
            align = (keyValue[1][0].toUpperCase() +
              keyValue[1].substring(1).toLowerCase()) as AlignType;
          }
        }
      });
    if (indentation || align) {
      paragraphProperties = Object.assign(
        {},
        indentation && { indentation },
        align && { align },
      );
    }
  }
  return paragraphProperties;
};
