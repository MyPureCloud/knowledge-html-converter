import { DomNode, DomNodeType } from 'html-parse-stringify';
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
  getStyleKeyValues,
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
  TableRowType,
} from '../models/blocks/table';
import { htmlTagToTextMark } from '../models/blocks/text';
import { ContentBlock } from '../models/blocks/content-block';

type TablePaddingPropertyHolder = {
  value?: number;
};

export const generateTableBlock = (tableElement: DomNode): TableBlock => {
  const tableBlock: TableBlock = {
    type: BlockType.Table,
    table: {
      rows: [],
    },
  };
  const tableProperties = generateTableProperties(tableElement);
  let colgroupIndex;
  let caption;
  let childrenInDifferentTags: DomNode;
  const tablePaddingProperty: TablePaddingPropertyHolder = {};
  if (tableProperties) {
    tableBlock.table.properties = tableProperties;
  }
  tableElement.children?.forEach((child, index) => {
    switch (child.name) {
      case Tag.TableBody:
        if (child.children) {
          child.children
            .filter((node) => node.type === DomNodeType.Tag)
            .forEach((rowElement) => {
              tableBlock.table.rows.push(
                generateRowBlock(
                  rowElement,
                  TableRowType.Body,
                  childrenInDifferentTags,
                  tablePaddingProperty,
                ),
              );
            });
        }
        break;
      case Tag.TableHead:
        if (child.children) {
          child.children
            .filter((node) => node.type === DomNodeType.Tag)
            .forEach((rowElement) => {
              tableBlock.table.rows.push(
                generateRowBlock(
                  rowElement,
                  TableRowType.Header,
                  childrenInDifferentTags,
                  tablePaddingProperty,
                ),
              );
            });
        }
        break;
      case Tag.TableFooter:
        if (child.children) {
          child.children
            .filter((node) => node.type === DomNodeType.Tag)
            .forEach((rowElement) => {
              tableBlock.table.rows.push(
                generateRowBlock(
                  rowElement,
                  TableRowType.Footer,
                  childrenInDifferentTags,
                  tablePaddingProperty,
                ),
              );
            });
        }
        break;
      case Tag.ColumnGroup:
        colgroupIndex = index;
        childrenInDifferentTags = tableElement.children![colgroupIndex];
        break;
      case Tag.Caption:
        caption = getCaption(child);
        if (caption) {
          tableBlock.table.properties!.caption = caption;
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
  rowElement: DomNode,
  rowType: TableRowType,
  childrenInDifferentTags: DomNode,
  tablePaddingProperty: TablePaddingPropertyHolder,
): TableRowBlock => {
  const rowBlock: TableRowBlock = {
    cells: [],
  };
  const cellElements = rowElement.children?.filter(
    (child) => child.type === DomNodeType.Tag,
  );
  cellElements?.forEach((cellElement, index) => {
    const cellBlock: TableCellBlock = {
      blocks: [],
    };
    const blocksInCell = generateCellBlock(cellElement);
    const colGroup = childrenInDifferentTags?.children![index];
    const cellProperties = generateCellProperties(
      cellElement,
      colGroup,
      tablePaddingProperty,
    );
    cellBlock.blocks = blocksInCell;
    if (cellProperties) {
      cellBlock.properties = cellProperties;
    }
    rowBlock.cells.push(cellBlock);
  });
  rowBlock.properties = generateRowProperties(rowElement, rowType);
  return rowBlock;
};

const generateCellBlock = (domNode: DomNode): TableCellContentBlock[] => {
  const blocks: TableCellContentBlock[] = [];

  const children = domNode.children;
  children?.forEach((child) => {
    let block: TableCellContentBlock | undefined;
    let textBlocks: ContentBlock[] | undefined;
    child.children?.forEach((grandChild) => {
      const textMark = htmlTagToTextMark(child.name);
      if (textMark) {
        textBlocks = generateTextBlocks(grandChild, { textMarks: [textMark] });
      }
    });
    if (child.type === 'text') {
      textBlocks = generateTextBlocks(child);
    } else {
      switch (child.name) {
        case Tag.Paragraph:
        case Tag.Heading1:
        case Tag.Heading2:
        case Tag.Heading3:
        case Tag.Heading4:
        case Tag.Heading5:
        case Tag.Heading6:
        case Tag.Preformatted:
          block = generateParagraphBlock(child);
          break;
        case Tag.OrderedList:
          block = generateListBlock(child, BlockType.OrderedList);
          break;
        case Tag.UnorderedList:
          block = generateListBlock(child, BlockType.UnorderedList);
          break;
        case Tag.Image:
          block = generateImageBlock(child);
          break;
        case Tag.IFrame:
          block = generateVideoBlock(child);
          break;
        case Tag.Table:
          block = generateTableBlock(child);
          break;
        case Tag.Span:
        case Tag.LineBreak:
        case Tag.Anchor:
          textBlocks = generateTextBlocks(child);
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

const generateTableProperties = (tableElement: DomNode): TableProperties => {
  let tableProperties: TableProperties | undefined;
  let borderWidth;
  let cellSpacing;
  let width;
  let height;
  let alignment;
  let borderStyle;
  let borderColor;
  let backgroundColor;

  if (tableElement.attrs && tableElement.attrs?.style) {
    const styleKeyValues = getStyleKeyValues(tableElement);

    borderWidth = getBorderWidth(styleKeyValues);
    cellSpacing = getBorderSpacing(styleKeyValues);
    width = getWidth(styleKeyValues);
    height = getHeight(styleKeyValues);
    alignment = getAlignment(styleKeyValues);
    borderStyle = getBorderStyle(styleKeyValues);
    borderColor = getBorderColor(styleKeyValues);
    backgroundColor = getBackgroundColor(styleKeyValues);
    if (
      Object.prototype.hasOwnProperty.call(
        styleKeyValues,
        StyleAttribute.Border,
      )
    ) {
      [borderWidth, borderStyle, borderColor] =
        getBorderProperties(styleKeyValues);
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
  rowElement: DomNode,
  rowType: TableRowType,
): TableRowProperties => {
  let alignment: TableBlockHorizontalAlignType | undefined;
  let height: number | undefined;
  let borderStyle: TableBorderStyleType | undefined;
  let borderColor: string | undefined;
  let backgroundColor: string | undefined;

  if (rowElement.attrs && rowElement.attrs.style) {
    const styleKeyValues = getStyleKeyValues(rowElement);
    backgroundColor = getBackgroundColor(styleKeyValues);
    borderColor = getBorderColor(styleKeyValues);
    borderStyle = getBorderStyle(styleKeyValues);
    alignment = getHorizontalAlign(styleKeyValues);
    height = getHeight(styleKeyValues);
  }

  return Object.assign(
    { rowType },
    alignment && { alignment },
    backgroundColor && { backgroundColor },
    borderColor && { borderColor },
    borderStyle && { borderStyle },
    height && { height },
  );
};

const generateCellProperties = (
  cellElement: DomNode,
  colGroup: DomNode,
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
    cellElement.type === DomNodeType.Tag &&
    cellElement.name === Tag.HeaderCell
  ) {
    cellType = TableBlockCellType.HeaderCell;
  } else if (
    cellElement.type === DomNodeType.Tag &&
    cellElement.name === Tag.DataCell
  ) {
    cellType = TableBlockCellType.Cell;
  }

  if (cellElement.attrs && cellElement.attrs.scope) {
    scope = htmlScopeToTableBlockScopeType(cellElement.attrs.scope);
  }
  if (cellElement.attrs && cellElement.attrs.colspan !== 'None') {
    colSpan = Number(cellElement.attrs.colspan);
  }
  if (cellElement.attrs && cellElement.attrs.rowspan !== 'None') {
    rowSpan = Number(cellElement.attrs.rowspan);
  }

  if (cellElement.attrs && cellElement.attrs.style) {
    cellStyleJson = getStyleKeyValues(cellElement);
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
