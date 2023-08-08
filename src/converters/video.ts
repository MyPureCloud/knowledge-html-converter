import { AstElement } from 'html-parse-stringify';
import { BlockType } from '../models/blocks/block-type';
import { VideoBlock } from '../models/blocks/video';

export const generateVideoBlock = (block: AstElement): VideoBlock => {
  return {
    type: BlockType.VideoBlock,
    video: {
      url: block.attrs?.src || '',
    },
  };
};
