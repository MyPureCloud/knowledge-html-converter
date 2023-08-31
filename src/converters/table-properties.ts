import { DomNode, DomNodeType } from 'html-parse-stringify';
import { StyleAttribute, Tag } from '../models/html';
import { DocumentContentBlock } from '../models/blocks/document-body-paragraph';
import {
  DocumentBodyTableBlockHorizontalAlignType,
  DocumentBodyTableBlockVerticalAlignType,
  DocumentBodyTableBorderStyleType,
  DocumentBodyTableCaptionBlock,
  DocumentBodyTableCaptionItem,
} from '../models/blocks/document-body-table';
import { convertRgbToHex, generateImage } from './image';
import { generateList } from './list';
import { generateParagraph } from './paragraph';
import {
  generateTextBlocks,
  htmlTagToTextMark,
  shrinkTextNodeWhiteSpaces,
  trimEdgeTextNodes,
} from './text';
import { generateVideo } from './video';

const emPattern = /^\d+(?:\.\d+)?em$/;
const pxPattern = /^\d+(?:\.\d+)?px$/;
const percentagePattern = /^\d+(?:\.\d+)?%$/;

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
  let padding: number | undefined;
  if (
    Object.prototype.hasOwnProperty.call(styleKeyValues, StyleAttribute.Padding)
  ) {
    if (emPattern.test(styleKeyValues[StyleAttribute.Padding])) {
      padding = Number(
        styleKeyValues[StyleAttribute.Padding].replace(/\s*em\s*/g, ''),
      );
    } else if (pxPattern.test(styleKeyValues[StyleAttribute.Padding])) {
      padding = convertPixelsToEM(
        Number(styleKeyValues[StyleAttribute.Padding].replace(/\s*px\s*/g, '')),
      );
    }
  }
  return padding;
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
    backgroundColor = styleKeyValues[StyleAttribute.BackgroundColor].startsWith(
      '#',
    )
      ? styleKeyValues[StyleAttribute.BackgroundColor]
      : convertRgbToHex(styleKeyValues[StyleAttribute.BackgroundColor]);
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
    borderColor = styleKeyValues[StyleAttribute.BorderColor].startsWith('#')
      ? styleKeyValues[StyleAttribute.BorderColor]
      : convertRgbToHex(styleKeyValues[StyleAttribute.BorderColor]);
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
  const verticalAlign = styleKeyValues[StyleAttribute.VerticalAlign];
  return verticalAlign
    ? cssVerticalAlignToTableBlockVerticalAlignType(verticalAlign)
    : undefined;
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

  const children = shrinkTextNodeWhiteSpaces(
    trimEdgeTextNodes(captionElement.children),
  );

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
  return captionBlock.blocks.length ? captionBlock : undefined;
};

const generateParagraphBlock = (
  domNode: DomNode,
): DocumentBodyTableCaptionItem => {
  return {
    type: 'Paragraph',
    paragraph: generateParagraph(domNode),
  };
};

const generateListBlock = (
  domNode: DomNode,
  type: 'OrderedList' | 'UnorderedList',
): DocumentBodyTableCaptionItem | undefined => {
  const list = generateList(domNode, type);
  return list
    ? {
        type,
        list,
      }
    : undefined;
};

const generateImageBlock = (domNode: DomNode): DocumentBodyTableCaptionItem => {
  return {
    type: 'Image',
    image: generateImage(domNode),
  };
};

const generateVideoBlock = (domNode: DomNode): DocumentBodyTableCaptionItem => {
  return {
    type: 'Video',
    video: generateVideo(domNode),
  };
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
  styleKeyValues: Record<string, string>,
  key: string,
): number | undefined => {
  let value: number | undefined;
  if (Object.prototype.hasOwnProperty.call(styleKeyValues, key)) {
    if (emPattern.test(styleKeyValues[key])) {
      value = Number(styleKeyValues[key].replace(/\s*em\s*/g, ''));
    } else if (pxPattern.test(styleKeyValues[key])) {
      value = convertPixelsToEM(
        Number(styleKeyValues[key].replace(/\s*px\s*/g, '')),
      );
    } else if (percentagePattern.test(styleKeyValues[key])) {
      value = convertPercentageToEM(
        Number(styleKeyValues[key].replace(/\s*%\s*/g, '')),
      );
    }
  }
  return value;
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
