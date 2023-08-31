import { DomNode } from 'html-parse-stringify';
import { DocumentBodyVideo } from '../models/blocks/document-body-video';

export const generateVideo = (iframeElement: DomNode): DocumentBodyVideo => {
  return {
    url: iframeElement.attrs?.src || '',
  };
};
