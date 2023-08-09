import { AlignType } from './align-type';
import { BlockType } from './block';
import { FontType } from './font-type';
import { ImageBlock } from './image';
import { FontSize, TextBlock } from './text';
import { VideoBlock } from './video';

export interface ListBlock {
  type: BlockType.OrderedList | BlockType.UnorderedList;
  list: {
    blocks: ListItemBlock[];
    properties?: ListBlockProperties;
  };
}

export interface ListItemBlock {
  type: ListItemBlockType.ListItem;
  blocks: ListItemContentBlock[];
  properties?: ListItemBlockProperties;
}

export enum ListItemBlockType {
  ListItem = 'ListItem',
}

export type ListItemContentBlock =
  | TextBlock
  | ImageBlock
  | VideoBlock
  | ListBlock;

export interface ListBlockProperties {
  orderedType?: OrderedType;
  unorderedType?: UnorderedType;
}

export interface ListItemBlockProperties {
  align?: AlignType;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: FontSize;
  fontType?: FontType;
  indentation?: number;
  orderedType?: OrderedType;
  unorderedType?: UnorderedType;
}

export enum OrderedType {
  LowerAlpha = 'LowerAlpha',
  LowerGreek = 'LowerGreek',
  LowerRoman = 'LowerRoman',
  UpperAlpha = 'UpperAlpha',
  UpperRoman = 'UpperRoman',
  None = 'None',
}

const orderedTypesByCssListStyleType: Record<string, OrderedType> = {
  'lower-alpha': OrderedType.LowerAlpha,
  'lower-greek': OrderedType.LowerGreek,
  'lower-roman': OrderedType.LowerRoman,
  'upper-alpha': OrderedType.UpperAlpha,
  'upper-roman': OrderedType.UpperRoman,
  none: OrderedType.None,
};

export const cssListStyleTypeToOrderedType = (
  listStyleType: string,
): OrderedType | undefined => {
  return listStyleType
    ? orderedTypesByCssListStyleType[listStyleType.toLowerCase()]
    : undefined;
};

export enum UnorderedType {
  Normal = 'Normal', // TODO 'normal' is not a list-style-type value
  Square = 'Square',
  Circle = 'Circle',
  None = 'None',
}

const unorderedTypesByCssListStyleType: Record<string, UnorderedType> = {
  normal: UnorderedType.Normal, // TODO 'normal' is not a list-style-type value
  square: UnorderedType.Square,
  circle: UnorderedType.Circle,
  none: UnorderedType.None,
};

export const cssListStyleTypeToUnorderedType = (
  listStyleType: string,
): UnorderedType | undefined => {
  return listStyleType
    ? unorderedTypesByCssListStyleType[listStyleType.toLowerCase()]
    : undefined;
};
