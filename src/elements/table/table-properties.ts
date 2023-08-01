import { AstElement } from 'html-parse-stringify';
import { BlockTypes, StyleProperties, TagNames } from '../../tags';
import { ImageBlock, convertRgbToHex, generateImageBlock } from '../image';
import { generateListBlock } from '../list';
import {
  CaptionBlock,
  CaptionBlockType,
  CaptionItem,
  RowType
} from './table-models';
import { AllowedProperties, TextBlocks, generateTextBlocks } from '../text';
import { VideoBlock, generateVideoBlock } from '../video';

const emPattern = /^\d+(?:\.\d+)?em$/;
const pxPattern = /^\d+(?:\.\d+)?px$/;
const percentagePattern = /^\d+(?:\.\d+)?%$/;

export const getTablePropertiesJSON = (blockData: AstElement): Record<string, string> => {
  const jsonObject: Record<string, string> = {};
  blockData.attrs?.style
    .split(/\s*;\s*/) //split with extra spaces around the semi colon
    .map((chunk: string) => chunk.split(/\s*:\s*/)) //split key:value with colon
    .map((keyValue: string[]) => {
      jsonObject[keyValue[0]] = keyValue[1];
    });
  return jsonObject;
};

export const getPadding = (jsonObject: Record<string, string>): number | undefined => {
  let padding: number | undefined;
  if (Object.prototype.hasOwnProperty.call(jsonObject, StyleProperties.Padding)) {
    if (emPattern.test(jsonObject[StyleProperties.Padding])) {
      padding = Number(jsonObject[StyleProperties.Padding].replace(/\s*em\s*/g, ''));
    } else if (pxPattern.test(jsonObject[StyleProperties.Padding])) {
      padding = convertPixelsToEM(Number(jsonObject[StyleProperties.Padding].replace(/\s*px\s*/g, '')));
    }
  }
  return padding;
};

export const getBackgroundColor = (jsonObject: Record<string, string>): string | undefined => {
  let backgroundColor: string | undefined;

  if (Object.prototype.hasOwnProperty.call(jsonObject, StyleProperties.BackgroundColor)) {
    backgroundColor = jsonObject[StyleProperties.BackgroundColor].startsWith('#')
      ? jsonObject[StyleProperties.BackgroundColor]
      : convertRgbToHex(jsonObject[StyleProperties.BackgroundColor]);
  }
  return backgroundColor;
};

export const getBorderColor = (jsonObject: Record<string, string>): string | undefined => {
  let borderColor: string | undefined;
  if (Object.prototype.hasOwnProperty.call(jsonObject, StyleProperties.BorderColor)) {
    borderColor = jsonObject[StyleProperties.BorderColor].startsWith('#')
      ? jsonObject[StyleProperties.BorderColor]
      : convertRgbToHex(jsonObject[StyleProperties.BorderColor]);
  }
  return borderColor;
}

export const getBorderStyle = (jsonObject: Record<string, string>): string | undefined => {
  let borderStyle: string | undefined;
  if (Object.prototype.hasOwnProperty.call(jsonObject, StyleProperties.BorderStyle)) {
    borderStyle =
      jsonObject[StyleProperties.BorderStyle].charAt(0).toUpperCase() +
      jsonObject[StyleProperties.BorderStyle].slice(1);
  }
  return borderStyle;
};

export const getBorderProperties = (jsonObject: Record<string, string>): (number | string | undefined)[] => {
  let borderWidth: number | undefined;
  let borderStyle: string | undefined;
  let borderColor: string | undefined;
  if (Object.prototype.hasOwnProperty.call(jsonObject, StyleProperties.Border)) {
    const properties = jsonObject[StyleProperties.Border].split(' ');
    const result = properties.splice(0, 2);
    result.push(properties.join(' '));

    // border width
    if (emPattern.test(result[0])) {
      borderWidth = Number(result[0].replace(/\s*em\s*/g, ''));
    } else if (pxPattern.test(result[0])) {
      borderWidth = convertPixelsToEM(Number(result[0].replace(/\s*px\s*/g, '')));
    }
    // border style
    borderStyle = result[1].charAt(0).toUpperCase() + result[1].slice(1);

    // border color
    borderColor = result[2].startsWith('#') ? result[2] : convertRgbToHex(result[2]);
  }
  return [borderWidth, borderStyle, borderColor];
};

export const getAlignment = (jsonObject: Record<string, string>): string | undefined => {
  let alignment: string | undefined;
  if (
    Object.prototype.hasOwnProperty.call(jsonObject, StyleProperties.MarginLeft) &&
    Object.prototype.hasOwnProperty.call(jsonObject, StyleProperties.MarginRight)
  ) {
    if (jsonObject[StyleProperties.MarginLeft] === '0px' && jsonObject[StyleProperties.MarginRight] === 'auto') {
      alignment = 'Left';
    } else if (
      jsonObject[StyleProperties.MarginLeft] === 'auto' &&
      jsonObject[StyleProperties.MarginRight] === 'auto'
    ) {
      alignment = 'Center';
    } else if (
      jsonObject[StyleProperties.MarginLeft] === 'auto' &&
      jsonObject[StyleProperties.MarginRight] === '0px'
    ) {
      alignment = 'Right';
    }
  }
  return alignment;
};

