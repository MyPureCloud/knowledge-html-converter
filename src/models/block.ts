import { ImageBlock } from './blocks/image';
import { ListBlock } from './blocks/list';
import { ParagraphBlock } from './blocks/paragraph';
import { TableBlock } from './blocks/table';
import { TextBlocks } from './blocks/text';
import { VideoBlock } from './blocks/video';

export type Block =
  | ParagraphBlock
  | ListBlock
  | ImageBlock
  | VideoBlock
  | TableBlock
  | TextBlocks;
