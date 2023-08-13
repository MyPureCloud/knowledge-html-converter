import { AstElement } from 'html-parse-stringify';
import { StyleAttribute, Tag } from '../models/html';
import { BlockType } from '../models/blocks/block';
import {
  TableBlockHorizontalAlignType,
  TableBlockVerticalAlignType,
  TableBorderStyleType,
  TableCaptionBlock,
  TableCaptionContentBlock,
  TableRowType,
  cssBorderStyleToTableBorderStyleType,
  cssTextAlignToTableBlockHorizontalAlignType,
  cssVerticalAlignToTableBlockVerticalAlignType,
} from '../models/blocks/table';
import { htmlTagToTextMark } from '../models/blocks/text';
import { convertRgbToHex, generateImageBlock } from './image';
import { generateListBlock } from './list';
import { generateParagraphBlock } from './paragraph';
import { generateTextBlocks } from './text';
import { generateVideoBlock } from './video';
import { ContentBlock } from '../models/blocks/content-block';

const emPattern = /^\d+(?:\.\d+)?em$/;
const pxPattern = /^\d+(?:\.\d+)?px$/;
const percentagePattern = /^\d+(?:\.\d+)?%$/;

export const getTablePropertiesJSON = (
  blockData: AstElement,
): Record<string, string> => {
  const jsonObject: Record<string, string> = {};
  blockData.attrs?.style
    .split(/\s*;\s*/) //split with extra spaces around the semi colon
    .map((chunk: string) => chunk.split(/\s*:\s*/)) //split key:value with colon
    .map((keyValue: string[]) => {
      jsonObject[keyValue[0]] = keyValue[1];
    });
  return jsonObject;
};

export const getPadding = (
  jsonObject: Record<string, string>,
): number | undefined => {
  let padding: number | undefined;
  if (
    Object.prototype.hasOwnProperty.call(jsonObject, StyleAttribute.Padding)
  ) {
    if (emPattern.test(jsonObject[StyleAttribute.Padding])) {
      padding = Number(
        jsonObject[StyleAttribute.Padding].replace(/\s*em\s*/g, ''),
      );
    } else if (pxPattern.test(jsonObject[StyleAttribute.Padding])) {
      padding = convertPixelsToEM(
        Number(jsonObject[StyleAttribute.Padding].replace(/\s*px\s*/g, '')),
      );
    }
  }
  return padding;
};

export const getBackgroundColor = (
  jsonObject: Record<string, string>,
): string | undefined => {
  let backgroundColor: string | undefined;

  if (
    Object.prototype.hasOwnProperty.call(
      jsonObject,
      StyleAttribute.BackgroundColor,
    )
  ) {
    backgroundColor = jsonObject[StyleAttribute.BackgroundColor].startsWith('#')
      ? jsonObject[StyleAttribute.BackgroundColor]
      : convertRgbToHex(jsonObject[StyleAttribute.BackgroundColor]);
  }
  return backgroundColor;
};

export const getBorderColor = (
  jsonObject: Record<string, string>,
): string | undefined => {
  let borderColor: string | undefined;
  if (
    Object.prototype.hasOwnProperty.call(jsonObject, StyleAttribute.BorderColor)
  ) {
    borderColor = jsonObject[StyleAttribute.BorderColor].startsWith('#')
      ? jsonObject[StyleAttribute.BorderColor]
      : convertRgbToHex(jsonObject[StyleAttribute.BorderColor]);
  }
  return borderColor;
};

export const getBorderStyle = (
  jsonObject: Record<string, string>,
): TableBorderStyleType | undefined => {
  const borderStyle = jsonObject[StyleAttribute.BorderStyle];
  return borderStyle
    ? cssBorderStyleToTableBorderStyleType(borderStyle)
    : undefined;
};

export const getBorderProperties = (
  jsonObject: Record<string, string>,
): (number | string | undefined)[] => {
  let borderWidth: number | undefined;
  let borderStyle: string | undefined;
  let borderColor: string | undefined;
  if (Object.prototype.hasOwnProperty.call(jsonObject, StyleAttribute.Border)) {
    const properties = jsonObject[StyleAttribute.Border].split(' ');
    const result = properties.splice(0, 2);
    result.push(properties.join(' '));

    // border width
    if (emPattern.test(result[0])) {
      borderWidth = Number(result[0].replace(/\s*em\s*/g, ''));
    } else if (pxPattern.test(result[0])) {
      borderWidth = convertPixelsToEM(
        Number(result[0].replace(/\s*px\s*/g, '')),
      );
    }
    // border style
    borderStyle = cssBorderStyleToTableBorderStyleType(result[1]);

    // border color
    borderColor = result[2].startsWith('#')
      ? result[2]
      : convertRgbToHex(result[2]);
  }
  return [borderWidth, borderStyle, borderColor];
};

