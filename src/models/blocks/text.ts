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
