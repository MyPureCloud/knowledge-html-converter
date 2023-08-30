import { DomNode, DomNodeType } from 'html-parse-stringify';
import { StyleAttribute, Tag } from '../models/html';
import {
  DocumentBodyBlockType,
  DocumentBodyBlockAlignType,
  DocumentBodyBlockFontSize,
  DocumentBodyBlockFontType,
} from '../models/blocks/document-body-block';
import { convertRgbToHex } from './image';
import {
  DocumentBodyListBlock,
  DocumentBodyListBlockProperties,
  DocumentBodyListItemBlock,
  DocumentBodyListItemProperties,
  DocumentBodyListItemBlockType,
  DocumentBodyBlockOrderedType,
  DocumentBodyBlockUnorderedType,
} from '../models/blocks/document-body-list-block';
import {
  createEmptyTextBlock,
  generateTextBlocks,
  getFontSizeName,
  removeBlankEdgeTextBlocks,
  shrinkTextNodeWhiteSpaces,
  trimEdgeTextNodes,
} from './text';
import { DocumentContentBlock } from '../models/blocks/document-content-block';
import { cssTextAlignToAlignType, htmlTagToFontType } from './paragraph';

export const generateListBlock = (
  listElement: DomNode,
  listType: DocumentBodyBlockType,
): DocumentBodyListBlock | undefined => {
  const listBlock: DocumentBodyListBlock = {
    type: DocumentBodyBlockType.UnorderedList,
    list: {
      blocks: [],
    },
  };
  if (listType === DocumentBodyBlockType.OrderedList) {
    listBlock.type = DocumentBodyBlockType.OrderedList;
  }
  const properties = generateListProperties(
    listElement.attrs?.style,
    listBlock.type,
  );
  if (properties) {
    listBlock.list.properties = properties;
  }

  listElement.children
    ?.filter((child) => child.type === DomNodeType.Tag)
    .forEach((listItemElement) => {
      const listItemBlock = generateListItemBlock(
        listItemElement,
        listBlock.type,
      );
      listBlock.list.blocks.push(listItemBlock);
    });
  return listBlock.list.blocks.length ? listBlock : undefined;
};

const generateListProperties = (
  styles: string | undefined,
  listType:
    | DocumentBodyBlockType.OrderedList
    | DocumentBodyBlockType.UnorderedList,
): DocumentBodyListBlockProperties | DocumentBodyListItemProperties => {
  let properties;
  if (styles) {
    let orderedType: DocumentBodyBlockOrderedType | undefined;
    let unorderedType: DocumentBodyBlockUnorderedType | undefined;
    let fontSize: DocumentBodyBlockFontSize | undefined;
    let textColor: string | undefined;
    let backgroundColor: string | undefined;
    let align: DocumentBodyBlockAlignType | undefined;
    styles
      .split(/\s*;\s*/) //split with extra spaces around the semi colon
      .map((chunk) => chunk.split(/\s*:\s*/)) //split key:value with colon
      .map((keyValue) => {
        if (keyValue.length === 2) {
          if (keyValue[0] === StyleAttribute.ListStyleType) {
            if (listType === DocumentBodyBlockType.OrderedList) {
              orderedType = cssListStyleTypeToOrderedType(keyValue[1]);
            } else {
              unorderedType = cssListStyleTypeToUnorderedType(keyValue[1]);
            }
          }
          if (keyValue[0] === StyleAttribute.FontSize) {
            fontSize = getFontSizeName(keyValue[1]);
          }
          if (keyValue[0] === StyleAttribute.TextColor) {
            textColor = keyValue[1].startsWith('#')
              ? keyValue[1]
              : convertRgbToHex(keyValue[1]);
          }
          if (keyValue[0] === StyleAttribute.BackgroundColor) {
            backgroundColor = keyValue[1].startsWith('#')
              ? keyValue[1]
              : convertRgbToHex(keyValue[1]);
          }
          if (keyValue[0] === StyleAttribute.TextAlign) {
            align = cssTextAlignToAlignType(keyValue[1]);
          }
        }
      });
    if (
      orderedType ||
      unorderedType ||
      fontSize ||
      textColor ||
      backgroundColor ||
      align
    ) {
      properties = Object.assign(
        {},
        orderedType && { orderedType },
        unorderedType && { unorderedType },
        fontSize && { fontSize },
        textColor && { textColor },
        backgroundColor && { backgroundColor },
        align && { align },
      );
    }
  }
  return properties;
};

