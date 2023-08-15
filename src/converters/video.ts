import { DomNode } from 'html-parse-stringify';
import { BlockType } from '../models/blocks/block';
import { VideoBlock } from '../models/blocks/video';

export const generateVideoBlock = (iframeElement: DomNode): VideoBlock => {
  return {
    type: BlockType.Video,
    video: {
      url: iframeElement.attrs?.src || '',
    },
  };
};
