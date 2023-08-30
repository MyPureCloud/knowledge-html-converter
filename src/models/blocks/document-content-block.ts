import { DocumentBodyImageBlock } from './document-body-image-block';
import { DocumentTextBlock } from './document-text-block';
import { DocumentBodyVideoBlock } from './document-body-video-block';

export type DocumentContentBlock =
  | DocumentTextBlock
  | DocumentBodyImageBlock
  | DocumentBodyVideoBlock;

export enum DocumentContentBlockType {
  Text = 'Text',
  Image = 'Image',
  Video = 'Video',
}
