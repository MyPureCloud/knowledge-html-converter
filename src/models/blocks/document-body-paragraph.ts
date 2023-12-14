import {
  DocumentBodyBlockAlignType,
  DocumentBodyBlockFontSize,
  DocumentBodyBlockFontType,
} from './document-body-block.js';
import { DocumentBodyImage } from './document-body-image.js';
import { DocumentBodyVideo } from './document-body-video.js';
import { DocumentText } from './document-text.js';

export interface DocumentBodyParagraphBlock {
  type: 'Paragraph';
  paragraph: DocumentBodyParagraph;
}

export interface DocumentBodyParagraph {
  blocks: DocumentContentBlock[];
  properties?: DocumentBodyParagraphProperties;
}

export interface DocumentContentBlock {
  type: DocumentContentBlockType;
  text?: DocumentText;
  image?: DocumentBodyImage;
  video?: DocumentBodyVideo;
}

export type DocumentContentBlockType = 'Text' | 'Image' | 'Video';

export interface DocumentBodyParagraphProperties {
  align?: DocumentBodyBlockAlignType;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: DocumentBodyBlockFontSize;
  fontType?: DocumentBodyBlockFontType;
  indentation?: number;
}
