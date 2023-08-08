import { BlockType } from './block';
import { ImageBlock } from './image';
import { ListBlock } from './list';
import { ParagraphBlock } from './paragraph';
import { TextBlock } from './text';
import { VideoBlock } from './video';

export interface TableBlock {
  type: BlockType.Table;
  table: {
    rows: TableRowBlock[];
    properties?: TableProperties;
  };
}

export interface TableRowBlock {
  cells: TableCellBlock[];
  properties?: TableRowProperties;
}

export interface TableCellBlock {
  blocks: TableCellContentBlock[];
  properties?: TableCellProperties;
}

export type TableCellContentBlock =
  | ParagraphBlock
  | TextBlock
  | ImageBlock
  | VideoBlock
  | ListBlock
  | TableBlock;

export interface TableProperties {
  width?: number;
  height?: number;
  cellSpacing?: number;
  cellPadding?: number;
  borderWidth?: number;
  alignment?: TableBlockHorizontalAlignType;
  borderStyle?: TableBorderStyleType;
  borderColor?: string;
  backgroundColor?: string;
  caption?: TableCaptionBlock;
}

export interface TableCaptionBlock {
  blocks: TableCaptionContentBlock[];
}

export type TableCaptionContentBlock =
  | TextBlock
  | ParagraphBlock
  | ImageBlock
  | VideoBlock
  | ListBlock;

export interface TableRowProperties {
  rowType?: TableRowType;
  alignment?: TableBlockHorizontalAlignType;
  height?: number;
  borderStyle?: TableBorderStyleType;
  borderColor?: string;
  backgroundColor?: string;
}

export interface TableCellProperties {
  cellType?: TableBlockCellType;
  scope?: TableBlockScopeType;
  width?: number;
  height?: number;
  horizontalAlign?: TableBlockHorizontalAlignType;
  verticalAlign?: TableBlockVerticalAlignType;
  borderWidth?: number;
  borderStyle?: TableBorderStyleType;
  borderColor?: string;
  backgroundColor?: string;
  colSpan?: number;
  rowSpan?: number;
}

export enum TableRowType {
  Header = 'Header',
  Body = 'Body',
  Footer = 'Footer',
}

export enum TableBlockCellType {
  Cell = 'Cell',
  HeaderCell = 'HeaderCell',
}

export enum TableBlockScopeType {
  Row = 'row',
  Column = 'col',
  RowGroup = 'rowgroup',
  ColumnGroup = 'colgroup',
  None = 'none',
  ['row'] = 'Row',
  ['col'] = 'Column',
  ['rowgroup'] = 'RowGroup',
  ['colgroup'] = 'ColumnGroup',
}

export enum TableBlockHorizontalAlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export enum TableBlockVerticalAlignType {
  Top = 'top',
  Middle = 'middle',
  Bottom = 'bottom',
}

export enum TableBorderStyleType {
  Solid = 'solid',
  Dotted = 'dotted',
  Dashed = 'dashed',
  Double = 'double',
  Groove = 'groove',
  Ridge = 'ridge',
  Inset = 'inset',
  Outset = 'outset',
  Hidden = 'hidden',
  None = 'none',
}
