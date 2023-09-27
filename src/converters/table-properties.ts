import { DomNode, DomNodeType } from 'html-parse-stringify';
import { parseColorString } from '../utils/color';
import { getLength } from '../utils/length';
import { DocumentContentBlock } from '../models/blocks/document-body-paragraph';
import {
  DocumentBodyTableBlockHorizontalAlignType,
  DocumentBodyTableBlockVerticalAlignType,
  DocumentBodyTableBorderStyleType,
  DocumentBodyTableCaptionBlock,
  DocumentBodyTableCaptionItem,
} from '../models/blocks/document-body-table';
import { StyleAttribute, Tag } from '../models/html';
import { generateImageBlock } from './image';
import { generateListBlock } from './list';
import { generateParagraphBlock } from './paragraph';
import {
  generateTextBlocks,
  htmlTagToTextMark,
  postProcessTextBlocks,
} from './text';
import { generateVideoBlock } from './video';

export const getStyleKeyValues = (
  domElement: DomNode,
): Record<string, string> => {
  const keyValues: Record<string, string> = {};
  domElement.attrs?.style
    .split(/\s*;\s*/) //split with extra spaces around the semi colon
    .map((chunk: string) => chunk.split(/\s*:\s*/)) //split key:value with colon
    .map((keyValue: string[]) => {
      keyValues[keyValue[0]] = keyValue[1];
    });
  return keyValues;
};

export const getPadding = (
  styleKeyValues: Record<string, string>,
): number | undefined => {
  return getLength(styleKeyValues[StyleAttribute.Padding]);
};

export const getBackgroundColor = (
  styleKeyValues: Record<string, string>,
): string | undefined => {
  let backgroundColor: string | undefined;

  if (
    Object.prototype.hasOwnProperty.call(
      styleKeyValues,
      StyleAttribute.BackgroundColor,
    )
  ) {
    backgroundColor = parseColorString(
      styleKeyValues[StyleAttribute.BackgroundColor],
    );
  }
  return backgroundColor;
};

export const getBorderColor = (
  styleKeyValues: Record<string, string>,
): string | undefined => {
  let borderColor: string | undefined;
  if (
    Object.prototype.hasOwnProperty.call(
      styleKeyValues,
      StyleAttribute.BorderColor,
    )
  ) {
    borderColor = parseColorString(styleKeyValues[StyleAttribute.BorderColor]);
  }
  return borderColor;
};

export const getBorderStyle = (
  styleKeyValues: Record<string, string>,
): DocumentBodyTableBorderStyleType | undefined => {
  const borderStyle = styleKeyValues[StyleAttribute.BorderStyle];
  return borderStyle
    ? cssBorderStyleToTableBorderStyleType(borderStyle)
    : undefined;
};

export const getBorderProperties = (
  styleKeyValues: Record<string, string>,
): (number | string | undefined)[] => {
  let borderWidth: number | undefined;
  let borderStyle: string | undefined;
  let borderColor: string | undefined;
  if (
    Object.prototype.hasOwnProperty.call(styleKeyValues, StyleAttribute.Border)
  ) {
    const properties = styleKeyValues[StyleAttribute.Border].split(' ');
    const result = properties.splice(0, 2);
    result.push(properties.join(' '));

    if (result.length != 3) {
      return [undefined, undefined, undefined];
    }

    borderWidth = getLength(result[0]);

    borderStyle = cssBorderStyleToTableBorderStyleType(result[1]);

    borderColor = parseColorString(result[2]);
  }
  return [borderWidth, borderStyle, borderColor];
};

export const getAlignment = (
  styleKeyValues: Record<string, string>,
): string | undefined => {
  let alignment: string | undefined;
  if (
    Object.prototype.hasOwnProperty.call(
      styleKeyValues,
      StyleAttribute.MarginLeft,
    ) &&
    Object.prototype.hasOwnProperty.call(
      styleKeyValues,
      StyleAttribute.MarginRight,
    )
  ) {
    if (
      styleKeyValues[StyleAttribute.MarginLeft] === '0px' &&
      styleKeyValues[StyleAttribute.MarginRight] === 'auto'
    ) {
      alignment = 'Left';
    } else if (
      styleKeyValues[StyleAttribute.MarginLeft] === 'auto' &&
      styleKeyValues[StyleAttribute.MarginRight] === 'auto'
    ) {
      alignment = 'Center';
    } else if (
      styleKeyValues[StyleAttribute.MarginLeft] === 'auto' &&
      styleKeyValues[StyleAttribute.MarginRight] === '0px'
    ) {
      alignment = 'Right';
    }
  }
  return alignment;
};

export const getHorizontalAlign = (
  styleKeyValues: Record<string, string>,
): DocumentBodyTableBlockHorizontalAlignType | undefined => {
  const textAlign = styleKeyValues[StyleAttribute.TextAlign];
  return textAlign
    ? cssTextAlignToTableBlockHorizontalAlignType(textAlign)
    : undefined;
};

export const getVerticalAlign = (
  styleKeyValues: Record<string, string>,
): DocumentBodyTableBlockVerticalAlignType | undefined => {
  return cssVerticalAlignToTableBlockVerticalAlignType(styleKeyValues[StyleAttribute.VerticalAlign]);
};

