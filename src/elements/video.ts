import { AstElement } from 'html-parse-stringify';
import { BlockTypes } from '../tags';

export interface VideoBlock {
  type: 'Video';
  video: {
    url: string;
  };
}

export const generateVideoBlock = (block: AstElement): VideoBlock => {
  return {
    type: BlockTypes.VideoBlock,
    video: {
      url: block.attrs?.src || '',
    },
  } as VideoBlock;
};
