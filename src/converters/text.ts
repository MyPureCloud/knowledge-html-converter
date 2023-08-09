import { AstElement, AstElementType } from 'html-parse-stringify';
import { StyleAttribute, Tag } from '../models/html';
import { ContentBlock, ContentBlockType } from '../models/blocks/content-block';
import {
  TextMark,
  FontSize,
  TextProperties,
  Text,
  TextBlock,
} from '../models/blocks/text';
import { generateHyperlinkBlock } from './hyperlink';
import { convertRgbToHex, generateImageBlock } from './image';
import { generateVideoBlock } from './video';

export const generateTextBlocks = (
  textData: AstElement,
  attributes: TextMark[] = [],
  properties = {},
  textProperties?: TextProperties,
): ContentBlock[] => {
  const arr: ContentBlock[] = [];
  if (textData.type === AstElementType.Text) {
    if (textData.content) {
      arr.push(assignAttributes(textData.content, textProperties, attributes));
    }
  } else if (
    textData.type === AstElementType.Tag &&
    textData.name === Tag.LineBreak
  ) {
    arr.push(assignAttributes('\n'));
  } else if (
    textData.type === AstElementType.Tag &&
    textData.name === Tag.Image
  ) {
    arr.push(
      generateImageBlock(textData, { ...properties, ...textProperties }),
    );
  } else if (
    textData.type === AstElementType.Tag &&
    textData.name === Tag.Anchor
  ) {
    arr.push(generateHyperlinkBlock(textData, attributes));
  } else if (
    textData.type === AstElementType.Tag &&
    textData.name === Tag.Video
  ) {
    arr.push(generateVideoBlock(textData));
  } else {
    if (
      textData.type === AstElementType.Tag &&
      textData.name === Tag.Span &&
      textData.attrs?.style
    ) {
      textProperties = Object.assign(
        textProperties ? textProperties : {},
        generateTextProperties(textData.attrs.style),
      );
    }
    const textFormatMap: Record<string, TextMark> = {
      strong: TextMark.Bold,
      em: TextMark.Italic,
      u: TextMark.Underline,
      s: TextMark.Strikethrough,
      sub: TextMark.Subscript,
      sup: TextMark.Superscript,
    };
    textData.children?.forEach((child) => {
      const attribute = textFormatMap[textData.name] as TextMark | undefined;
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
    let backgroundColor: string | undefined;
    let fontSize: FontSize | undefined;
    let textColor: string | undefined;
    styles
      .split(/\s*;\s*/) //split with extra spaces around the semi colon
      .map((chunk: string) => chunk.split(/\s*:\s*/)) //split key:value with colon
      .map((keyValue: string[]) => {
        if (keyValue.length === 2) {
          if (keyValue[0] === StyleAttribute.BackgroundColor) {
            backgroundColor = keyValue[1].startsWith('#')
              ? keyValue[1]
              : convertRgbToHex(keyValue[1]);
          }
          if (keyValue[0] === StyleAttribute.FontSize) {
            fontSize = getFontSizeName(keyValue[1]);
          }
          if (keyValue[0] === StyleAttribute.TextColor) {
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

export const getFontSizeName = (
  htmlFontSizeValue: string,
): FontSize | undefined => {
  // TODO make this more robust
  switch (htmlFontSizeValue) {
    case '9px':
      return FontSize.XxSmall;
    case '10px':
      return FontSize.XSmall;
    case '13.333px':
      return FontSize.Small;
    case '16px':
      return FontSize.Medium;
    case '18px':
      return FontSize.Large;
    case '24px':
      return FontSize.XLarge;
    case '32px':
      return FontSize.XxLarge;
    default:
      return undefined;
  }
};

const assignAttributes = (
  text: string,
  properties: TextProperties | null = null,
  attributes: TextMark[] = [],
): TextBlock => {
  const textBlock: Text = {
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

  const textBlocks: TextBlock = {
    type: ContentBlockType.Text,
    text: textBlock,
  };

  return textBlocks;
};
