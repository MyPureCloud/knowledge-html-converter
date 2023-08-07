import { AlignType } from './align-type';
import { BlockTypes } from './block-type';

export interface ImageBlock {
  type: BlockTypes.ImageBlock;
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
