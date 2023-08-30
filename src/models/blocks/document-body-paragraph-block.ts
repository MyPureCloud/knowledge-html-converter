import {
  DocumentBodyBlockType,
  DocumentBodyBlockAlignType,
  DocumentBodyBlockFontSize,
  DocumentBodyBlockFontType,
} from './document-body-block';
import { DocumentContentBlock } from './document-content-block';

export interface DocumentBodyParagraphBlock {
  type: DocumentBodyBlockType.Paragraph;
  paragraph: {
    blocks: DocumentContentBlock[];
    properties?: DocumentBodyParagraphProperties;
  };
}

export interface DocumentBodyParagraphProperties {
  align?: DocumentBodyBlockAlignType;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: DocumentBodyBlockFontSize;
  fontType?: DocumentBodyBlockFontType;
  indentation?: number;
}
