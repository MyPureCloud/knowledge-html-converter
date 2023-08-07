import { AstElement } from 'html-parse-stringify';
import { StyleAttributes, Tags } from '../models/html';
import { BlockTypes } from '../models/blocks/block-type';
import { ImageBlock } from '../models/blocks/image';
import {
  AllowedProperties,
  FontSize,
  TextProperties,
  TextBlock,
  TextBlocks,
  TextDataType,
} from '../models/blocks/text';
import { VideoBlock } from '../models/blocks/video';
import { generateHyperlinkBlock } from './hyperlink';
import { convertRgbToHex, generateImageBlock } from './image';
import { generateVideoBlock } from './video';

export const generateTextBlocks = (
  textData: AstElement,
  attributes: AllowedProperties[] = [],
  properties = {},
  textProperties?: TextProperties,
): (TextBlocks | ImageBlock | VideoBlock)[] => {
  const arr: (TextBlocks | ImageBlock | VideoBlock)[] = [];
  if (textData.type === TextDataType.Text) {
    if (textData.content) {
      arr.push(assignAttributes(textData.content, textProperties, attributes));
    }
  } else if (
    textData.type === TextDataType.Tag &&
    textData.name === Tags.LineBreak
  ) {
    arr.push(assignAttributes('\n'));
  } else if (
    textData.type === TextDataType.Tag &&
    textData.name === Tags.Image
  ) {
    arr.push(
      generateImageBlock(textData, { ...properties, ...textProperties }),
    );
  } else if (
    textData.type === TextDataType.Tag &&
    textData.name === Tags.Anchor
  ) {
    arr.push(generateHyperlinkBlock(textData, attributes));
  } else if (
    textData.type === TextDataType.Tag &&
    textData.name === Tags.Video
  ) {
    arr.push(generateVideoBlock(textData));
  } else {
    if (
      textData.type === TextDataType.Tag &&
      textData.name === Tags.Span &&
      textData.attrs?.style
    ) {
      textProperties = Object.assign(
        textProperties ? textProperties : {},
        generateTextProperties(textData.attrs.style),
      );
    }
    const textFormatMap: Record<string, AllowedProperties> = {
      strong: AllowedProperties.Bold,
      em: AllowedProperties.Italic,
      u: AllowedProperties.Underline,
      s: AllowedProperties.Strikethrough,
      sub: AllowedProperties.Subscript,
      sup: AllowedProperties.Superscript,
    };
    textData.children?.forEach((child) => {
      const attribute = textFormatMap[textData.name] as
        | AllowedProperties
        | undefined;
      if (attribute) {
        arr.push(
          ...generateTextBlocks(
            child,
            [...attributes, attribute],
            properties,
            textProperties,
          ),
        );
      } else {
        arr.push(
          ...generateTextBlocks(child, attributes, properties, textProperties),
        );
      }
    });
  }
  return arr;
};

export const generateTextProperties = (
  styles: string,
): TextProperties | undefined => {
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
          if (keyValue[0] === StyleAttributes.BackgroundColor) {
            backgroundColor = keyValue[1].startsWith('#')
              ? keyValue[1]
              : convertRgbToHex(keyValue[1]);
          }
          if (keyValue[0] === StyleAttributes.FontSize) {
            fontSize = getFontSizeName(keyValue[1]);
          }
          if (keyValue[0] === StyleAttributes.TextColor) {
            textColor = keyValue[1].startsWith('#')
              ? keyValue[1]
              : convertRgbToHex(keyValue[1]);
          }
        }
      });
    if (backgroundColor || fontSize || textColor) {
      textProperties = Object.assign(
        {},
        backgroundColor && { backgroundColor },
        fontSize && { fontSize },
        textColor && { textColor },
      );
    }
  }
  return textProperties;
};

export const getFontSizeName = (fontSize: string): string => {
  return Object.keys(FontSize)[
    Object.values(FontSize).indexOf(fontSize as unknown as FontSize)
  ];
};

const assignAttributes = (
  text: string,
  properties: TextProperties | null = null,
  attributes: AllowedProperties[] = [],
): TextBlocks => {
  const textBlock: TextBlock = {
    text: '',
  };
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
    text: textBlock,
  };

  return textBlocks;
};