export const getHorizontalAlign = (jsonObject: Record<string, string>): string | undefined => {
  return getHorizontalAndVerticalAlignProperty(jsonObject, StyleProperties.Align);
};

export const getVerticalAlign = (jsonObject: Record<string, string>): string | undefined => {
  return getHorizontalAndVerticalAlignProperty(jsonObject, StyleProperties.VerticalAlign);
};

export const getBorderWidth = (jsonObject: Record<string, string>): number | undefined => {
  return getHeightAndWidthProperty(jsonObject, StyleProperties.BorderWidth);
};

export const getBorderSpacing = (jsonObject: Record<string, string>): number | undefined => {
  return getHeightAndWidthProperty(jsonObject, StyleProperties.BorderSpacing);
};

export const getHeight = (jsonObject: Record<string, string>): number | undefined => {
  return getHeightAndWidthProperty(jsonObject, StyleProperties.Height);
};

export const getWidth = (jsonObject: Record<string, string>): number | undefined => {
  return getHeightAndWidthProperty(jsonObject, StyleProperties.Width);
};

export const getCaption = (captionData: AstElement): CaptionBlock => {
  const captionBlock = {
    blocks: [] as CaptionItem[]
  } as CaptionBlock;
  const blocks: CaptionBlockType[] = [];

  const textFormatMap: Record<string, AllowedProperties> = {
    strong: AllowedProperties.Bold,
    em: AllowedProperties.Italic,
    u: AllowedProperties.Underline,
    s: AllowedProperties.Strikethrough,
    sub: AllowedProperties.Subscript,
    sup: AllowedProperties.Superscript
  };
  captionData.children?.forEach((child) => {
    let block: CaptionBlockType | undefined;
    let textBlocks: (TextBlocks | ImageBlock | VideoBlock)[] | undefined;

    if (textFormatMap[child.name]) {
      textBlocks = generateTextBlocks(child, [textFormatMap[captionData.name]]);
    }

    if (child.type === 'text') {
      textBlocks = generateTextBlocks(child);
    } else {
      switch (child.name) {
        case TagNames.OrderedList:
          block = generateListBlock(child, BlockTypes.OrderedList);
          break;
        case TagNames.UnorderedList:
          block = generateListBlock(child, BlockTypes.UnorderedList);
          break;
        case TagNames.Image:
          block = generateImageBlock(child);
          break;
        case TagNames.Video:
          block = generateVideoBlock(child);
          break;
        case TagNames.Span:
        case TagNames.LineBreak:
        case TagNames.Anchor:
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
  if (type === TagNames.TableBody) {
    rowType = RowType.Body;
  } else if (type === TagNames.TableHead) {
    rowType = RowType.Header;
  } else if (type === TagNames.TableFooter) {
    rowType = RowType.Footer;
  }
  return rowType;
};

export const convertPixelsToEM = (value: number): number => {
  return value / 16; // 16 is the base font-size for browsers
};

export const convertPercentageToEM = (value: number): number => {
  // TODO tox-edit-area?
  //const parentWidth = document.getElementsByClassName('tox-edit-area')[0].clientWidth - 32;
  const parentWidth = 800;
  const pxValue = (parentWidth / 100) * value;
  return convertPixelsToEM(pxValue);
};

const getHeightAndWidthProperty = (jsonObject: Record<string, string>, propertyName: string): number | undefined => {
  let property: number | undefined;
  if (Object.prototype.hasOwnProperty.call(jsonObject, propertyName)) {
    if (emPattern.test(jsonObject[propertyName])) {
      property = Number(jsonObject[propertyName].replace(/\s*em\s*/g, ''));
    } else if (pxPattern.test(jsonObject[propertyName])) {
      property = convertPixelsToEM(Number(jsonObject[propertyName].replace(/\s*px\s*/g, '')));
    } else if (percentagePattern.test(jsonObject[propertyName])) {
      property = convertPercentageToEM(Number(jsonObject[propertyName].replace(/\s*%\s*/g, '')));
    }
  }
  return property;
};

const getHorizontalAndVerticalAlignProperty = (jsonObject: Record<string, string>, propertyName: string): string | undefined => {
  let property: string | undefined;
  if (Object.prototype.hasOwnProperty.call(jsonObject, propertyName)) {
    property = jsonObject[propertyName].charAt(0).toUpperCase() + jsonObject[propertyName].slice(1);
  }
  return property;
};
