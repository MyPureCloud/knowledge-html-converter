import { DocumentBodyImage } from './document-body-image.js';
import { DocumentBodyList } from './document-body-list.js';
import { DocumentBodyParagraph } from './document-body-paragraph.js';
import { DocumentBodyTable } from './document-body-table.js';
import { DocumentBodyVideo } from './document-body-video.js';

export interface DocumentBodyBlock {
  type: DocumentBodyBlockType;
  paragraph?: DocumentBodyParagraph;
  image?: DocumentBodyImage;
  video?: DocumentBodyVideo;
  list?: DocumentBodyList;
  table?: DocumentBodyTable;
}

export type DocumentBodyBlockType =
  | 'Paragraph'
  | 'Image'
  | 'Video'
  | 'OrderedList'
  | 'UnorderedList'
  | 'Table';

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
