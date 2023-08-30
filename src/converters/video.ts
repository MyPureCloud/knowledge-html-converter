import { DomNode } from 'html-parse-stringify';
import { DocumentBodyBlockType } from '../models/blocks/document-body-block';
import { DocumentBodyVideoBlock } from '../models/blocks/document-body-video-block';

export const generateVideoBlock = (
  iframeElement: DomNode,
): DocumentBodyVideoBlock => {
  return {
    type: DocumentBodyBlockType.Video,
    video: {
      url: iframeElement.attrs?.src || '',
    },
  };
};
