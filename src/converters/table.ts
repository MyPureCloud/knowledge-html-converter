import { AstElement } from 'html-parse-stringify';
import { generateImageBlock } from './image';
import { generateListBlock } from './list';
import { generateParagraphBlock } from './paragraph';
import {
  getAlignment,
  getBackgroundColor,
  getBorderColor,
  getBorderProperties,
  getBorderSpacing,
  getBorderStyle,
  getBorderWidth,
  getCaption,
  getHeight,
  getHorizontalAlign,
  getPadding,
  getRowType,
  getTablePropertiesJSON,
  getVerticalAlign,
  getWidth,
} from './table-properties';
import { generateTextBlocks } from './text';
import { generateVideoBlock } from './video';
import { StyleAttributes, Tags } from '../models/html';
import { Block } from '../models/blocks/block';
import { BlockTypes } from '../models/blocks/block-type';
import { ImageBlock } from '../models/blocks/image';
import {
  CellBlock,
  CellProperties,
  CellScopeType,
  RowBlock,
  RowProperties,
  TableBlock,
  TableProperties,
} from '../models/blocks/table';
import {
  AllowedProperties,
  TextBlocks,
  TextDataType,
} from '../models/blocks/text';
import { VideoBlock } from '../models/blocks/video';

type TablePaddingPropertyHolder = {
  value?: number;
};

export const generateTableBlock = (blockData: AstElement): TableBlock => {
  const tableBlock: TableBlock = {
    type: BlockTypes.TableBlock,
    table: {
      rows: [],
    },
  };
  const tableProperties = generateTableProperties(blockData);
  let colgroupIndex;
  let caption;
  let childrenInDifferentTags: AstElement;
  const tablePaddingProperty: TablePaddingPropertyHolder = {};
  if (tableProperties) {
    tableBlock.table.properties = tableProperties;
  }
  blockData.children?.forEach((child, index) => {
    switch (child.name) {
      case 'tbody':
        if (blockData.children![index]) {
          (blockData.children![index]?.children ?? []).forEach((row) => {
            tableBlock.table.rows.push(
              generateRowBlock(
                row,
                'tbody',
                childrenInDifferentTags,
                tablePaddingProperty,
              ),
            );
          });
        }
        break;
      case 'thead':
        if (blockData.children![index]) {
          (blockData.children![index]?.children ?? []).forEach((row) => {
            tableBlock.table.rows.push(
              generateRowBlock(
                row,
                'thead',
                childrenInDifferentTags,
                tablePaddingProperty,
              ),
            );
          });
        }
        break;
      case 'tfoot':
        if (blockData.children![index]) {
          (blockData.children![index]?.children ?? []).forEach((row) => {
            tableBlock.table.rows.push(
              generateRowBlock(
                row,
                'tfoot',
                childrenInDifferentTags,
                tablePaddingProperty,
              ),
            );
          });
        }
        break;
      case 'colgroup':
        colgroupIndex = index;
        childrenInDifferentTags = blockData.children![colgroupIndex];
        break;
      case 'caption':
        if (blockData.children![index]) {
          caption = getCaption(blockData.children![index]);
          if (caption) {
            tableBlock.table.properties!.caption = caption;
          }
        }
        break;
    }
  });
  if (tablePaddingProperty.value) {
    if (!tableBlock.table.properties) {
      tableBlock.table.properties = {};
    }
    tableBlock.table.properties.cellPadding = tablePaddingProperty.value;
  }
  return tableBlock;
};

const generateRowBlock = (
  row: AstElement,
  rowType: string,
  childrenInDifferentTags: AstElement,
  tablePaddingProperty: TablePaddingPropertyHolder,
): RowBlock => {
  const rowBlock: RowBlock = {
    cells: [],
  };
  const cells = row.children;
  cells?.forEach((cell, index) => {
    const cellBlock: CellBlock = {
      blocks: [],
    };
    const blocksInCell = generateCellBlock(cell);
    const colGroup = childrenInDifferentTags?.children![index];
    const cellProperties = generateCellProperties(
      cell,
      colGroup,
      tablePaddingProperty,
    );
    cellBlock.blocks = blocksInCell;
    if (cellProperties) {
      cellBlock.properties = cellProperties;
    }
    rowBlock.cells.push(cellBlock);
  });
  const rowProperties = generateRowProperties(row, rowType);
  if (rowProperties) {
    rowBlock.properties = rowProperties;
  }
  return rowBlock;
};

