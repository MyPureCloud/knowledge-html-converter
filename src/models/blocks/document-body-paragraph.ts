import {
  DocumentBodyBlockAlignType,
  DocumentBodyBlockFontSize,
  DocumentBodyBlockFontType,
} from './document-body-block';
import { DocumentBodyImage } from './document-body-image';
import { DocumentBodyVideo } from './document-body-video';
import { DocumentText } from './document-text';

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

export enum DocumentContentBlockType {
  Text = 'Text',
  Image = 'Image',
  Video = 'Video',
}

export interface DocumentBodyParagraphProperties {
  align?: DocumentBodyBlockAlignType;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: DocumentBodyBlockFontSize;
  fontType?: DocumentBodyBlockFontType;
  indentation?: number;
}
