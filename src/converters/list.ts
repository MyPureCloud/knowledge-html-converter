import { AstElement } from 'html-parse-stringify';
import { StyleAttributes, Tags } from '../models/html';
import { AlignType } from '../models/blocks/align-type';
import { BlockType } from '../models/blocks/block-type';
import { htmlTagToFontType } from '../models/blocks/font-type';
import { convertRgbToHex } from './image';
import {
  ListBlock,
  ListBlockProperties,
  ListItemBlock,
  ListItemBlockProperties,
  OrderedType,
  UnorderedType,
} from '../models/blocks/list';
import { generateTextBlocks, getFontSizeName } from './text';

export const generateListBlock = (
  list: AstElement,
  listType: BlockType,
): ListBlock => {
  const listBlock: ListBlock = {
    type: BlockType.UnorderedList,
    list: {
      blocks: [],
    },
  };
  if (listType === BlockType.OrderedList) {
    listBlock.type = BlockType.OrderedList;
  }
  const properties = generateListProperties(list.attrs?.style, listBlock.type);
  if (properties) {
    listBlock.list.properties = properties;
  }

  list.children?.forEach((listItem) => {
    const listItemBlock = generateListItemBlock(listItem, listBlock.type);
    if (listItemBlock.blocks.length) {
      listBlock.list.blocks.push(listItemBlock);
    }
  });
  return listBlock;
};

const generateListProperties = (
  styles: string | undefined,
  listType: BlockType.OrderedList | BlockType.UnorderedList,
): ListBlockProperties | ListItemBlockProperties => {
  let properties;
  if (styles) {
    let orderedType;
    let unorderedType;
    let fontSize;
    let textColor;
    let backgroundColor;
    let align;
    styles
      .split(/\s*;\s*/) //split with extra spaces around the semi colon
      .map((chunk) => chunk.split(/\s*:\s*/)) //split key:value with colon
      .map((keyValue) => {
        if (keyValue.length === 2) {
          if (keyValue[0] === StyleAttributes.ListStyleType) {
            if (listType === BlockType.OrderedList) {
              orderedType =
                Object.keys(OrderedType)[
                  Object.values(OrderedType).indexOf(
                    keyValue[1] as unknown as OrderedType,
                  )
                ];
            } else {
              unorderedType =
                Object.keys(UnorderedType)[
                  Object.values(UnorderedType).indexOf(
                    keyValue[1] as unknown as UnorderedType,
                  )
                ];
            }
          }
          if (keyValue[0] === StyleAttributes.FontSize) {
            fontSize = getFontSizeName(keyValue[1]);
          }
          if (keyValue[0] === StyleAttributes.TextColor) {
            textColor = keyValue[1].startsWith('#')
              ? keyValue[1]
              : convertRgbToHex(keyValue[1]);
          }
          if (keyValue[0] === StyleAttributes.BackgroundColor) {
            backgroundColor = keyValue[1].startsWith('#')
              ? keyValue[1]
              : convertRgbToHex(keyValue[1]);
          }
          if (
            keyValue[0] === StyleAttributes.Align &&
            keyValue[1] &&
            keyValue[1].length > 0
          ) {
            align = (keyValue[1][0].toUpperCase() +
              keyValue[1].substring(1).toLowerCase()) as AlignType;
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
  listItemData: AstElement,
  listType: BlockType.OrderedList | BlockType.UnorderedList,
): ListItemBlock => {
  const listItemBlock: ListItemBlock = {
    type: BlockType.ListItem,
    blocks: [],
  };

  if (listItemData.attrs?.style) {
    listItemBlock.properties = generateListProperties(
      listItemData.attrs?.style,
      listType,
    );
  }

  listItemData?.children?.forEach((child: AstElement) => {
    const childNameLowerCase = child?.name?.toLowerCase();
    if (childNameLowerCase === Tags.OrderedList) {
      listItemBlock.blocks.push(
        generateListBlock(child, BlockType.OrderedList),
      );
    } else if (childNameLowerCase === Tags.UnorderedList) {
      listItemBlock.blocks.push(
        generateListBlock(child, BlockType.UnorderedList),
      );
    } else if (htmlTagToFontType(childNameLowerCase)) {
      const fontType = htmlTagToFontType(childNameLowerCase);

      if (listItemBlock.properties) {
        listItemBlock.properties.fontType = fontType;
      } else {
        listItemBlock.properties = { fontType };
      }
      if (child.children?.length) {
        listItemBlock.blocks.push(...generateTextBlocks(child.children[0]));
      }
    } else {
      listItemBlock.blocks.push(...generateTextBlocks(child));
    }
  });

  return listItemBlock;
};
