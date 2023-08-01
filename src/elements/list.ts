import { AstElement } from 'html-parse-stringify';
import { BlockTypes, StyleProperties, TagNames } from '../tags';
import { ImageBlock, convertRgbToHex } from './image';
import {
  FontSize,
  TextBlocks,
  generateTextBlocks,
  getFontSizeName,
} from './text';
import { AlignType } from './paragraph';
import { VideoBlock } from './video';

export interface ListBlock {
  type: BlockTypes.OrderedList | BlockTypes.UnorderedList;
  list: {
    blocks: ListItemBlock[];
    properties?: ListBlockProperties;
  };
}

export type FontType =
  | 'Heading1'
  | 'Heading2'
  | 'Heading3'
  | 'Heading4'
  | 'Heading5'
  | 'Heading6'
  | 'Paragraph'
  | 'Preformatted';

export const fontTypes = [
  'Heading1',
  'Heading2',
  'Heading3',
  'Heading4',
  'Heading5',
  'Heading6',
  'Paragraph',
  'Preformatted',
];

export interface ListBlockProperties {
  fontType?: FontType;
  unorderedType?: UnorderedTypes;
  orderedType?: OrderedTypes;
}

export enum UnorderedTypes {
  Normal = 'normal',
  Square = 'square',
  Circle = 'circle',
  None = 'none',
}

export enum OrderedTypes {
  LowerAlpha = 'lower-alpha',
  LowerGreek = 'lower-greek',
  LowerRoman = 'lower-roman',
  UpperAlpha = 'upper-alpha',
  UpperRoman = 'upper-roman',
  None = 'none',
}

export interface ListItemBlock {
  type: BlockTypes.ListItem;
  blocks: (TextBlocks | ImageBlock | VideoBlock | ListBlock)[];
  properties?: ListItemBlockProperties;
}

export interface ListItemBlockProperties {
  fontType?: FontType;
  fontSize?: FontSize;
  textColor?: string;
  backgroundColor?: string;
  align?: AlignType;
  indentation?: number;
  unorderedType?: UnorderedTypes;
  orderedType?: OrderedTypes;
}

export const generateListBlock = (
  list: AstElement,
  listType: BlockTypes,
): ListBlock => {
  const listBlock: ListBlock = {
    type: BlockTypes.UnorderedList,
    list: {
      blocks: [],
    },
  };
  if (listType === BlockTypes.OrderedList) {
    listBlock.type = BlockTypes.OrderedList;
  }
  const properties = generateListProperties(list.attrs?.style, listBlock.type);
  if (properties) {
    listBlock.list.properties = properties;
  }

  list.children?.forEach((listItem) => {
    const listItemBlock = generateListItemBlock(listItem, listBlock.type);
    if (listItemBlock.blocks.length) {
      listBlock.list.blocks.push(
        generateListItemBlock(listItem, listBlock.type),
      );
    }
  });
  return listBlock;
};

const generateListProperties = (
  styles: string | undefined,
  listType: BlockTypes.OrderedList | BlockTypes.UnorderedList,
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
          if (keyValue[0] === StyleProperties.ListStyleType) {
            if (listType === BlockTypes.OrderedList) {
              orderedType =
                Object.keys(OrderedTypes)[
                  Object.values(OrderedTypes).indexOf(
                    keyValue[1] as unknown as OrderedTypes,
                  )
                ];
            } else {
              unorderedType =
                Object.keys(UnorderedTypes)[
                  Object.values(UnorderedTypes).indexOf(
                    keyValue[1] as unknown as UnorderedTypes,
                  )
                ];
            }
          }
          if (keyValue[0] === StyleProperties.FontSize) {
            fontSize = getFontSizeName(keyValue[1]);
          }
          if (keyValue[0] === StyleProperties.TextColor) {
            textColor = keyValue[1].startsWith('#')
              ? keyValue[1]
              : convertRgbToHex(keyValue[1]);
          }
          if (keyValue[0] === StyleProperties.BackgroundColor) {
            backgroundColor = keyValue[1].startsWith('#')
              ? keyValue[1]
              : convertRgbToHex(keyValue[1]);
          }
          if (keyValue[0] === StyleProperties.Align) {
            align =
              Object.keys(AlignType)[
                Object.values(AlignType).indexOf(
                  keyValue[1] as unknown as AlignType,
                )
              ];
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
  listType: BlockTypes.OrderedList | BlockTypes.UnorderedList,
): ListItemBlock => {
  const listItemBlock: ListItemBlock = {
    type: BlockTypes.ListItem,
    blocks: [],
  };

  if (listItemData.attrs?.style) {
    listItemBlock.properties = generateListProperties(
      listItemData.attrs?.style,
      listType,
    );
  }

  listItemData?.children?.forEach((child: AstElement) => {
    if (child?.name?.toLowerCase() === TagNames.OrderedList) {
      listItemBlock.blocks.push(
        generateListBlock(child, BlockTypes.OrderedList),
      );
    } else if (child?.name?.toLowerCase() === TagNames.UnorderedList) {
      listItemBlock.blocks.push(
        generateListBlock(child, BlockTypes.UnorderedList),
      );
    } else if (fontTypes.includes(child?.name?.toLowerCase())) {
      const fontType = Object.keys(TagNames)[
        Object.values(TagNames).indexOf(child?.name?.toLowerCase() as TagNames)
      ] as FontType;

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
