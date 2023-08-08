import { BlockType } from './block-type';

export interface VideoBlock {
  type: BlockType.VideoBlock;
  video: {
    url: string;
  };
}
