import { ImageBlock } from './image';
import { ListBlock } from './list';
import { ParagraphBlock } from './paragraph';
import { TableBlock } from './table';
import { TextBlocks } from './text';
import { VideoBlock } from './video';

export type Block =
  | ParagraphBlock
  | ListBlock
  | ImageBlock
  | VideoBlock
  | TableBlock
  | TextBlocks;
