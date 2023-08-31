import {
  DocumentBodyBlockAlignType,
  DocumentBodyBlockFontSize,
  DocumentBodyBlockFontType,
} from './document-body-block';
import { DocumentBodyImage } from './document-body-image';
import { DocumentText } from './document-text';
import { DocumentBodyVideo } from './document-body-video';

export interface DocumentBodyList {
  blocks: DocumentBodyListBlock[];
  properties?: DocumentBodyListBlockProperties;
}

export interface DocumentBodyListBlock {
  type: DocumentBodyListBlockType;
  blocks: DocumentListContentBlock[];
  properties?: DocumentBodyListItemProperties;
}

export type DocumentBodyListBlockType = 'ListItem';

export interface DocumentListContentBlock {
  type: DocumentListContentBlockType;
  text?: DocumentText;
  image?: DocumentBodyImage;
  list?: DocumentBodyList;
  video?: DocumentBodyVideo;
}

export type DocumentListContentBlockType =
  | 'Text'
  | 'Image'
  | 'OrderedList'
  | 'UnorderedList'
  | 'Video';

export interface DocumentBodyListBlockProperties {
  unorderedType?: DocumentBodyBlockUnorderedType;
  orderedType?: DocumentBodyBlockOrderedType;
}

export interface DocumentBodyListItemProperties {
  backgroundColor?: string;
  align?: DocumentBodyBlockAlignType;
  indentation?: number;
  fontSize?: DocumentBodyBlockFontSize;
  fontType?: DocumentBodyBlockFontType;
  textColor?: string;
  unorderedType?: DocumentBodyBlockUnorderedType;
  orderedType?: DocumentBodyBlockOrderedType;
}

export enum DocumentBodyBlockOrderedType {
  LowerAlpha = 'LowerAlpha',
  LowerGreek = 'LowerGreek',
  LowerRoman = 'LowerRoman',
  UpperAlpha = 'UpperAlpha',
  UpperRoman = 'UpperRoman',
  None = 'None',
}

export enum DocumentBodyBlockUnorderedType {
  Normal = 'Normal', // TODO 'normal' is not a list-style-type value
  Square = 'Square',
  Circle = 'Circle',
  None = 'None',
}
