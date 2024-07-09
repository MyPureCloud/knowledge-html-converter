import {
  DocumentBodyBlockAlignType,
  DocumentBodyBlockFontSize,
  DocumentBodyBlockFontType,
} from './document-body-block.js';
import {
  DocumentBodyTableBlockHorizontalAlignType,
  DocumentBodyTableBorderStyleType,
} from './document-body-table.js';

export interface DocumentTextBlock {
  type: 'Text';
  text: DocumentText;
}

export interface DocumentText {
  text: string;
  marks?: DocumentTextMarks[];
  hyperlink?: string;
  externalDocumentId?: string;
  externalVariationName?: string;
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

export interface DocumentBlockProperties {
  align?: DocumentBodyBlockAlignType;
  horizontalAlign?: DocumentBodyTableBlockHorizontalAlignType;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: DocumentBodyBlockFontSize;
  fontType?: DocumentBodyBlockFontType;
  indentation?: number;
  borderStyle?: DocumentBodyTableBorderStyleType;
  borderColor?: string;
  borderWidth?: string;
}