const generateListItemBlock = (
  listItemElement: DomNode,
  listType:
    | DocumentBodyBlockType.OrderedList
    | DocumentBodyBlockType.UnorderedList,
): DocumentBodyListItemBlock => {
  const listItemBlock: DocumentBodyListItemBlock = {
    type: DocumentBodyListItemBlockType.ListItem,
    blocks: [],
  };

  if (listItemElement.attrs?.style) {
    listItemBlock.properties = generateListProperties(
      listItemElement.attrs?.style,
      listType,
    );
  }
  const fontType = getFontType(listItemElement);
  if (fontType) {
    listItemBlock.properties = listItemBlock.properties || {};
    listItemBlock.properties.fontType = fontType;
  }
  const isPreformatted = fontType === DocumentBodyBlockFontType.Preformatted;
  let children = listItemElement.children;
  if (!isPreformatted) {
    children = shrinkTextNodeWhiteSpaces(trimEdgeTextNodes(children));
  }

  children?.forEach((child: DomNode) => {
    if (child.name === Tag.OrderedList) {
      const listBlock = generateListBlock(
        child,
        DocumentBodyBlockType.OrderedList,
      );
      if (listBlock) {
        listItemBlock.blocks.push(listBlock);
      }
    } else if (child.name === Tag.UnorderedList) {
      const listBlock = generateListBlock(
        child,
        DocumentBodyBlockType.UnorderedList,
      );
      if (listBlock) {
        listItemBlock.blocks.push(listBlock);
      }
    } else {
      listItemBlock.blocks.push(
        ...generateTextBlocks(child, { isPreformatted }),
      );
    }
  });
  removeBlankEdgeTextBlocks(listItemBlock.blocks as DocumentContentBlock[]);
  if (!listItemBlock.blocks.length) {
    listItemBlock.blocks.push(createEmptyTextBlock());
  }
  return listItemBlock;
};

const getFontType = (
  listItemElement: DomNode,
): DocumentBodyBlockFontType | undefined => {
  const children = listItemElement.children || [];
  for (let i = 0; i < children.length; i++) {
    if (children[i].type === DomNodeType.Tag) {
      const fontType = htmlTagToFontType(children[i].name);
      if (fontType) {
        return fontType;
      }
    }
  }
};

const orderedTypesByCssListStyleType: Record<
  string,
  DocumentBodyBlockOrderedType
> = {
  'lower-alpha': DocumentBodyBlockOrderedType.LowerAlpha,
  'lower-greek': DocumentBodyBlockOrderedType.LowerGreek,
  'lower-roman': DocumentBodyBlockOrderedType.LowerRoman,
  'upper-alpha': DocumentBodyBlockOrderedType.UpperAlpha,
  'upper-roman': DocumentBodyBlockOrderedType.UpperRoman,
  none: DocumentBodyBlockOrderedType.None,
};

const cssListStyleTypeToOrderedType = (
  listStyleType: string,
): DocumentBodyBlockOrderedType | undefined => {
  return listStyleType
    ? orderedTypesByCssListStyleType[listStyleType.toLowerCase()]
    : undefined;
};

const unorderedTypesByCssListStyleType: Record<
  string,
  DocumentBodyBlockUnorderedType
> = {
  normal: DocumentBodyBlockUnorderedType.Normal, // TODO 'normal' is not a list-style-type value
  square: DocumentBodyBlockUnorderedType.Square,
  circle: DocumentBodyBlockUnorderedType.Circle,
  none: DocumentBodyBlockUnorderedType.None,
};

const cssListStyleTypeToUnorderedType = (
  listStyleType: string,
): DocumentBodyBlockUnorderedType | undefined => {
  return listStyleType
    ? unorderedTypesByCssListStyleType[listStyleType.toLowerCase()]
    : undefined;
};