export const getBorderWidth = (
  styleKeyValues: Record<string, string>,
): number | undefined => {
  return getHeightAndWidthProperty(styleKeyValues, StyleAttribute.BorderWidth);
};

export const getBorderSpacing = (
  styleKeyValues: Record<string, string>,
): number | undefined => {
  return getHeightAndWidthProperty(
    styleKeyValues,
    StyleAttribute.BorderSpacing,
  );
};

export const getHeight = (
  styleKeyValues: Record<string, string>,
): number | undefined => {
  return getHeightAndWidthProperty(styleKeyValues, StyleAttribute.Height);
};

export const getWidth = (
  styleKeyValues: Record<string, string>,
): number | undefined => {
  return getHeightAndWidthProperty(styleKeyValues, StyleAttribute.Width);
};

export const getCaption = (
  captionElement: DomNode,
): DocumentBodyTableCaptionBlock | undefined => {
  const captionBlock: DocumentBodyTableCaptionBlock = {
    blocks: [],
  };

  const children = captionElement.children || [];
  children.forEach((child) => {
    let block: DocumentBodyTableCaptionItem | undefined;
    let textBlocks: DocumentContentBlock[] | undefined;

    if (child.type === DomNodeType.Text || htmlTagToTextMark(child.name)) {
      textBlocks = generateTextBlocks(child);
    } else {
      switch (child.name) {
        case Tag.Paragraph:
        case Tag.Heading1:
        case Tag.Heading2:
        case Tag.Heading3:
        case Tag.Heading4:
        case Tag.Heading5:
        case Tag.Heading6:
        case Tag.Preformatted:
          block = generateParagraphBlock(child);
          break;
        case Tag.OrderedList:
          block = generateListBlock(child, 'OrderedList');
          break;
        case Tag.UnorderedList:
          block = generateListBlock(child, 'UnorderedList');
          break;
        case Tag.Image:
          block = generateImageBlock(child);
          break;
        case Tag.IFrame:
          block = generateVideoBlock(child);
          break;
        case Tag.Span:
        case Tag.LineBreak:
        case Tag.Anchor:
          textBlocks = generateTextBlocks(child);
          break;
      }
    }
    if (block) {
      captionBlock.blocks.push(block);
    }
    if (textBlocks) {
      captionBlock.blocks.push(...textBlocks);
    }
  });
  postProcessTextBlocks(captionBlock.blocks);
  return captionBlock.blocks.length ? captionBlock : undefined;
};

const getHeightAndWidthProperty = (
  styleKeyValues: Record<string, string>,
  key: string,
): number | undefined => {
  if (Object.prototype.hasOwnProperty.call(styleKeyValues, key)) {
    return getLength(styleKeyValues[key]);
  }
  return undefined;
};

const tableBlockHorizontalAlignTypesByCssTextAlign: Record<
  string,
  DocumentBodyTableBlockHorizontalAlignType
> = {
  center: DocumentBodyTableBlockHorizontalAlignType.Center,
  left: DocumentBodyTableBlockHorizontalAlignType.Left,
  right: DocumentBodyTableBlockHorizontalAlignType.Right,
};

const cssTextAlignToTableBlockHorizontalAlignType = (
  textAlign: string,
): DocumentBodyTableBlockHorizontalAlignType | undefined => {
  return textAlign
    ? tableBlockHorizontalAlignTypesByCssTextAlign[textAlign.toLowerCase()]
    : undefined;
};

const tableBlockVerticalAlignTypesByCssVerticalAlign: Record<
  string,
  DocumentBodyTableBlockVerticalAlignType
> = {
  top: DocumentBodyTableBlockVerticalAlignType.Top,
  middle: DocumentBodyTableBlockVerticalAlignType.Middle,
  bottom: DocumentBodyTableBlockVerticalAlignType.Bottom,
};

const cssVerticalAlignToTableBlockVerticalAlignType = (
  verticalAlign: string,
): DocumentBodyTableBlockVerticalAlignType | undefined => {
  return verticalAlign
    ? tableBlockVerticalAlignTypesByCssVerticalAlign[
        verticalAlign.toLowerCase()
      ]
    : undefined;
};

const tableBorderStyleTypesByCssBorderStyle: Record<
  string,
  DocumentBodyTableBorderStyleType
> = {
  solid: DocumentBodyTableBorderStyleType.Solid,
  dotted: DocumentBodyTableBorderStyleType.Dotted,
  dashed: DocumentBodyTableBorderStyleType.Dashed,
  double: DocumentBodyTableBorderStyleType.Double,
  groove: DocumentBodyTableBorderStyleType.Groove,
  ridge: DocumentBodyTableBorderStyleType.Ridge,
  inset: DocumentBodyTableBorderStyleType.Inset,
  outset: DocumentBodyTableBorderStyleType.Outset,
  hidden: DocumentBodyTableBorderStyleType.Hidden,
  none: DocumentBodyTableBorderStyleType.None,
};

const cssBorderStyleToTableBorderStyleType = (
  borderStyle: string,
): DocumentBodyTableBorderStyleType | undefined => {
  return borderStyle
    ? tableBorderStyleTypesByCssBorderStyle[borderStyle.toLowerCase()]
    : undefined;
};
