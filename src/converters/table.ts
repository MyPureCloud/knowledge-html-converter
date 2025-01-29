import { DomNode, DomNodeType } from 'html-parse-stringify';
import { generateImageBlock } from './image.js';
import { generateListBlock } from './list.js';
import { generateParagraphBlock } from './paragraph.js';
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
  getWidthWithUnit,
} from './table-properties.js';
import {
  generateTextBlocks,
  htmlTagToTextMark,
  nbspCharacter,
  postProcessTextBlocks,
} from './text.js';
import { generateVideoBlock } from './video.js';
import { StyleAttribute } from '../models/html/style-attribute.js';
import { Tag } from '../models/html/tag.js';
import { DocumentContentBlock } from '../models/blocks/document-body-paragraph.js';
import {
  DocumentBodyTableCellBlock,
  DocumentBodyTableCellBlockProperties,
  DocumentBodyTableRowBlock,
  DocumentBodyTableRowBlockProperties,
  DocumentBodyTable,
  DocumentBodyTableProperties,
  DocumentTableContentBlock,
  DocumentBodyTableBlockCellType,
  DocumentBodyTableBlockScopeType,
  DocumentBodyTableBlockHorizontalAlignType,
  DocumentBodyTableBorderStyleType,
  DocumentBodyTableBlockRowType,
  DocumentBodyTableBlock,
} from '../models/blocks/document-body-table.js';
import { HtmlConverterOptions } from '../models/options/html-converter-options.js';

type TablePaddingPropertyHolder = {
  value?: number;
};

export const generateTableBlock = (
  tableElement: DomNode,
  converterOptions: HtmlConverterOptions,
): DocumentBodyTableBlock | undefined => {
  const table = generateTable(tableElement, converterOptions);
  return table
    ? {
        type: 'Table',
        table,
      }
    : undefined;
};

const generateTable = (
  tableElement: DomNode,
  converterOptions: HtmlConverterOptions,
): DocumentBodyTable | undefined => {
  const table: DocumentBodyTable = {
    rows: [],
  };
  const tableProperties = generateTableProperties(
    tableElement,
    converterOptions,
  );
  let defaultCellBorderProperties: DocumentBodyTableCellBlockProperties;
  if (tableElement.attrs?.border === '1') {
    const borderWidth = tableProperties?.borderWidth;
    const borderStyle = tableProperties?.borderStyle;
    const borderColor = tableProperties?.borderColor;
    if (borderWidth || borderStyle || borderColor) {
      defaultCellBorderProperties = Object.assign(
        {},
        borderColor && { borderColor },
        borderStyle && { borderStyle },
        borderWidth && { borderWidth },
      );
    }
  }
  let colgroupIndex;
  let caption;
  let childrenInDifferentTags: DomNode;
  const tablePaddingProperty: TablePaddingPropertyHolder = {};
  if (tableProperties) {
    table.properties = tableProperties;
  }
  tableElement.children?.forEach((child, index) => {
    switch (child.name) {
      case Tag.TableBody:
        if (child.children) {
          child.children
            .filter((node) => node.type === DomNodeType.Tag)
            .forEach((rowElement) => {
              const rowBlock = generateRowBlock(
                rowElement,
                DocumentBodyTableBlockRowType.Body,
                childrenInDifferentTags,
                tablePaddingProperty,
                defaultCellBorderProperties,
                converterOptions,
              );
              if (rowBlock) {
                table.rows.push(rowBlock);
              }
            });
        }
        break;
      case Tag.TableHead:
        if (child.children) {
          child.children
            .filter((node) => node.type === DomNodeType.Tag)
            .forEach((rowElement) => {
              const rowBlock = generateRowBlock(
                rowElement,
                DocumentBodyTableBlockRowType.Header,
                childrenInDifferentTags,
                tablePaddingProperty,
                defaultCellBorderProperties,
                converterOptions,
              );
              if (rowBlock) {
                table.rows.push(rowBlock);
              }
            });
        }
        break;
      case Tag.TableFooter:
        if (child.children) {
          child.children
            .filter((node) => node.type === DomNodeType.Tag)
            .forEach((rowElement) => {
              const rowBlock = generateRowBlock(
                rowElement,
                DocumentBodyTableBlockRowType.Footer,
                childrenInDifferentTags,
                tablePaddingProperty,
                defaultCellBorderProperties,
                converterOptions,
              );
              if (rowBlock) {
                table.rows.push(rowBlock);
              }
            });
        }
        break;
      case Tag.ColumnGroup:
        colgroupIndex = index;
        childrenInDifferentTags = tableElement.children![colgroupIndex];
        break;
      case Tag.Caption:
        caption = getCaption(child, converterOptions);
        if (caption) {
          if (!table.properties) {
            table.properties = {};
          }
          table.properties.caption = caption;
        }
        break;
    }
  });
  if (tablePaddingProperty.value) {
    if (!table.properties) {
      table.properties = {};
    }
    table.properties.cellPadding = tablePaddingProperty.value;
  }
  return table.rows.length ? table : undefined;
};