const generateCellBlock = (cell: AstElement): Block[] => {
  const blocks: Block[] = [];

  const children = cell.children;
  children?.forEach((blockData) => {
    let block: Block | undefined;
    let textBlocks: (TextBlocks | ImageBlock | VideoBlock)[] | undefined;
    const textFormatMap: Record<string, AllowedProperties> = {
      strong: AllowedProperties.Bold,
      em: AllowedProperties.Italic,
      u: AllowedProperties.Underline,
      s: AllowedProperties.Strikethrough,
      sub: AllowedProperties.Subscript,
      sup: AllowedProperties.Superscript,
    };
    blockData.children?.forEach((child) => {
      if (textFormatMap[blockData.name]) {
        textBlocks = generateTextBlocks(child, [textFormatMap[blockData.name]]);
      }
    });
    if (blockData.type === 'text') {
      textBlocks = generateTextBlocks(blockData);
    } else {
      switch (blockData.name) {
        case Tags.Paragraph:
        case Tags.Heading1:
        case Tags.Heading2:
        case Tags.Heading3:
        case Tags.Heading4:
        case Tags.Heading5:
        case Tags.Heading6:
        case Tags.Preformatted:
          block = generateParagraphBlock(blockData);
          break;
        case Tags.OrderedList:
          block = generateListBlock(blockData, BlockTypes.OrderedList);
          break;
        case Tags.UnorderedList:
          block = generateListBlock(blockData, BlockTypes.UnorderedList);
          break;
        case Tags.Image:
          block = generateImageBlock(blockData);
          break;
        case Tags.Video:
          block = generateVideoBlock(blockData);
          break;
        case Tags.Table:
          block = generateTableBlock(blockData);
          break;
        case Tags.Span:
        case Tags.LineBreak:
        case Tags.Anchor:
          textBlocks = generateTextBlocks(blockData);
          break;
      }
    }
    if (block) {
      blocks.push(block);
    }
    if (textBlocks) {
      blocks.push(...textBlocks);
    }
  });
  return blocks;
};

const generateTableProperties = (blockData: AstElement): TableProperties => {
  let tableProperties: TableProperties | undefined;
  let borderWidth;
  let cellSpacing;
  let width;
  let height;
  let alignment;
  let borderStyle;
  let borderColor;
  let backgroundColor;
  let jsonObject = {};

  if (blockData.attrs && blockData.attrs?.style) {
    jsonObject = getTablePropertiesJSON(blockData);

    borderWidth = getBorderWidth(jsonObject);
    cellSpacing = getBorderSpacing(jsonObject);
    width = getWidth(jsonObject);
    height = getHeight(jsonObject);
    alignment = getAlignment(jsonObject);
    borderStyle = getBorderStyle(jsonObject);
    borderColor = getBorderColor(jsonObject);
    backgroundColor = getBackgroundColor(jsonObject);
    if (
      Object.prototype.hasOwnProperty.call(jsonObject, StyleAttributes.Border)
    ) {
      [borderWidth, borderStyle, borderColor] = getBorderProperties(jsonObject);
    }
  }

  if (
    alignment ||
    backgroundColor ||
    borderColor ||
    borderStyle ||
    borderWidth ||
    cellSpacing ||
    height ||
    width
  ) {
    tableProperties = Object.assign(
      {},
      alignment && { alignment },
      backgroundColor && { backgroundColor },
      borderColor && { borderColor },
      borderStyle && { borderStyle },
      borderWidth && { borderWidth },
      cellSpacing && { cellSpacing },
      height && { height },
      width && { width },
    );
  }
  return tableProperties || {};
};

