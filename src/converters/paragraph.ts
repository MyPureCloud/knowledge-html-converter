import { DomNode } from 'html-parse-stringify';
import { StyleAttribute } from '../models/html';
import {
  DocumentBodyBlockAlignType,
  DocumentBodyBlockFontType,
} from '../models/blocks/document-body-block';
import { DocumentBodyBlockType } from '../models/blocks/document-body-block';
import {
  createEmptyTextBlock,
  generateTextBlocks,
  shrinkTextNodeWhiteSpaces,
  trimEdgeTextNodes,
} from './text';
import {
  DocumentBodyParagraphBlock,
  DocumentBodyParagraphProperties,
} from '../models/blocks/document-body-paragraph-block';

export const generateParagraphBlock = (
  domElement: DomNode,
): DocumentBodyParagraphBlock => {
  const paragraphBlock: DocumentBodyParagraphBlock = {
    type: DocumentBodyBlockType.Paragraph,
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

  const isPreformatted = fontType === DocumentBodyBlockFontType.Preformatted;
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
  if (!paragraphBlock.paragraph.blocks.length) {
    paragraphBlock.paragraph.blocks.push(createEmptyTextBlock());
  }
  return paragraphBlock;
};

const generateProperties = (
  attrs: Record<string, string> | undefined,
): DocumentBodyParagraphProperties | undefined => {
  let paragraphProperties: DocumentBodyParagraphProperties | undefined;
  let indentation: number | undefined;
  let align: DocumentBodyBlockAlignType | undefined;
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

export const createEmptyParagraph = (): DocumentBodyParagraphBlock => {
  return {
    type: DocumentBodyBlockType.Paragraph,
    paragraph: {
      blocks: [createEmptyTextBlock()],
      properties: {
        fontType: DocumentBodyBlockFontType.Paragraph,
      },
    },
  };
};

const alignTypesByHtmlTextAlign: Record<string, DocumentBodyBlockAlignType> = {
  center: DocumentBodyBlockAlignType.Center,
  left: DocumentBodyBlockAlignType.Left,
  right: DocumentBodyBlockAlignType.Right,
  justify: DocumentBodyBlockAlignType.Justify,
};

export const cssTextAlignToAlignType = (
  textAlign: string,
): DocumentBodyBlockAlignType | undefined => {
  return textAlign
    ? alignTypesByHtmlTextAlign[textAlign.toLowerCase()]
    : undefined;
};

const fontTypesByHtmlTag: Record<string, DocumentBodyBlockFontType> = {
  h1: DocumentBodyBlockFontType.Heading1,
  h2: DocumentBodyBlockFontType.Heading2,
  h3: DocumentBodyBlockFontType.Heading3,
  h4: DocumentBodyBlockFontType.Heading4,
  h5: DocumentBodyBlockFontType.Heading5,
  h6: DocumentBodyBlockFontType.Heading6,
  p: DocumentBodyBlockFontType.Paragraph,
  pre: DocumentBodyBlockFontType.Preformatted,
};

export const htmlTagToFontType = (
  tag: string,
): DocumentBodyBlockFontType | undefined => {
  return tag ? fontTypesByHtmlTag[tag.toLowerCase()] : undefined;
};
