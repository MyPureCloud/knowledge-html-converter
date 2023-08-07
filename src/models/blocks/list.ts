import { AlignType } from './align-type';
import { BlockTypes } from './block-type';
import { FontType } from './font-type';
import { ImageBlock } from './image';
import { FontSize, TextBlocks } from './text';
import { VideoBlock } from './video';

export interface ListBlock {
  type: BlockTypes.OrderedList | BlockTypes.UnorderedList;
  list: {
    blocks: ListItemBlock[];
    properties?: ListBlockProperties;
  };
}

export interface ListItemBlock {
  type: BlockTypes.ListItem;
  blocks: (TextBlocks | ImageBlock | VideoBlock | ListBlock)[];
  properties?: ListItemBlockProperties;
}

export interface ListBlockProperties {
  fontType?: FontType;
  unorderedType?: UnorderedTypes;
  orderedType?: OrderedTypes;
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
