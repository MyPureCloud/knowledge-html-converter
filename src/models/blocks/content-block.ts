import { ImageBlock } from './image';
import { TextBlock } from './text';
import { VideoBlock } from './video';

export type ContentBlock = TextBlock | ImageBlock | VideoBlock;

export enum ContentBlockType {
  Text = 'Text',
  Image = 'Image',
  Video = 'Video',
}
