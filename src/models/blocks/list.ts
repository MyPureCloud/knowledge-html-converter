import { AlignType } from './align-type';
import { BlockType } from './block-type';
import { FontType } from './font-type';
import { ImageBlock } from './image';
import { FontSize, TextBlocks } from './text';
import { VideoBlock } from './video';

export interface ListBlock {
  type: BlockType.OrderedList | BlockType.UnorderedList;
  list: {
    blocks: ListItemBlock[];
    properties?: ListBlockProperties;
  };
}

export interface ListItemBlock {
  type: BlockType.ListItem;
  blocks: (TextBlocks | ImageBlock | VideoBlock | ListBlock)[];
  properties?: ListItemBlockProperties;
}

export interface ListBlockProperties {
  fontType?: FontType;
  unorderedType?: UnorderedType;
  orderedType?: OrderedType;
}

export interface ListItemBlockProperties {
  fontType?: FontType;
  fontSize?: FontSize;
  textColor?: string;
  backgroundColor?: string;
  align?: AlignType;
  indentation?: number;
  unorderedType?: UnorderedType;
  orderedType?: OrderedType;
}

export enum UnorderedType {
  Normal = 'normal',
  Square = 'square',
  Circle = 'circle',
  None = 'none',
}

export enum OrderedType {
  LowerAlpha = 'lower-alpha',
  LowerGreek = 'lower-greek',
  LowerRoman = 'lower-roman',
  UpperAlpha = 'upper-alpha',
  UpperRoman = 'upper-roman',
  None = 'none',
}
