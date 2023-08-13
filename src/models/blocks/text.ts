import { ContentBlockType } from './content-block';

export interface TextBlock {
  type: ContentBlockType.Text;
  text: Text;
}

export interface Text {
  text: string;
  marks?: TextMark[];
  hyperlink?: string;
  properties?: TextProperties;
}

export enum TextMark {
  Bold = 'Bold',
  Italic = 'Italic',
  Underline = 'Underline',
  Strikethrough = 'Strikethrough',
  Subscript = 'Subscript',
  Superscript = 'Superscript',
}

const textMarksByHtmlTag: Record<string, TextMark> = {
  strong: TextMark.Bold,
  em: TextMark.Italic,
  u: TextMark.Underline,
  s: TextMark.Strikethrough,
  sub: TextMark.Subscript,
  sup: TextMark.Superscript,
};

export const htmlTagToTextMark = (tag: string): TextMark | undefined => {
  return tag ? textMarksByHtmlTag[tag.toLowerCase()] : undefined;
};

export interface TextProperties {
  fontSize?: FontSize;
  textColor?: string;
  backgroundColor?: string;
}

export enum FontSize {
  XxSmall = 'XxSmall',
  XSmall = 'XSmall',
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
  XLarge = 'XLarge',
  XxLarge = 'XxLarge',
}
