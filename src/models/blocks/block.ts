import { DocumentBodyBlock } from './document-body-block.js';
import {
  DocumentBodyParagraphBlock,
  DocumentContentBlock,
} from './document-body-paragraph.js';
import { DocumentBodyImageBlock } from './document-body-image.js';
import {
  DocumentBodyListBlock,
  DocumentBodyListElementBlock,
  DocumentListContentBlock,
} from './document-body-list.js';
import {
  DocumentBodyTableBlock,
  DocumentTableContentBlock,
} from './document-body-table.js';

export type Block =
  | DocumentBodyBlock
  | DocumentContentBlock
  | DocumentBodyImageBlock
  | DocumentBodyParagraphBlock
  | DocumentBodyListBlock
  | DocumentListContentBlock
  | DocumentBodyListElementBlock
  | DocumentBodyTableBlock
  | DocumentTableContentBlock;
