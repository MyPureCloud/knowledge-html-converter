import { DocumentBodyBlockFontSize } from './document-body-block';

export interface TextContentBlock {
  text?: DocumentText;
}

export interface DocumentTextBlock {
  type: 'Text';
  text: DocumentText;
}

export interface DocumentText {
  text: string;
  marks?: DocumentTextMarks[];
  hyperlink?: string;
  properties?: DocumentTextProperties;
}

export enum DocumentTextMarks {
  Bold = 'Bold',
  Italic = 'Italic',
  Underline = 'Underline',
  Strikethrough = 'Strikethrough',
  Subscript = 'Subscript',
  Superscript = 'Superscript',
}

export interface DocumentTextProperties {
  fontSize?: DocumentBodyBlockFontSize;
  textColor?: string;
  backgroundColor?: string;
}