const generateRowProperties = (
  blockData: AstElement,
  type: string,
): RowProperties | undefined => {
  let rowProperties: RowProperties | undefined;
  let alignment;
  let height;
  let borderStyle;
  let borderColor;
  let backgroundColor;
  let jsonObject = {};

  const rowType = getRowType(type);

  if (blockData.attrs && blockData.attrs.style) {
    jsonObject = getTablePropertiesJSON(blockData);

    backgroundColor = getBackgroundColor(jsonObject);
    borderColor = getBorderColor(jsonObject);
    borderStyle = getBorderStyle(jsonObject);
    alignment = getHorizontalAlign(jsonObject);
    height = getHeight(jsonObject);
  }

  if (
    alignment ||
    backgroundColor ||
    borderColor ||
    borderStyle ||
    height ||
    rowType
  ) {
    rowProperties = Object.assign(
      {},
      alignment && { alignment },
      backgroundColor && { backgroundColor },
      borderColor && { borderColor },
      borderStyle && { borderStyle },
      height && { height },
      rowType && { rowType },
    );
  }
  return rowProperties;
};

const generateCellProperties = (
  cellBlockData: AstElement,
  colGroup: AstElement,
  tablePaddingProperty: TablePaddingPropertyHolder,
): CellProperties | undefined => {
  let cellProperties: CellProperties | undefined;
  let rowSpan;
  let colSpan;
  let cellType;
  let scope;
  let width;
  let cellStyleJson = {};

  if (colGroup?.attrs && colGroup?.attrs?.style) {
    colGroup.attrs.style
      .split(/\s*;\s*/) //split with extra spaces around the semi colon
      .map((chunk) => chunk.split(/\s*:\s*/)) //split key:value with colon
      .map((keyValue) => {
        if (keyValue.length === 2) {
          const styleJson = {
            [keyValue[0]]: keyValue[1],
          };
          width = getWidth(styleJson);
        }
      });
  }
  if (
    cellBlockData.type === TextDataType.Tag &&
    cellBlockData.name === Tags.HeaderCell
  ) {
    cellType = 'HeaderCell';
  } else if (
    cellBlockData.type === TextDataType.Tag &&
    cellBlockData.name === Tags.DataCell
  ) {
    cellType = 'Cell';
  }

  if (cellBlockData.attrs && cellBlockData.attrs.scope) {
    scope = getScope(cellBlockData.attrs.scope);
  }
  if (cellBlockData.attrs && cellBlockData.attrs.colspan !== 'None') {
    colSpan = Number(cellBlockData.attrs.colspan);
  }
  if (cellBlockData.attrs && cellBlockData.attrs.rowspan !== 'None') {
    rowSpan = Number(cellBlockData.attrs.rowspan);
  }

  if (cellBlockData.attrs && cellBlockData.attrs.style) {
    cellStyleJson = getTablePropertiesJSON(cellBlockData);
  }
  tablePaddingProperty.value = getPadding(cellStyleJson);
  const horizontalAlign = getHorizontalAlign(cellStyleJson);
  const verticalAlign = getVerticalAlign(cellStyleJson);
  const height = getHeight(cellStyleJson);
  const backgroundColor = getBackgroundColor(cellStyleJson);
  const borderColor = getBorderColor(cellStyleJson);
  const borderStyle = getBorderStyle(cellStyleJson);
  const borderWidth = getBorderWidth(cellStyleJson);
  if (
    Object.prototype.hasOwnProperty.call(cellStyleJson, StyleAttributes.Width)
  ) {
    width = getWidth(cellStyleJson);
  }

  if (
    backgroundColor ||
    borderColor ||
    borderStyle ||
    borderWidth ||
    cellType ||
    colSpan ||
    height ||
    horizontalAlign ||
    rowSpan ||
    scope ||
    verticalAlign ||
    width
  ) {
    cellProperties = Object.assign(
      {},
      backgroundColor && { backgroundColor },
      borderColor && { borderColor },
      borderStyle && { borderStyle },
      borderWidth && { borderWidth },
      cellType && { cellType },
      colSpan && { colSpan },
      height && { height },
      horizontalAlign && { horizontalAlign },
      rowSpan && { rowSpan },
      scope && { scope },
      verticalAlign && { verticalAlign },
      width && { width },
    );
  }
  return cellProperties;
};

const getScope = (scope: string): string => {
  switch (scope) {
    case CellScopeType.Row:
      return CellScopeType[CellScopeType.Row];
    case CellScopeType.Column:
      return CellScopeType[CellScopeType.Column];
    case CellScopeType.RowGroup:
      return CellScopeType[CellScopeType.RowGroup];
    case CellScopeType.ColumnGroup:
      return CellScopeType[CellScopeType.ColumnGroup];
    default:
      return 'None';
  }
};
