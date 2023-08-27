import { DomNode, DomNodeType } from 'html-parse-stringify';
import { StyleAttribute, Tag } from '../models/html';
import {
  AlignType,
  cssTextAlignToAlignType,
} from '../models/blocks/align-type';
import { BlockType } from '../models/blocks/block';
import { FontType, htmlTagToFontType } from '../models/blocks/font-type';
import { convertRgbToHex } from './image';
import {
  ListBlock,
  ListBlockProperties,
  ListItemBlock,
  ListItemBlockProperties,
  ListItemBlockType,
  OrderedType,
  UnorderedType,
  cssListStyleTypeToOrderedType,
  cssListStyleTypeToUnorderedType,
} from '../models/blocks/list';
import {
  createEmptyTextBlock,
  generateTextBlocks,
  getFontSizeName,
  removeBlankEdgeTextBlocks,
  shrinkTextNodeWhiteSpaces,
  trimEdgeTextNodes,
} from './text';
import { FontSize } from '../models/blocks/text';
import { ContentBlock } from '../models/blocks/content-block';

export const generateListBlock = (
  listElement: DomNode,
  listType: BlockType,
): ListBlock | undefined => {
  const listBlock: ListBlock = {
    type: BlockType.UnorderedList,
    list: {
      blocks: [],
    },
  };
  if (listType === BlockType.OrderedList) {
    listBlock.type = BlockType.OrderedList;
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
  listType: BlockType.OrderedList | BlockType.UnorderedList,
): ListBlockProperties | ListItemBlockProperties => {
  let properties;
  if (styles) {
    let orderedType: OrderedType | undefined;
    let unorderedType: UnorderedType | undefined;
    let fontSize: FontSize | undefined;
    let textColor: string | undefined;
    let backgroundColor: string | undefined;
    let align: AlignType | undefined;
    styles
      .split(/\s*;\s*/) //split with extra spaces around the semi colon
      .map((chunk) => chunk.split(/\s*:\s*/)) //split key:value with colon
      .map((keyValue) => {
        if (keyValue.length === 2) {
          if (keyValue[0] === StyleAttribute.ListStyleType) {
            if (listType === BlockType.OrderedList) {
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
  listType: BlockType.OrderedList | BlockType.UnorderedList,
): ListItemBlock => {
  const listItemBlock: ListItemBlock = {
    type: ListItemBlockType.ListItem,
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
  const isPreformatted = fontType === FontType.Preformatted;
  let children = listItemElement.children;
  if (!isPreformatted) {
    children = shrinkTextNodeWhiteSpaces(trimEdgeTextNodes(children));
  }

  children?.forEach((child: DomNode) => {
    if (child.name === Tag.OrderedList) {
      const listBlock = generateListBlock(child, BlockType.OrderedList);
      if (listBlock) {
        listItemBlock.blocks.push(listBlock);
      }
    } else if (child.name === Tag.UnorderedList) {
      const listBlock = generateListBlock(child, BlockType.UnorderedList);
      if (listBlock) {
        listItemBlock.blocks.push(listBlock);
      }
    } else {
      listItemBlock.blocks.push(
        ...generateTextBlocks(child, { isPreformatted }),
      );
    }
  });
  removeBlankEdgeTextBlocks(listItemBlock.blocks as ContentBlock[]);
  if (!listItemBlock.blocks.length) {
    listItemBlock.blocks.push(createEmptyTextBlock());
  }
  return listItemBlock;
};

const getFontType = (listItemElement: DomNode): FontType | undefined => {
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
