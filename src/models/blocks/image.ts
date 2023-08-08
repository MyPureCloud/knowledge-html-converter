import { AlignType } from './align-type';
import { BlockType } from './block-type';

export interface ImageBlock {
  type: BlockType.ImageBlock;
  image: {
    url: string;
    hyperlink?: string;
    properties?: ImageProperties;
  };
}

export interface ImageProperties {
  align?: AlignType;
  backgroundColor?: string;
  indentation?: number;
  hyperlink?: string;
}
