import { AstElement, AstElementType } from 'html-parse-stringify';
import { StyleAttribute, Tag } from '../models/html';
import { ContentBlock, ContentBlockType } from '../models/blocks/content-block';
import {
  TextMark,
  FontSize,
  TextProperties,
  Text,
  TextBlock,
  htmlTagToTextMark,
} from '../models/blocks/text';
import { generateHyperlinkBlock } from './hyperlink';
import { convertRgbToHex, generateImageBlock } from './image';
import { generateVideoBlock } from './video';

type TextBlockOptions = {
  textMarks?: TextMark[];
  hyperlink?: string;
  textProperties?: TextProperties;
};

export const generateTextBlocks = (
  textData: AstElement,
  options: TextBlockOptions = {},
): ContentBlock[] => {
  const arr: ContentBlock[] = [];
  if (textData.type === AstElementType.Text) {
    if (textData.content) {
      arr.push(assignAttributes(textData.content, options));
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
      generateImageBlock(textData, {
        hyperlink: options.hyperlink,
        ...options.textProperties,
      }),
    );
  } else if (
    textData.type === AstElementType.Tag &&
    textData.name === Tag.Anchor
  ) {
    arr.push(generateHyperlinkBlock(textData, options.textMarks));
  } else if (
    textData.type === AstElementType.Tag &&
    textData.name === Tag.Video
  ) {
    arr.push(generateVideoBlock(textData));
  } else {
    const textMarks = options.textMarks ? [...options.textMarks] : [];
    const textMark = htmlTagToTextMark(textData.name);
    if (textMark) {
      textMarks.push(textMark);
    }
    const textProperties: TextProperties = options.textProperties
      ? { ...options.textProperties }
      : {};
    if (
      textData.type === AstElementType.Tag &&
      textData.name === Tag.Span &&
      textData.attrs?.style
    ) {
      Object.assign(
        textProperties,
        generateTextProperties(textData.attrs.style),
      );
    }
    textData.children?.forEach((child) => {
      arr.push(
        ...generateTextBlocks(child, {
          ...options,
          textMarks,
          textProperties,
        }),
      );
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
  options: TextBlockOptions = {},
): TextBlock => {
  const textBlock: Text = {
    text: '',
  };
  textBlock.text = text;
  if (
    options.textProperties &&
    Object.getOwnPropertyNames(options.textProperties).length
  ) {
    textBlock.properties = options.textProperties;
  }
  if (options.textMarks && options.textMarks.length) {
    textBlock.marks = [...new Set(options.textMarks)];
  }

  const textBlocks: TextBlock = {
    type: ContentBlockType.Text,
    text: textBlock,
  };

  return textBlocks;
};
