import { DocumentElementLength } from './document-element-length.js';

export interface DocumentBodyVideoBlock {
  type: 'Video';
  video: DocumentBodyVideo;
}

export interface DocumentBodyVideo {
  url: string;
  properties?: DocumentBodyVideoProperties;
}

export interface DocumentBodyVideoProperties {
  width?: DocumentElementLength;
}
