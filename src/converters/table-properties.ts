import { AstElement } from 'html-parse-stringify';
import { StyleAttributes, Tags } from '../models/html';
import { BlockType } from '../models/blocks/block-type';
import { ImageBlock } from '../models/blocks/image';
import { ListBlock } from '../models/blocks/list';
import { ParagraphBlock } from '../models/blocks/paragraph';
import {
  CaptionBlock,
  CaptionBlockItem,
  RowType,
} from '../models/blocks/table';
import { TextMark, TextBlocks } from '../models/blocks/text';
import { VideoBlock } from '../models/blocks/video';
import { convertRgbToHex, generateImageBlock } from './image';
import { generateListBlock } from './list';
import { generateParagraphBlock } from './paragraph';
import { generateTextBlocks } from './text';
import { generateVideoBlock } from './video';

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
    Object.prototype.hasOwnProperty.call(jsonObject, StyleAttributes.Padding)
  ) {
    if (emPattern.test(jsonObject[StyleAttributes.Padding])) {
      padding = Number(
        jsonObject[StyleAttributes.Padding].replace(/\s*em\s*/g, ''),
      );
    } else if (pxPattern.test(jsonObject[StyleAttributes.Padding])) {
      padding = convertPixelsToEM(
        Number(jsonObject[StyleAttributes.Padding].replace(/\s*px\s*/g, '')),
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
      StyleAttributes.BackgroundColor,
    )
  ) {
    backgroundColor = jsonObject[StyleAttributes.BackgroundColor].startsWith(
      '#',
    )
      ? jsonObject[StyleAttributes.BackgroundColor]
      : convertRgbToHex(jsonObject[StyleAttributes.BackgroundColor]);
  }
  return backgroundColor;
};

export const getBorderColor = (
  jsonObject: Record<string, string>,
): string | undefined => {
  let borderColor: string | undefined;
  if (
    Object.prototype.hasOwnProperty.call(
      jsonObject,
      StyleAttributes.BorderColor,
    )
  ) {
    borderColor = jsonObject[StyleAttributes.BorderColor].startsWith('#')
      ? jsonObject[StyleAttributes.BorderColor]
      : convertRgbToHex(jsonObject[StyleAttributes.BorderColor]);
  }
  return borderColor;
};

export const getBorderStyle = (
  jsonObject: Record<string, string>,
): string | undefined => {
  let borderStyle: string | undefined;
  if (
    Object.prototype.hasOwnProperty.call(
      jsonObject,
      StyleAttributes.BorderStyle,
    )
  ) {
    borderStyle =
      jsonObject[StyleAttributes.BorderStyle].charAt(0).toUpperCase() +
      jsonObject[StyleAttributes.BorderStyle].slice(1);
  }
  return borderStyle;
};

export const getBorderProperties = (
  jsonObject: Record<string, string>,
): (number | string | undefined)[] => {
  let borderWidth: number | undefined;
  let borderStyle: string | undefined;
  let borderColor: string | undefined;
  if (
    Object.prototype.hasOwnProperty.call(jsonObject, StyleAttributes.Border)
  ) {
    const properties = jsonObject[StyleAttributes.Border].split(' ');
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
    borderStyle = result[1].charAt(0).toUpperCase() + result[1].slice(1);

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
      StyleAttributes.MarginLeft,
    ) &&
    Object.prototype.hasOwnProperty.call(
      jsonObject,
      StyleAttributes.MarginRight,
    )
  ) {
    if (
      jsonObject[StyleAttributes.MarginLeft] === '0px' &&
      jsonObject[StyleAttributes.MarginRight] === 'auto'
    ) {
      alignment = 'Left';
    } else if (
      jsonObject[StyleAttributes.MarginLeft] === 'auto' &&
      jsonObject[StyleAttributes.MarginRight] === 'auto'
    ) {
      alignment = 'Center';
    } else if (
      jsonObject[StyleAttributes.MarginLeft] === 'auto' &&
      jsonObject[StyleAttributes.MarginRight] === '0px'
    ) {
      alignment = 'Right';
    }
  }
  return alignment;
};

export const getHorizontalAlign = (
  jsonObject: Record<string, string>,
): string | undefined => {
  return getHorizontalAndVerticalAlignProperty(
    jsonObject,
    StyleAttributes.Align,
  );
};

export const getVerticalAlign = (
  jsonObject: Record<string, string>,
): string | undefined => {
  return getHorizontalAndVerticalAlignProperty(
    jsonObject,
    StyleAttributes.VerticalAlign,
  );
};

export const getBorderWidth = (
  jsonObject: Record<string, string>,
): number | undefined => {
  return getHeightAndWidthProperty(jsonObject, StyleAttributes.BorderWidth);
};

export const getBorderSpacing = (
  jsonObject: Record<string, string>,
): number | undefined => {
  return getHeightAndWidthProperty(jsonObject, StyleAttributes.BorderSpacing);
};

export const getHeight = (
  jsonObject: Record<string, string>,
): number | undefined => {
  return getHeightAndWidthProperty(jsonObject, StyleAttributes.Height);
};

export const getWidth = (
  jsonObject: Record<string, string>,
): number | undefined => {
  return getHeightAndWidthProperty(jsonObject, StyleAttributes.Width);
};

export const getCaption = (captionData: AstElement): CaptionBlock => {
  const captionBlock: CaptionBlock = {
    blocks: [],
  };
  const blocks: CaptionBlockItem[] = [];

  const textFormatMap: Record<string, TextMark> = {
    strong: TextMark.Bold,
    em: TextMark.Italic,
    u: TextMark.Underline,
    s: TextMark.Strikethrough,
    sub: TextMark.Subscript,
    sup: TextMark.Superscript,
  };
  captionData.children?.forEach((child) => {
    let block: ParagraphBlock | ListBlock | ImageBlock | VideoBlock | undefined;
    let textBlocks: (TextBlocks | ImageBlock | VideoBlock)[] | undefined;

    if (textFormatMap[child.name]) {
      textBlocks = generateTextBlocks(child, [textFormatMap[captionData.name]]);
    }

    if (child.type === 'text') {
      textBlocks = generateTextBlocks(child);
    } else {
      switch (child.name) {
        case Tags.Paragraph:
        case Tags.Heading1:
        case Tags.Heading2:
        case Tags.Heading3:
        case Tags.Heading4:
        case Tags.Heading5:
        case Tags.Heading6:
        case Tags.Preformatted:
          block = generateParagraphBlock(child);
          break;
        case Tags.OrderedList:
          block = generateListBlock(child, BlockType.OrderedList);
          break;
        case Tags.UnorderedList:
          block = generateListBlock(child, BlockType.UnorderedList);
          break;
        case Tags.Image:
          block = generateImageBlock(child);
          break;
        case Tags.Video:
          block = generateVideoBlock(child);
          break;
        case Tags.Span:
        case Tags.LineBreak:
        case Tags.Anchor:
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
  if (type === Tags.TableBody) {
    rowType = RowType.Body;
  } else if (type === Tags.TableHead) {
    rowType = RowType.Header;
  } else if (type === Tags.TableFooter) {
    rowType = RowType.Footer;
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

const getHorizontalAndVerticalAlignProperty = (
  jsonObject: Record<string, string>,
  propertyName: string,
): string | undefined => {
  let property: string | undefined;
  if (Object.prototype.hasOwnProperty.call(jsonObject, propertyName)) {
    property =
      jsonObject[propertyName].charAt(0).toUpperCase() +
      jsonObject[propertyName].slice(1);
  }
  return property;
};