export const getAlignment = (
  jsonObject: Record<string, string>,
): string | undefined => {
  let alignment: string | undefined;
  if (
    Object.prototype.hasOwnProperty.call(
      jsonObject,
      StyleAttribute.MarginLeft,
    ) &&
    Object.prototype.hasOwnProperty.call(jsonObject, StyleAttribute.MarginRight)
  ) {
    if (
      jsonObject[StyleAttribute.MarginLeft] === '0px' &&
      jsonObject[StyleAttribute.MarginRight] === 'auto'
    ) {
      alignment = 'Left';
    } else if (
      jsonObject[StyleAttribute.MarginLeft] === 'auto' &&
      jsonObject[StyleAttribute.MarginRight] === 'auto'
    ) {
      alignment = 'Center';
    } else if (
      jsonObject[StyleAttribute.MarginLeft] === 'auto' &&
      jsonObject[StyleAttribute.MarginRight] === '0px'
    ) {
      alignment = 'Right';
    }
  }
  return alignment;
};

export const getHorizontalAlign = (
  jsonObject: Record<string, string>,
): TableBlockHorizontalAlignType | undefined => {
  const textAlign = jsonObject[StyleAttribute.Align];
  return textAlign
    ? cssTextAlignToTableBlockHorizontalAlignType(textAlign)
    : undefined;
};

export const getVerticalAlign = (
  jsonObject: Record<string, string>,
): TableBlockVerticalAlignType | undefined => {
  const verticalAlign = jsonObject[StyleAttribute.VerticalAlign];
  return verticalAlign
    ? cssVerticalAlignToTableBlockVerticalAlignType(verticalAlign)
    : undefined;
};

export const getBorderWidth = (
  jsonObject: Record<string, string>,
): number | undefined => {
  return getHeightAndWidthProperty(jsonObject, StyleAttribute.BorderWidth);
};

export const getBorderSpacing = (
  jsonObject: Record<string, string>,
): number | undefined => {
  return getHeightAndWidthProperty(jsonObject, StyleAttribute.BorderSpacing);
};

export const getHeight = (
  jsonObject: Record<string, string>,
): number | undefined => {
  return getHeightAndWidthProperty(jsonObject, StyleAttribute.Height);
};

export const getWidth = (
  jsonObject: Record<string, string>,
): number | undefined => {
  return getHeightAndWidthProperty(jsonObject, StyleAttribute.Width);
};

export const getCaption = (captionData: AstElement): TableCaptionBlock => {
  const captionBlock: TableCaptionBlock = {
    blocks: [],
  };
  const blocks: TableCaptionContentBlock[] = [];

  captionData.children?.forEach((child) => {
    let block: TableCaptionContentBlock | undefined;
    let textBlocks: ContentBlock[] | undefined;

    if (htmlTagToTextMark(child.name)) {
      const captionTextMark = htmlTagToTextMark(captionData.name);
      const captionTextMarks = captionTextMark ? [captionTextMark] : [];
      textBlocks = generateTextBlocks(child, captionTextMarks);
    }

    if (child.type === 'text') {
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
          block = generateListBlock(child, BlockType.OrderedList);
          break;
        case Tag.UnorderedList:
          block = generateListBlock(child, BlockType.UnorderedList);
          break;
        case Tag.Image:
          block = generateImageBlock(child);
          break;
        case Tag.Video:
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
      blocks.push(block);
    }
    if (textBlocks) {
      blocks.push(...textBlocks);
    }
    if (blocks) {
      captionBlock.blocks = blocks;
    }
  });
  return captionBlock;
};

export const getRowType = (type: string): string | undefined => {
  let rowType: string | undefined;
  if (type === Tag.TableBody) {
    rowType = TableRowType.Body;
  } else if (type === Tag.TableHead) {
    rowType = TableRowType.Header;
  } else if (type === Tag.TableFooter) {
    rowType = TableRowType.Footer;
  }
  return rowType;
};

export const convertPixelsToEM = (value: number): number => {
  return value / 16; // 16 is the base font-size for browsers
};

export const convertPercentageToEM = (value: number): number => {
  // TODO tox-edit-area? pass in as an option?
  //const parentWidth = document.getElementsByClassName('tox-edit-area')[0].clientWidth - 32;
  const parentWidth = 1168;
  const pxValue = (parentWidth / 100) * value;
  return convertPixelsToEM(pxValue);
};

const getHeightAndWidthProperty = (
  jsonObject: Record<string, string>,
  propertyName: string,
): number | undefined => {
  let property: number | undefined;
  if (Object.prototype.hasOwnProperty.call(jsonObject, propertyName)) {
    if (emPattern.test(jsonObject[propertyName])) {
      property = Number(jsonObject[propertyName].replace(/\s*em\s*/g, ''));
    } else if (pxPattern.test(jsonObject[propertyName])) {
      property = convertPixelsToEM(
        Number(jsonObject[propertyName].replace(/\s*px\s*/g, '')),
      );
    } else if (percentagePattern.test(jsonObject[propertyName])) {
      property = convertPercentageToEM(
        Number(jsonObject[propertyName].replace(/\s*%\s*/g, '')),
      );
    }
  }
  return property;
};
