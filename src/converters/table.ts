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
import { StyleAttribute, Tag } from '../models/html';
import { BlockType } from '../models/blocks/block';
import {
  TableCellBlock,
  TableCellProperties,
  TableRowBlock,
  TableRowProperties,
  TableBlock,
  TableProperties,
  TableCellContentBlock,
  TableBlockCellType,
  htmlScopeToTableBlockScopeType,
  TableBlockScopeType,
  TableBlockHorizontalAlignType,
  TableBorderStyleType,
} from '../models/blocks/table';
import { TextMark, TextDataType } from '../models/blocks/text';
import { ContentBlock } from '../models/blocks/content-block';

type TablePaddingPropertyHolder = {
  value?: number;
};

export const generateTableBlock = (blockData: AstElement): TableBlock => {
  const tableBlock: TableBlock = {
    type: BlockType.Table,
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
): TableRowBlock => {
  const rowBlock: TableRowBlock = {
    cells: [],
  };
  const cells = row.children;
  cells?.forEach((cell, index) => {
    const cellBlock: TableCellBlock = {
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

const generateCellBlock = (cell: AstElement): TableCellContentBlock[] => {
  const blocks: TableCellContentBlock[] = [];

  const children = cell.children;
  children?.forEach((blockData) => {
    let block: TableCellContentBlock | undefined;
    let textBlocks: ContentBlock[] | undefined;
    const textFormatMap: Record<string, TextMark> = {
      strong: TextMark.Bold,
      em: TextMark.Italic,
      u: TextMark.Underline,
      s: TextMark.Strikethrough,
      sub: TextMark.Subscript,
      sup: TextMark.Superscript,
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
        case Tag.Paragraph:
        case Tag.Heading1:
        case Tag.Heading2:
        case Tag.Heading3:
        case Tag.Heading4:
        case Tag.Heading5:
        case Tag.Heading6:
        case Tag.Preformatted:
          block = generateParagraphBlock(blockData);
          break;
        case Tag.OrderedList:
          block = generateListBlock(blockData, BlockType.OrderedList);
          break;
        case Tag.UnorderedList:
          block = generateListBlock(blockData, BlockType.UnorderedList);
          break;
        case Tag.Image:
          block = generateImageBlock(blockData);
          break;
        case Tag.Video:
          block = generateVideoBlock(blockData);
          break;
        case Tag.Table:
          block = generateTableBlock(blockData);
          break;
        case Tag.Span:
        case Tag.LineBreak:
        case Tag.Anchor:
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
      Object.prototype.hasOwnProperty.call(jsonObject, StyleAttribute.Border)
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
): TableRowProperties | undefined => {
  let rowProperties: TableRowProperties | undefined;
  let alignment: TableBlockHorizontalAlignType | undefined;
  let height: number | undefined;
  let borderStyle: TableBorderStyleType | undefined;
  let borderColor: string | undefined;
  let backgroundColor: string | undefined;

  const rowType = getRowType(type);

  if (blockData.attrs && blockData.attrs.style) {
    const jsonObject = getTablePropertiesJSON(blockData);
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
): TableCellProperties | undefined => {
  let cellProperties: TableCellProperties | undefined;
  let rowSpan;
  let colSpan;
  let cellType: TableBlockCellType | undefined;
  let scope: TableBlockScopeType | undefined;
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
    cellBlockData.name === Tag.HeaderCell
  ) {
    cellType = TableBlockCellType.HeaderCell;
  } else if (
    cellBlockData.type === TextDataType.Tag &&
    cellBlockData.name === Tag.DataCell
  ) {
    cellType = TableBlockCellType.Cell;
  }

  if (cellBlockData.attrs && cellBlockData.attrs.scope) {
    scope = htmlScopeToTableBlockScopeType(cellBlockData.attrs.scope);
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
    Object.prototype.hasOwnProperty.call(cellStyleJson, StyleAttribute.Width)
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
