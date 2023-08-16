import { DomNode } from 'html-parse-stringify';
import { StyleAttribute } from '../models/html';
import {
  AlignType,
  cssTextAlignToAlignType,
} from '../models/blocks/align-type';
import { BlockType } from '../models/blocks/block';
import { FontType, htmlTagToFontType } from '../models/blocks/font-type';
import {
  generateTextBlocks,
  shrinkTextNodeWhiteSpaces,
  trimEdgeTextNodes,
} from './text';
import {
  ParagraphBlock,
  ParagraphProperties,
} from '../models/blocks/paragraph';

export const generateParagraphBlock = (domElement: DomNode): ParagraphBlock => {
  const paragraphBlock: ParagraphBlock = {
    type: BlockType.Paragraph,
    paragraph: {
      blocks: [],
    },
  };
  let children = domElement.children;
  const fontType = htmlTagToFontType(domElement.name);
  const properties = generateProperties(domElement.attrs);
  if (properties) {
    paragraphBlock.paragraph.properties = { ...properties, fontType };
  } else {
    paragraphBlock.paragraph.properties = { fontType };
  }

  const isPreformatted = fontType === FontType.Preformatted;
  if (!isPreformatted) {
    children = shrinkTextNodeWhiteSpaces(
      trimEdgeTextNodes(domElement.children),
    );
  }
  children?.forEach((child: DomNode) => {
    paragraphBlock.paragraph.blocks.push(
      ...generateTextBlocks(child, { isPreformatted }),
    );
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
          if (keyValue[0] === StyleAttribute.PaddingLeft) {
            // remove the em from the value
            indentation = Number(keyValue[1].replace(/\s*em\s*/g, ''));
          }
          if (keyValue[0] === StyleAttribute.TextAlign) {
            align = cssTextAlignToAlignType(keyValue[1]);
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
