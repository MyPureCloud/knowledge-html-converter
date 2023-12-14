import { DocumentBodyBlockAlignType } from './document-body-block.js';

export interface DocumentBodyImageBlock {
  type: 'Image';
  image: DocumentBodyImage;
}

export interface DocumentBodyImage {
  url: string;
  hyperlink?: string;
  properties?: DocumentBodyImageProperties;
}

export interface DocumentBodyImageProperties {
  backgroundColor?: string;
  align?: DocumentBodyBlockAlignType;
  indentation?: number;
}
