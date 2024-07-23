import {
  DocumentBodyParagraphBlock,
  DocumentContentBlock,
} from './models/blocks/document-body-paragraph.js';
import { DocumentBodyImageBlock } from './models/blocks/document-body-image.js';
import {
  DocumentBodyListBlock,
  DocumentBodyListElementBlock,
  DocumentListContentBlock,
} from './models/blocks/document-body-list.js';
import {
  DocumentBodyTableBlock,
  DocumentBodyTableCaptionItem,
  DocumentBodyTableCellBlock,
  DocumentBodyTableRowBlock,
  DocumentTableContentBlock,
} from './models/blocks/document-body-table.js';
import { DocumentBodyBlock } from './models/blocks/document-body-block.js';
import { DocumentTextBlock } from './models/blocks/document-text.js';
import { DocumentBodyVideoBlock } from './models/blocks/document-body-video.js';
import { Block } from './models/blocks/block.js';

/**
 * Traverse document body blocks.
 * @param blocks array of DocumentBodyBlock
 * @returns Generator function
 */
export function* traverseBlocks(
  blocks: DocumentBodyBlock[] | undefined,
): Generator<Block> {
  yield* loop(blocks || []);
}

function* loop(
  blocks:
    | DocumentBodyBlock[]
    | DocumentContentBlock[]
    | DocumentBodyListBlock[]
    | DocumentListContentBlock[]
    | DocumentTableContentBlock[]
    | DocumentBodyTableCaptionItem[],
) {
  for (const block of blocks) {
    yield* traverse(block);
  }
}

function* traverse(
  block:
    | DocumentBodyBlock
    | DocumentContentBlock
    | DocumentBodyListBlock
    | DocumentListContentBlock
    | DocumentTableContentBlock,
): Generator<Block> {
  switch (block.type) {
    case 'Text':
      yield block as DocumentTextBlock;
      break;
    case 'Image':
      yield block as DocumentBodyImageBlock;
      break;
    case 'Video':
      yield block as DocumentBodyVideoBlock;
      break;
    case 'Paragraph':
      yield block as DocumentBodyParagraphBlock;
      yield* loop((block as DocumentBodyParagraphBlock).paragraph.blocks || []);
      break;
    case 'OrderedList':
    case 'UnorderedList':
      yield block as DocumentBodyListElementBlock;
      yield* loop((block as DocumentBodyListElementBlock).list.blocks || []);
      break;
    case 'ListItem':
      yield block as DocumentBodyListBlock;
      yield* loop((block as DocumentBodyListBlock).blocks || []);
      break;
    case 'Table':
      yield block as DocumentBodyTableBlock;
      yield* traverseTable(block as DocumentBodyTableBlock);
      yield* loop(block.table?.properties?.caption?.blocks || []);
      break;
  }
}

function* traverseTable(block: DocumentBodyTableBlock): Generator<Block> {
  const children = ((block as DocumentBodyTableBlock).table.rows || []).flatMap(
    (row: DocumentBodyTableRowBlock) =>
      (row.cells || []).flatMap(
        (cell: DocumentBodyTableCellBlock) => cell.blocks || [],
      ),
  );
  yield* loop(children);
}
