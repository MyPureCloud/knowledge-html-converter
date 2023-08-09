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
  Row = 'Row',
  Column = 'Column',
  RowGroup = 'RowGroup',
  ColumnGroup = 'ColumnGroup',
}

const tableBlockScopeTypesByHtmlScope: Record<string, TableBlockScopeType> = {
  row: TableBlockScopeType.Row,
  col: TableBlockScopeType.Column,
  rowgroup: TableBlockScopeType.RowGroup,
  colgroup: TableBlockScopeType.ColumnGroup,
};

export const htmlScopeToTableBlockScopeType = (
  scope: string,
): TableBlockScopeType | undefined => {
  return scope
    ? tableBlockScopeTypesByHtmlScope[scope.toLowerCase()]
    : undefined;
};

export enum TableBlockHorizontalAlignType {
  Center = 'Center',
  Left = 'Left',
  Right = 'Right',
}

const tableBlockHorizontalAlignTypesByCssTextAlign: Record<
  string,
  TableBlockHorizontalAlignType
> = {
  center: TableBlockHorizontalAlignType.Center,
  left: TableBlockHorizontalAlignType.Left,
  right: TableBlockHorizontalAlignType.Right,
};

export const cssTextAlignToTableBlockHorizontalAlignType = (
  textAlign: string,
): TableBlockHorizontalAlignType | undefined => {
  return textAlign
    ? tableBlockHorizontalAlignTypesByCssTextAlign[textAlign.toLowerCase()]
    : undefined;
};

export enum TableBlockVerticalAlignType {
  Top = 'Top',
  Middle = 'Middle',
  Bottom = 'Bottom',
}

const tableBlockVerticalAlignTypesByCssVerticalAlign: Record<
  string,
  TableBlockVerticalAlignType
> = {
  top: TableBlockVerticalAlignType.Top,
  middle: TableBlockVerticalAlignType.Middle,
  bottom: TableBlockVerticalAlignType.Bottom,
};

export const cssVerticalAlignToTableBlockVerticalAlignType = (
  verticalAlign: string,
): TableBlockVerticalAlignType | undefined => {
  return verticalAlign
    ? tableBlockVerticalAlignTypesByCssVerticalAlign[
        verticalAlign.toLowerCase()
      ]
    : undefined;
};

export enum TableBorderStyleType {
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

const tableBorderStyleTypesByCssBorderStyle: Record<
  string,
  TableBorderStyleType
> = {
  solid: TableBorderStyleType.Solid,
  dotted: TableBorderStyleType.Dotted,
  dashed: TableBorderStyleType.Dashed,
  double: TableBorderStyleType.Double,
  groove: TableBorderStyleType.Groove,
  ridge: TableBorderStyleType.Ridge,
  inset: TableBorderStyleType.Inset,
  outset: TableBorderStyleType.Outset,
  hidden: TableBorderStyleType.Hidden,
  none: TableBorderStyleType.None,
};

export const cssBorderStyleToTableBorderStyleType = (
  borderStyle: string,
): TableBorderStyleType | undefined => {
  return borderStyle
    ? tableBorderStyleTypesByCssBorderStyle[borderStyle.toLowerCase()]
    : undefined;
};
