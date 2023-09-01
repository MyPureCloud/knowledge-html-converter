import { DomNode } from 'html-parse-stringify';
import {
  DocumentBodyVideo,
  DocumentBodyVideoBlock,
} from '../models/blocks/document-body-video';

export const generateVideoBlock = (
  iframeElement: DomNode,
): DocumentBodyVideoBlock => {
  return {
    type: 'Video',
    video: generateVideo(iframeElement),
  };
};

const generateVideo = (iframeElement: DomNode): DocumentBodyVideo => {
  return {
    url: iframeElement.attrs?.src || '',
  };
};