const generateRowBlock = (
  rowElement: DomNode,
  rowType: DocumentBodyTableBlockRowType,
  childrenInDifferentTags: DomNode,
  tablePaddingProperty: TablePaddingPropertyHolder,
  defaultCellProperties: DocumentBodyTableCellBlockProperties = {},
  converterOptions: HtmlConverterOptions,
): DocumentBodyTableRowBlock | undefined => {
  const rowBlock: DocumentBodyTableRowBlock = {
    cells: [],
  };
  const cellElements = rowElement.children?.filter(
    (child) => child.type === DomNodeType.Tag,
  );
  cellElements?.forEach((cellElement, index) => {
    const cellBlock: DocumentBodyTableCellBlock = {
      blocks: [],
    };
    const blocksInCell = generateCellBlock(cellElement, converterOptions);
    const colGroup = childrenInDifferentTags?.children![index];
    let cellProperties = generateCellProperties(
      cellElement,
      colGroup,
      tablePaddingProperty,
      converterOptions,
    );
    // Merging the text properties to cell properties, to handle block level properties on text block.
    const { textColor: _textColor, ...textBlockPropertiesWithoutTextColor } =
      blocksInCell[0]?.text?.properties ?? {};
    cellProperties = textBlockPropertiesWithoutTextColor
      ? Object.assign(cellProperties ?? {}, textBlockPropertiesWithoutTextColor)
      : cellProperties;
    cellBlock.blocks = blocksInCell;
    // Default properties are overridden by cell properties.
    if (cellProperties || defaultCellProperties) {
      cellBlock.properties = Object.assign(
        {},
        defaultCellProperties,
        cellProperties,
      );
    }
    rowBlock.cells.push(cellBlock);
  });
  rowBlock.properties = generateRowProperties(
    rowElement,
    rowType,
    converterOptions,
  );
  return rowBlock.cells.length ? rowBlock : undefined;
};

