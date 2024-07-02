import { DomNode, DomNodeType } from 'html-parse-stringify';
import { parseColorString } from '../utils/color.js';
import { getLength, getLengthWithUnit } from '../utils/length.js';
import { DocumentContentBlock } from '../models/blocks/document-body-paragraph.js';
import {
  DocumentBodyTableBlockHorizontalAlignType,
  DocumentBodyTableBlockVerticalAlignType,
  DocumentBodyTableBorderStyleType,
  DocumentBodyTableCaptionBlock,
  DocumentBodyTableCaptionItem,
} from '../models/blocks/document-body-table.js';
import { StyleAttribute } from '../models/html/style-attribute.js';
import { Tag } from '../models/html/tag.js';
import { generateImageBlock } from './image.js';
import { generateListBlock } from './list.js';
import { generateParagraphBlock } from './paragraph.js';
import {
  generateTextBlocks,
  htmlTagToTextMark,
  postProcessTextBlocks,
} from './text.js';
import { generateVideoBlock } from './video.js';
import { DocumentElementLength } from '../models/blocks/document-element-length.js';
import { HtmlConverterOptions } from '../models/options/html-converter-options.js';

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

/*
 * Handles the styles 'background-color', 'background'
 * First it looks for the style 'background-color'
 * if not present then for the style 'background'
 */
export const getBackgroundColor = (
  styleKeyValues: Record<string, string>,
): string | undefined => {
  let backgroundColor: string | undefined;

  if (
    Object.prototype.hasOwnProperty.call(
      styleKeyValues,
      StyleAttribute.BackgroundColor,
    ) ||
    Object.prototype.hasOwnProperty.call(
      styleKeyValues,
      StyleAttribute.Background,
    )
  ) {
    backgroundColor =
      parseColorString(styleKeyValues[StyleAttribute.BackgroundColor]) ??
      parseColorString(styleKeyValues[StyleAttribute.Background]);
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
  const borderWidthPattern = /\d+(?:\.\d+)?(px|em)/i;
  const borderStylePattern =
    /dotted|dashed|solid|double|groove|ridge|inset|outset|none|hidden/gi;
  const colorPattern =
    /#(0x)?[0-9a-f]+|rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)|rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(\d{1,3})\s*)?\)/gi;
  let borderWidth: number | undefined;
  let borderStyle: string | undefined;
  let borderColor: string | undefined;
  if (
    Object.prototype.hasOwnProperty.call(styleKeyValues, StyleAttribute.Border)
  ) {
    let borderValue: string = styleKeyValues[StyleAttribute.Border] ?? '';
    // border color
    const color = colorPattern.test(borderValue)
      ? borderValue!.match(colorPattern)![0]
      : undefined;
    if (color) {
      borderColor = parseColorString(color);
      borderValue = borderValue.replace(color, '').trim();
    }
    // border style
    const style = borderStylePattern.test(borderValue)
      ? borderValue!.match(borderStylePattern)![0]
      : undefined;
    if (style) {
      borderStyle = cssBorderStyleToTableBorderStyleType(style);
      borderValue = borderValue.replace(style, '').trim();
    }
    // border width
    const width = borderWidthPattern.test(borderValue)
      ? borderValue!.match(borderWidthPattern)![0]
      : undefined;
    borderWidth = getLength(width);
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
  return cssVerticalAlignToTableBlockVerticalAlignType(
    styleKeyValues[StyleAttribute.VerticalAlign],
  );
};

export const getBorderWidth = (
  styleKeyValues: Record<string, string>,
  converterOptions: HtmlConverterOptions = {},
): number | undefined => {
  return getHeightAndWidthProperty(
    styleKeyValues,
    StyleAttribute.BorderWidth,
    converterOptions,
  );
};

export const getBorderSpacing = (
  styleKeyValues: Record<string, string>,
  converterOptions: HtmlConverterOptions = {},
): number | undefined => {
  return getHeightAndWidthProperty(
    styleKeyValues,
    StyleAttribute.BorderSpacing,
    converterOptions,
  );
};

export const getHeight = (
  styleKeyValues: Record<string, string>,
  converterOptions: HtmlConverterOptions = {},
): number | undefined => {
  return getHeightAndWidthProperty(
    styleKeyValues,
    StyleAttribute.Height,
    converterOptions,
  );
};

export const getWidth = (
  styleKeyValues: Record<string, string>,
  converterOptions: HtmlConverterOptions = {},
): number | undefined => {
  return getHeightAndWidthProperty(
    styleKeyValues,
    StyleAttribute.Width,
    converterOptions,
  );
};

export const getWidthWithUnit = (
  styleKeyValues: Record<string, string>,
): DocumentElementLength | undefined => {
  return getWidthAndUnit(styleKeyValues, StyleAttribute.Width);
};

export const getCaption = (
  captionElement: DomNode,
  converterOptions: HtmlConverterOptions = {},
): DocumentBodyTableCaptionBlock | undefined => {
  const captionBlock: DocumentBodyTableCaptionBlock = {
    blocks: [],
  };

  const children = captionElement.children || [];
  children.forEach((child) => {
    let block: DocumentBodyTableCaptionItem | undefined;
    let textBlocks: DocumentContentBlock[] | undefined;

    if (child.type === DomNodeType.Text || htmlTagToTextMark(child.name)) {
      textBlocks = generateTextBlocks(child, converterOptions);
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
          block = generateParagraphBlock(child, converterOptions);
          break;
        case Tag.OrderedList:
          block = generateListBlock(child, 'OrderedList', converterOptions);
          break;
        case Tag.UnorderedList:
          block = generateListBlock(child, 'UnorderedList', converterOptions);
          break;
        case Tag.Image:
          block = generateImageBlock(child, converterOptions);
          break;
        case Tag.IFrame:
          block = generateVideoBlock(child);
          break;
        case Tag.Span:
        case Tag.LineBreak:
        case Tag.Anchor:
          textBlocks = generateTextBlocks(child, converterOptions);
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
  converterOptions: HtmlConverterOptions = {},
): number | undefined => {
  if (Object.prototype.hasOwnProperty.call(styleKeyValues, key)) {
    return getLength(styleKeyValues[key], converterOptions.baseFontSize);
  }
  return undefined;
};

const getWidthAndUnit = (
  styleKeyValues: Record<string, string>,
  key: string,
): DocumentElementLength | undefined => {
  if (Object.prototype.hasOwnProperty.call(styleKeyValues, key)) {
    return getLengthWithUnit(styleKeyValues[key]);
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
