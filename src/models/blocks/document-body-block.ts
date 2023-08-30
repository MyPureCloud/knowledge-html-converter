import { DocumentBodyImageBlock } from './document-body-image-block';
import { DocumentBodyListBlock } from './document-body-list-block';
import { DocumentBodyParagraphBlock } from './document-body-paragraph-block';
import { DocumentBodyTableBlock } from './document-body-table-block';
import { DocumentBodyVideoBlock } from './document-body-video-block';

export type DocumentBodyBlock =
  | DocumentBodyParagraphBlock
  | DocumentBodyImageBlock
  | DocumentBodyVideoBlock
  | DocumentBodyListBlock
  | DocumentBodyTableBlock;

export enum DocumentBodyBlockType {
  Paragraph = 'Paragraph',
  Image = 'Image',
  Video = 'Video',
  OrderedList = 'OrderedList',
  UnorderedList = 'UnorderedList',
  Table = 'Table',
}

export enum DocumentBodyBlockAlignType {
  Center = 'Center',
  Left = 'Left',
  Right = 'Right',
  Justify = 'Justify',
}

export enum DocumentBodyBlockFontSize {
  XxSmall = 'XxSmall',
  XSmall = 'XSmall',
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
  XLarge = 'XLarge',
  XxLarge = 'XxLarge',
}

export enum DocumentBodyBlockFontType {
  Heading1 = 'Heading1',
  Heading2 = 'Heading2',
  Heading3 = 'Heading3',
  Heading4 = 'Heading4',
  Heading5 = 'Heading5',
  Heading6 = 'Heading6',
  Paragraph = 'Paragraph',
  Preformatted = 'Preformatted',
}
