import { DocumentBodyBlockAlignType } from './document-body-block.js';
import { DocumentElementLength } from './document-element-length.js';

export interface DocumentBodyImageBlock {
  type: 'Image';
  image: DocumentBodyImage;
}

export interface DocumentBodyImage {
  url: string;
  hyperlink?: string;
  externalDocumentId?: string;
  externalVariationName?: string;
  properties?: DocumentBodyImageProperties;
}

export interface DocumentBodyImageProperties {
  backgroundColor?: string;
  align?: DocumentBodyBlockAlignType;
  indentation?: number;
  width?: number;
  widthWithUnit?: DocumentElementLength;
}
