import { DocumentContentBlockType } from './document-content-block';
import { DocumentBodyBlockFontSize } from './document-body-block';

export interface DocumentTextBlock {
  type: DocumentContentBlockType.Text;
  text: DocumentText;
}

export interface DocumentText {
  text: string;
  marks?: DocumentTextMark[];
  hyperlink?: string;
  properties?: DocumentTextProperties;
}

export enum DocumentTextMark {
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
