import { DocumentBodyImage } from './document-body-image.js';
import { DocumentBodyList } from './document-body-list.js';
import { DocumentBodyParagraph } from './document-body-paragraph.js';
import { DocumentText } from './document-text.js';
import { DocumentBodyVideo } from './document-body-video.js';
import { DocumentElementLength } from './document-element-length.js';

export interface DocumentBodyTableBlock {
  type: 'Table';
  table: DocumentBodyTable;
}

export interface DocumentBodyTable {
  rows: DocumentBodyTableRowBlock[];
  properties?: DocumentBodyTableProperties;
}

export interface DocumentBodyTableRowBlock {
  cells: DocumentBodyTableCellBlock[];
  properties?: DocumentBodyTableRowBlockProperties;
}

export interface DocumentBodyTableCellBlock {
  blocks: DocumentTableContentBlock[];
  properties?: DocumentBodyTableCellBlockProperties;
}

export interface DocumentTableContentBlock {
  type: DocumentTableContentBlockType;
  paragraph?: DocumentBodyParagraph;
  text?: DocumentText;
  image?: DocumentBodyImage;
  video?: DocumentBodyVideo;
  list?: DocumentBodyList;
  table?: DocumentBodyTable;
}

export type DocumentTableContentBlockType =
  | 'Paragraph'
  | 'Text'
  | 'Image'
  | 'Video'
  | 'OrderedList'
  | 'UnorderedList'
  | 'Table';

export interface DocumentBodyTableProperties {
  width?: number;
  widthWithUnit?: DocumentElementLength;
  height?: number;
  cellSpacing?: number;
  cellPadding?: number;
  borderWidth?: number;
  alignment?: DocumentBodyTableBlockHorizontalAlignType;
  borderStyle?: DocumentBodyTableBorderStyleType;
  borderColor?: string;
  backgroundColor?: string;
  caption?: DocumentBodyTableCaptionBlock;
}

export interface DocumentBodyTableCaptionBlock {
  blocks: DocumentBodyTableCaptionItem[];
}

export interface DocumentBodyTableCaptionItem {
  type: DocumentBodyTableCaptionItemType;
  text?: DocumentText;
  paragraph?: DocumentBodyParagraph;
  image?: DocumentBodyImage;
  video?: DocumentBodyVideo;
  list?: DocumentBodyList;
}

export type DocumentBodyTableCaptionItemType =
  | 'Text'
  | 'Paragraph'
  | 'Image'
  | 'Video'
  | 'OrderedList'
  | 'UnorderedList';

export interface DocumentBodyTableRowBlockProperties {
  rowType?: DocumentBodyTableBlockRowType;
  alignment?: DocumentBodyTableBlockHorizontalAlignType;
  height?: number;
  borderStyle?: DocumentBodyTableBorderStyleType;
  borderColor?: string;
  backgroundColor?: string;
}

export interface DocumentBodyTableCellBlockProperties {
  cellType?: DocumentBodyTableBlockCellType;
  width?: number;
  widthWithUnit?: DocumentElementLength;
  height?: number;
  horizontalAlign?: DocumentBodyTableBlockHorizontalAlignType;
  verticalAlign?: DocumentBodyTableBlockVerticalAlignType;
  borderWidth?: number;
  borderStyle?: DocumentBodyTableBorderStyleType;
  borderColor?: string;
  backgroundColor?: string;
  scope?: DocumentBodyTableBlockScopeType;
  colSpan?: number;
  rowSpan?: number;
}

export enum DocumentBodyTableBlockRowType {
  Header = 'Header',
  Body = 'Body',
  Footer = 'Footer',
}

export enum DocumentBodyTableBlockCellType {
  Cell = 'Cell',
  HeaderCell = 'HeaderCell',
}

export enum DocumentBodyTableBlockScopeType {
  Row = 'Row',
  Column = 'Column',
  RowGroup = 'RowGroup',
  ColumnGroup = 'ColumnGroup',
}

export enum DocumentBodyTableBlockHorizontalAlignType {
  Center = 'Center',
  Left = 'Left',
  Right = 'Right',
}

export enum DocumentBodyTableBlockVerticalAlignType {
  Top = 'Top',
  Middle = 'Middle',
  Bottom = 'Bottom',
}

export enum DocumentBodyTableBorderStyleType {
  Solid = 'Solid',
  Dotted = 'Dotted',
  Dashed = 'Dashed',
  Double = 'Double',
  Groove = 'Groove',
  Ridge = 'Ridge',
  Inset = 'Inset',
  Outset = 'Outset',
  Hidden = 'Hidden',
  None = 'None',
}
