import { ImageBlock } from './image';
import { ListBlock } from './list';
import { ParagraphBlock } from './paragraph';
import { TableBlock } from './table';
import { VideoBlock } from './video';

export type Block =
  | ParagraphBlock
  | ImageBlock
  | VideoBlock
  | ListBlock
  | TableBlock;

export enum BlockType {
  Paragraph = 'Paragraph',
  Image = 'Image',
  Video = 'Video',
  OrderedList = 'OrderedList',
  UnorderedList = 'UnorderedList',
  Table = 'Table',
}
