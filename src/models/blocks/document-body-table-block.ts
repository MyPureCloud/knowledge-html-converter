import { DocumentBodyBlockType } from './document-body-block';
import { DocumentBodyImageBlock } from './document-body-image-block';
import { DocumentBodyListBlock } from './document-body-list-block';
import { DocumentBodyParagraphBlock } from './document-body-paragraph-block';
import { DocumentTextBlock } from './document-text-block';
import { DocumentBodyVideoBlock } from './document-body-video-block';

export interface DocumentBodyTableBlock {
  type: DocumentBodyBlockType.Table;
  table: {
    rows: DocumentBodyTableRowBlock[];
    properties?: DocumentBodyTableProperties;
  };
}

export interface DocumentBodyTableRowBlock {
  cells: DocumentBodyTableCellBlock[];
  properties?: DocumentBodyTableRowBlockProperties;
}

export interface DocumentBodyTableCellBlock {
  blocks: DocumentTableContentBlock[];
  properties?: DocumentBodyTableCellBlockProperties;
}

export type DocumentTableContentBlock =
  | DocumentBodyParagraphBlock
  | DocumentTextBlock
  | DocumentBodyImageBlock
  | DocumentBodyVideoBlock
  | DocumentBodyListBlock
  | DocumentBodyTableBlock;

export interface DocumentBodyTableProperties {
  width?: number;
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

export type DocumentBodyTableCaptionItem =
  | DocumentTextBlock
  | DocumentBodyParagraphBlock
  | DocumentBodyImageBlock
  | DocumentBodyVideoBlock
  | DocumentBodyListBlock;

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
  scope?: DocumentBodyTableBlockScopeType;
  width?: number;
  height?: number;
  horizontalAlign?: DocumentBodyTableBlockHorizontalAlignType;
  verticalAlign?: DocumentBodyTableBlockVerticalAlignType;
  borderWidth?: number;
  borderStyle?: DocumentBodyTableBorderStyleType;
  borderColor?: string;
  backgroundColor?: string;
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
