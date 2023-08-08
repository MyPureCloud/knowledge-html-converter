import { BlockType } from './block-type';
import { ImageBlock } from './image';
import { ListBlock } from './list';
import { ParagraphBlock } from './paragraph';
import { TextBlock, TextBlocks } from './text';
import { VideoBlock } from './video';

export interface TableBlock {
  type: BlockType.TableBlock;
  table: {
    rows: RowBlock[];
    properties?: TableProperties;
  };
}

export interface RowBlock {
  cells: CellBlock[];
  properties?: RowProperties;
}

export interface CellBlock {
  blocks: (
    | TextBlocks
    | ImageBlock
    | VideoBlock
    | ListBlock
    | ParagraphBlock
    | TableBlock
  )[];
  properties?: CellProperties;
}

export interface TableProperties {
  width?: number;
  height?: number;
  cellSpacing?: number;
  cellPadding?: number;
  borderWidth?: number;
  alignment?: HorizontalAlignType;
  borderStyle?: BorderStyleType;
  borderColor?: string;
  backgroundColor?: string;
  caption?: CaptionBlock;
}

export interface CaptionBlock {
  blocks: CaptionBlockItem[];
}

export type CaptionBlockItem =
  | ParagraphBlock
  | TextBlocks
  | ImageBlock
  | VideoBlock
  | ListBlock;

export interface CaptionItem {
  type?:
    | BlockType.TextBlocks
    | BlockType.ImageBlock
    | BlockType.VideoBlock
    | BlockType.OrderedList
    | BlockType.UnorderedList;
  text?: TextBlock;
  image?: ImageBlock;
  video?: VideoBlock;
  list?: ListBlock;
}

export interface RowProperties {
  rowType?: RowType;
  alignment?: HorizontalAlignType;
  height?: number;
  borderStyle?: BorderStyleType;
  borderColor?: string;
  backgroundColor?: string;
}
export interface CellProperties {
  cellType?: CellType;
  scope?: CellScopeType;
  width?: number;
  height?: number;
  horizontalAlign?: HorizontalAlignType;
  verticalAlign?: VerticalAlignType;
  borderWidth?: number;
  borderStyle?: BorderStyleType;
  borderColor?: string;
  backgroundColor?: string;
  colSpan?: number;
  rowSpan?: number;
}

export enum RowType {
  Header = 'Header',
  Body = 'Body',
  Footer = 'Footer',
}

export enum CellType {
  Cell = 'Cell',
  HeaderCell = 'HeaderCell',
}

export enum CellScopeType {
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

export enum HorizontalAlignType {
  Center = 'center',
  Left = 'left',
  Right = 'right',
}

export enum VerticalAlignType {
  Top = 'top',
  Middle = 'middle',
  Bottom = 'bottom',
}

export enum BorderStyleType {
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
