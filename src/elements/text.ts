import { AstElement } from 'html-parse-stringify';
import { BlockTypes, StyleProperties, TagNames } from '../tags';
import { HyperlinkProperties, generateHyperlinkBlock } from './hyperlink';
import { ImageBlock, convertRgbToHex, generateImageBlock } from './image';
import { VideoBlock, generateVideoBlock } from './video';

export interface TextBlocks {
  type: BlockTypes.TextBlocks;
  text: TextBlock;
}

export enum TextDataType {
  Tag = 'tag',
  Text = 'text'
}

export enum AllowedProperties {
  Bold = 'Bold',
  Italic = 'Italic',
  Underline = 'Underline',
  Strikethrough = 'Strikethrough',
  Subscript = 'Subscript',
  Superscript = 'Superscript'
}

export enum FontSize {
  XxSmall = '9px',
  XSmall = '10px',
  Small = '13.333px',
  Medium = '16px',
  Large = '18px',
  XLarge = '24px',
  XxLarge = '32px'
}

export interface TextProperties {
  fontSize?: FontSize;
  textColor?: string;
  backgroundColor?: string;
}

export interface TextBlock {
  text: string;
  marks?: Array<
    | AllowedProperties.Bold
    | AllowedProperties.Italic
    | AllowedProperties.Underline
    | AllowedProperties.Strikethrough
    | AllowedProperties.Subscript
    | AllowedProperties.Superscript
  >;
  properties?: TextProperties;
  hyperlink?: string;
  hyperlinkProperties?: HyperlinkProperties;
}

export const generateTextBlocks = (
  textData: AstElement,
  attributes: AllowedProperties[] = [],
  properties = {},
  textProperties?: TextProperties
): (TextBlocks | ImageBlock | VideoBlock)[] => {
  const arr: (TextBlocks | ImageBlock | VideoBlock)[] = [];
  if (textData.type === TextDataType.Text) {
    if (textData.content) {
      arr.push(assignAttributes(textData.content, textProperties, attributes));
    }
  } else if (textData.type === TextDataType.Tag && textData.name === TagNames.LineBreak) {
    arr.push(assignAttributes('\n'));
  } else if (textData.type === TextDataType.Tag && textData.name === TagNames.Image) {
    arr.push(generateImageBlock(textData, { ...properties, ...textProperties }));
  } else if (textData.type === TextDataType.Tag && textData.name === TagNames.Anchor) {
    arr.push(generateHyperlinkBlock(textData, attributes));
  } else if (textData.type === TextDataType.Tag && textData.name === TagNames.Video) {
    arr.push(generateVideoBlock(textData));
  } else {
    if (textData.type === TextDataType.Tag && textData.name === TagNames.Span && textData.attrs?.style) {
      textProperties = Object.assign(
        textProperties ? textProperties : {},
        generateTextProperties(textData.attrs.style)
      );
    }
    const textFormatMap = {
      strong: AllowedProperties.Bold,
      em: AllowedProperties.Italic,
      u: AllowedProperties.Underline,
      s: AllowedProperties.Strikethrough,
      sub: AllowedProperties.Subscript,
      sup: AllowedProperties.Superscript
    };
    textData.children?.forEach((child) => {
      const attribute = (textFormatMap as any)[textData.name] as AllowedProperties | undefined;
      if (attribute) {
        arr.push(...generateTextBlocks(child, [...attributes, attribute], properties, textProperties));
      } else {
        arr.push(...generateTextBlocks(child, attributes, properties, textProperties));
      }
    });
  }
  return arr;
};

export const generateTextProperties = (styles: string): TextProperties | undefined => {
  let textProperties: TextProperties | undefined;
  if (styles) {
    let backgroundColor;
    let fontSize;
    let textColor;
    styles
      .split(/\s*;\s*/) //split with extra spaces around the semi colon
      .map((chunk: string) => chunk.split(/\s*:\s*/)) //split key:value with colon
      .map((keyValue: string[]) => {
        if (keyValue.length === 2) {
          if (keyValue[0] === StyleProperties.BackgroundColor) {
            backgroundColor = keyValue[1].startsWith('#') ? keyValue[1] : convertRgbToHex(keyValue[1]);
          }
          if (keyValue[0] === StyleProperties.FontSize) {
            fontSize = getFontSizeName(keyValue[1]);
          }
          if (keyValue[0] === StyleProperties.TextColor) {
            textColor = keyValue[1].startsWith('#') ? keyValue[1] : convertRgbToHex(keyValue[1]);
          }
        }
      });
    if (backgroundColor || fontSize || textColor) {
      textProperties = Object.assign(
        {},
        backgroundColor && { backgroundColor },
        fontSize && { fontSize },
        textColor && { textColor }
      );
    }
  }
  return textProperties;
};

export const getFontSizeName = (fontSize: string): string => {
  return Object.keys(FontSize)[Object.values(FontSize).indexOf(fontSize as unknown as FontSize)];
};

const assignAttributes = (text: string, properties: TextProperties | null = null, attributes: AllowedProperties[] = []): TextBlocks => {
  const textBlock: TextBlock = {
    text: ''
  } as TextBlock;
  textBlock.text = text;
  if (properties) {
    textBlock.properties = properties;
  }
  if (attributes.length) {
    textBlock.marks = [];
    attributes.forEach((attr) => {
      if (attr !== undefined) {
        textBlock.marks!.push(attr);
      }
    });
  }

  const textBlocks: TextBlocks = {
    type: BlockTypes.TextBlocks,
    text: textBlock
  } as TextBlocks;

  return textBlocks;
};
