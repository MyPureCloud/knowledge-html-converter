import { AlignType } from './align-type';
import { BlockType } from './block';

export interface ImageBlock {
  type: BlockType.Image;
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
