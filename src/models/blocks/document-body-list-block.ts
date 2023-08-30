import {
  DocumentBodyBlockType,
  DocumentBodyBlockAlignType,
  DocumentBodyBlockFontSize,
  DocumentBodyBlockFontType,
} from './document-body-block';
import { DocumentBodyImageBlock } from './document-body-image-block';
import { DocumentTextBlock } from './document-text-block';
import { DocumentBodyVideoBlock } from './document-body-video-block';

export interface DocumentBodyListBlock {
  type: DocumentBodyBlockType.OrderedList | DocumentBodyBlockType.UnorderedList;
  list: {
    blocks: DocumentBodyListItemBlock[];
    properties?: DocumentBodyListBlockProperties;
  };
}

export interface DocumentBodyListItemBlock {
  type: DocumentBodyListItemBlockType.ListItem;
  blocks: DocumentListContentBlock[];
  properties?: DocumentBodyListItemProperties;
}

export enum DocumentBodyListItemBlockType {
  ListItem = 'ListItem',
}

export type DocumentListContentBlock =
  | DocumentTextBlock
  | DocumentBodyImageBlock
  | DocumentBodyListBlock
  | DocumentBodyVideoBlock;

export interface DocumentBodyListBlockProperties {
  orderedType?: DocumentBodyBlockOrderedType;
  unorderedType?: DocumentBodyBlockUnorderedType;
}

export interface DocumentBodyListItemProperties {
  align?: DocumentBodyBlockAlignType;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: DocumentBodyBlockFontSize;
  fontType?: DocumentBodyBlockFontType;
  indentation?: number;
  orderedType?: DocumentBodyBlockOrderedType;
  unorderedType?: DocumentBodyBlockUnorderedType;
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
