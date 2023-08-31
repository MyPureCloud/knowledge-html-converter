import { DocumentBodyBlockAlignType } from './document-body-block';

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
