import { BlockTypes } from './block-type';

export interface VideoBlock {
  type: BlockTypes.VideoBlock;
  video: {
    url: string;
  };
}
