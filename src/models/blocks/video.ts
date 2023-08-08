import { BlockType } from './block';

export interface VideoBlock {
  type: BlockType.Video;
  video: {
    url: string;
  };
}
