import { AstElement } from 'html-parse-stringify';
import { BlockTypes } from '../models/blocks/block-type';
import { VideoBlock } from '../models/blocks/video';

export const generateVideoBlock = (block: AstElement): VideoBlock => {
  return {
    type: BlockTypes.VideoBlock,
    video: {
      url: block.attrs?.src || '',
    },
  };
};