const generateCellBlock = (
  domNode: DomNode,
  converterOptions: HtmlConverterOptions,
): DocumentTableContentBlock[] => {
  const blocks: DocumentTableContentBlock[] = [];

  const children = domNode.children || [];
  children.forEach((child) => {
    let block: DocumentTableContentBlock | undefined;
    let textBlocks: DocumentContentBlock[] | undefined;
    if (child.type === DomNodeType.Text || htmlTagToTextMark(child.name)) {
      textBlocks = generateTextBlocks(child, converterOptions);
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
          block = generateParagraphBlock(child, converterOptions);
          break;
        case Tag.OrderedList:
          block = generateListBlock(child, 'OrderedList', converterOptions);
          break;
        case Tag.UnorderedList:
          block = generateListBlock(child, 'UnorderedList', converterOptions);
          break;
        case Tag.Image:
          block = generateImageBlock(child, converterOptions);
          break;
        case Tag.IFrame:
          block = generateVideoBlock(child);
          break;
        case Tag.Table:
          block = generateTableBlock(child, converterOptions);
          break;
        case Tag.Span:
        case Tag.LineBreak:
        case Tag.Anchor:
          textBlocks = generateTextBlocks(child, converterOptions);
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
  postProcessTextBlocks(blocks);
  if (!blocks.length) {
    blocks.push(generateEmptyTextBlock());
  }
  return blocks;
};

const generateTableProperties = (
  tableElement: DomNode,
  converterOptions: HtmlConverterOptions,
): DocumentBodyTableProperties | undefined => {
  let tableProperties: DocumentBodyTableProperties | undefined;
  let borderWidth;
  let cellSpacing;
  let width;
  let widthWithUnit;
  let height;
  let alignment;
  let borderStyle;
  let borderColor;
  let backgroundColor;

  // Handle bgcolor attribute on table
  if (tableElement.attrs?.bgcolor) {
    backgroundColor = tableElement.attrs?.bgcolor;
  }
  // Handle border attribute on table
  if (tableElement.attrs?.border === '1') {
    borderWidth = 0.0625;
    borderStyle = DocumentBodyTableBorderStyleType.Solid;
  }

  if (tableElement.attrs && tableElement.attrs?.style) {
    const styleKeyValues = getStyleKeyValues(tableElement);

    borderWidth = getBorderWidth(styleKeyValues, converterOptions);
    cellSpacing = getBorderSpacing(styleKeyValues, converterOptions);

    if (converterOptions.handleWidthWithUnits) {
      widthWithUnit = getWidthWithUnit(styleKeyValues);
    }
    width = getWidth(styleKeyValues, converterOptions);
    height = getHeight(styleKeyValues, converterOptions);
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
    width ||
    widthWithUnit
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
      widthWithUnit && { widthWithUnit },
    );
  }
  return tableProperties;
};

const generateRowProperties = (
  rowElement: DomNode,
  rowType: DocumentBodyTableBlockRowType,
  converterOptions: HtmlConverterOptions,
): DocumentBodyTableRowBlockProperties => {
  let alignment: DocumentBodyTableBlockHorizontalAlignType | undefined;
  let height: number | undefined;
  let borderStyle: DocumentBodyTableBorderStyleType | undefined;
  let borderColor: string | undefined;
  let backgroundColor: string | undefined;

  // Handle bgcolor attribute
  if (rowElement.attrs?.bgcolor) {
    backgroundColor = rowElement.attrs?.bgcolor;
  }
  if (rowElement.attrs && rowElement.attrs.style) {
    const styleKeyValues = getStyleKeyValues(rowElement);
    backgroundColor = getBackgroundColor(styleKeyValues);
    borderColor = getBorderColor(styleKeyValues);
    borderStyle = getBorderStyle(styleKeyValues);
    alignment = getHorizontalAlign(styleKeyValues);
    height = getHeight(styleKeyValues, converterOptions);
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
  converterOptions: HtmlConverterOptions,
): DocumentBodyTableCellBlockProperties | undefined => {
  let cellProperties: DocumentBodyTableCellBlockProperties | undefined;
  let rowSpan;
  let colSpan;
  let cellType: DocumentBodyTableBlockCellType | undefined;
  let scope: DocumentBodyTableBlockScopeType | undefined;
  let width;
  let widthWithUnit;
  let cellStyleJson = {};
  let borderColor;
  let borderStyle;
  let borderWidth;

  if (colGroup?.attrs && colGroup?.attrs?.style) {
    colGroup.attrs.style
      .split(/\s*;\s*/) //split with extra spaces around the semi colon
      .map((chunk) => chunk.split(/\s*:\s*/)) //split key:value with colon
      .map((keyValue) => {
        if (keyValue.length === 2) {
          const styleJson = {
            [keyValue[0]]: keyValue[1],
          };
          width = getWidth(styleJson, converterOptions);
          if (converterOptions.handleWidthWithUnits) {
            widthWithUnit = getWidthWithUnit(styleJson);
          }
        }
      });
  }
  if (
    cellElement.type === DomNodeType.Tag &&
    cellElement.name === Tag.HeaderCell
  ) {
    cellType = DocumentBodyTableBlockCellType.HeaderCell;
  } else if (
    cellElement.type === DomNodeType.Tag &&
    cellElement.name === Tag.DataCell
  ) {
    cellType = DocumentBodyTableBlockCellType.Cell;
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
  const height = getHeight(cellStyleJson, converterOptions);
  const backgroundColor =
    getBackgroundColor(cellStyleJson) ?? cellElement.attrs?.bgcolor; // Handle bgcolor attribute
  borderColor = getBorderColor(cellStyleJson);
  borderStyle = getBorderStyle(cellStyleJson);
  borderWidth = getBorderWidth(cellStyleJson, converterOptions);
  if (
    Object.prototype.hasOwnProperty.call(cellStyleJson, StyleAttribute.Width)
  ) {
    width = getWidth(cellStyleJson, converterOptions);
    if (converterOptions.handleWidthWithUnits) {
      widthWithUnit = getWidthWithUnit(cellStyleJson);
    }
  }
  if (
    Object.prototype.hasOwnProperty.call(cellStyleJson, StyleAttribute.Border)
  ) {
    [borderWidth, borderStyle, borderColor] =
      getBorderProperties(cellStyleJson);
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
    width ||
    widthWithUnit
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
      widthWithUnit && { widthWithUnit },
    );
  }
  return cellProperties;
};

const tableBlockScopeTypesByHtmlScope: Record<
  string,
  DocumentBodyTableBlockScopeType
> = {
  row: DocumentBodyTableBlockScopeType.Row,
  col: DocumentBodyTableBlockScopeType.Column,
  rowgroup: DocumentBodyTableBlockScopeType.RowGroup,
  colgroup: DocumentBodyTableBlockScopeType.ColumnGroup,
};

const htmlScopeToTableBlockScopeType = (
  scope: string,
): DocumentBodyTableBlockScopeType | undefined => {
  return scope
    ? tableBlockScopeTypesByHtmlScope[scope.toLowerCase()]
    : undefined;
};

const generateEmptyTextBlock = (): DocumentTableContentBlock => {
  return {
    type: 'Text',
    text: {
      text: nbspCharacter,
    },
  };
};
