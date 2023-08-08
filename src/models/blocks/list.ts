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
  LowerAlpha = 'lower-alpha',
  LowerGreek = 'lower-greek',
  LowerRoman = 'lower-roman',
  UpperAlpha = 'upper-alpha',
  UpperRoman = 'upper-roman',
  None = 'none',
}

export enum UnorderedType {
  Normal = 'normal',
  Square = 'square',
  Circle = 'circle',
  None = 'none',
}
