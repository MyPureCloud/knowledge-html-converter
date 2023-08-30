import {
  DocumentBodyBlockType,
  DocumentBodyBlockAlignType,
} from './document-body-block';

export interface DocumentBodyImageBlock {
  type: DocumentBodyBlockType.Image;
  image: {
    url: string;
    hyperlink?: string;
    properties?: DocumentBodyImageProperties;
  };
}

export interface DocumentBodyImageProperties {
  align?: DocumentBodyBlockAlignType;
  backgroundColor?: string;
  indentation?: number;
  hyperlink?: string;
}
