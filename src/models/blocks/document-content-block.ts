import { DocumentBodyImage } from './document-body-image';
import { DocumentText } from './document-text';
import { DocumentBodyVideo } from './document-body-video';

export interface TextContentBlock {
  text?: DocumentText;
}

export interface DocumentContentBlock {
  type: DocumentContentBlockType;
  text?: DocumentText;
  image?: DocumentBodyImage;
  video?: DocumentBodyVideo;
}

export enum DocumentContentBlockType {
  Text = 'Text',
  Image = 'Image',
  Video = 'Video',
}
