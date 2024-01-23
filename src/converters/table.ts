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
import { Length } from '../models/html/length.js';

type TablePaddingPropertyHolder = {
  value?: number;
};

export const generateTableBlock = (
  tableElement: DomNode,
  options: HtmlConverterOptions,
): DocumentBodyTableBlock | undefined => {
  const table = generateTable(tableElement, options);
  return table
    ? {
        type: 'Table',
        table,
      }
    : undefined;
};

const generateTable = (
  tableElement: DomNode,
  options: HtmlConverterOptions,
): DocumentBodyTable | undefined => {
  const table: DocumentBodyTable = {
    rows: [],
  };
  const tableProperties = generateTableProperties(tableElement, options);
  let defaultCellBorderProperties: DocumentBodyTableCellBlockProperties;
  if (tableElement.attrs?.border === '1') {
    const borderWidth = tableProperties!.borderWidth;
    const borderStyle = tableProperties!.borderStyle;
    const borderColor = tableProperties!.borderColor;
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
                options,
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
                options,
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
                options,
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
        caption = getCaption(child);
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
  options: HtmlConverterOptions,
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
    const blocksInCell = generateCellBlock(cellElement, options);
    const colGroup = childrenInDifferentTags?.children![index];
    let cellProperties = generateCellProperties(
      cellElement,
      colGroup,
      tablePaddingProperty,
      options,
    );
    // Merging the text properties to cell properties, to handle block level properties on text block.
    const textBlockProperties = blocksInCell[0]?.text?.properties;
    cellProperties = textBlockProperties
      ? Object.assign(cellProperties ?? {}, textBlockProperties)
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
  rowBlock.properties = generateRowProperties(rowElement, rowType);
  return rowBlock.cells.length ? rowBlock : undefined;
};

const generateCellBlock = (
  domNode: DomNode,
  options: HtmlConverterOptions,
): DocumentTableContentBlock[] => {
  const blocks: DocumentTableContentBlock[] = [];

  const children = domNode.children || [];
  children.forEach((child) => {
    let block: DocumentTableContentBlock | undefined;
    let textBlocks: DocumentContentBlock[] | undefined;
    if (child.type === DomNodeType.Text || htmlTagToTextMark(child.name)) {
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
          block = generateListBlock(child, 'OrderedList');
          break;
        case Tag.UnorderedList:
          block = generateListBlock(child, 'UnorderedList');
          break;
        case Tag.Image:
          block = generateImageBlock(child);
          break;
        case Tag.IFrame:
          block = generateVideoBlock(child);
          break;
        case Tag.Table:
          block = generateTableBlock(child, options);
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
  postProcessTextBlocks(blocks);
  if (!blocks.length) {
    blocks.push(generateEmptyTextBlock());
  }
  return blocks;
};

const generateTableProperties = (
  tableElement: DomNode,
  options: HtmlConverterOptions,
): DocumentBodyTableProperties | undefined => {
  let tableProperties: DocumentBodyTableProperties | undefined;
  let borderWidth;
  let cellSpacing;
  let width;
  let widthUnit;
  let height;
  let alignment;
  let borderStyle;
  let borderColor;
  let backgroundColor;

  // Handle bgcolor attribute on table
  if (tableElement.attrs?.bgcolor) {
    backgroundColor = tableElement.attrs?.bgcolor;
  }

  if (tableElement.attrs && tableElement.attrs?.style) {
    const styleKeyValues = getStyleKeyValues(tableElement);

    borderWidth = getBorderWidth(styleKeyValues);
    cellSpacing = getBorderSpacing(styleKeyValues);

    if (options.handleWidthWithUnits) {
      const widthWithUnit: Length | undefined = getWidthWithUnit(
        styleKeyValues,
        options,
      );
      width = widthWithUnit?.length;
      widthUnit = widthWithUnit?.unit;
    } else {
      width = getWidth(styleKeyValues, options);
    }
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
    width ||
    widthUnit
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
      widthUnit && { widthUnit },
    );
  }
  return tableProperties;
};

const generateRowProperties = (
  rowElement: DomNode,
  rowType: DocumentBodyTableBlockRowType,
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
  options: HtmlConverterOptions,
): DocumentBodyTableCellBlockProperties | undefined => {
  let cellProperties: DocumentBodyTableCellBlockProperties | undefined;
  let rowSpan;
  let colSpan;
  let cellType: DocumentBodyTableBlockCellType | undefined;
  let scope: DocumentBodyTableBlockScopeType | undefined;
  let width;
  let widthUnit;
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
          if (options.handleWidthWithUnits) {
            const widthAndUnit = getWidthWithUnit(styleJson, options);
            width = widthAndUnit?.length;
            widthUnit = widthAndUnit?.unit;
          } else {
            width = getWidth(styleJson, options);
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
  const height = getHeight(cellStyleJson);
  const backgroundColor =
    getBackgroundColor(cellStyleJson) ?? cellElement.attrs?.bgcolor; // Handle bgcolor attribute
  borderColor = getBorderColor(cellStyleJson);
  borderStyle = getBorderStyle(cellStyleJson);
  borderWidth = getBorderWidth(cellStyleJson);
  if (
    Object.prototype.hasOwnProperty.call(cellStyleJson, StyleAttribute.Width)
  ) {
    width = getWidth(cellStyleJson);
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
    widthUnit
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
      widthUnit && { widthUnit },
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
